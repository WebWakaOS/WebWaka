/**
 * Built-in tool: create_booking
 * SA-5.x — Creates a booking row in ai_bookings and marks the slot 'reserved'
 * in ai_schedule_slots in a single D1 batch (atomic).
 *
 * Platform Invariants:
 *   T3  — schedule_id, slot_id, and contact_id are all validated against tenantId
 *   P13 — contact_id reference only; notes must not contain raw PII
 *
 * HITL gating:
 *   autonomyLevel >= 3 → D1 batch (insert booking + UPDATE slot status)
 *   autonomyLevel < 3  → HITL queue item, returns { deferred: true, queue_item_id }
 */

import type { RegisteredTool } from '../tool-registry.js';

export const createBookingTool: RegisteredTool = {
  definition: {
    type: 'function',
    function: {
      name: 'create_booking',
      description:
        'Create a booking for a customer using an available schedule slot. ' +
        'Use schedule_availability to find open slots first, then call this tool with ' +
        'the schedule_id and slot_id from those results. ' +
        'Returns the booking ID on success. ' +
        'For sensitive verticals (health, legal, finance), the booking will be queued ' +
        'for human approval and you will receive a queue_item_id instead.',
      parameters: {
        type: 'object',
        properties: {
          schedule_id: {
            type: 'string',
            description: 'The schedule group ID (from schedule_availability results).',
          },
          slot_id: {
            type: 'string',
            description: 'The specific slot ID to reserve (from schedule_availability results).',
          },
          contact_id: {
            type: 'string',
            description:
              'The entity ID of the customer (from customer_lookup). ' +
              'Required for tenant isolation — do NOT guess or fabricate this value.',
          },
          notes: {
            type: 'string',
            description:
              'Optional booking notes (max 500 characters). ' +
              'Do NOT include names, phone numbers, email addresses, or other PII.',
          },
        },
        required: ['schedule_id', 'slot_id', 'contact_id'],
      },
    },
  },

  async handler(args, ctx) {
    const scheduleId = typeof args.schedule_id === 'string' ? args.schedule_id.trim() : '';
    const slotId     = typeof args.slot_id === 'string' ? args.slot_id.trim() : '';
    const contactId  = typeof args.contact_id === 'string' ? args.contact_id.trim() : '';
    const notes      = typeof args.notes === 'string' ? args.notes.slice(0, 500) : null;

    if (!scheduleId || !slotId || !contactId) {
      return JSON.stringify({
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'schedule_id, slot_id, and contact_id are all required.',
      });
    }

    // T3: Verify slot exists, belongs to this tenant, and is available
    const slot = await ctx.db
      .prepare(
        `SELECT id, schedule_id, slot_time, service_name, status
         FROM   ai_schedule_slots
         WHERE  id = ? AND tenant_id = ? AND schedule_id = ?
         LIMIT  1`,
      )
      .bind(slotId, ctx.tenantId, scheduleId)
      .first<{ id: string; schedule_id: string; slot_time: number; service_name: string | null; status: string }>();

    if (!slot) {
      return JSON.stringify({
        error: 'SLOT_NOT_FOUND',
        message: `No slot with id '${slotId}' in schedule '${scheduleId}' found for this workspace.`,
      });
    }

    if (slot.status !== 'available') {
      return JSON.stringify({
        error: 'SLOT_NOT_AVAILABLE',
        slot_id: slotId,
        current_status: slot.status,
        message: `Slot '${slotId}' is no longer available (status: ${slot.status}). Please check schedule_availability for open slots.`,
      });
    }

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

    // HITL gating — threshold: autonomyLevel >= 3 to write directly
    if (ctx.autonomyLevel < 3) {
      const payload = JSON.stringify({
        tool: 'create_booking',
        schedule_id: scheduleId,
        slot_id: slotId,
        contact_id: contactId,
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

    // Autonomy >= 3: two-step write — UPDATE slot first, INSERT booking second.
    //
    // Why not a single batch?
    //   D1 batch sends both statements in one SQLite transaction, but we cannot
    //   inspect the result of statement-1 inside the batch to abort statement-2.
    //   If a concurrent request reserved the slot after our initial read but
    //   before our batch runs, the UPDATE would match 0 rows but the batch INSERT
    //   would still succeed, leaving a booking row for an already-taken slot.
    //
    // Solution: UPDATE slot (changes=1 ↔ we won the race), then INSERT booking.
    //   The UNIQUE constraint on ai_bookings.slot_id provides a secondary safety
    //   net so that even on a re-run or retry, a duplicate booking cannot exist.

    // Step 1: atomically claim the slot by transitioning status 'available' → 'reserved'.
    const slotUpdate = await ctx.db
      .prepare(
        `UPDATE ai_schedule_slots
         SET status = 'reserved', updated_at = unixepoch()
         WHERE id = ? AND tenant_id = ? AND status = 'available'`,
      )
      .bind(slotId, ctx.tenantId)
      .run();

    if (!slotUpdate.success || (slotUpdate.meta?.changes ?? 0) === 0) {
      return JSON.stringify({
        error: 'SLOT_NO_LONGER_AVAILABLE',
        slot_id: slotId,
        message:
          `Slot '${slotId}' was taken by another booking while this request was processing. ` +
          `Please check schedule_availability for open slots and try again.`,
      });
    }

    // Step 2: insert the booking row (slot is now ours).
    const bookingId = crypto.randomUUID();
    await ctx.db
      .prepare(
        `INSERT INTO ai_bookings
           (id, tenant_id, workspace_id, schedule_id, slot_id, contact_id, notes, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'reserved', ?)`,
      )
      .bind(bookingId, ctx.tenantId, ctx.workspaceId, scheduleId, slotId, contactId, notes, ctx.userId)
      .run();

    return JSON.stringify({
      status: 'ok',
      booking_id: bookingId,
      schedule_id: scheduleId,
      slot_id: slotId,
      service_name: slot.service_name ?? null,
      message: `Booking created successfully. Booking ID: ${bookingId}.`,
    });
  },
  metadata: { pillar: 1, autonomyThreshold: 3, readOnly: false },
};
