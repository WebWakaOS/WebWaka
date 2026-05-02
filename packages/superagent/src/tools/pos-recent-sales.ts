/**
 * Built-in tool: pos_recent_sales
 * SA-5.x — Returns aggregated POS sales summary for recent transactions.
 *
 * Platform Invariants:
 *   T3  — Query is tenant-scoped via tenantId in ToolExecutionContext
 *   P13 — Returns aggregate totals only. cashier_id is included (staff, not customer PII).
 *         Customer names and phone numbers are never exposed.
 */

import type { RegisteredTool } from '../tool-registry.js';

export const posRecentSalesTool: RegisteredTool = {
  definition: {
    type: 'function',
    function: {
      name: 'pos_recent_sales',
      description:
        'Retrieve a summary of recent Point-of-Sale transactions for this workspace. ' +
        'Returns total revenue, transaction count, and payment method breakdown ' +
        'for the specified time window. Use this for shift summaries or revenue reports.',
      parameters: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            description:
              'Time period to query. ' +
              '"today" = current calendar day, ' +
              '"week" = last 7 days, ' +
              '"month" = last 30 days.',
            enum: ['today', 'week', 'month'],
          },
        },
        required: ['period'],
      },
    },
  },

  async handler(args, ctx) {
    const period = (args.period as string) || 'today';

    // Compute unix timestamp cutoff
    const now = Math.floor(Date.now() / 1000);
    const cutoff =
      period === 'today'
        ? now - 86400
        : period === 'week'
          ? now - 7 * 86400
          : now - 30 * 86400;

    // Total revenue + count
    const summary = await ctx.db
      .prepare(
        `SELECT
           COUNT(*)            AS txn_count,
           COALESCE(SUM(total_kobo), 0) AS total_kobo
         FROM pos_sales
         WHERE tenant_id = ? AND created_at >= ?`,
      )
      .bind(ctx.tenantId, cutoff)
      .first<{ txn_count: number; total_kobo: number }>();

    // Payment method breakdown
    const { results: breakdown } = await ctx.db
      .prepare(
        `SELECT payment_method, COUNT(*) AS count,
                COALESCE(SUM(total_kobo), 0) AS total_kobo
         FROM   pos_sales
         WHERE  tenant_id = ? AND created_at >= ?
         GROUP BY payment_method`,
      )
      .bind(ctx.tenantId, cutoff)
      .all<{ payment_method: string; count: number; total_kobo: number }>();

    const periodLabel =
      period === 'today' ? 'today' : period === 'week' ? 'last 7 days' : 'last 30 days';

    return JSON.stringify({
      status: 'ok',
      period: periodLabel,
      total_transactions: summary?.txn_count ?? 0,
      total_revenue_kobo: summary?.total_kobo ?? 0,
      payment_breakdown: (breakdown ?? []).map((b) => ({
        method: b.payment_method,
        count: b.count,
        revenue_kobo: b.total_kobo,
      })),
    });
  },
  metadata: { pillar: 1, autonomyThreshold: null, readOnly: true },
};
