/**
 * Built-in tool: schedule_availability
 * SA-5.x — Queries upcoming appointment slots for scheduling-assistant verticals.
 *
 * Looks for appointments in salon_appointments (the canonical cross-vertical
 * appointment table). For workspaces that don't use salon_appointments, returns
 * an informational response explaining that no appointment data is available.
 *
 * Platform Invariants:
 *   T3  — Query is tenant-scoped via tenantId in ToolExecutionContext
 *   P13 — client_phone is excluded from all responses (customer PII)
 */

import type { RegisteredTool } from '../tool-registry.js';

const SECONDS_PER_DAY = 86400;

export const scheduleAvailabilityTool: RegisteredTool = {
  definition: {
    type: 'function',
    function: {
      name: 'schedule_availability',
      description:
        'Check appointment availability and upcoming bookings for this workspace. ' +
        'Returns counts of booked, available, and cancelled slots for the requested period. ' +
        'Use this to suggest scheduling improvements or identify peak booking times.',
      parameters: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            description:
              'Time window to check. ' +
              '"today" = current day, ' +
              '"week" = next 7 days, ' +
              '"month" = next 30 days.',
            enum: ['today', 'week', 'month'],
          },
          status_filter: {
            type: 'string',
            description:
              'Filter by appointment status. ' +
              '"all" (default) = all statuses, ' +
              '"booked" = confirmed only, ' +
              '"cancelled" = cancelled only.',
            enum: ['all', 'booked', 'cancelled'],
          },
        },
        required: ['period'],
      },
    },
  },

  async handler(args, ctx) {
    const period = (args.period as string) || 'today';
    const statusFilter = (args.status_filter as string) || 'all';

    const now = Math.floor(Date.now() / 1000);
    const windowEnd =
      period === 'today'
        ? now + SECONDS_PER_DAY
        : period === 'week'
          ? now + 7 * SECONDS_PER_DAY
          : now + 30 * SECONDS_PER_DAY;

    // Build status filter fragment
    const statusWhere =
      statusFilter === 'booked'
        ? "AND status = 'booked'"
        : statusFilter === 'cancelled'
          ? "AND status = 'cancelled'"
          : '';

    // Try to query salon_appointments (cross-vertical canonical table)
    let results: Array<{ status: string; count: number }>;
    try {
      const { results: rows } = await ctx.db
        .prepare(
          `SELECT status, COUNT(*) AS count
           FROM   salon_appointments
           WHERE  tenant_id = ?
             AND  appointment_time BETWEEN ? AND ?
             ${statusWhere}
           GROUP  BY status`,
        )
        .bind(ctx.tenantId, now, windowEnd)
        .all<{ status: string; count: number }>();
      results = rows ?? [];
    } catch {
      // Table may not exist for non-salon verticals
      return JSON.stringify({
        status: 'no_data',
        message:
          'Appointment scheduling data is not available for this workspace. ' +
          'This tool is primarily used by beauty, spa, health, and service-booking verticals.',
        period,
      });
    }

    const periodLabel =
      period === 'today'
        ? 'today'
        : period === 'week'
          ? 'next 7 days'
          : 'next 30 days';

    if (results.length === 0) {
      return JSON.stringify({
        status: 'ok',
        period: periodLabel,
        message: `No appointments found for ${periodLabel}.`,
        breakdown: {},
        total: 0,
      });
    }

    const breakdown = Object.fromEntries(results.map((r) => [r.status, r.count]));
    const total = results.reduce((sum, r) => sum + r.count, 0);

    return JSON.stringify({
      status: 'ok',
      period: periodLabel,
      total_appointments: total,
      breakdown,
    });
  },
};
