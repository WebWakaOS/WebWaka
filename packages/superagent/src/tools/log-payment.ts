/**
 * log_payment tool — SA-5.x / Wave 3
 * Write-capable tool — HITL-gated at autonomy < 3.
 * Guards against direct financial table writes via guardAIFinancialWrite.
 *
 * Logs an inbound payment record to the payment_logs table (not a core financial table).
 * This is for recording received payments from customers — NOT for modifying wallet balances.
 *
 * P9  — All monetary values must be integers (kobo).
 * P13 — Payment reference only; no customer name/phone stored directly.
 * T3  — Tenant-scoped writes.
 */

import type { RegisteredTool } from '../tool-registry.js';
import { guardAIFinancialWrite } from '../guards.js';

export const logPaymentTool: RegisteredTool = {
  definition: {
    type: 'function',
    function: {
      name: 'log_payment',
      description:
        'Log a received payment from a customer. Use this to record cash, transfer, or POS payments. ' +
        'Does not modify wallet balances — this is a record-keeping tool only. Requires human approval if autonomy is below threshold.',
      parameters: {
        type: 'object',
        properties: {
          amount_kobo: {
            type: 'integer',
            description: 'Payment amount in kobo (integer, e.g. 500000 = ₦5,000)',
          },
          payment_method: {
            type: 'string',
            enum: ['cash', 'bank_transfer', 'pos', 'mobile_money', 'other'],
            description: 'Method of payment received',
          },
          reference: {
            type: 'string',
            description: 'Payment reference or transaction ID (no customer PII)',
          },
          notes: {
            type: 'string',
            description: 'Optional notes about this payment (max 500 chars)',
          },
        },
        required: ['amount_kobo', 'payment_method'],
      },
    },
  },
  handler: async (args, ctx) => {
    const amountKobo = parseInt(String(args.amount_kobo ?? '0'), 10);
    const paymentMethod = String(args.payment_method ?? '');
    const reference = String(args.reference ?? '').trim().slice(0, 100);
    const notes = String(args.notes ?? '').trim().slice(0, 500);

    if (!Number.isInteger(amountKobo) || amountKobo <= 0) {
      return JSON.stringify({ error: 'INVALID_ARGS', message: 'amount_kobo must be a positive integer' });
    }
    if (!paymentMethod) {
      return JSON.stringify({ error: 'INVALID_ARGS', message: 'payment_method is required' });
    }

    // HITL gate
    if (ctx.autonomyLevel < 3) {
      const hitlId = await ctx.hitlService.submit({
        tenantId: ctx.tenantId,
        workspaceId: ctx.workspaceId,
        userId: ctx.userId,
        vertical: ctx.vertical,
        capability: 'function_call',
        hitlLevel: 1,
        aiRequestPayload: JSON.stringify({ amountKobo, paymentMethod, reference }),
      });
      return JSON.stringify({
        status: 'queued_for_review',
        hitlId: hitlId.queueItemId,
        message: `Payment log queued for review (₦${(amountKobo / 100).toFixed(2)} via ${paymentMethod}). HITL ID: ${hitlId.queueItemId}`,
      });
    }

    const insertSql = `INSERT INTO payment_logs (id, tenant_id, workspace_id, user_id, amount_kobo, payment_method, reference, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`;

    // Guard against accidental financial table writes (P9 invariant)
    guardAIFinancialWrite(insertSql);

    try {
      const logId = crypto.randomUUID();
      await ctx.db
        .prepare(insertSql)
        .bind(logId, ctx.tenantId, ctx.workspaceId, ctx.userId, amountKobo, paymentMethod, reference, notes)
        .run();

      return JSON.stringify({
        status: 'logged',
        logId,
        amountKobo,
        amountNaira: (amountKobo / 100).toFixed(2),
        paymentMethod,
        message: `Payment of ₦${(amountKobo / 100).toFixed(2)} via ${paymentMethod} logged successfully.`,
      });
    } catch (err) {
      return JSON.stringify({
        error: 'WRITE_ERROR',
        message: err instanceof Error ? err.message : 'Failed to log payment',
      });
    }
  },
  metadata: { pillar: 1, autonomyThreshold: 3, readOnly: false },
};
