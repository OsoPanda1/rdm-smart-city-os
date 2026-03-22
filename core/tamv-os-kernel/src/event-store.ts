import { Pool } from "pg";
import type { CivicEvent } from "./types";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function persistEvent(event: CivicEvent) {
  await pool.query(
    `INSERT INTO tamv_event_store
     (id, type, federation, payload, occurred_at, source, correlation_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [
      event.id,
      event.type,
      event.federation,
      JSON.stringify(event.payload),
      event.occurredAt,
      event.source,
      event.correlationId ?? null,
    ],
  );
}
