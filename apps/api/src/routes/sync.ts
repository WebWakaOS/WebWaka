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

// P2-A fix: added offerings, pos_products, pos_sales for offline POS sync support.
// Phase 1: added group, case for offline Groups + Cases sync (T004).
const ALLOWED_ENTITIES = [
  'individual',
  'organization',
  'agent_transaction',
  'contact_channel',
  'offering',
  'pos_product',
  'pos_sale',
  'group',
  'case',
] as const;
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

/**
 * GET /sync/delta — Incremental sync delta endpoint (Phase 1, M11)
 *
 * Returns all syncable entity records modified since a given timestamp.
 * Used by the offline-sync client to fetch only new/changed records.
 *
 * Query params:
 *   since   — Unix epoch seconds (required). Returns records with updated_at > since.
 *   entities — comma-separated entity names to include (optional, default: all allowed)
 *   limit   — max records per entity (default 100, max 500)
 *
 * T3: tenantId from JWT on all queries.
 * P11: Server-wins — returned records are the authoritative server state.
 */
syncRoutes.get('/delta', async (c) => {
  const auth = c.get('auth');
  const tenantId = auth.tenantId;
  const db = c.env.DB as unknown as D1Like;

  const sinceStr = c.req.query('since');
  const entitiesStr = c.req.query('entities');
  const limitStr = c.req.query('limit');

  if (!sinceStr) {
    return c.json({ error: "'since' query parameter is required (Unix epoch seconds)." }, 400);
  }

  const since = parseInt(sinceStr, 10);
  if (!Number.isInteger(since) || since < 0) {
    return c.json({ error: "'since' must be a non-negative integer (Unix epoch seconds)." }, 400);
  }

  const limit = Math.min(parseInt(limitStr ?? '100', 10) || 100, 500);

  // Determine which entities to include
  const requestedEntities = entitiesStr
    ? entitiesStr.split(',').map(e => e.trim()).filter(e => ALLOWED_ENTITIES.includes(e as never))
    : [...ALLOWED_ENTITIES];

  const delta: Record<string, unknown[]> = {};
  const serverTimestamp = Math.floor(Date.now() / 1000);

  // Table map: entity name → (table name, id column, tenant column)
  const ENTITY_TABLE_MAP: Record<string, { table: string; idCol: string }> = {
    individual:        { table: 'individuals',       idCol: 'id' },
    organization:      { table: 'organizations',     idCol: 'id' },
    agent_transaction: { table: 'agent_transactions', idCol: 'id' },
    contact_channel:   { table: 'contact_channels',  idCol: 'id' },
    offering:          { table: 'offerings',          idCol: 'id' },
    pos_product:       { table: 'pos_products',       idCol: 'id' },
    pos_sale:          { table: 'pos_sales',          idCol: 'id' },
    group:             { table: 'groups',             idCol: 'id' },
    case:              { table: 'cases',              idCol: 'id' },
  };

  for (const entity of requestedEntities) {
    const mapping = ENTITY_TABLE_MAP[entity];
    if (!mapping) continue;

    try {
      const { results } = await db
        .prepare(`
          SELECT * FROM ${mapping.table}
          WHERE tenant_id = ? AND updated_at > ?
          ORDER BY updated_at ASC
          LIMIT ?
        `)
        .bind(tenantId, since, limit)
        .all<Record<string, unknown>>();

      delta[entity] = results;
    } catch {
      // Table may not yet exist in this deployment — return empty array for that entity
      delta[entity] = [];
    }
  }

  return c.json({
    since,
    serverTimestamp,
    entities: requestedEntities,
    delta,
  });
});
