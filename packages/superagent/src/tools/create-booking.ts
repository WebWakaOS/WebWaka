/**
 * Built-in tool: create_booking
 * SA-5.x — Creates a booking row in ai_agent_bookings.
 *
 * Platform Invariants:
 *   T3  — All writes tenant-scoped via tenantId in ToolExecutionContext
 *   P9  — No monetary values in this tool (bookings don't carry price)
 *   P13 — contact_id reference only; no raw PII stored in notes (caller responsibility)
 *
 * HITL gating:
 *   autonomyLevel >= 3 → direct D1 insert
 *   autonomyLevel < 3  → HITL queue item, returns { deferred: true, queue_item_id }
 */

import type { RegisteredTool } from '../tool-registry.js';

export const createBookingTool: RegisteredTool = {
  definition: {
    type: 'function',
    function: {
      name: 'create_booking',
      description:
        'Create a new booking for a customer in this workspace. ' +
        'Returns the booking ID on success. ' +
        'For sensitive verticals (health, legal, finance), the booking will be queued for ' +
        'human approval first and you will receive a deferred response with a queue_item_id. ' +
        'Always look up the contact_id first using customer_lookup before calling this tool.',
      parameters: {
        type: 'object',
        properties: {
          contact_id: {
            type: 'string',
            description:
              'The entity ID of the customer (from customer_lookup). ' +
              'Required for tenant isolation — do NOT guess or fabricate this value.',
          },
          service_name: {
            type: 'string',
            description: 'Human-readable name of the service or appointment being booked.',
          },
          slot_time_iso: {
            type: 'string',
            description:
              'Requested slot date and time in ISO-8601 format (e.g. "2026-05-10T09:00:00"). ' +
              'Use schedule_availability to verify availability first.',
          },
          notes: {
            type: 'string',
            description:
              'Optional booking notes (max 500 characters). ' +
              'Do NOT include names, phone numbers, email addresses, or other PII.',
          },
        },
        required: ['contact_id', 'service_name', 'slot_time_iso'],
      },
    },
  },

  async handler(args, ctx) {
    const contactId   = typeof args.contact_id === 'string' ? args.contact_id.trim() : '';
    const serviceName = typeof args.service_name === 'string' ? args.service_name.trim() : '';
    const slotTimeIso = typeof args.slot_time_iso === 'string' ? args.slot_time_iso.trim() : '';
    const notes       = typeof args.notes === 'string' ? args.notes.slice(0, 500) : null;

    if (!contactId || !serviceName || !slotTimeIso) {
      return JSON.stringify({
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'contact_id, service_name, and slot_time_iso are all required.',
      });
    }

    // Validate slot_time_iso
    const slotMs = Date.parse(slotTimeIso);
    if (Number.isNaN(slotMs)) {
      return JSON.stringify({
        error: 'INVALID_SLOT_TIME',
        message: `'${slotTimeIso}' is not a valid ISO-8601 datetime.`,
      });
    }
    const slotUnix = Math.floor(slotMs / 1000);

    // T3: Verify contact_id belongs to this tenant before booking
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

    // HITL gating — threshold: autonomyLevel >= 3 to write directly
    if (ctx.autonomyLevel < 3) {
      const payload = JSON.stringify({
        tool: 'create_booking',
        contact_id: contactId,
        service_name: serviceName,
        slot_time_iso: slotTimeIso,
        notes,
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
        message:
          'The booking request has been queued for human approval. ' +
          'Please inform the user that a workspace administrator will review and confirm the booking.',
      });
    }

    // Autonomy >= 3: write directly
    const id = crypto.randomUUID();
    await ctx.db
      .prepare(
        `INSERT INTO ai_agent_bookings
           (id, tenant_id, workspace_id, contact_id, service_name, slot_time, notes, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'reserved', ?)`,
      )
      .bind(id, ctx.tenantId, ctx.workspaceId, contactId, serviceName, slotUnix, notes, ctx.userId)
      .run();

    return JSON.stringify({
      status: 'ok',
      booking_id: id,
      service_name: serviceName,
      slot_time_iso: slotTimeIso,
      message: `Booking created successfully. Booking ID: ${id}.`,
    });
  },
};
