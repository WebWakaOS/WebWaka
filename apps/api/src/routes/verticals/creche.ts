/**
 * Crèche routes — M12
 * P13: child_ref_id opaque UUID; child names/ages/developmental notes NEVER to AI
 * L3 HITL mandatory for ALL AI calls on this vertical
 * P9: monthlyFeeKobo / feeKobo must be integers
 * T3: all queries scoped to tenantId
 * P12: AI blocked on USSD
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
import type { Env } from '../../types.js';
import {
  CrecheRepository,
  guardClaimedToSubebVerified,
  guardL3HitlRequired,
  guardP13ChildData,
  guardFractionalKobo,
  isValidCrecheTransition,
} from '@webwaka/verticals-creche';

type Auth = { userId: string; tenantId: string };
const app = new Hono<{ Bindings: Env }>();
function repo(c: { env: Env }) { return new CrecheRepository(c.env.DB); }
function auth(c: Context<{ Bindings: Env }>) { return c.get('auth') as Auth; }

app.post('/profiles', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ workspaceId: string; crecheName: string; subebRegistration?: string; stateSocialWelfareCert?: string; cacRc?: string; capacity?: number }>();
  const profile = await repo(c).createProfile({ workspaceId: body.workspaceId, tenantId, crecheName: body.crecheName, subebRegistration: body.subebRegistration, stateSocialWelfareCert: body.stateSocialWelfareCert, cacRc: body.cacRc, capacity: body.capacity });
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
  const body = await c.req.json<{ to: string; subebRegistration?: string; kycTier?: number }>();
  const to = body.to as Parameters<typeof isValidCrecheTransition>[1];
  const current = await repo(c).findProfileById(c.req.param('id'), tenantId);
  if (!current) return c.json({ error: 'not found' }, 404);
  if (!isValidCrecheTransition(current.status, to)) return c.json({ error: `Invalid FSM transition: ${current.status} → ${to}` }, 422);
  if (to === 'subeb_verified') {
    const g = guardClaimedToSubebVerified({ subebRegistration: body.subebRegistration ?? current.subebRegistration, kycTier: body.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
    if (body.subebRegistration) await repo(c).updateProfile(c.req.param('id'), tenantId, { subebRegistration: body.subebRegistration });
  }
  const updated = await repo(c).transition(c.req.param('id'), tenantId, to);
  return c.json(updated);
});

app.post('/profiles/:id/children', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ ageMonths: number; admissionDate?: number; monthlyFeeKobo: number }>();
  const g = guardFractionalKobo(body.monthlyFeeKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const child = await repo(c).createChild({ profileId: c.req.param('id'), tenantId, ageMonths: body.ageMonths, admissionDate: body.admissionDate, monthlyFeeKobo: body.monthlyFeeKobo });
  return c.json(child, 201);
});

app.get('/profiles/:id/children', async (c) => {
  const { tenantId } = auth(c);
  return c.json(await repo(c).listChildren(c.req.param('id'), tenantId));
});

app.post('/profiles/:id/attendance', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ childRefId: string; attendanceDate: number; present?: boolean }>();
  const record = await repo(c).recordAttendance({ profileId: c.req.param('id'), tenantId, childRefId: body.childRefId, attendanceDate: body.attendanceDate, present: body.present });
  return c.json(record, 201);
});

app.post('/profiles/:id/billing', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ childRefId: string; billingPeriod: string; feeKobo: number; paidKobo?: number }>();
  const g = guardFractionalKobo(body.feeKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const billing = await repo(c).createBilling({ profileId: c.req.param('id'), tenantId, childRefId: body.childRefId, billingPeriod: body.billingPeriod, feeKobo: body.feeKobo, paidKobo: body.paidKobo });
  return c.json(billing, 201);
});

app.post('/ai/prompt', async (c) => {
  const body = await c.req.json<{ autonomyLevel?: string | number; payloadKeys?: string[] }>();
  const hitlGuard = guardL3HitlRequired({ autonomyLevel: body.autonomyLevel });
  if (!hitlGuard.allowed) return c.json({ error: hitlGuard.reason }, 403);
  const p13Guard = guardP13ChildData({ payloadKeys: body.payloadKeys ?? [] });
  if (!p13Guard.allowed) return c.json({ error: p13Guard.reason }, 403);
  return c.json({ status: 'ai_prompt_queued_for_hitl_review' });
});

export default app;
