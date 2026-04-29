/**
 * Offline sync endpoints — Phase 1 (M11) + Phase 3 (M13) upgrade
 *
 * POST /sync/apply  — idempotent apply of a queued operation (M7b)
 * GET  /sync/delta  — incremental sync delta (Phase 1 V1, Phase 3 V2 module-aware)
 *
 * V1 format (backward compat): ?since=<unix>&entities=<list>&limit=<n>
 *   → { since, serverTimestamp, entities, delta }
 *
 * V2 format (PRD §11.2, Phase 3 E20): ?module=<module>&last_synced_at=<unix>&workspace_id=<id>&cursor=<cursor>&limit=<n>
 *   → { changes, deletes, server_time, has_more, next_cursor }
 *
 * T3: tenantId from JWT on all DB queries.
 * P11: Server-wins — returned records are the authoritative server state.
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
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

// ---------------------------------------------------------------------------
// Allowed entities (V1 format) — Phase 0 + Phase 1 + Phase 3 additions
// ---------------------------------------------------------------------------

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
  // Phase 3 (E20) additions — read-only offline scope
  'group_member',
  'case_note',
  'group_broadcast_draft',
  'group_event',
] as const;
type AllowedEntity = typeof ALLOWED_ENTITIES[number];

function isAllowedEntity(entity: string): entity is AllowedEntity {
  return (ALLOWED_ENTITIES as readonly string[]).includes(entity);
}

// ---------------------------------------------------------------------------
// Entity → table map (V1 + V2 shared)
// ---------------------------------------------------------------------------

interface EntityTableConfig {
  table: string;
  idCol: string;
  timestampCol: string;
  /** For V2: which module this entity belongs to */
  module: SyncModule;
}

type SyncModule = 'groups' | 'cases' | 'notifications' | 'geography' | 'core';

const ENTITY_TABLE_MAP: Record<AllowedEntity, EntityTableConfig> = {
  individual:             { table: 'individuals',       idCol: 'id', timestampCol: 'updated_at', module: 'core' },
  organization:           { table: 'organizations',     idCol: 'id', timestampCol: 'updated_at', module: 'core' },
  agent_transaction:      { table: 'agent_transactions', idCol: 'id', timestampCol: 'updated_at', module: 'core' },
  contact_channel:        { table: 'contact_channels',  idCol: 'id', timestampCol: 'updated_at', module: 'core' },
  offering:               { table: 'offerings',          idCol: 'id', timestampCol: 'updated_at', module: 'core' },
  pos_product:            { table: 'pos_products',       idCol: 'id', timestampCol: 'updated_at', module: 'core' },
  pos_sale:               { table: 'pos_sales',          idCol: 'id', timestampCol: 'created_at', module: 'core' },
  group:                  { table: 'groups',             idCol: 'id', timestampCol: 'updated_at', module: 'groups' },
  case:                   { table: 'cases',              idCol: 'id', timestampCol: 'updated_at', module: 'cases' },
  // Phase 3 additions
  group_member:           { table: 'group_members',       idCol: 'id', timestampCol: 'updated_at', module: 'groups' },
  case_note:              { table: 'case_notes',           idCol: 'id', timestampCol: 'created_at', module: 'cases' },
  group_broadcast_draft:  { table: 'group_broadcasts',    idCol: 'id', timestampCol: 'updated_at', module: 'groups' },
  group_event:            { table: 'group_events',         idCol: 'id', timestampCol: 'updated_at', module: 'groups' },
};

// ---------------------------------------------------------------------------
// V2: Module → entity list (PRD §11.2)
// ---------------------------------------------------------------------------

const MODULE_ENTITIES: Record<SyncModule | 'all', readonly AllowedEntity[]> = {
  groups:        ['group', 'group_member', 'group_broadcast_draft', 'group_event'],
  cases:         ['case', 'case_note'],
  notifications: [], // handled by separate notification-store (N-068)
  geography:     [], // geography is cached from geography.ts routes; no delta table yet
  core:          ['individual', 'organization', 'agent_transaction', 'contact_channel', 'offering', 'pos_product', 'pos_sale'],
  all:           [...ALLOWED_ENTITIES],
};

