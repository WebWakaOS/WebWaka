/**
 * Built-in tool: get_active_offerings
 * SA-5.x — Lists published offerings from the workspace's offerings table.
 *
 * Platform Invariants:
 *   T3  — Query is tenant-scoped via tenantId in ToolExecutionContext
 *   P13 — Returns product/service information only (no customer PII)
 */

import type { RegisteredTool } from '../tool-registry.js';

export const getActiveOfferingsTool: RegisteredTool = {
  definition: {
    type: 'function',
    function: {
      name: 'get_active_offerings',
      description:
        'List the active (published) offerings for this workspace. ' +
        'Returns name, description, category, and price for each offering. ' +
        'Useful for answering questions about available products or services, ' +
        'generating product copy, or building price lists.',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description:
              'Optional: filter by offering category. ' +
              'Leave empty to list all published offerings.',
          },
          limit: {
            type: 'string',
            description: 'Maximum number of offerings to return (1–50). Defaults to 20.',
          },
        },
        required: [],
      },
    },
  },

  async handler(args, ctx) {
    const category =
      typeof args.category === 'string' ? args.category.trim() : '';
    const limitRaw = parseInt(String(args.limit ?? '20'), 10);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 20;

    let sql = `
      SELECT name, description, category, price_kobo, sort_order
      FROM   offerings
      WHERE  tenant_id = ? AND is_published = 1
    `;
    const bindings: unknown[] = [ctx.tenantId];

    if (category) {
      sql += ' AND category = ?';
      bindings.push(category);
    }

    sql += ' ORDER BY sort_order ASC, name ASC LIMIT ?';
    bindings.push(limit);

    const { results } = await ctx.db
      .prepare(sql)
      .bind(...bindings)
      .all<{
        name: string;
        description: string | null;
        category: string | null;
        price_kobo: number | null;
        sort_order: number;
      }>();

    if (!results || results.length === 0) {
      return JSON.stringify({
        status: 'ok',
        message: category
          ? `No published offerings found in category '${category}'.`
          : 'No published offerings found for this workspace.',
        offerings: [],
      });
    }

    return JSON.stringify({
      status: 'ok',
      total: results.length,
      offerings: results.map((r) => ({
        name: r.name,
        category: r.category ?? 'General',
        description: r.description ?? '',
        price_kobo: r.price_kobo ?? 0,
      })),
    });
  },
};
