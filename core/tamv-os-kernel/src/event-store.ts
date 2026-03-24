import { createHash } from "node:crypto";
import { Pool, type PoolClient } from "pg";
import { resolveNextState, type CanonicalEventType } from "./domain/canonical-domain";
import type { CivicEvent } from "./types";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface AppendEventOptions {
  streamId: string;
  expectedVersion?: number;
  actorId?: string;
  causationId?: string;
  checksum?: string;
}

export interface StoredEvent<TPayload = unknown> extends CivicEvent<TPayload> {
  streamId: string;
  streamVersion: number;
  globalPosition: number;
  eventHash: string;
  recordedAt: string;
  metadata: {
    actorId?: string;
    causationId?: string;
    checksum?: string;
  };
}

export interface DeadLetterEvent {
  id: string;
  streamId: string;
  reason: string;
  attempts: number;
  payload: unknown;
  createdAt: string;
}

let initialized = false;
const autoMigrate = process.env.TAMV_EVENT_STORE_AUTO_MIGRATE === "true";

function assertCanonicalTransition(event: CivicEvent) {
  if (!event.canonical?.aggregateType || !event.canonical.previousState || !event.canonical.nextState) return;

  const expected = resolveNextState(
    event.canonical.aggregateType,
    event.type as CanonicalEventType,
    event.canonical.previousState,
  );

  if (expected !== event.canonical.nextState) {
    throw new Error(
      `Invalid canonical state progression for ${event.canonical.aggregateType}/${event.canonical.aggregateId}: expected ${expected}, received ${event.canonical.nextState}`,
    );
  }
}

function hashEventPayload(event: CivicEvent, streamId: string, streamVersion: number): string {
  const raw = JSON.stringify({
    id: event.id,
    type: event.type,
    federation: event.federation,
    payload: event.payload,
    occurredAt: event.occurredAt,
    source: event.source,
    correlationId: event.correlationId ?? null,
    streamId,
    streamVersion,
  });
  return createHash("sha256").update(raw).digest("hex");
}

async function assertRequiredTables() {
  const result = await pool.query<{ event_store: string | null; dead_letter: string | null; snapshots: string | null }>(
    `SELECT
      to_regclass('public.tamv_event_store') as event_store,
      to_regclass('public.tamv_event_dead_letter') as dead_letter,
      to_regclass('public.tamv_stream_snapshot') as snapshots`,
  );

  const row = result.rows[0];
  if (!row?.event_store || !row.dead_letter || !row.snapshots) {
    throw new Error(
      "TAMV event schema is missing. Apply migrations before boot (supabase db push) or set TAMV_EVENT_STORE_AUTO_MIGRATE=true only for local bootstrap.",
    );
  }
}

