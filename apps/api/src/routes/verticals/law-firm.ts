/**
 * Law Firm routes — M9
 * FSM: seeded → claimed → nba_verified → active → suspended
 * CRITICAL: L3 HITL MANDATORY for ALL AI calls — legal privilege absolute
 * P13 ABSOLUTE: matter_ref_id opaque UUID; no client identity in any payload
 * Time billing: integer minutes × rate_per_hour_kobo
 * P9: all monetary in kobo integers; time in integer minutes
 * T3: all queries scoped to tenantId
 * P12: AI blocked on USSD
 */

import { Hono } from 'hono';
import type { Env } from '../../types.js';
import {
  LawFirmRepository,
  guardClaimedToNbaVerified,
  guardL3HitlRequired,
  guardFractionalKobo,
  guardLegalPrivilege,
  guardIntegerMinutes,
  guardOpaqueMatterRefId,
  isValidLawFirmTransition,
} from '@webwaka/verticals-law-firm';

type Auth = { userId: string; tenantId: string };
const app = new Hono<{ Bindings: Env }>();
function repo(c: { env: Env }) { return new LawFirmRepository(c.env.DB); }
function auth(c: Parameters<Parameters<typeof app.use>[1]>[0]) { return c.get('auth') as Auth; }

app.post('/profiles', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ workspaceId: string; firmName: string; nbaFirmRegistration?: string; nbaBranch?: string; njcAffiliated?: boolean; cacRc?: string }>();
  const profile = await repo(c).createProfile({ workspaceId: body.workspaceId, tenantId, firmName: body.firmName, nbaFirmRegistration: body.nbaFirmRegistration, nbaBranch: body.nbaBranch, njcAffiliated: body.njcAffiliated, cacRc: body.cacRc });
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
  const body = await c.req.json<{ to: string; nbaFirmRegistration?: string }>();
  const to = body.to as Parameters<typeof isValidLawFirmTransition>[1];
  const current = await repo(c).findProfileById(c.req.param('id'), tenantId);
  if (!current) return c.json({ error: 'not found' }, 404);
  if (!isValidLawFirmTransition(current.status, to)) return c.json({ error: `Invalid FSM transition: ${current.status} → ${to}` }, 422);
  if (to === 'nba_verified') {
    const g = guardClaimedToNbaVerified({ nbaFirmRegistration: body.nbaFirmRegistration ?? current.nbaFirmRegistration });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  await repo(c).updateStatus(c.req.param('id'), tenantId, to);
  const updated = await repo(c).findProfileById(c.req.param('id'), tenantId);
  return c.json(updated);
});

app.post('/profiles/:id/matters', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ matterRefId: string; matterType: string; billingType: string; agreedFeeKobo: number }>();
  const uuidG = guardOpaqueMatterRefId(body.matterRefId);
  if (!uuidG.allowed) return c.json({ error: uuidG.reason }, 422);
  const g = guardFractionalKobo(body.agreedFeeKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const matter = await repo(c).createMatter({ profileId: c.req.param('id'), tenantId, matterRefId: body.matterRefId, matterType: body.matterType as never, billingType: body.billingType as never, agreedFeeKobo: body.agreedFeeKobo });
  return c.json(matter, 201);
});

app.post('/profiles/:id/time-entries', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ matterRefId: string; feeEarnerRefId: string; timeMinutes: number; ratePerHourKobo: number; amountKobo: number; entryDate: number }>();
  const mG = guardIntegerMinutes(body.timeMinutes);
  if (!mG.allowed) return c.json({ error: mG.reason }, 422);
  const g = guardFractionalKobo(body.amountKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const entry = await repo(c).createTimeEntry({ profileId: c.req.param('id'), tenantId, matterRefId: body.matterRefId, feeEarnerRefId: body.feeEarnerRefId, timeMinutes: body.timeMinutes, ratePerHourKobo: body.ratePerHourKobo, amountKobo: body.amountKobo, entryDate: body.entryDate });
  return c.json(entry, 201);
});

app.post('/profiles/:id/court-calendar', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ matterRefId: string; courtDate: number; courtName: string; courtType: string; hearingType: string }>();
  const entry = await repo(c).createCourtCalendar({ profileId: c.req.param('id'), tenantId, matterRefId: body.matterRefId, courtDate: body.courtDate, courtName: body.courtName, courtType: body.courtType as never, hearingType: body.hearingType });
  return c.json(entry, 201);
});

app.post('/profiles/:id/invoices', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ matterRefId: string; invoiceNumber: string; totalKobo: number; paidKobo?: number; issuedDate: number }>();
  const g = guardFractionalKobo(body.totalKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const invoice = await repo(c).createInvoice({ profileId: c.req.param('id'), tenantId, matterRefId: body.matterRefId, invoiceNumber: body.invoiceNumber, totalKobo: body.totalKobo, paidKobo: body.paidKobo, issuedDate: body.issuedDate });
  return c.json(invoice, 201);
});

app.post('/profiles/:id/ai/matter-analysis', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<Record<string, unknown>>();
  const hitlG = guardL3HitlRequired({ autonomyLevel: body.autonomyLevel as never });
  if (!hitlG.allowed) return c.json({ error: hitlG.reason }, 403);
  const piiG = guardLegalPrivilege(body);
  if (!piiG.allowed) return c.json({ error: piiG.reason }, 403);
  return c.json({ status: 'queued_for_hitl', message: 'Law firm AI request queued — L3 human review mandatory before output', tenantId });
});

export default app;
