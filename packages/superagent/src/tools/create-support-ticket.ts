/**
 * create_support_ticket tool — SA-5.x / Wave 3
 * Write-capable tool — HITL-gated at autonomy < 2.
 * Submits a support ticket on behalf of the tenant user.
 *
 * P13 — Ticket subject/body may contain user-entered text; caller must strip PII.
 * T3  — All writes tenant-scoped.
 */

import type { RegisteredTool } from '../tool-registry.js';

export const createSupportTicketTool: RegisteredTool = {
  definition: {
    type: 'function',
    function: {
      name: 'create_support_ticket',
      description:
        'Create a support ticket for the workspace. Use this when the user reports a problem ' +
        'that requires platform support intervention. Requires human approval (HITL).',
      parameters: {
        type: 'object',
        properties: {
          subject: {
            type: 'string',
            description: 'Brief description of the issue (max 200 characters)',
          },
          description: {
            type: 'string',
            description: 'Detailed description of the problem',
          },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
            description: 'Ticket priority (default: medium)',
          },
          category: {
            type: 'string',
            enum: ['billing', 'technical', 'account', 'feature_request', 'other'],
            description: 'Ticket category',
          },
        },
        required: ['subject', 'description'],
      },
    },
  },
  handler: async (args, ctx) => {
    const subject = String(args.subject ?? '').trim().slice(0, 200);
    const description = String(args.description ?? '').trim();
    const priority = ['low', 'medium', 'high'].includes(String(args.priority))
      ? String(args.priority)
      : 'medium';
    const category = ['billing', 'technical', 'account', 'feature_request', 'other'].includes(String(args.category))
      ? String(args.category)
      : 'other';

    if (!subject || !description) {
      return JSON.stringify({ error: 'INVALID_ARGS', message: 'subject and description are required' });
    }

    // HITL gate — support tickets always require human review (autonomy < 2)
    if (ctx.autonomyLevel < 2) {
      const hitlId = await ctx.hitlService.submit({
        tenantId: ctx.tenantId,
        workspaceId: ctx.workspaceId,
        userId: ctx.userId,
        vertical: ctx.vertical,
        capability: 'function_call',
        hitlLevel: 1,
        aiRequestPayload: JSON.stringify({ subject, description, priority, category }),
      });
      return JSON.stringify({
        status: 'queued_for_review',
        hitlId,
        message: `Support ticket submission has been queued for admin review (HITL ID: ${hitlId}).`,
      });
    }

    try {
      const ticketId = crypto.randomUUID();
      await ctx.db
        .prepare(
          `INSERT INTO support_tickets (id, tenant_id, workspace_id, user_id, subject, description, priority, category, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open', datetime('now'))`,
        )
        .bind(
          ticketId,
          ctx.tenantId,
          ctx.workspaceId,
          ctx.userId,
          subject,
          description,
          priority,
          category,
        )
        .run();

      return JSON.stringify({
        status: 'created',
        ticketId,
        subject,
        priority,
        category,
        message: `Support ticket created successfully (ID: ${ticketId}).`,
      });
    } catch (err) {
      return JSON.stringify({
        error: 'WRITE_ERROR',
        message: err instanceof Error ? err.message : 'Failed to create support ticket',
      });
    }
  },
  metadata: { pillar: 2, autonomyThreshold: 2, readOnly: false },
};