async function ensureSchema() {
  if (initialized) return;

  if (!autoMigrate) {
    await assertRequiredTables();
    initialized = true;
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tamv_event_store (
      global_position BIGSERIAL PRIMARY KEY,
      event_id UUID NOT NULL UNIQUE,
      stream_id TEXT NOT NULL,
      stream_version INTEGER NOT NULL,
      event_type TEXT NOT NULL,
      federation TEXT NOT NULL,
      payload JSONB NOT NULL,
      occurred_at TIMESTAMPTZ NOT NULL,
      recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      source TEXT NOT NULL,
      correlation_id UUID,
      event_hash TEXT NOT NULL,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
      UNIQUE(stream_id, stream_version)
    );

    CREATE TABLE IF NOT EXISTS tamv_event_dead_letter (
      id UUID PRIMARY KEY,
      stream_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      attempts INTEGER NOT NULL,
      payload JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS tamv_stream_snapshot (
      stream_id TEXT NOT NULL,
      stream_version INTEGER NOT NULL,
      state_hash TEXT NOT NULL,
      state_payload JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY(stream_id, stream_version)
    );

    CREATE INDEX IF NOT EXISTS idx_tamv_event_store_stream
      ON tamv_event_store(stream_id, stream_version);

    CREATE INDEX IF NOT EXISTS idx_tamv_event_store_occurred_at
      ON tamv_event_store(occurred_at);
  `);

  initialized = true;
}

async function nextStreamVersion(client: PoolClient, streamId: string): Promise<number> {
  await client.query(`SELECT pg_advisory_xact_lock(hashtext($1))`, [streamId]);

  const versionResult = await client.query<{ version: number }>(
    `SELECT COALESCE(MAX(stream_version), 0) AS version
      FROM tamv_event_store
      WHERE stream_id = $1`,
    [streamId],
  );

  return Number(versionResult.rows[0]?.version ?? 0) + 1;
}

export async function appendEvent(event: CivicEvent, options: AppendEventOptions): Promise<StoredEvent> {
  await ensureSchema();

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const streamVersion = await nextStreamVersion(client, options.streamId);

    if (typeof options.expectedVersion === "number" && streamVersion !== options.expectedVersion + 1) {
      throw new Error(
        `Optimistic concurrency violation in stream ${options.streamId}: expected ${options.expectedVersion}, actual ${streamVersion - 1}`,
      );
    }

    assertCanonicalTransition(event);

    const eventHash = hashEventPayload(event, options.streamId, streamVersion);

    const insertResult = await client.query<StoredEvent>(
      `INSERT INTO tamv_event_store
        (event_id, stream_id, stream_version, event_type, federation, payload, occurred_at, source, correlation_id, event_hash, metadata)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING
        global_position as "globalPosition",
        event_id as id,
        stream_id as "streamId",
        stream_version as "streamVersion",
        event_type as type,
        federation,
        payload,
        occurred_at as "occurredAt",
        source,
        correlation_id as "correlationId",
        event_hash as "eventHash",
        metadata,
        recorded_at as "recordedAt"`,
      [
        event.id,
        options.streamId,
        streamVersion,
        event.type,
        event.federation,
        JSON.stringify(event.payload),
        event.occurredAt,
        event.source,
        event.correlationId ?? null,
        eventHash,
        JSON.stringify({
          actorId: options.actorId,
          causationId: options.causationId,
          checksum: options.checksum,
        }),
      ],
    );

    await client.query("COMMIT");

    return insertResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function appendDeadLetter(event: {
  id: string;
  streamId: string;
  payload: unknown;
  reason: string;
  attempts: number;
}) {
  await ensureSchema();
  await pool.query(
    `INSERT INTO tamv_event_dead_letter (id, stream_id, reason, attempts, payload)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (id) DO UPDATE SET
      reason = EXCLUDED.reason,
      attempts = EXCLUDED.attempts,
      payload = EXCLUDED.payload`,
    [event.id, event.streamId, event.reason, event.attempts, JSON.stringify(event.payload)],
  );
}

export async function createStreamSnapshot(streamId: string, streamVersion: number, statePayload: unknown) {
  await ensureSchema();
  const stateHash = createHash("sha256").update(JSON.stringify(statePayload)).digest("hex");
  await pool.query(
    `INSERT INTO tamv_stream_snapshot (stream_id, stream_version, state_hash, state_payload)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (stream_id, stream_version) DO UPDATE SET
      state_hash = EXCLUDED.state_hash,
      state_payload = EXCLUDED.state_payload`,
    [streamId, streamVersion, stateHash, JSON.stringify(statePayload)],
  );
}

export async function loadLatestSnapshot<TState>(streamId: string): Promise<{ version: number; state: TState } | null> {
  await ensureSchema();
  const result = await pool.query<{ version: number; state: TState }>(
    `SELECT stream_version as version, state_payload as state
    FROM tamv_stream_snapshot
    WHERE stream_id = $1
    ORDER BY stream_version DESC
    LIMIT 1`,
    [streamId],
  );

  return result.rows[0] ?? null;
}

export async function loadStream(streamId: string, fromVersion = 1): Promise<StoredEvent[]> {
  await ensureSchema();
  const result = await pool.query<StoredEvent>(
    `SELECT
      global_position as "globalPosition",
      event_id as id,
      stream_id as "streamId",
      stream_version as "streamVersion",
      event_type as type,
      federation,
      payload,
      occurred_at as "occurredAt",
      source,
      correlation_id as "correlationId",
      event_hash as "eventHash",
      metadata,
      recorded_at as "recordedAt"
    FROM tamv_event_store
    WHERE stream_id = $1
      AND stream_version >= $2
      AND is_deleted = false
    ORDER BY stream_version ASC`,
    [streamId, fromVersion],
  );

  return result.rows;
}

export async function verifyStreamIntegrity(streamId: string): Promise<{ valid: boolean; failedAtVersion?: number }> {
  const events = await loadStream(streamId);

  for (const event of events) {
    const recomputed = hashEventPayload(event, event.streamId, event.streamVersion);
    if (recomputed !== event.eventHash) {
      return { valid: false, failedAtVersion: event.streamVersion };
    }
  }

  return { valid: true };
}

export async function replayStream<TState>(
  streamId: string,
  reducer: (state: TState, event: StoredEvent) => TState,
  initialState: TState,
): Promise<TState> {
  const snapshot = await loadLatestSnapshot<TState>(streamId);
  const initial = snapshot ? snapshot.state : initialState;
  const fromVersion = snapshot ? snapshot.version + 1 : 1;
  const events = await loadStream(streamId, fromVersion);
  return events.reduce(reducer, initial);
}
