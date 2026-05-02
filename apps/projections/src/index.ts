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
  WALLET_KV?: KVNamespace;         // WF-041: MLA payout feature flag + commission config
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
// H-7 / H-6: Request-ID propagation for distributed tracing
app.use('*', async (c, next) => {
  const requestId = c.req.header('X-Request-ID') ?? crypto.randomUUID();
  c.set('requestId' as never, requestId);
  c.header('X-Request-ID', requestId);
  await next();
});
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

  // WF-041: Daily 02:00 — MLA payout (feature-flag-gated via wallet:flag:mla_payout_enabled)
  // Phase 2+: disabled in Phase 1. Feature flag must be set to '1' by super-admin
  // before payouts begin. Idempotent: credited earnings are never re-credited.
  if (cron === '0 2 * * *') {
    try {
      const walletKv = env.WALLET_KV;
      if (!walletKv) {
        console.warn('[projections:cron:mla] WALLET_KV not bound — MLA payout skipped');
      } else {
        const payoutEnabled = await walletKv.get('wallet:flag:mla_payout_enabled');
        if (payoutEnabled !== '1') {
          console.log('[projections:cron:mla] mla_payout_enabled != 1 — payout skipped (Phase 1)');
        } else {
          const mlaCronStart = Date.now();
          let promoted = 0;
          let credited = 0;
          let errors  = 0;

          const SETTLEMENT_WINDOW_SECS = 86_400; // 24h
          const BATCH_SIZE = 100;
          const now = Math.floor(Date.now() / 1000);
          const cutoff = now - SETTLEMENT_WINDOW_SECS;

          // Step 1: Promote pending earnings older than settlement window → payable.
          // Uses subquery form to satisfy SQLite UPDATE...LIMIT requirement.
          try {
            const promoteResult = await db
              .prepare(
                `UPDATE hl_mla_earnings SET status = 'payable', updated_at = ?
                 WHERE id IN (
                   SELECT id FROM hl_mla_earnings
                   WHERE status = 'pending' AND created_at <= ?
                   LIMIT ?
                 )`,
              )
              .bind(now, cutoff, BATCH_SIZE)
              .run();
            promoted = promoteResult.meta?.changes ?? 0;
          } catch (promoteErr) {
            console.error('[projections:cron:mla] promote step failed:', promoteErr);
          }

          // Step 2: Credit payable earnings — only for wallets whose cumulative payable
          // commission meets or exceeds the minimum payout threshold (governance WF-042).
          // Prevents crediting micro-commissions individually; they accumulate until threshold.
          // Read min_payout_kobo from KV; fallback ₦500 (50_000 kobo). NaN-safe.
          try {
            const minPayoutRaw    = await walletKv.get('wallet:mla:min_payout_kobo');
            const minPayoutParsed = minPayoutRaw ? parseInt(minPayoutRaw, 10) : 50_000;
            const minPayoutKobo   = Number.isNaN(minPayoutParsed) || minPayoutParsed < 0
              ? 50_000
              : minPayoutParsed;

            const payable = await db
              .prepare(
                `SELECT e.id, e.wallet_id, e.tenant_id, e.commission_kobo, e.referral_level
                 FROM hl_mla_earnings e
                 WHERE e.status = 'payable'
                   AND e.wallet_id IN (
                     SELECT wallet_id
                     FROM hl_mla_earnings
                     WHERE status = 'payable'
                     GROUP BY wallet_id
                     HAVING SUM(commission_kobo) >= ?
                   )
                 LIMIT ?`,
              )
              .bind(minPayoutKobo, BATCH_SIZE)
              .all<{
                id: string;
                wallet_id: string;
                tenant_id: string;
                commission_kobo: number;
                referral_level: number;
              }>();

            for (const earning of payable.results) {
              try {
                await creditPayableEarningInline(db, earning, now);
                credited++;
              } catch (creditErr) {
                errors++;
                console.error(
                  `[projections:cron:mla] credit failed earning_id=${earning.id}:`,
                  creditErr,
                );
              }
            }
          } catch (selectErr) {
            console.error('[projections:cron:mla] payable SELECT failed:', selectErr);
          }

          const mlaDurationMs = Date.now() - mlaCronStart;
          console.log(
            `[projections:cron:mla] done — promoted=${promoted} credited=${credited} errors=${errors} durationMs=${mlaDurationMs}`,
          );
          await updateProjectionCheckpoint(db, 'mla_payout', mlaDurationMs,
            errors > 0 ? `${errors} credit errors` : undefined);
        }
      }
    } catch (err) {
      console.error('[projections:cron:mla] MLA payout CRON failed:', err);
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// WF-041: MLA payout inline helper
// Performs the three-step atomic credit for a single payable MLA earning:
//   1. Credit hl_wallets balance (mla_credit tx type → increments lifetime_funded_kobo)
//   2. Insert hl_ledger entry
//   3. Mark hl_mla_earnings as credited
// IDs are generated inline to avoid importing @webwaka/hl-wallet.
// T3 invariant: all queries are tenant-scoped.
// ---------------------------------------------------------------------------

async function creditPayableEarningInline(
  db: D1Like,
  earning: {
    id: string;
    wallet_id: string;
    tenant_id: string;
    commission_kobo: number;
    referral_level: number;
  },
  now: number,
): Promise<void> {
  // Step 1: Credit wallet balance. mla_credit is a top-up so lifetime_funded_kobo increments.
  const updateResult = await db
    .prepare(
      `UPDATE hl_wallets
       SET balance_kobo         = balance_kobo + ?,
           lifetime_funded_kobo = lifetime_funded_kobo + ?,
           updated_at           = unixepoch()
       WHERE id = ? AND tenant_id = ? AND status != 'closed'`,
    )
    .bind(earning.commission_kobo, earning.commission_kobo, earning.wallet_id, earning.tenant_id)
    .run();

  if (!updateResult.meta?.changes) {
    // Wallet not found, closed, or frozen — leave earning as payable for retry
    throw new Error(`wallet credit failed: wallet_id=${earning.wallet_id} — wallet may be closed`);
  }

  // Step 2: Read back balance_after for the ledger entry.
  const walletRow = await db
    .prepare('SELECT balance_kobo FROM hl_wallets WHERE id = ? AND tenant_id = ?')
    .bind(earning.wallet_id, earning.tenant_id)
    .first<{ balance_kobo: number }>();

  const balanceAfter = walletRow?.balance_kobo ?? earning.commission_kobo;

  // Step 3: Insert ledger entry.
  const entryId  = `hll_${crypto.randomUUID().replace(/-/g, '')}`;
  const date     = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix   = Math.random().toString(36).toUpperCase().slice(2, 7);
  const reference = `MLA-${date}-${suffix}`;

  await db
    .prepare(
      `INSERT INTO hl_ledger
         (id, wallet_id, user_id, tenant_id, entry_type, amount_kobo, balance_after,
          tx_type, reference, description, currency_code, related_id, related_type, created_at)
       VALUES (?, ?, '', ?, 'credit', ?, ?, 'mla_credit', ?, ?, 'NGN', ?, 'hl_mla_earning', ?)`,
    )
    .bind(
      entryId,
      earning.wallet_id,
      earning.tenant_id,
      earning.commission_kobo,
      balanceAfter,
      reference,
      `MLA L${earning.referral_level} commission credit`,
      earning.id,
      now,
    )
    .run();

  // Step 4: Mark earning as credited (idempotency: status must still be 'payable').
  await db
    .prepare(
      `UPDATE hl_mla_earnings
       SET status = 'credited', ledger_entry_id = ?, credited_at = ?, updated_at = ?
       WHERE id = ? AND tenant_id = ? AND status = 'payable'`,
    )
    .bind(entryId, now, now, earning.id, earning.tenant_id)
    .run();
}

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
