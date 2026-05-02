/**
 * Built-in tool: create_invoice
 * SA-5.x — Creates a draft invoice row in ai_agent_invoices.
 *
 * Platform Invariants:
 *   T3  — All writes tenant-scoped via tenantId in ToolExecutionContext
 *   P9  — All monetary values MUST be integer kobo. Float inputs are rejected.
 *         All monetary outputs are in kobo only — no naira formatting.
 *   P13 — contact_id reference only; no raw PII stored in line item descriptions
 *
 * HITL gating:
 *   autonomyLevel >= 3 → direct D1 insert with status 'draft'
 *   autonomyLevel < 3  → HITL queue item, returns { deferred: true, queue_item_id }
 */

import type { RegisteredTool } from '../tool-registry.js';

interface LineItem {
  description: string;
  qty: number;
  unit_price_kobo: number;
  total_kobo: number;
}

interface RawLineItem {
  description: unknown;
  qty: unknown;
  unit_price_kobo: unknown;
}

function isPositiveInteger(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v) && Number.isInteger(v) && v > 0;
}

export const createInvoiceTool: RegisteredTool = {
  definition: {
    type: 'function',
    function: {
      name: 'create_invoice',
      description:
        'Create a draft invoice for a customer in this workspace. ' +
        'All prices MUST be in integer kobo (100 kobo = ₦1). For example, ₦1,500 = 150000 kobo. ' +
        'Float values will be rejected. ' +
        'Returns the invoice ID and total_kobo on success. ' +
        'For sensitive verticals, the invoice will be queued for human approval first.',
      parameters: {
        type: 'object',
        properties: {
          contact_id: {
            type: 'string',
            description:
              'The entity ID of the customer to invoice (from customer_lookup). ' +
              'Required for tenant isolation — do NOT guess or fabricate this value.',
          },
          line_items: {
            type: 'array',
            description:
              'Array of invoice line items. Each item must have description, qty (positive integer), ' +
              'and unit_price_kobo (positive integer — NOT naira, NOT a float).',
            items: {
              type: 'object',
              properties: {
                description:     { type: 'string', description: 'Item or service description.' },
                qty:             { type: 'number', description: 'Quantity (positive integer).', minimum: 1 },
                unit_price_kobo: { type: 'number', description: 'Unit price in integer kobo. 100 kobo = ₦1.', minimum: 1 },
              },
              required: ['description', 'qty', 'unit_price_kobo'],
            },
          },
          due_date: {
            type: 'string',
            description: 'Optional due date in ISO-8601 format (e.g. "2026-06-01").',
          },
        },
        required: ['contact_id', 'line_items'],
      },
    },
  },

  async handler(args, ctx) {
    const contactId = typeof args.contact_id === 'string' ? args.contact_id.trim() : '';
    const rawItems  = Array.isArray(args.line_items) ? (args.line_items as RawLineItem[]) : [];
    const dueDate   = typeof args.due_date === 'string' ? args.due_date.trim() || null : null;

    if (!contactId) {
      return JSON.stringify({ error: 'MISSING_CONTACT_ID', message: 'contact_id is required.' });
    }
    if (rawItems.length === 0) {
      return JSON.stringify({ error: 'EMPTY_LINE_ITEMS', message: 'At least one line item is required.' });
    }

    // P9: validate all kobo values are positive integers — reject floats
    const lineItems: LineItem[] = [];
    for (const [i, item] of rawItems.entries()) {
      const desc  = typeof item.description === 'string' ? item.description.trim() : '';
      const qty: unknown   = item.qty;
      const price: unknown = item.unit_price_kobo;

      if (!desc) {
        return JSON.stringify({ error: 'INVALID_LINE_ITEM', message: `Line item ${i + 1}: description is required.` });
      }
      if (!isPositiveInteger(qty)) {
        return JSON.stringify({ error: 'INVALID_LINE_ITEM', message: `Line item ${i + 1}: qty must be a positive integer, got ${JSON.stringify(qty)}.` });
      }
      if (!isPositiveInteger(price)) {
        return JSON.stringify({
          error: 'P9_VIOLATION',
          message: `Line item ${i + 1}: unit_price_kobo must be a positive integer kobo value, got ${JSON.stringify(price)}. Do not use naira or floats.`,
        });
      }
      lineItems.push({ description: desc, qty, unit_price_kobo: price, total_kobo: qty * price });
    }

    const totalKobo = lineItems.reduce((sum, l) => sum + l.total_kobo, 0);

    // T3: Verify contact_id belongs to this tenant
    const contact = await ctx.db
      .prepare(
        `SELECT id FROM individuals WHERE id = ? AND tenant_id = ?
         UNION ALL
         SELECT id FROM organizations WHERE id = ? AND tenant_id = ?
         LIMIT 1`,
      )
      .bind(contactId, ctx.tenantId, contactId, ctx.tenantId)
      .first<{ id: string }>();

    if (!contact) {
      return JSON.stringify({
        error: 'CONTACT_NOT_FOUND',
        message: `No contact with id '${contactId}' found in this workspace.`,
      });
    }

    const lineItemsJson = JSON.stringify(lineItems);

    // HITL gating — threshold: autonomyLevel >= 3 to write directly
    if (ctx.autonomyLevel < 3) {
      const payload = JSON.stringify({
        tool: 'create_invoice',
        contact_id: contactId,
        line_items: lineItems,
        total_kobo: totalKobo,
        due_date: dueDate,
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
        total_kobo: totalKobo,
        message:
          'The invoice has been queued for human approval. ' +
          'A workspace administrator will review and send the invoice.',
      });
    }

    // Autonomy >= 3: write draft invoice directly
    const id = crypto.randomUUID();
    await ctx.db
      .prepare(
        `INSERT INTO ai_agent_invoices
           (id, tenant_id, workspace_id, contact_id, line_items, total_kobo, due_date, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?)`,
      )
      .bind(id, ctx.tenantId, ctx.workspaceId, contactId, lineItemsJson, totalKobo, dueDate, ctx.userId)
      .run();

    return JSON.stringify({
      status: 'ok',
      invoice_id: id,
      total_kobo: totalKobo,
      line_item_count: lineItems.length,
      message: `Draft invoice created. Invoice ID: ${id}. Total: ${totalKobo} kobo.`,
    });
  },
  metadata: { pillar: 1, autonomyThreshold: 3, readOnly: false },
};
