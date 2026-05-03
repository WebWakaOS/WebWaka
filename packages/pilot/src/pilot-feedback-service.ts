/**
 * @webwaka/pilot — PilotFeedbackService
 *
 * Collects in-app NPS scores and qualitative feedback from pilot operators.
 * Exposes summary stats used by the super-admin pilot dashboard.
 */

import type { PilotFeedback, SubmitFeedbackInput, PilotFeedbackType } from './types.js';

interface D1Like {
  prepare(sql: string): {
    bind(...args: unknown[]): {
      run(): Promise<{ meta?: { changes?: number } }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

export interface FeedbackSummary {
  total: number;
  avg_nps: number | null;
  by_type: Record<PilotFeedbackType, number>;
  promoters: number;   // NPS 9-10
  passives: number;    // NPS 7-8
  detractors: number;  // NPS 0-6
  nps_score: number | null;  // ((promoters - detractors) / total_nps_responses) * 100
}

export class PilotFeedbackService {
  constructor(private readonly db: D1Like) {}

  async submit(input: SubmitFeedbackInput): Promise<PilotFeedback> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await this.db
      .prepare(
        `INSERT INTO pilot_feedback
           (id, tenant_id, workspace_id, user_id, feedback_type,
            nps_score, message, context_route, submitted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        input.tenant_id,
        input.workspace_id,
        input.user_id,
        input.feedback_type,
        input.nps_score ?? null,
        input.message ?? null,
        input.context_route ?? null,
        now,
      )
      .run();

    const row = await this.db
      .prepare(`SELECT * FROM pilot_feedback WHERE id = ?`)
      .bind(id)
      .first<PilotFeedback>();

    if (!row) throw new Error('Feedback not found after insert');
    return row;
  }

  async listForTenant(tenantId: string, limit = 50): Promise<PilotFeedback[]> {
    const result = await this.db
      .prepare(
        `SELECT * FROM pilot_feedback
         WHERE tenant_id = ?
         ORDER BY submitted_at DESC
         LIMIT ?`,
      )
      .bind(tenantId, limit)
      .all<PilotFeedback>();
    return result.results;
  }

  async summary(since?: string): Promise<FeedbackSummary> {
    const cutoff = since ?? '1970-01-01T00:00:00.000Z';

    const counts = await this.db
      .prepare(
        `SELECT feedback_type, COUNT(*) AS cnt
         FROM pilot_feedback
         WHERE submitted_at >= ?
         GROUP BY feedback_type`,
      )
      .bind(cutoff)
      .all<{ feedback_type: PilotFeedbackType; cnt: number }>();

    const npsStats = await this.db
      .prepare(
        `SELECT
           COUNT(*)                                         AS total_nps,
           AVG(nps_score)                                   AS avg_nps,
           SUM(CASE WHEN nps_score >= 9 THEN 1 ELSE 0 END) AS promoters,
           SUM(CASE WHEN nps_score BETWEEN 7 AND 8 THEN 1 ELSE 0 END) AS passives,
           SUM(CASE WHEN nps_score <= 6 THEN 1 ELSE 0 END) AS detractors
         FROM pilot_feedback
         WHERE feedback_type = 'nps' AND nps_score IS NOT NULL AND submitted_at >= ?`,
      )
      .bind(cutoff)
      .first<{
        total_nps: number;
        avg_nps: number | null;
        promoters: number;
        passives: number;
        detractors: number;
      }>();

    const byType: Record<PilotFeedbackType, number> = {
      nps: 0,
      bug: 0,
      feature_request: 0,
      general: 0,
    };
    let total = 0;
    for (const row of counts.results) {
      byType[row.feedback_type] = row.cnt;
      total += row.cnt;
    }

    const promoters  = npsStats?.promoters ?? 0;
    const detractors = npsStats?.detractors ?? 0;
    const totalNps   = npsStats?.total_nps ?? 0;
    const npsScore   = totalNps > 0
      ? Math.round(((promoters - detractors) / totalNps) * 100)
      : null;

    return {
      total,
      avg_nps: npsStats?.avg_nps ?? null,
      by_type: byType,
      promoters,
      passives:    npsStats?.passives ?? 0,
      detractors,
      nps_score: npsScore,
    };
  }
}
