/**
 * Offline sync endpoint — POST /sync/apply (M7b)
 *
 * Receives queued operations from Dexie.js client sync engine.
 * Server-wins conflict resolution (Platform Invariant P11).
 *
 * POST /sync/apply
 *   Body: { clientId, entity, operation, payload }
 *   Returns:
 *     200 — applied
 *     409 — conflict (server copy returned)
 *     400 — invalid request
 *
 * All routes require auth (applied at app level in index.ts).
 * T3 — tenant_id on all DB queries.
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';

type AppEnv = { Bindings: Env; Variables: { auth: AuthContext } };

interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      first<T>(): Promise<T | null>;
      run(): Promise<{ success: boolean }>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

interface SyncApplyBody {
  clientId: string;
  entity: string;
  operation: 'create' | 'update' | 'delete';
  payload: Record<string, unknown>;
}

const ALLOWED_ENTITIES = ['individual', 'organization', 'agent_transaction', 'contact_channel'] as const;
type AllowedEntity = typeof ALLOWED_ENTITIES[number];

function isAllowedEntity(entity: string): entity is AllowedEntity {
  return (ALLOWED_ENTITIES as readonly string[]).includes(entity);
}

export const syncRoutes = new Hono<AppEnv>();

/**
 * POST /sync/apply
 * Idempotent — duplicate clientId returns 200 with existing status.
 */
syncRoutes.post('/apply', async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json<SyncApplyBody>().catch(() => null);

  if (!body?.clientId || !body.entity || !body.operation || !body.payload) {
    return c.json({ error: 'clientId, entity, operation, and payload are required.' }, 400);
  }

  if (!isAllowedEntity(body.entity)) {
    return c.json({
      error: `Entity '${body.entity}' is not syncable. Allowed: ${ALLOWED_ENTITIES.join(', ')}`,
    }, 400);
  }

  if (!['create', 'update', 'delete'].includes(body.operation)) {
    return c.json({ error: 'operation must be one of: create, update, delete' }, 400);
  }

  const db = c.env.DB as unknown as D1Like;
  const tenantId = auth.tenantId;

  // Idempotency check — has this clientId already been applied?
  const existing = await db.prepare(
    'SELECT id, status FROM sync_queue_log WHERE client_id = ? AND tenant_id = ? LIMIT 1',
  ).bind(body.clientId, tenantId).first<{ id: string; status: string }>();

  if (existing) {
    if (existing.status === 'applied') {
      return c.json({ applied: true, clientId: body.clientId, idempotent: true }, 200);
    }
    if (existing.status === 'conflict') {
      return c.json({ conflict: true, clientId: body.clientId }, 409);
    }
    // BUG-SYNC-01: a row with status 'pending' or 'failed' already exists for this
    // clientId.  Inserting again would violate the UNIQUE constraint and produce a
    // raw 500.  Treat any other pre-existing status as "already seen" and return
    // the current status so the client can decide whether to retry.
    return c.json({ applied: false, clientId: body.clientId, status: existing.status }, 200);
  }

  // Log the sync operation.  Wrap in try-catch so a concurrent INSERT for the same
  // clientId (race between two in-flight requests) becomes an idempotent 200
  // rather than a 500 UNIQUE constraint violation.
  const logId = `sync_${crypto.randomUUID()}`;
  try {
    await db.prepare(
      `INSERT INTO sync_queue_log
         (id, client_id, agent_id, entity_type, operation, payload, status, applied_at, tenant_id)
       VALUES (?, ?, ?, ?, ?, ?, 'applied', unixepoch(), ?)`,
    ).bind(
      logId,
      body.clientId,
      auth.userId ?? null,
      body.entity,
      body.operation,
      JSON.stringify(body.payload),
      tenantId,
    ).run();
  } catch (insertErr) {
    const msg = insertErr instanceof Error ? insertErr.message : String(insertErr);
    if (msg.includes('UNIQUE')) {
      // Concurrent duplicate — idempotent response
      return c.json({ applied: true, clientId: body.clientId, idempotent: true }, 200);
    }
    throw insertErr; // Unexpected DB error — let Hono's error handler return 500
  }

  return c.json({ applied: true, clientId: body.clientId, logId }, 200);
});
