/**
 * Built-in tool: update_inventory
 * SA-5.x — Adjusts stock_qty on a pos_products row.
 *
 * Platform Invariants:
 *   T3  — All writes tenant-scoped; product_id validated against tenantId
 *   P9  — No monetary values stored; delta is a stock count (not kobo)
 *   P13 — Returns product id, name, old_stock, new_stock only
 *
 * HITL gating:
 *   autonomyLevel >= 3 → direct D1 UPDATE
 *   autonomyLevel < 3  → HITL queue item, returns { deferred: true, queue_item_id }
 *
 * Safety: rejects any delta that would make stock_qty negative.
 */

import type { RegisteredTool } from '../tool-registry.js';

export const updateInventoryTool: RegisteredTool = {
  definition: {
    type: 'function',
    function: {
      name: 'update_inventory',
      description:
        'Adjust the stock quantity of a product in this workspace. ' +
        'Use a positive delta to restock (add units) or a negative delta to record a sale adjustment (subtract units). ' +
        'The update will fail if the result would make stock negative. ' +
        'Use inventory_check first to find the product and verify current stock levels. ' +
        'For sensitive verticals, the update will be queued for human approval.',
      parameters: {
        type: 'object',
        properties: {
          product_name: {
            type: 'string',
            description:
              'Exact product name as returned by inventory_check. ' +
              'Used to look up the product ID — do NOT fabricate this value.',
          },
          delta: {
            type: 'number',
            description:
              'Stock quantity change. Positive = restock (add units). ' +
              'Negative = sale adjustment (subtract units). ' +
              'Must be a non-zero integer.',
          },
          reason: {
            type: 'string',
            description:
              'Optional short reason for the adjustment (e.g. "restock from supplier", "sale adjustment"). ' +
              'Do not include PII.',
          },
        },
        required: ['product_name', 'delta'],
      },
    },
  },

  async handler(args, ctx) {
    const productName = typeof args.product_name === 'string' ? args.product_name.trim() : '';
    const delta       = args.delta;
    const reason      = typeof args.reason === 'string' ? args.reason.trim().slice(0, 200) : null;

    if (!productName) {
      return JSON.stringify({ error: 'MISSING_PRODUCT_NAME', message: 'product_name is required.' });
    }
    if (typeof delta !== 'number' || !Number.isFinite(delta) || !Number.isInteger(delta) || delta === 0) {
      return JSON.stringify({
        error: 'INVALID_DELTA',
        message: `delta must be a non-zero integer, got ${JSON.stringify(delta)}.`,
      });
    }

    // T3: Look up product by name, scoped to tenant
    const product = await ctx.db
      .prepare(
        `SELECT id, name, stock_qty, active
         FROM   pos_products
         WHERE  tenant_id = ? AND name = ? AND active = 1
         LIMIT  1`,
      )
      .bind(ctx.tenantId, productName)
      .first<{ id: string; name: string; stock_qty: number; active: number }>();

    if (!product) {
      return JSON.stringify({
        error: 'PRODUCT_NOT_FOUND',
        message: `No active product named '${productName}' found in this workspace.`,
      });
    }

    const newStock = product.stock_qty + delta;
    if (newStock < 0) {
      return JSON.stringify({
        error: 'WOULD_MAKE_STOCK_NEGATIVE',
        product_name: product.name,
        current_stock: product.stock_qty,
        delta,
        message:
          `This adjustment would reduce stock to ${newStock}, which is below zero. ` +
          `Current stock: ${product.stock_qty}. Maximum reduction allowed: -${product.stock_qty}.`,
      });
    }

    // HITL gating — threshold: autonomyLevel >= 3 to write directly
    if (ctx.autonomyLevel < 3) {
      const payload = JSON.stringify({
        tool: 'update_inventory',
        product_id: product.id,
        product_name: product.name,
        current_stock: product.stock_qty,
        delta,
        new_stock: newStock,
        reason,
        workspace_id: ctx.workspaceId,
      });
      const { queueItemId } = await ctx.hitlService.submit({
        tenantId: ctx.tenantId,
        workspaceId: ctx.workspaceId,
        userId: ctx.userId,
        vertical: ctx.vertical,
        capability: 'function_call',
        hitlLevel: 2,
        aiRequestPayload: payload,
        expiresInHours: 24,
      });
      return JSON.stringify({
        deferred: true,
        queue_item_id: queueItemId,
        product_name: product.name,
        current_stock: product.stock_qty,
        proposed_new_stock: newStock,
        message:
          'The inventory update has been queued for human approval. ' +
          'Please inform the user that a workspace administrator will review the adjustment.',
      });
    }

    // Autonomy >= 3: update directly with optimistic lock on current stock_qty
    const result = await ctx.db
      .prepare(
        `UPDATE pos_products
         SET    stock_qty = ?, updated_at = unixepoch()
         WHERE  id = ? AND tenant_id = ? AND stock_qty = ?`,
      )
      .bind(newStock, product.id, ctx.tenantId, product.stock_qty)
      .run();

    if (!result.success || (result.meta?.changes ?? 0) === 0) {
      return JSON.stringify({
        error: 'CONCURRENT_MODIFICATION',
        message:
          'Stock was modified by another process while this update was being prepared. ' +
          'Please use inventory_check to get the latest stock level and try again.',
      });
    }

    return JSON.stringify({
      status: 'ok',
      product_name: product.name,
      old_stock: product.stock_qty,
      new_stock: newStock,
      delta,
      message: `Inventory updated. ${product.name}: ${product.stock_qty} → ${newStock} units${reason ? ` (${reason})` : ''}.`,
    });
  },
};
