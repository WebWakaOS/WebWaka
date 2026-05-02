/**
 * get_customer_history tool — SA-5.x / Wave 3
 * CRM read-only tool — returns a customer's purchase history by phone reference.
 *
 * P13 — Returns aggregated purchase data; raw PII (phone numbers, names) are
 *        never returned in the tool response. The caller must pass a hashed
 *        customer reference, not a raw phone number.
 * T3  — All queries tenant-scoped.
 */

import type { RegisteredTool } from '../tool-registry.js';

export const getCustomerHistoryTool: RegisteredTool = {
  definition: {
    type: 'function',
    function: {
      name: 'get_customer_history',
      description:
        'Get a customer\'s purchase history and spending summary by their customer ID. ' +
        'Returns order counts, total spend, and top products purchased — no raw PII.',
      parameters: {
        type: 'object',
        properties: {
          customer_id: {
            type: 'string',
            description: 'The customer\'s unique ID (not their phone number)',
          },
          limit: {
            type: 'integer',
            description: 'Number of recent orders to include (default: 10)',
          },
        },
        required: ['customer_id'],
      },
    },
  },
  handler: async (args, ctx) => {
    const customerId = String(args.customer_id ?? '').trim();
    const limit = Math.min(Number(args.limit ?? 10), 50);

    if (!customerId) {
      return JSON.stringify({ error: 'INVALID_ARGS', message: 'customer_id is required' });
    }

    try {
      // Summary stats
      const summary = await ctx.db
        .prepare(
          `SELECT
             COUNT(*) as order_count,
             SUM(total_kobo) as total_spend_kobo,
             MAX(created_at) as last_purchase_at
           FROM pos_transactions
           WHERE tenant_id = ? AND workspace_id = ? AND customer_id = ?`,
        )
        .bind(ctx.tenantId, ctx.workspaceId, customerId)
        .first<{ order_count: number; total_spend_kobo: number | null; last_purchase_at: string | null }>();

      if (!summary || summary.order_count === 0) {
        return JSON.stringify({ message: `No purchase history found for customer ${customerId}` });
      }

      // Recent orders
      const { results: recentOrders } = await ctx.db
        .prepare(
          `SELECT id, total_kobo, created_at, status
           FROM pos_transactions
           WHERE tenant_id = ? AND workspace_id = ? AND customer_id = ?
           ORDER BY created_at DESC
           LIMIT ?`,
        )
        .bind(ctx.tenantId, ctx.workspaceId, customerId, limit)
        .all<{ id: string; total_kobo: number; created_at: string; status: string }>();

      return JSON.stringify({
        customerId,
        orderCount: summary.order_count,
        totalSpendKobo: summary.total_spend_kobo ?? 0,
        totalSpendNaira: ((summary.total_spend_kobo ?? 0) / 100).toFixed(2),
        lastPurchaseAt: summary.last_purchase_at,
        recentOrders: recentOrders.map((o) => ({
          id: o.id,
          totalKobo: o.total_kobo,
          totalNaira: (o.total_kobo / 100).toFixed(2),
          status: o.status,
          date: o.created_at,
        })),
      });
    } catch (err) {
      return JSON.stringify({
        error: 'QUERY_ERROR',
        message: err instanceof Error ? err.message : 'Failed to fetch customer history',
      });
    }
  },
};
