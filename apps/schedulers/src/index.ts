/**
 * WebWaka Schedulers Worker — BUG-005 / ENH-004
 *
 * Dedicated Cloudflare Worker that uses a single CRON slot (every 30 min)
 * to dispatch all internal recurring jobs from the `scheduled_jobs` D1 table.
 * This frees the 5 production CRON slots from internal jobs so they are
 * available for critical-path triggers only.
 *
 * To disable a job without redeploying: UPDATE scheduled_jobs SET enabled=0 WHERE name=?
 * To trigger immediately: UPDATE scheduled_jobs SET next_run_at=0 WHERE name=?
 */

export interface Env {
  DB: D1Database;
  RATE_LIMIT_KV: KVNamespace;
  AUDIT_FAIL_KV: KVNamespace;
  ENVIRONMENT: string;
}

type JobFn = (env: Env) => Promise<void>;

const JOBS: Record<string, JobFn> = {
  'audit-log-redriver': async (env: Env) => {
    const keys = await env.AUDIT_FAIL_KV.list({ prefix: 'audit_fail:' });
    let redriven = 0;
    for (const key of keys.keys) {
      const raw = await env.AUDIT_FAIL_KV.get(key.name);
      if (!raw) continue;
      try {
        const entry = JSON.parse(raw) as Record<string, unknown>;
        await env.DB.prepare(
          `INSERT OR IGNORE INTO audit_logs
           (id, tenant_id, actor_id, actor_type, event_type, resource_type, resource_id, metadata, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch())`,
        ).bind(
          (entry.id as string) ?? crypto.randomUUID(),
          entry.tenant_id ?? '',
          entry.actor_id ?? null,
          entry.actor_type ?? 'system',
          entry.event_type ?? 'AUDIT_REDRIVEN',
          entry.resource_type ?? null,
          entry.resource_id ?? null,
          JSON.stringify(entry.metadata ?? {}),
        ).run();
        await env.AUDIT_FAIL_KV.delete(key.name);
        redriven++;
      } catch {
        // Skip on error — will retry next tick
      }
    }
    if (redriven > 0) {
      console.log(JSON.stringify({ level: 'info', event: 'audit_redriven', count: redriven }));
    }
  },

  'refresh-token-cleanup': async (env: Env) => {
    const result = await env.DB.prepare(
      `DELETE FROM refresh_tokens
       WHERE expires_at < unixepoch() - 86400 AND revoked_at IS NOT NULL`,
    ).run();
    console.log(JSON.stringify({
      level: 'info', event: 'refresh_token_cleanup',
      deleted: result.meta?.changes ?? 0,
    }));
  },

  'ndpr-retention-sweep': async (env: Env) => {
    const cutoff = Math.floor(Date.now() / 1000) - 63_072_000; // 24 months
    await env.DB.batch([
      env.DB.prepare(
        `DELETE FROM sessions WHERE expires_at < ? AND user_id IN
         (SELECT id FROM users WHERE deleted_at IS NOT NULL)`,
      ).bind(cutoff),
      env.DB.prepare(
        `DELETE FROM invitations
         WHERE created_at < ? AND (accepted_at IS NOT NULL OR revoked_at IS NOT NULL)`,
      ).bind(cutoff),
    ]);
    console.log(JSON.stringify({ level: 'info', event: 'ndpr_retention_sweep', cutoff }));
  },

  'wallet-tier-reconciliation': async (env: Env) => {
    // GOVERNANCE_SKIP: This is an intentional cross-tenant aggregate for CBN compliance.
    // BUG-037: Nightly cross-check of HL wallet tier caps against actual ledger totals.
    const now = Math.floor(Date.now() / 1000);
    const dayStart = now - (now % 86400);
    const result = await env.DB.prepare(
      `SELECT w.id, w.tenant_id, w.tier, w.daily_limit_kobo,
              COALESCE(SUM(CASE WHEN t.created_at >= ? THEN t.amount_kobo ELSE 0 END), 0) AS daily_total
       FROM hl_wallets w
       LEFT JOIN hl_ledger t ON t.wallet_id = w.id AND t.direction = 'debit'
       WHERE w.tenant_id IS NOT NULL
       GROUP BY w.id, w.tenant_id, w.tier, w.daily_limit_kobo
       HAVING daily_total > w.daily_limit_kobo`,
    ).bind(dayStart).all<{
      id: string; tenant_id: string; tier: string; daily_limit_kobo: number; daily_total: number;
    }>();
    if (result.results.length > 0) {
      console.error(JSON.stringify({
        level: 'error', event: 'wallet_tier_breach',
        count: result.results.length,
        breaches: result.results.map(r => ({
          walletId: r.id, tenantId: r.tenant_id, tier: r.tier,
          limit: r.daily_limit_kobo, actual: r.daily_total,
        })),
      }));
    }
  },

  'dsar-export-processor': async (env: Env) => {
    // COMP-001 / ENH-039: Process pending DSAR export requests.
    // Assembles all user data rows across core tables and stores as JSON in KV.
    // KV TTL: 172800 s (48 h) — user must download within that window.
    // T3: every query binds user_id AND tenant_id — no cross-tenant data leakage.
    const pending = await env.DB.prepare(
      `SELECT id, user_id, tenant_id FROM dsar_requests
       WHERE status = 'pending' AND expires_at > unixepoch()
       ORDER BY requested_at ASC LIMIT 20`,
    ).all<{ id: string; user_id: string; tenant_id: string }>();

    for (const req of pending.results) {
      try {
        await env.DB.prepare(
          `UPDATE dsar_requests SET status = 'processing' WHERE id = ?`,
        ).bind(req.id).run();

        const [userRow, wsRow, ledgerRows, notifRows] = await Promise.all([
          env.DB.prepare(
            `SELECT email, full_name, phone, created_at
             FROM users WHERE id = ? AND tenant_id = ?`,
          ).bind(req.user_id, req.tenant_id).first(),
          env.DB.prepare(
            `SELECT w.name, w.subscription_plan
             FROM workspaces w
             JOIN users u ON u.workspace_id = w.id
             WHERE u.id = ? AND w.tenant_id = ?
             LIMIT 1`,
          ).bind(req.user_id, req.tenant_id).first(),
          env.DB.prepare(
            `SELECT id, direction, amount_kobo, description, created_at
             FROM hl_ledger WHERE user_id = ? AND tenant_id = ?
             ORDER BY created_at DESC LIMIT 1000`,
          ).bind(req.user_id, req.tenant_id).all(),
          env.DB.prepare(
            `SELECT id, title, body, created_at, read_at
             FROM notification_inbox WHERE user_id = ? AND tenant_id = ?
             ORDER BY created_at DESC LIMIT 500`,
          ).bind(req.user_id, req.tenant_id).all(),
        ]);

        const exportData = {
          exported_at: new Date().toISOString(),
          user: userRow,
          workspace: wsRow,
          transactions: ledgerRows.results,
          notifications: notifRows.results,
        };
        const exportJson = JSON.stringify(exportData, null, 2);
        const exportKey = `dsar:export:${req.id}`;

        await env.RATE_LIMIT_KV.put(exportKey, exportJson, { expirationTtl: 172800 });
        await env.DB.prepare(
          `UPDATE dsar_requests
           SET status = 'ready', completed_at = unixepoch(), download_key = ?
           WHERE id = ?`,
        ).bind(exportKey, req.id).run();

        console.log(JSON.stringify({
          level: 'info', event: 'dsar_export_ready', requestId: req.id,
        }));
      } catch (err) {
        console.error(JSON.stringify({
          level: 'error', event: 'dsar_export_failed',
          requestId: req.id, error: String(err),
        }));
        await env.DB.prepare(
          `UPDATE dsar_requests SET status = 'pending' WHERE id = ?`,
        ).bind(req.id).run();
      }
    }
  },
};

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    console.log(JSON.stringify({
      level: 'info', event: 'scheduler_tick',
      ts: new Date().toISOString(),
    }));

    let dueJobs: { results: Array<{ name: string }> };
    try {
      dueJobs = await env.DB.prepare(
        `SELECT name FROM scheduled_jobs
         WHERE next_run_at <= unixepoch() AND enabled = 1
         ORDER BY priority DESC`,
      ).all<{ name: string }>();
    } catch (err) {
      console.error(JSON.stringify({
        level: 'error', event: 'scheduler_db_error', error: String(err),
      }));
      return;
    }

    for (const { name } of dueJobs.results) {
      const job = JOBS[name];
      if (!job) {
        console.warn(JSON.stringify({ level: 'warn', event: 'scheduler_unknown_job', name }));
        continue;
      }

      const started = Date.now();
      try {
        await job(env);
        await env.DB.prepare(
          `UPDATE scheduled_jobs
           SET last_run_at = unixepoch(),
               next_run_at = unixepoch() + run_interval_seconds,
               last_status = 'ok',
               last_error = NULL
           WHERE name = ?`,
        ).bind(name).run();
        console.log(JSON.stringify({
          level: 'info', event: 'scheduler_job_ok', name,
          duration_ms: Date.now() - started,
        }));
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        try {
          await env.DB.prepare(
            `UPDATE scheduled_jobs
             SET last_run_at = unixepoch(),
                 next_run_at = unixepoch() + run_interval_seconds,
                 last_status = 'error',
                 last_error = ?
             WHERE name = ?`,
          ).bind(errMsg, name).run();
        } catch {
          // DB update failure is non-blocking
        }
        console.error(JSON.stringify({
          level: 'error', event: 'scheduler_job_failed', name, error: errMsg,
        }));
      }
    }
  },
};
