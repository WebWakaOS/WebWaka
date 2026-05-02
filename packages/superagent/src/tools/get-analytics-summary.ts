/**
 * get_analytics_summary tool — SA-5.x / Wave 3
 * Pillar 1 — Read-only analytics tool.
 * Returns daily/weekly revenue and order statistics for the agent's context.
 *
 * P13 — Aggregated data only, no individual transaction or customer PII.
 * T3  — All queries tenant-scoped.
 */

import type { RegisteredTool } from '../tool-registry.js';

export const getAnalyticsSummaryTool: RegisteredTool = {
  definition: {
    type: 'function',
    function: {
      name: 'get_analytics_summary',
      description:
        'Get aggregated revenue and order statistics for the workspace. ' +
        'Returns total sales, order counts, and top products for the requested period.',
      parameters: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            enum: ['today', 'yesterday', 'last_7_days', 'last_30_days'],
            description: 'Time period for the analytics summary (default: today)',
          },
        },
        required: [],
      },
    },
  },
  handler: async (args, ctx) => {
    const period = String(args.period ?? 'today');

    const dateFilter: Record<string, string> = {
      today: "date(created_at) = date('now')",
      yesterday: "date(created_at) = date('now', '-1 day')",
      last_7_days: "created_at >= datetime('now', '-7 days')",
      last_30_days: "created_at >= datetime('now', '-30 days')",
    };

    const filter = dateFilter[period] ?? dateFilter['today'];

    try {
      // Revenue + order count
      const summary = await ctx.db
        .prepare(
          `SELECT
             COUNT(*) as order_count,
             COALESCE(SUM(total_kobo), 0) as revenue_kobo,
             COALESCE(AVG(total_kobo), 0) as avg_order_kobo
           FROM pos_transactions
           WHERE tenant_id = ? AND workspace_id = ? AND status = 'completed'
             AND ${filter}`,
        )
        .bind(ctx.tenantId, ctx.workspaceId)
        .first<{ order_count: number; revenue_kobo: number; avg_order_kobo: number }>();

      // Top 5 products by revenue
      const { results: topProducts } = await ctx.db
        .prepare(
          `SELECT
             oi.product_name,
             SUM(oi.quantity) as units_sold,
             SUM(oi.line_total_kobo) as revenue_kobo
           FROM pos_order_items oi
           JOIN pos_transactions t ON oi.transaction_id = t.id
           WHERE t.tenant_id = ? AND t.workspace_id = ? AND t.status = 'completed'
             AND ${filter}
           GROUP BY oi.product_name
           ORDER BY revenue_kobo DESC
           LIMIT 5`,
        )
        .bind(ctx.tenantId, ctx.workspaceId)
        .all<{ product_name: string; units_sold: number; revenue_kobo: number }>();

      return JSON.stringify({
        period,
        orderCount: summary?.order_count ?? 0,
        revenueKobo: summary?.revenue_kobo ?? 0,
        revenueNaira: ((summary?.revenue_kobo ?? 0) / 100).toFixed(2),
        avgOrderNaira: ((summary?.avg_order_kobo ?? 0) / 100).toFixed(2),
        topProducts: topProducts.map((p) => ({
          name: p.product_name,
          unitsSold: p.units_sold,
          revenueNaira: (p.revenue_kobo / 100).toFixed(2),
        })),
      });
    } catch (err) {
      return JSON.stringify({
        error: 'QUERY_ERROR',
        message: err instanceof Error ? err.message : 'Failed to fetch analytics',
      });
    }
  },
};
