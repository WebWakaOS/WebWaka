/**
 * search_offerings tool — SA-5.x / Wave 3
 * Pillar 3 — Marketplace read-only tool.
 * Searches active offerings for the tenant's workspace by keyword.
 * Used to give the agent context when responding to product/service queries.
 *
 * P13 — No PII returned. T3 — All queries tenant-scoped.
 */

import type { RegisteredTool } from '../tool-registry.js';

export const searchOfferingsTool: RegisteredTool = {
  definition: {
    type: 'function',
    function: {
      name: 'search_offerings',
      description:
        'Search the business catalogue (products, services, or tickets) by keyword. ' +
        'Returns matching items with name, price, and availability.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search keyword (product name, category, or service type)',
          },
          limit: {
            type: 'integer',
            description: 'Maximum number of results to return (default: 10, max: 25)',
          },
        },
        required: ['query'],
      },
    },
  },
  handler: async (args, ctx) => {
    const query = String(args.query ?? '').trim();
    const limit = Math.min(Number(args.limit ?? 10), 25);

    if (!query) {
      return JSON.stringify({ error: 'INVALID_ARGS', message: 'query is required' });
    }

    try {
      const { results } = await ctx.db
        .prepare(
          `SELECT o.id, o.name, o.price_kobo, o.currency, o.category, o.status
           FROM offerings o
           WHERE o.tenant_id = ?
             AND o.workspace_id = ?
             AND o.status = 'active'
             AND (o.name LIKE ? OR o.category LIKE ? OR o.description LIKE ?)
           ORDER BY o.name ASC
           LIMIT ?`,
        )
        .bind(
          ctx.tenantId,
          ctx.workspaceId,
          `%${query}%`,
          `%${query}%`,
          `%${query}%`,
          limit,
        )
        .all<{
          id: string;
          name: string;
          price_kobo: number;
          currency: string;
          category: string | null;
          status: string;
        }>();

      if (results.length === 0) {
        return JSON.stringify({ offerings: [], message: `No active offerings matched "${query}"` });
      }

      return JSON.stringify({
        offerings: results.map((r) => ({
          id: r.id,
          name: r.name,
          priceKobo: r.price_kobo,
          priceNaira: (r.price_kobo / 100).toFixed(2),
          category: r.category ?? 'uncategorized',
          status: r.status,
        })),
        count: results.length,
      });
    } catch (err) {
      return JSON.stringify({
        error: 'QUERY_ERROR',
        message: err instanceof Error ? err.message : 'Failed to search offerings',
      });
    }
  },
};
