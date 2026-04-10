/**
 * Event Planner routes — M9
 * FSM: seeded → claimed → licence_verified → active → suspended
 * AI: L2 cap — event pipeline aggregate; P13 no client details
 * P9: all monetary in kobo integers; guest_count integer
 * T3: all queries scoped to tenantId
 * P12: AI blocked on USSD
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
import type { Env } from '../../types.js';
import {
  EventPlannerRepository,
  guardClaimedToLicenceVerified,
  guardL2AiCap,
  guardFractionalKobo,
  guardNoClientDataInAi,
  isValidEventPlannerTransition,
} from '@webwaka/verticals-event-planner';

type Auth = { userId: string; tenantId: string };
const app = new Hono<{ Bindings: Env }>();
function repo(c: { env: Env }) { return new EventPlannerRepository(c.env.DB); }
function auth(c: Context<{ Bindings: Env }>) { return c.get('auth') as Auth; }

app.post('/profiles', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ workspaceId: string; companyName: string; stateEventLicence?: string; cacRc?: string }>();
  const profile = await repo(c).createProfile({ workspaceId: body.workspaceId, tenantId, companyName: body.companyName, stateEventLicence: body.stateEventLicence, cacRc: body.cacRc });
  return c.json(profile, 201);
});

app.get('/profiles/:id', async (c) => {
  const { tenantId } = auth(c);
  const p = await repo(c).findProfileById(c.req.param('id'), tenantId);
  if (!p) return c.json({ error: 'not found' }, 404);
  return c.json(p);
});

app.patch('/profiles/:id/transition', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ to: string; stateEventLicence?: string }>();
  const to = body.to as Parameters<typeof isValidEventPlannerTransition>[1];
  const current = await repo(c).findProfileById(c.req.param('id'), tenantId);
  if (!current) return c.json({ error: 'not found' }, 404);
  if (!isValidEventPlannerTransition(current.status, to)) return c.json({ error: `Invalid FSM transition: ${current.status} → ${to}` }, 422);
  if (to === 'licence_verified') {
    const g = guardClaimedToLicenceVerified({ stateEventLicence: body.stateEventLicence ?? current.stateEventLicence });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  await repo(c).updateStatus(c.req.param('id'), tenantId, to);
  const updated = await repo(c).findProfileById(c.req.param('id'), tenantId);
  return c.json(updated);
});

app.post('/profiles/:id/events', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ clientPhone: string; eventType: string; eventDate: number; venue?: string; guestCount: number; totalBudgetKobo: number; depositKobo?: number }>();
  const g = guardFractionalKobo(body.totalBudgetKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const event = await repo(c).createEvent({ profileId: c.req.param('id'), tenantId, clientPhone: body.clientPhone, eventType: body.eventType as never, eventDate: body.eventDate, venue: body.venue, guestCount: body.guestCount, totalBudgetKobo: body.totalBudgetKobo, depositKobo: body.depositKobo });
  return c.json(event, 201);
});

app.post('/profiles/:id/vendors', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ eventId: string; vendorType: string; vendorPhone: string; vendorName: string; agreedFeeKobo: number; depositPaidKobo?: number }>();
  const g = guardFractionalKobo(body.agreedFeeKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const vendor = await repo(c).createVendor({ eventId: body.eventId, tenantId, vendorType: body.vendorType as never, vendorPhone: body.vendorPhone, vendorName: body.vendorName, agreedFeeKobo: body.agreedFeeKobo, depositPaidKobo: body.depositPaidKobo });
  return c.json(vendor, 201);
});

app.post('/profiles/:id/tasks', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ eventId: string; taskName: string; dueDate?: number }>();
  const task = await repo(c).createTask({ eventId: body.eventId, tenantId, taskName: body.taskName, dueDate: body.dueDate });
  return c.json(task, 201);
});

app.post('/profiles/:id/ai/event-pipeline', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<Record<string, unknown>>();
  const capG = guardL2AiCap({ autonomyLevel: body.autonomyLevel as never });
  if (!capG.allowed) return c.json({ error: capG.reason }, 403);
  const piiG = guardNoClientDataInAi(body);
  if (!piiG.allowed) return c.json({ error: piiG.reason }, 403);
  return c.json({ status: 'queued', message: 'Event pipeline AI request queued for L2 advisory review', tenantId });
});

export default app;