// ---------------------------------------------------------------------------
// V2: Change record (PRD §11.2 format)
// ---------------------------------------------------------------------------

interface ChangeRecord {
  table: string;
  operation: 'upsert';
  id: string;
  data: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Route definitions
// ---------------------------------------------------------------------------

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

  // Idempotency check
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
    return c.json({ applied: false, clientId: body.clientId, status: existing.status }, 200);
  }

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
      return c.json({ applied: true, clientId: body.clientId, idempotent: true }, 200);
    }
    throw insertErr;
  }

  return c.json({ applied: true, clientId: body.clientId, logId }, 200);
});

/**
 * GET /sync/delta — Incremental sync delta endpoint
 *
 * Supports two formats:
 *
 * V1 (backward compat — existing clients):
 *   ?since=<unix_epoch_seconds>&entities=<csv>&limit=<n>
 *   → { since, serverTimestamp, entities, delta }
 *
 * V2 (PRD §11.2, Phase 3 E20 — module-aware + cursor-based):
 *   ?module=<groups|cases|notifications|geography|core|all>
 *   &last_synced_at=<unix_epoch_seconds>
 *   &workspace_id=<id>     (optional — scopes results to workspace)
 *   &cursor=<opaque>       (optional — cursor from previous response for pagination)
 *   &limit=<n>             (default 100, max 500)
 *   → { changes, deletes, server_time, has_more, next_cursor }
 *
 * T3: tenant_id predicate on every query.
 * P11: Server-wins — returned records are the authoritative server state.
 */
syncRoutes.get('/delta', async (c) => {
  const auth = c.get('auth');
  const tenantId = auth.tenantId;
  const db = c.env.DB as unknown as D1Like;

  const moduleParam = c.req.query('module');

  // ── V2 format (module param present) ────────────────────────────────────
  if (moduleParam) {
    return handleDeltaV2(c, db, tenantId, moduleParam);
  }

  // ── V1 format (legacy — backward compat) ────────────────────────────────
  return handleDeltaV1(c, db, tenantId);
});

// ---------------------------------------------------------------------------
// V1 handler (backward compat)
// ---------------------------------------------------------------------------

async function handleDeltaV1(
  c: Context<AppEnv>,
  db: D1Like,
  tenantId: string,
): Promise<Response> {
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

  const requestedEntities = entitiesStr
    ? entitiesStr.split(',').map(e => e.trim()).filter(e => isAllowedEntity(e)) as AllowedEntity[]
    : [...ALLOWED_ENTITIES];

  const delta: Record<string, unknown[]> = {};
  const serverTimestamp = Math.floor(Date.now() / 1000);

  for (const entity of requestedEntities) {
    const mapping = ENTITY_TABLE_MAP[entity];
    if (!mapping) continue;

    try {
      const { results } = await db
        .prepare(`
          SELECT * FROM ${mapping.table}
          WHERE tenant_id = ? AND ${mapping.timestampCol} > ?
          ORDER BY ${mapping.timestampCol} ASC
          LIMIT ?
        `)
        .bind(tenantId, since, limit)
        .all<Record<string, unknown>>();

      delta[entity] = results;
    } catch {
      delta[entity] = [];
    }
  }

  return c.json({
    since,
    serverTimestamp,
    entities: requestedEntities,
    delta,
  });
}

// ---------------------------------------------------------------------------
// V2 handler (PRD §11.2 — module-aware, cursor-based)
// ---------------------------------------------------------------------------

