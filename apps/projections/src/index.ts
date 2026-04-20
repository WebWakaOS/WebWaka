/**
 * apps/projections — Cloudflare Workers event processor.
 *
 * Consumes from Cloudflare Queue (M7+) or is triggered via a Scheduled Worker
 * (cron) to rebuild search index projections from the event_log.
 *
 * Routes:
 *   GET  /health                      — liveness probe
 *   POST /rebuild/search              — rebuild search index from events (inter-service auth required)
 *   POST /rebuild/analytics           — rebuild analytics snapshot stub (inter-service auth required)
 *   GET  /events/:aggregate/:id       — fetch events for an aggregate
 *
 * Scheduled CRON handlers (Issue 4 + Issue 8):
 *   [every 15 min]  — Search index incremental rebuild + HITL stale expiry
 *   0 2 * * *      — Daily analytics snapshot computation
 *   [every 4 hrs]   — HITL expiry sweep + L3 escalation notification
 *
 * SEC-009: POST /rebuild/* require X-Inter-Service-Secret header.
 *
 * N-100b (OQ-002, Phase 9): Legacy HITL notification dispatch removed.
 * HitlService.expireAllStale() D1 status writes run unconditionally.
 * Notification dispatch is handled by NotificationService via publishEvent().
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { createCorsConfig } from '@webwaka/shared-config';
import {
  rebuildSearchIndexFromEvents,
  getAggregateEvents,
} from '@webwaka/events';
import { HitlService } from '@webwaka/superagent';

interface Env {
  DB: D1Database;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  ALLOWED_ORIGINS?: string;
  INTER_SERVICE_SECRET: string;
}

interface D1Like {
  prepare(query: string): {
    bind(...args: unknown[]): {
      run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
    run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results: T[] }>;
  };
  batch(stmts: unknown[]): Promise<Array<{ success: boolean }>>;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', secureHeaders());
app.use('*', async (c, next) => {
  const config = createCorsConfig({
    environment: c.env.ENVIRONMENT,
    ...(c.env.ALLOWED_ORIGINS !== undefined ? { allowedOriginsEnv: c.env.ALLOWED_ORIGINS } : {}),
    allowMethods: ['GET', 'POST', 'OPTIONS'],
  });
  return cors(config)(c, next);
});

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

app.get('/health', (c) => c.json({ status: 'ok', app: 'projections' }));

// ---------------------------------------------------------------------------
// Inter-service auth helper (SEC-009)
// ---------------------------------------------------------------------------

function verifyInterServiceSecret(
  secret: string | undefined,
  expected: string | undefined,
): boolean {
  if (!expected) return false;
  if (!secret) return false;
  return secret === expected;
}

// ---------------------------------------------------------------------------
// Rebuild search index — POST /rebuild/search
// ---------------------------------------------------------------------------

app.post('/rebuild/search', async (c) => {
  const provided = c.req.header('X-Inter-Service-Secret');
  if (!verifyInterServiceSecret(provided, c.env.INTER_SERVICE_SECRET)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const db = c.env.DB as unknown as D1Like;

  const start = Date.now();
  const result = await rebuildSearchIndexFromEvents(db);
  const durationMs = Date.now() - start;

  await updateProjectionCheckpoint(db, 'search_index', durationMs, result.errors[0]);

  if (result.errors.length > 0) {
    console.error('[projections] rebuild/search errors:', result.errors);
  }

  return c.json({ ...result, durationMs }, result.errors.length > 0 ? 207 : 200);
});

// ---------------------------------------------------------------------------
// Rebuild analytics snapshot — POST /rebuild/analytics
// ---------------------------------------------------------------------------

app.post('/rebuild/analytics', async (c) => {
  const provided = c.req.header('X-Inter-Service-Secret');
  if (!verifyInterServiceSecret(provided, c.env.INTER_SERVICE_SECRET)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const db = c.env.DB as unknown as D1Like;
  const start = Date.now();

  const result = await computeAnalyticsSnapshots(db);
  const durationMs = Date.now() - start;

  await updateProjectionCheckpoint(db, 'analytics_snapshots', durationMs);

  return c.json({ ...result, durationMs });
});

// ---------------------------------------------------------------------------
// Aggregate event history — GET /events/:aggregate/:id
// ---------------------------------------------------------------------------

app.get('/events/:aggregate/:id', async (c) => {
  const provided = c.req.header('X-Inter-Service-Secret');
  if (!verifyInterServiceSecret(provided, c.env.INTER_SERVICE_SECRET)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const aggregate = c.req.param('aggregate');
  const aggregateId = c.req.param('id');
  const db = c.env.DB as unknown as D1Like;

  const events = await getAggregateEvents(db, aggregate, aggregateId);

  return c.json({ aggregate, aggregateId, events, total: events.length });
});

// ---------------------------------------------------------------------------
// Scheduled CRON handler (Issue 4 — projections checkpoint + CRON trigger)
// Issue 8 — HITL cross-tenant expiry + L3 escalation
// N-100b (Phase 9): Legacy HITL dispatch removed. Expiry sweep runs unconditionally.
// ---------------------------------------------------------------------------

export async function scheduled(
  _event: { cron: string; scheduledTime: number },
  env: Env,
): Promise<void> {
  const db = env.DB as unknown as D1Like;
  const cron = _event.cron;

  console.log(`[projections:cron] triggered — cron="${cron}"`);

  // ---------------------------------------------------------------------------
  // HITL stale expiry sweep (N-100b, Phase 9).
  // D1 status writes (expire rows, write hitl_escalations) run unconditionally.
  // Notification dispatch is handled by NotificationService.raise() via publishEvent().
  // ---------------------------------------------------------------------------
  try {
    const hitlResult = await HitlService.expireAllStale(db);
    if (hitlResult.expired > 0 || hitlResult.escalated > 0) {
      console.log(
        `[projections:cron] HITL expiry — expired=${hitlResult.expired} escalated=${hitlResult.escalated}`,
      );
    }
  } catch (err) {
    console.error('[projections:cron] HITL expiry failed:', err);
  }

  // Every 15 minutes: incremental search index rebuild
  if (cron === '*/15 * * * *' || cron === '0 */4 * * *') {
    const start = Date.now();
    try {
      const result = await rebuildSearchIndexFromEvents(db);
      const durationMs = Date.now() - start;
      await updateProjectionCheckpoint(db, 'search_index', durationMs, result.errors[0]);
      console.log(
        `[projections:cron] search rebuild done — processed=${result.processed} errors=${result.errors.length} durationMs=${durationMs}`,
      );
    } catch (err) {
      console.error('[projections:cron] search rebuild failed:', err);
      await updateProjectionCheckpoint(db, 'search_index', Date.now() - start, String(err));
    }
  }

  // Daily 02:00: analytics snapshot computation
  if (cron === '0 2 * * *') {
    const start = Date.now();
    try {
      const result = await computeAnalyticsSnapshots(db);
      const durationMs = Date.now() - start;
      await updateProjectionCheckpoint(db, 'analytics_snapshots', durationMs);
      console.log(
        `[projections:cron] analytics snapshots done — snapshots=${result.snapshots} durationMs=${durationMs}`,
      );
    } catch (err) {
      console.error('[projections:cron] analytics snapshots failed:', err);
      await updateProjectionCheckpoint(db, 'analytics_snapshots', Date.now() - start, String(err));
    }
  }

  // Daily 02:00: auto-expire pending bank transfer orders older than 48h
  if (cron === '0 2 * * *') {
    try {
      const now = Math.floor(Date.now() / 1000);
      const result = await db
        .prepare(
          `UPDATE bank_transfer_orders SET status = 'expired', updated_at = ?
           WHERE status = 'pending' AND expires_at < ?`,
        )
        .bind(now, now)
        .run();
      const expired = result.meta?.changes ?? 0;
      if (expired > 0) {
        console.log(`[projections:cron] bank_transfer_orders expired=${expired}`);
      }
    } catch (err) {
      console.error('[projections:cron] bank transfer expiry failed:', err);
    }
  }

  // WF-028: Daily 02:00 — expire hl_funding_requests whose bank_transfer_order expired
  if (cron === '0 2 * * *') {
    try {
      const now = Math.floor(Date.now() / 1000);
      const result = await db
        .prepare(
          `UPDATE hl_funding_requests
           SET status = 'expired', updated_at = ?
           WHERE status = 'pending'
             AND bank_transfer_order_id IN (
               SELECT id FROM bank_transfer_orders WHERE status = 'expired'
             )`,
        )
        .bind(now)
        .run();
      const expired = result.meta?.changes ?? 0;
      if (expired > 0) {
        console.log(`[projections:cron] hl_funding_requests expired=${expired}`);
      }
      await updateProjectionCheckpoint(db, 'wallet_funding_expiry', Date.now() - (Date.now() - 1));
    } catch (err) {
      console.error('[projections:cron] wallet funding expiry failed:', err);
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Upsert a projection checkpoint row after each run.
 * Tracks run count, last run time, and last error for operational visibility.
 */
async function updateProjectionCheckpoint(
  db: D1Like,
  projection: string,
  durationMs: number,
  lastError?: string,
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  try {
    await db
      .prepare(
        `INSERT INTO projection_checkpoints (id, projection, last_run_at, run_count, last_error, updated_at)
         VALUES (?, ?, ?, 1, ?, ?)
         ON CONFLICT(projection) DO UPDATE SET
           last_run_at = excluded.last_run_at,
           run_count   = run_count + 1,
           last_error  = excluded.last_error,
           updated_at  = excluded.updated_at`,
      )
      .bind(
        crypto.randomUUID(),
        projection,
        now,
        lastError ?? null,
        now,
      )
      .run();
    void durationMs;
  } catch {
    // Checkpoint failure must never block the caller — log and move on
  }
}

/**
 * Compute daily analytics snapshots for all workspaces.
 * Aggregates from bank_transfer_orders and transactions for yesterday's date.
 * Writes to analytics_snapshots with period_type = 'day'.
 *
 * This is a best-effort operation — individual workspace failures are swallowed
 * so one bad workspace cannot block the full snapshot run.
 */
async function computeAnalyticsSnapshots(
  db: D1Like,
): Promise<{ snapshots: number; errors: number }> {
  // Get yesterday's date in YYYY-MM-DD format (UTC)
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  // Fetch all unique (tenant_id, workspace_id) pairs that have transaction activity
  const workspaces = await db
    .prepare(
      `SELECT DISTINCT tenant_id, workspace_id
       FROM transactions
       WHERE date(created_at) = ?
       LIMIT 1000`,
    )
    .bind(yesterday)
    .all<{ tenant_id: string; workspace_id: string }>();

  let snapshots = 0;
  let errors = 0;

  for (const ws of workspaces.results) {
    try {
      // Aggregate transaction data for this workspace on yesterday
      const agg = await db
        .prepare(
          `SELECT
             COUNT(*) as total_orders,
             COALESCE(SUM(amount_kobo), 0) as total_revenue_kobo,
             COUNT(DISTINCT COALESCE(metadata_buyer_id, '')) as unique_customers
           FROM transactions
           WHERE tenant_id = ? AND workspace_id = ? AND date(created_at) = ?`,
        )
        .bind(ws.tenant_id, ws.workspace_id, yesterday)
        .first<{
          total_orders: number;
          total_revenue_kobo: number;
          unique_customers: number;
        }>();

      if (!agg) continue;

      const snapshotId = crypto.randomUUID();
      const computedAt = new Date().toISOString();

      await db
        .prepare(
          `INSERT INTO analytics_snapshots
           (id, tenant_id, workspace_id, snapshot_date, period_type,
            total_orders, total_revenue_kobo, unique_customers, computed_at)
           VALUES (?, ?, ?, ?, 'day', ?, ?, ?, ?)
           ON CONFLICT(tenant_id, workspace_id, snapshot_date, period_type)
           DO UPDATE SET
             total_orders = excluded.total_orders,
             total_revenue_kobo = excluded.total_revenue_kobo,
             unique_customers = excluded.unique_customers,
             computed_at = excluded.computed_at`,
        )
        .bind(
          snapshotId,
          ws.tenant_id,
          ws.workspace_id,
          yesterday,
          agg.total_orders,
          agg.total_revenue_kobo,
          agg.unique_customers,
          computedAt,
        )
        .run();

      snapshots++;
    } catch {
      errors++;
    }
  }

  return { snapshots, errors };
}

// ---------------------------------------------------------------------------
// Dual export: fetch handler (HTTP) + scheduled handler (CRON)
// Cloudflare Workers requires both exports on the same default export object.
// ---------------------------------------------------------------------------

export default { fetch: app.fetch, scheduled };
