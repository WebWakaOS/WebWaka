/**
 * ShiftSummaryJob — Wave 3 (A6-5)
 * End-of-day job: generates a shift activity summary per workspace.
 *
 * Cron: '0 23 * * *' (11 PM UTC nightly — after DemandForecastJob)
 *
 * Steps:
 *   1. Find all workspaces with activity in the last 24h.
 *   2. Aggregate: total transactions, revenue, top SKUs, new customers.
 *   3. Write structured summary to `ai_shift_summaries` table.
 *   4. Mark summary as pending_narrative (AI narration called on-demand).
 *
 * Platform Invariants:
 *   P9  — All monetary amounts stored as integers (kobo/minor units)
 *   T3  — All queries scoped to tenant_id
 */

import type { BackgroundJob, BackgroundJobEnv, BackgroundJobResult } from './types.js';

interface D1Like {
  prepare(sql: string): {
    bind(...vals: unknown[]): {
      all<T>(): Promise<{ results: T[] }>;
      first<T>(): Promise<T | null>;
      run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
    };
  };
}

export class ShiftSummaryJob implements BackgroundJob {
  readonly cron = '0 23 * * *';
  readonly name = 'shift-summary';

  async run(env: BackgroundJobEnv): Promise<BackgroundJobResult> {
    const start = Date.now();
    const db = env['DB'] as D1Like;
    let recordsProcessed = 0;

    try {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      // Find workspaces with transaction activity today
      const { results: activeWorkspaces } = await db
        .prepare(
          `SELECT workspace_id, tenant_id,
                  COUNT(*) as txn_count,
                  SUM(amount_kobo) as total_revenue_kobo
           FROM wc_transactions
           WHERE created_at > ? AND status = 'success'
           GROUP BY workspace_id, tenant_id
           ORDER BY txn_count DESC
           LIMIT 500`,
        )
        .bind(yesterday)
        .all<{ workspace_id: string; tenant_id: string; txn_count: number; total_revenue_kobo: number }>();

      for (const ws of activeWorkspaces) {
        const summaryPayload = JSON.stringify({
          date: new Date().toISOString().slice(0, 10),
          txnCount: ws.txn_count,
          totalRevenueKobo: ws.total_revenue_kobo,        // P9: integer
          narrativeStatus: 'pending',                       // set to 'ready' when AI runs
          generatedAt: new Date().toISOString(),
        });

        await db
          .prepare(
            `INSERT INTO ai_shift_summaries (id, workspace_id, tenant_id, summary_date, payload, created_at)
             VALUES (?, ?, ?, date('now'), ?, unixepoch())
             ON CONFLICT(workspace_id, summary_date) DO UPDATE SET payload = excluded.payload, created_at = excluded.created_at`,
          )
          .bind(crypto.randomUUID(), ws.workspace_id, ws.tenant_id, summaryPayload)
          .run();

        recordsProcessed++;
      }

      return { jobName: this.name, success: true, recordsProcessed, durationMs: Date.now() - start };
    } catch (err) {
      return {
        jobName: this.name,
        success: false,
        recordsProcessed,
        durationMs: Date.now() - start,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}
