/**
 * Built-in tool: inventory_check
 * SA-5.x — Queries the pos_products table for current stock levels.
 *
 * Platform Invariants:
 *   T3  — Query is tenant-scoped via tenantId in ToolExecutionContext
 *   P13 — Returns product names and stock quantities only (no customer PII)
 */

import type { RegisteredTool } from '../tool-registry.js';

export const inventoryCheckTool: RegisteredTool = {
  definition: {
    type: 'function',
    function: {
      name: 'inventory_check',
      description:
        'Check current stock levels for products in this workspace. ' +
        'Returns a list of products with their current stock quantities, ' +
        'highlighting items that are low or out of stock. ' +
        'Optionally filter by a specific SKU or product name.',
      parameters: {
        type: 'object',
        properties: {
          filter: {
            type: 'string',
            description:
              'Optional: partial SKU or product name to filter results. ' +
              'Leave empty to retrieve all products.',
          },
          low_stock_only: {
            type: 'string',
            description: 'Set to "true" to return only low-stock items (qty ≤ 5).',
            enum: ['true', 'false'],
          },
        },
        required: [],
      },
    },
  },

  async handler(args, ctx) {
    const filter = typeof args.filter === 'string' ? args.filter.trim() : '';
    const lowStockOnly = args.low_stock_only === 'true';

    let sql = `
      SELECT id, name, sku, stock_qty, category, price_kobo
      FROM   pos_products
      WHERE  tenant_id = ?
        AND  active = 1
    `;
    const bindings: unknown[] = [ctx.tenantId];

    if (filter) {
      sql += ' AND (name LIKE ? OR sku LIKE ?)';
      bindings.push(`%${filter}%`, `%${filter}%`);
    }

    if (lowStockOnly) {
      sql += ' AND stock_qty <= 5';
    }

    sql += ' ORDER BY stock_qty ASC, name ASC LIMIT 50';

    const { results } = await ctx.db
      .prepare(sql)
      .bind(...bindings)
      .all<{ id: string; name: string; sku: string | null; stock_qty: number; category: string | null; price_kobo: number }>();

    if (!results || results.length === 0) {
      return JSON.stringify({
        status: 'ok',
        message: filter
          ? `No products found matching '${filter}'.`
          : lowStockOnly
            ? 'No low-stock items found. All products are adequately stocked.'
            : 'No active products found in this workspace.',
        products: [],
      });
    }

    const products = results.map((r) => ({
      product_id: r.id,
      name: r.name,
      sku: r.sku ?? '—',
      category: r.category ?? 'Uncategorised',
      stock_qty: r.stock_qty,
      stock_status:
        r.stock_qty === 0 ? 'OUT_OF_STOCK' : r.stock_qty <= 5 ? 'LOW_STOCK' : 'IN_STOCK',
      price_kobo: r.price_kobo,
    }));

    const outOfStock = products.filter((p) => p.stock_status === 'OUT_OF_STOCK').length;
    const lowStock = products.filter((p) => p.stock_status === 'LOW_STOCK').length;

    return JSON.stringify({
      status: 'ok',
      total_products: results.length,
      out_of_stock_count: outOfStock,
      low_stock_count: lowStock,
      products,
    });
  },
  metadata: { pillar: 1, autonomyThreshold: null, readOnly: true },
};
