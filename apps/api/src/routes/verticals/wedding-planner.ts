/**
 * Wedding Planner routes — M12
 * FSM: seeded → claimed → cac_verified → active → suspended
 * AI: L2 cap — event aggregate; P13 no couple PII
 * P9: all monetary in kobo integers; guest_count integer
 * T3: all queries scoped to tenantId
 * P12: AI blocked on USSD
 */

import { Hono } from 'hono';
import type { Env } from '../../types.js';
import {
  WeddingPlannerRepository,
  guardClaimedToCacVerified,
  guardL2AiCap,
  guardFractionalKobo,
  guardNoCouplePiiInAi,
  isValidWeddingPlannerTransition,
} from '@webwaka/verticals-wedding-planner';

type Auth = { userId: string; tenantId: string };
const app = new Hono<{ Bindings: Env }>();
function repo(c: { env: Env }) { return new WeddingPlannerRepository(c.env.DB); }
function auth(c: Parameters<Parameters<typeof app.use>[1]>[0]) { return c.get('auth') as Auth; }

app.post('/profiles', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ workspaceId: string; companyName: string; cacRc?: string; celebrantCert?: string }>();
  const profile = await repo(c).createProfile({ workspaceId: body.workspaceId, tenantId, companyName: body.companyName, cacRc: body.cacRc, celebrantCert: body.celebrantCert });
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
  const body = await c.req.json<{ to: string; cacRc?: string }>();
  const to = body.to as Parameters<typeof isValidWeddingPlannerTransition>[1];
  const current = await repo(c).findProfileById(c.req.param('id'), tenantId);
  if (!current) return c.json({ error: 'not found' }, 404);
  if (!isValidWeddingPlannerTransition(current.status, to)) return c.json({ error: `Invalid FSM transition: ${current.status} → ${to}` }, 422);
  if (to === 'cac_verified') {
    const g = guardClaimedToCacVerified({ cacRc: body.cacRc ?? current.cacRc });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  await repo(c).updateStatus(c.req.param('id'), tenantId, to);
  const updated = await repo(c).findProfileById(c.req.param('id'), tenantId);
  return c.json(updated);
});

app.post('/profiles/:id/events', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ eventDate: number; venue?: string; guestCount: number; totalBudgetKobo: number; depositKobo?: number; style?: string }>();
  const g = guardFractionalKobo(body.totalBudgetKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const event = await repo(c).createEvent({ profileId: c.req.param('id'), tenantId, eventDate: body.eventDate, venue: body.venue, guestCount: body.guestCount, totalBudgetKobo: body.totalBudgetKobo, depositKobo: body.depositKobo, style: body.style as never });
  return c.json(event, 201);
});

app.post('/profiles/:id/vendors', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ eventId: string; vendorType: string; vendorPhone: string; agreedFeeKobo: number; depositPaidKobo?: number }>();
  const g = guardFractionalKobo(body.agreedFeeKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const vendor = await repo(c).createVendor({ eventId: body.eventId, tenantId, vendorType: body.vendorType as never, vendorPhone: body.vendorPhone, agreedFeeKobo: body.agreedFeeKobo, depositPaidKobo: body.depositPaidKobo });
  return c.json(vendor, 201);
});

app.post('/profiles/:id/tasks', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ eventId: string; taskName: string; category?: string; dueDate?: number }>();
  const task = await repo(c).createTask({ eventId: body.eventId, tenantId, taskName: body.taskName, category: body.category as never, dueDate: body.dueDate });
  return c.json(task, 201);
});

app.post('/profiles/:id/ai/event-planning', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<Record<string, unknown>>();
  const capG = guardL2AiCap({ autonomyLevel: body.autonomyLevel as never });
  if (!capG.allowed) return c.json({ error: capG.reason }, 403);
  const piiG = guardNoCouplePiiInAi(body);
  if (!piiG.allowed) return c.json({ error: piiG.reason }, 403);
  return c.json({ status: 'queued', message: 'Wedding planning AI request queued for L2 advisory review', tenantId });
});

export default app;
