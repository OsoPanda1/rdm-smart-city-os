import Stripe from "stripe";
import { Pool } from "pg";
import { resolveNextState, type PaymentLifecycleState } from "../../../core/tamv-os-kernel/src/domain/canonical-domain";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-10-28.acacia",
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

let schemaReady = false;
const autoMigrate = process.env.CATTLEYA_PAY_AUTO_MIGRATE === "true";

async function ensurePaymentsSchema() {
  if (schemaReady) return;

  if (!autoMigrate) {
    schemaReady = true;
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cattleya_payment_ledger (
      id BIGSERIAL PRIMARY KEY,
      operation_id TEXT NOT NULL UNIQUE,
      user_id TEXT NOT NULL,
      amount_cents BIGINT NOT NULL,
      currency TEXT NOT NULL,
      description TEXT NOT NULL,
      stripe_session_id TEXT,
      status TEXT NOT NULL CHECK (status IN ('INITIATED','SESSION_CREATED','AUTHORIZED','CAPTURED','SETTLED','FAILED','REFUNDED')),
      failure_reason TEXT,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_cattleya_payment_ledger_user
      ON cattleya_payment_ledger(user_id, created_at DESC);
  `);

  schemaReady = true;
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      attempt += 1;
      if (attempt >= retries) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100 * 2 ** attempt));
    }
  }

  throw lastError;
}

export class PaymentService {
  async createCheckoutSession(params: {
    operationId: string;
    userId: string;
    amount: number;
    currency?: string;
    description: string;
    metadata?: Record<string, string>;
  }) {
    await ensurePaymentsSchema();

    const currency = params.currency ?? "mxn";
    const amountCents = Math.round(params.amount * 100);

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const existing = await client.query<{
        stripe_session_id: string | null;
        status: string;
      }>(
        `SELECT stripe_session_id, status
         FROM cattleya_payment_ledger
         WHERE operation_id = $1
         FOR UPDATE`,
        [params.operationId],
      );

      if (existing.rowCount && existing.rows[0].stripe_session_id) {
        await client.query("COMMIT");
        return {
          id: existing.rows[0].stripe_session_id,
          reused: true,
        };
      }

      if (!existing.rowCount) {
        await client.query(
          `INSERT INTO cattleya_payment_ledger
            (operation_id, user_id, amount_cents, currency, description, status, metadata)
           VALUES ($1,$2,$3,$4,$5,'INITIATED',$6)`,
          [
            params.operationId,
            params.userId,
            amountCents,
            currency,
            params.description,
            JSON.stringify(params.metadata ?? {}),
          ],
        );
      }

      const currentState = (existing.rows[0]?.status as PaymentLifecycleState | undefined) ?? "INITIATED";
      const nextState = resolveNextState("PAYMENT_ORDER", "PAYMENT_SESSION_CREATED", currentState);

      const session = await withRetry(() =>
        stripe.checkout.sessions.create({
          mode: "payment",
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency,
                product_data: { name: params.description },
                unit_amount: amountCents,
              },
              quantity: 1,
            },
          ],
          metadata: {
            userId: params.userId,
            operationId: params.operationId,
            ...(params.metadata ?? {}),
          },
          success_url: process.env.CHECKOUT_SUCCESS_URL!,
          cancel_url: process.env.CHECKOUT_CANCEL_URL!,
        }),
      );

      await client.query(
        `UPDATE cattleya_payment_ledger
         SET stripe_session_id = $2,
             status = $3,
             updated_at = NOW()
         WHERE operation_id = $1`,
        [params.operationId, session.id, nextState],
      );

      await client.query("COMMIT");
      return { id: session.id, url: session.url, reused: false };
    } catch (error) {
      await client.query("ROLLBACK");

      const failedState = resolveNextState("PAYMENT_ORDER", "PAYMENT_FAILED", "INITIATED");

      await pool.query(
        `UPDATE cattleya_payment_ledger
         SET status = $3,
             failure_reason = $2,
             updated_at = NOW()
         WHERE operation_id = $1`,
        [params.operationId, error instanceof Error ? error.message : "Unknown payment error", failedState],
      );

      throw error;
    } finally {
      client.release();
    }
  }
}
