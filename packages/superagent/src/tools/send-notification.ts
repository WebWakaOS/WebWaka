/**
 * Built-in tool: send_notification
 * SA-5.x — Queues a business notification to a contact via ai_agent_outbox.
 *
 * Platform Invariants:
 *   T3  — All writes tenant-scoped via tenantId in ToolExecutionContext
 *   P13 — Message is PII-stripped via stripPii() before storage. contact_id
 *          reference only (no raw name/phone/email stored).
 *
 * HITL gating (more conservative than other write tools):
 *   autonomyLevel >= 2 → insert into ai_agent_outbox (queued for delivery)
 *   autonomyLevel < 2  → HITL queue item, returns { deferred: true, queue_item_id }
 *
 *   The lower autonomy threshold (2 vs 3 for bookings/invoices) reflects that
 *   notifications reach external parties and are irreversible once sent.
 */

import type { RegisteredTool } from '../tool-registry.js';
import { stripPii } from '../compliance-filter.js';

const VALID_CHANNELS = new Set(['inapp', 'sms', 'email']);

export const sendNotificationTool: RegisteredTool = {
  definition: {
    type: 'function',
    function: {
      name: 'send_notification',
      description:
        'Send a notification message to a customer via their preferred channel. ' +
        'The message must not contain phone numbers, email addresses, or other personal details — ' +
        'only reference the contact by their ID. Maximum 500 characters. ' +
        'For sensitive verticals, the notification will be queued for human approval first.',
      parameters: {
        type: 'object',
        properties: {
          contact_id: {
            type: 'string',
            description:
              'The entity ID of the recipient (from customer_lookup). ' +
              'Do NOT include the customer\'s actual name, phone, or email in this field.',
          },
          channel: {
            type: 'string',
            description:
              'Delivery channel: "inapp" = in-app notification, ' +
              '"sms" = SMS (requires tenant SMS credits), ' +
              '"email" = email (requires tenant email setup).',
            enum: ['inapp', 'sms', 'email'],
          },
          message: {
            type: 'string',
            description:
              'Notification message body (max 500 characters). ' +
              'Do NOT include phone numbers, email addresses, NIN, BVN, or account numbers. ' +
              'Reference the contact by name only if absolutely necessary.',
          },
        },
        required: ['contact_id', 'channel', 'message'],
      },
    },
  },

  async handler(args, ctx) {
    const contactId = typeof args.contact_id === 'string' ? args.contact_id.trim() : '';
    const channel   = typeof args.channel === 'string' ? args.channel.trim() : '';
    const rawMsg    = typeof args.message === 'string' ? args.message.trim() : '';

    if (!contactId) {
      return JSON.stringify({ error: 'MISSING_CONTACT_ID', message: 'contact_id is required.' });
    }
    if (!VALID_CHANNELS.has(channel)) {
      return JSON.stringify({
        error: 'INVALID_CHANNEL',
        message: `channel must be one of: inapp, sms, email. Got '${channel}'.`,
      });
    }
    if (!rawMsg) {
      return JSON.stringify({ error: 'EMPTY_MESSAGE', message: 'message is required and must not be empty.' });
    }

    // P13: strip PII from message before any further processing
    const message = stripPii(rawMsg).slice(0, 500);

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

    // HITL gating — threshold: autonomyLevel >= 2 (lower than booking/invoice)
    // Notifications leave the platform and are irreversible.
    if (ctx.autonomyLevel < 2) {
      const payload = JSON.stringify({
        tool: 'send_notification',
        contact_id: contactId,
        channel,
        message,
        workspace_id: ctx.workspaceId,
      });
      const { queueItemId } = await ctx.hitlService.submit({
        tenantId: ctx.tenantId,
        workspaceId: ctx.workspaceId,
        userId: ctx.userId,
        vertical: ctx.vertical,
        capability: 'function_call',
        hitlLevel: 1,
        aiRequestPayload: payload,
        expiresInHours: 24,
      });
      return JSON.stringify({
        deferred: true,
        queue_item_id: queueItemId,
        message:
          'The notification has been queued for human approval. ' +
          'Please inform the user that a workspace administrator will review and send the message.',
      });
    }

    // Autonomy >= 2: queue for delivery
    const id = crypto.randomUUID();
    await ctx.db
      .prepare(
        `INSERT INTO ai_agent_outbox
           (id, tenant_id, workspace_id, contact_id, channel, message, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, 'queued', ?)`,
      )
      .bind(id, ctx.tenantId, ctx.workspaceId, contactId, channel, message, ctx.userId)
      .run();

    return JSON.stringify({
      status: 'ok',
      outbox_id: id,
      channel,
      message: `Notification queued for delivery via ${channel}. Outbox ID: ${id}.`,
    });
  },
};
