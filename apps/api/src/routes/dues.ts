/**
 * Dues Collection Routes — Phase 2 T001 (FR-VM-15)
 *
 * POST   /dues/schedules                      — create dues schedule (Growth+)
 * GET    /dues/schedules                      — list group dues schedules
 * GET    /dues/schedules/:id                  — get schedule
 * GET    /dues/schedules/:id/status           — member dues status (own)
 * POST   /dues/schedules/:id/pay              — record payment (P9, P10)
 * POST   /dues/schedules/:id/close            — close schedule (admin)
 *
 * Platform Invariants:
 *   T3  — tenantId from JWT on every query
 *   P9  — amount_kobo integer guard (dues-repository enforces)
 *   P10 — ndprConsented required on pay
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';
import {
  createDuesSchedule,
  getDuesSchedule,
  listDuesSchedules,
  recordDuesPayment,
  listSchedulePayments,
  getMemberDuesStatus,
  closeDuesSchedule,
} from '@webwaka/fundraising';

type AppEnv = { Bindings: Env; Variables: { auth: AuthContext } };

interface D1Like {
  prepare(sql: string): {
    bind(...args: unknown[]): {
      first<T>(): Promise<T | null>;
      run(): Promise<{ success: boolean }>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

export const duesRoutes = new Hono<AppEnv>();

// ── Schemas ────────────────────────────────────────────────────────────────

const CreateScheduleSchema = z.object({
  groupId: z.string().min(1),
  title: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  amountKobo: z.number().int().positive(),
  period: z.enum(['weekly', 'monthly', 'quarterly', 'annual']),
  currencyCode: z.string().length(3).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const RecordPaymentSchema = z.object({
  memberUserId: z.string().min(1),
  amountKobo: z.number().int().positive(),
  periodLabel: z.string().min(1).max(20),
  paystackRef: z.string().optional(),
  paymentChannel: z.enum(['card', 'bank_transfer', 'ussd', 'mobile_money', 'manual']).optional(),
  ndprConsented: z.literal(true),
  note: z.string().max(500).optional(),
});

// ── Routes ─────────────────────────────────────────────────────────────────

duesRoutes.post('/schedules', zValidator('json', CreateScheduleSchema), async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId) return c.json({ error: 'unauthorized' }, 401);

  const body = c.req.valid('json');
  const db = c.env.DB as unknown as D1Like;

  try {
    const schedule = await createDuesSchedule(db, {
      tenantId: auth.tenantId,
      workspaceId: auth.workspaceId ?? body.groupId,
      groupId: body.groupId,
      title: body.title,
      description: body.description,
      amountKobo: body.amountKobo,
      period: body.period,
      currencyCode: body.currencyCode,
      startDate: body.startDate,
      endDate: body.endDate,
      createdBy: auth.userId,
    });
    return c.json({ schedule }, 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('P9_VIOLATION')) return c.json({ error: msg }, 422);
    throw err;
  }
});

duesRoutes.get('/schedules', async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId) return c.json({ error: 'unauthorized' }, 401);

  const groupId = c.req.query('groupId');
  if (!groupId) return c.json({ error: 'groupId query parameter required' }, 400);

  const db = c.env.DB as unknown as D1Like;
  const schedules = await listDuesSchedules(db, auth.tenantId, groupId);
  return c.json({ schedules });
});

duesRoutes.get('/schedules/:id', async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId) return c.json({ error: 'unauthorized' }, 401);

  const db = c.env.DB as unknown as D1Like;
  const schedule = await getDuesSchedule(db, c.req.param('id'), auth.tenantId);
  if (!schedule) return c.json({ error: 'not_found' }, 404);
  return c.json({ schedule });
});

duesRoutes.get('/schedules/:id/status', async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId) return c.json({ error: 'unauthorized' }, 401);

  const memberUserId = c.req.query('memberUserId') ?? auth.userId;
  const db = c.env.DB as unknown as D1Like;
  const status = await getMemberDuesStatus(db, c.req.param('id'), memberUserId, auth.tenantId);
  return c.json({ status });
});

duesRoutes.post('/schedules/:id/pay', zValidator('json', RecordPaymentSchema), async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId) return c.json({ error: 'unauthorized' }, 401);

  const body = c.req.valid('json');
  const db = c.env.DB as unknown as D1Like;
  const schedule = await getDuesSchedule(db, c.req.param('id'), auth.tenantId);
  if (!schedule) return c.json({ error: 'not_found' }, 404);

  try {
    const payment = await recordDuesPayment(db, {
      tenantId: auth.tenantId,
      workspaceId: schedule.workspaceId,
      scheduleId: schedule.id,
      memberUserId: body.memberUserId,
      amountKobo: body.amountKobo,
      periodLabel: body.periodLabel,
      paystackRef: body.paystackRef,
      paymentChannel: body.paymentChannel,
      ndprConsented: body.ndprConsented,
      note: body.note,
    });
    return c.json({ payment }, 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('P9_VIOLATION')) return c.json({ error: msg }, 422);
    if (msg.includes('P10_VIOLATION')) return c.json({ error: msg }, 422);
    throw err;
  }
});

duesRoutes.post('/schedules/:id/close', async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId) return c.json({ error: 'unauthorized' }, 401);
  if (!['admin', 'super_admin', 'group_admin'].includes(auth.role ?? '')) {
    return c.json({ error: 'admin role required' }, 403);
  }

  const db = c.env.DB as unknown as D1Like;
  const schedule = await getDuesSchedule(db, c.req.param('id'), auth.tenantId);
  if (!schedule) return c.json({ error: 'not_found' }, 404);

  await closeDuesSchedule(db, schedule.id, auth.tenantId);
  return c.json({ success: true });
});
