/**
 * Talent Agency routes — M12
 * FSM: seeded → claimed → nmma_verified → active → suspended
 * AI: L2 cap — booking aggregate; P13 no talent_ref_id or deal terms
 * commission_bps: INTEGER basis points — NO FLOATS
 * Fee arithmetic: commission_kobo + talent_payout_kobo = brand_fee_kobo enforced
 * P9: all monetary in kobo integers
 * T3: all queries scoped to tenantId
 * P12: AI blocked on USSD
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
import type { Env } from '../../types.js';
import {
  TalentAgencyRepository,
  guardClaimedToNmmaVerified,
  guardL2AiCap,
  guardFractionalKobo,
  guardNoTalentDealDataInAi,
  guardIntegerBps,
  guardFeeArithmetic,
  isValidTalentAgencyTransition,
} from '@webwaka/verticals-talent-agency';

type Auth = { userId: string; tenantId: string };
const app = new Hono<{ Bindings: Env }>();
function repo(c: { env: Env }) { return new TalentAgencyRepository(c.env.DB); }
function auth(c: Context<{ Bindings: Env }>) { return c.get('auth') as Auth; }

app.post('/profiles', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ workspaceId: string; agencyName: string; nmmaRegistration?: string; stateEntertainmentCert?: string; cacRc?: string }>();
  const profile = await repo(c).createProfile({ workspaceId: body.workspaceId, tenantId, agencyName: body.agencyName, nmmaRegistration: body.nmmaRegistration, stateEntertainmentCert: body.stateEntertainmentCert, cacRc: body.cacRc });
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
  const body = await c.req.json<{ to: string; nmmaRegistration?: string }>();
  const to = body.to as Parameters<typeof isValidTalentAgencyTransition>[1];
  const current = await repo(c).findProfileById(c.req.param('id'), tenantId);
  if (!current) return c.json({ error: 'not found' }, 404);
  if (!isValidTalentAgencyTransition(current.status, to)) return c.json({ error: `Invalid FSM transition: ${current.status} → ${to}` }, 422);
  if (to === 'nmma_verified') {
    const g = guardClaimedToNmmaVerified({ nmmaRegistration: body.nmmaRegistration ?? current.nmmaRegistration });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  await repo(c).updateStatus(c.req.param('id'), tenantId, to);
  const updated = await repo(c).findProfileById(c.req.param('id'), tenantId);
  return c.json(updated);
});

app.post('/profiles/:id/roster', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ talentRefId: string; category: string; commissionBps: number; signedDate: number }>();
  const bpsG = guardIntegerBps(body.commissionBps);
  if (!bpsG.allowed) return c.json({ error: bpsG.reason }, 422);
  const talent = await repo(c).createRosterEntry({ profileId: c.req.param('id'), tenantId, talentRefId: body.talentRefId, category: body.category as never, commissionBps: body.commissionBps, signedDate: body.signedDate });
  return c.json(talent, 201);
});

app.post('/profiles/:id/bookings', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ talentRefId: string; brandRefId: string; bookingDate: number; deliverableType: string; brandFeeKobo: number; commissionKobo: number; talentPayoutKobo: number }>();
  const arithG = guardFeeArithmetic({ brandFeeKobo: body.brandFeeKobo, commissionKobo: body.commissionKobo, talentPayoutKobo: body.talentPayoutKobo });
  if (!arithG.allowed) return c.json({ error: arithG.reason }, 422);
  const feeG = guardFractionalKobo(body.brandFeeKobo);
  if (!feeG.allowed) return c.json({ error: feeG.reason }, 422);
  const booking = await repo(c).createBooking({ profileId: c.req.param('id'), tenantId, talentRefId: body.talentRefId, brandRefId: body.brandRefId, bookingDate: body.bookingDate, deliverableType: body.deliverableType, brandFeeKobo: body.brandFeeKobo, commissionKobo: body.commissionKobo, talentPayoutKobo: body.talentPayoutKobo });
  return c.json(booking, 201);
});

app.post('/profiles/:id/ai/talent-pipeline', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<Record<string, unknown>>();
  const capG = guardL2AiCap({ autonomyLevel: body.autonomyLevel as never });
  if (!capG.allowed) return c.json({ error: capG.reason }, 403);
  const piiG = guardNoTalentDealDataInAi(body);
  if (!piiG.allowed) return c.json({ error: piiG.reason }, 403);
  return c.json({ status: 'queued', message: 'Talent pipeline AI request queued for L2 advisory review', tenantId });
});

export default app;
