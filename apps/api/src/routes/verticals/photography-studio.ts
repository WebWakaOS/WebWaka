/**
 * Photography Studio routes — M10
 * FSM: seeded → claimed → cac_verified → active → suspended
 * AI: L2 cap — booking aggregate; P13 no client details
 * P9: all monetary in kobo integers
 * T3: all queries scoped to tenantId
 * P12: AI blocked on USSD
 */

import { Hono } from 'hono';
import type { Env } from '../../types.js';
import {
  PhotographyStudioRepository,
  guardClaimedToCacVerified,
  guardL2AiCap,
  guardFractionalKobo,
  guardNoClientDataInAi,
  isValidPhotographyStudioTransition,
} from '@webwaka/verticals-photography-studio';

type Auth = { userId: string; tenantId: string };
const app = new Hono<{ Bindings: Env }>();
function repo(c: { env: Env }) { return new PhotographyStudioRepository(c.env.DB); }
function auth(c: Parameters<Parameters<typeof app.use>[1]>[0]) { return c.get('auth') as Auth; }

app.post('/profiles', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ workspaceId: string; studioName: string; apconRegistered?: boolean; nujAffiliation?: string; cacRc?: string }>();
  const profile = await repo(c).createProfile({ workspaceId: body.workspaceId, tenantId, studioName: body.studioName, apconRegistered: body.apconRegistered, nujAffiliation: body.nujAffiliation, cacRc: body.cacRc });
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
  const to = body.to as Parameters<typeof isValidPhotographyStudioTransition>[1];
  const current = await repo(c).findProfileById(c.req.param('id'), tenantId);
  if (!current) return c.json({ error: 'not found' }, 404);
  if (!isValidPhotographyStudioTransition(current.status, to)) return c.json({ error: `Invalid FSM transition: ${current.status} → ${to}` }, 422);
  if (to === 'cac_verified') {
    const g = guardClaimedToCacVerified({ cacRc: body.cacRc ?? current.cacRc });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  await repo(c).updateStatus(c.req.param('id'), tenantId, to);
  const updated = await repo(c).findProfileById(c.req.param('id'), tenantId);
  return c.json(updated);
});

app.post('/profiles/:id/bookings', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ clientRefId: string; shootType: string; shootDate: number; location?: string; packageFeeKobo: number; depositKobo?: number; deliverableRef?: string }>();
  const g = guardFractionalKobo(body.packageFeeKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const booking = await repo(c).createBooking({ profileId: c.req.param('id'), tenantId, clientRefId: body.clientRefId, shootType: body.shootType as never, shootDate: body.shootDate, location: body.location, packageFeeKobo: body.packageFeeKobo, depositKobo: body.depositKobo, deliverableRef: body.deliverableRef });
  return c.json(booking, 201);
});

app.post('/profiles/:id/equipment', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ itemName: string; category: string; purchaseCostKobo: number; condition?: string }>();
  const g = guardFractionalKobo(body.purchaseCostKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const equipment = await repo(c).createEquipment({ profileId: c.req.param('id'), tenantId, itemName: body.itemName, category: body.category as never, purchaseCostKobo: body.purchaseCostKobo, condition: body.condition as never });
  return c.json(equipment, 201);
});

app.post('/profiles/:id/ai/booking-insights', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<Record<string, unknown>>();
  const capG = guardL2AiCap({ autonomyLevel: body.autonomyLevel as never });
  if (!capG.allowed) return c.json({ error: capG.reason }, 403);
  const piiG = guardNoClientDataInAi(body);
  if (!piiG.allowed) return c.json({ error: piiG.reason }, 403);
  return c.json({ status: 'queued', message: 'Booking insights AI request queued for L2 advisory review', tenantId });
});

export default app;