async function handleDeltaV2(
  c: Context<AppEnv>,
  db: D1Like,
  tenantId: string,
  moduleParam: string,
): Promise<Response> {
  const lastSyncedAtStr = c.req.query('last_synced_at') ?? c.req.query('since');
  const workspaceId = c.req.query('workspace_id');
  const cursor = c.req.query('cursor');
  const limitStr = c.req.query('limit');

  if (!lastSyncedAtStr) {
    return c.json({
      error: "'last_synced_at' query parameter is required (Unix epoch seconds).",
    }, 400);
  }

  const since = parseInt(lastSyncedAtStr, 10);
  if (!Number.isInteger(since) || since < 0) {
    return c.json({
      error: "'last_synced_at' must be a non-negative integer (Unix epoch seconds).",
    }, 400);
  }

  const limit = Math.min(parseInt(limitStr ?? '100', 10) || 100, 500);

  // Determine cursor timestamp (opaque cursor = base64 of "timestamp_id")
  let cursorTs = since;
  let cursorId: string | null = null;
  if (cursor) {
    try {
      const decoded = atob(cursor);
      const [ts, id] = decoded.split('_', 2);
      const parsedTs = parseInt(ts ?? '0', 10);
      if (Number.isInteger(parsedTs) && parsedTs >= 0) {
        cursorTs = parsedTs;
        cursorId = id ?? null;
      }
    } catch {
      // Invalid cursor — fall back to last_synced_at
    }
  }

  // Resolve module → entities
  const mod = (MODULE_ENTITIES[moduleParam as SyncModule | 'all'] ? moduleParam : 'all') as SyncModule | 'all';
  const entities = MODULE_ENTITIES[mod] ?? MODULE_ENTITIES['all'];

  const changes: ChangeRecord[] = [];
  let maxTs = cursorTs;
  let maxId = cursorId;

  for (const entity of entities) {
    const mapping = ENTITY_TABLE_MAP[entity];
    if (!mapping) continue;

    try {
      // Cursor-aware query: WHERE ts > cursorTs OR (ts = cursorTs AND id > cursorId)
      let sql: string;
      const binds: unknown[] = [tenantId, cursorTs];

      if (cursorId) {
        sql = `
          SELECT * FROM ${mapping.table}
          WHERE tenant_id = ?
            AND (${mapping.timestampCol} > ? OR (${mapping.timestampCol} = ? AND ${mapping.idCol} > ?))
          ${workspaceId ? 'AND workspace_id = ?' : ''}
          ORDER BY ${mapping.timestampCol} ASC, ${mapping.idCol} ASC
          LIMIT ?
        `;
        binds.push(cursorTs, cursorId);
        if (workspaceId) binds.push(workspaceId);
        binds.push(limit);
      } else {
        sql = `
          SELECT * FROM ${mapping.table}
          WHERE tenant_id = ?
            AND ${mapping.timestampCol} > ?
          ${workspaceId ? 'AND workspace_id = ?' : ''}
          ORDER BY ${mapping.timestampCol} ASC, ${mapping.idCol} ASC
          LIMIT ?
        `;
        if (workspaceId) binds.push(workspaceId);
        binds.push(limit);
      }

      const { results } = await db
        .prepare(sql)
        .bind(...binds)
        .all<Record<string, unknown>>();

      for (const row of results) {
        changes.push({
          table: mapping.table,
          operation: 'upsert',
          id: String(row[mapping.idCol]),
          data: row,
        });
        const rowTs = Number(row[mapping.timestampCol] ?? 0);
        if (rowTs > maxTs) {
          maxTs = rowTs;
          maxId = String(row[mapping.idCol]);
        } else if (rowTs === maxTs) {
          const rowId = String(row[mapping.idCol]);
          if (!maxId || rowId > maxId) maxId = rowId;
        }
      }
    } catch {
      // Table may not exist in this deployment — skip silently
    }
  }

  const hasMore = changes.length === limit;
  const nextCursor = hasMore && maxId
    ? btoa(`${maxTs}_${maxId}`)
    : null;

  return c.json({
    changes,
    deletes: [], // Soft-delete tracking via deleted_records table — Phase 5
    server_time: Math.floor(Date.now() / 1000),
    has_more: hasMore,
    next_cursor: nextCursor,
  });
}
