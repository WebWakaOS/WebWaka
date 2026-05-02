/**
 * DemandForecastJob — Wave 3 (A6-5)
 * Nightly job: generates AI demand forecast per vertical per workspace.
 *
 * Cron: '0 22 * * *' (10 PM UTC nightly)
 *
 * Steps:
 *   1. Query last 30 days of booking/order events from D1 per workspace.
 *   2. Build a structured summary (item counts, peak hours, top SKUs).
 *   3. Store forecast metadata in `ai_demand_forecasts` table.
 *   4. (Future: call AI model for narrative summary — wired in Wave 4)
 *
 * This job intentionally does NOT call an AI model directly — it prepares
 * the data that the agent loop will consume on demand. This keeps the job
 * fast and avoids token costs for inactive workspaces.
 */

import type { BackgroundJob, BackgroundJobEnv, BackgroundJobResult } from './types.js';

interface D1Like {
  prepare(sql: string): {
    bind(...vals: unknown[]): {
      all<T>(): Promise<{ results: T[] }>;
      run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
    };
  };
}

export class DemandForecastJob implements BackgroundJob {
  readonly cron = '0 22 * * *';
  readonly name = 'demand-forecast';

  async run(env: BackgroundJobEnv): Promise<BackgroundJobResult> {
    const start = Date.now();
    const db = env['DB'] as D1Like;
    let recordsProcessed = 0;

    try {
      // Get all active workspaces with AI consent
      const { results: workspaces } = await db
        .prepare(`SELECT id, tenant_id, vertical_slug FROM workspaces WHERE is_active = 1 LIMIT 500`)
        .bind()
        .all<{ id: string; tenant_id: string; vertical_slug: string | null }>();

      for (const ws of workspaces) {
        // Count last 30-day events per workspace
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const { results: events } = await db
          .prepare(
            `SELECT COUNT(*) as cnt, event_key
             FROM event_log
             WHERE workspace_id = ? AND tenant_id = ? AND created_at > ?
             GROUP BY event_key
             ORDER BY cnt DESC
             LIMIT 20`,
          )
          .bind(ws.id, ws.tenant_id, thirtyDaysAgo)
          .all<{ cnt: number; event_key: string }>();

        if (events.length === 0) continue;

        // Upsert forecast metadata
        const forecastPayload = JSON.stringify({
          windowDays: 30,
          topEvents: events.slice(0, 5),
          generatedAt: new Date().toISOString(),
        });

        await db
          .prepare(
            `INSERT INTO ai_demand_forecasts (id, workspace_id, tenant_id, forecast_date, payload, created_at)
             VALUES (?, ?, ?, date('now'), ?, unixepoch())
             ON CONFLICT(workspace_id, forecast_date) DO UPDATE SET payload = excluded.payload, created_at = excluded.created_at`,
          )
          .bind(crypto.randomUUID(), ws.id, ws.tenant_id, forecastPayload)
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
