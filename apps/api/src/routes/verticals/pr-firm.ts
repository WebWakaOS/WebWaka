/**
 * PR Firm routes — M12
 * FSM: seeded → claimed → nipr_verified → active → suspended
 * AI: L2 cap — campaign aggregate; P13 no client strategy
 * P9: all monetary in kobo integers
 * T3: all queries scoped to tenantId
 * P12: AI blocked on USSD
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
import type { Env } from '../../types.js';
import {
  PrFirmRepository,
  guardClaimedToNiprVerified,
  guardL2AiCap,
  guardFractionalKobo,
  guardNoClientStrategyInAi,
  isValidPrFirmTransition,
} from '@webwaka/verticals-pr-firm';

type Auth = { userId: string; tenantId: string };
const app = new Hono<{ Bindings: Env }>();
function repo(c: { env: Env }) { return new PrFirmRepository(c.env.DB); }
function auth(c: Context<{ Bindings: Env }>) { return c.get('auth') as Auth; }

app.post('/profiles', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ workspaceId: string; firmName: string; niprAccreditation?: string; cacRc?: string }>();
  const profile = await repo(c).createProfile({ workspaceId: body.workspaceId, tenantId, firmName: body.firmName, niprAccreditation: body.niprAccreditation, cacRc: body.cacRc });
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
  const body = await c.req.json<{ to: string; niprAccreditation?: string }>();
  const to = body.to as Parameters<typeof isValidPrFirmTransition>[1];
  const current = await repo(c).findProfileById(c.req.param('id'), tenantId);
  if (!current) return c.json({ error: 'not found' }, 404);
  if (!isValidPrFirmTransition(current.status, to)) return c.json({ error: `Invalid FSM transition: ${current.status} → ${to}` }, 422);
  if (to === 'nipr_verified') {
    const g = guardClaimedToNiprVerified({ niprAccreditation: body.niprAccreditation ?? current.niprAccreditation });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  await repo(c).updateStatus(c.req.param('id'), tenantId, to);
  const updated = await repo(c).findProfileById(c.req.param('id'), tenantId);
  return c.json(updated);
});

app.post('/profiles/:id/campaigns', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ clientRefId: string; campaignName: string; campaignType: string; budgetKobo: number; startDate: number; endDate?: number }>();
  const g = guardFractionalKobo(body.budgetKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const campaign = await repo(c).createCampaign({ profileId: c.req.param('id'), tenantId, clientRefId: body.clientRefId, campaignName: body.campaignName, campaignType: body.campaignType as never, budgetKobo: body.budgetKobo, startDate: body.startDate, endDate: body.endDate });
  return c.json(campaign, 201);
});

app.post('/profiles/:id/media-coverage', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ campaignId: string; mediaName: string; coverageDate: number; clipRef?: string; sentiment?: string }>();
  const coverage = await repo(c).createMediaCoverage({ profileId: c.req.param('id'), tenantId, campaignId: body.campaignId, mediaName: body.mediaName, coverageDate: body.coverageDate, clipRef: body.clipRef, sentiment: body.sentiment as never });
  return c.json(coverage, 201);
});

app.post('/profiles/:id/billing', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ clientRefId: string; billingMonth: string; retainerKobo: number; adHocKobo?: number; paidKobo?: number }>();
  const g = guardFractionalKobo(body.retainerKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const bill = await repo(c).createBilling({ profileId: c.req.param('id'), tenantId, clientRefId: body.clientRefId, billingMonth: body.billingMonth, retainerKobo: body.retainerKobo, adHocKobo: body.adHocKobo, paidKobo: body.paidKobo });
  return c.json(bill, 201);
});

app.post('/profiles/:id/ai/campaign-insights', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<Record<string, unknown>>();
  const capG = guardL2AiCap({ autonomyLevel: body.autonomyLevel as never });
  if (!capG.allowed) return c.json({ error: capG.reason }, 403);
  const piiG = guardNoClientStrategyInAi(body);
  if (!piiG.allowed) return c.json({ error: piiG.reason }, 403);
  return c.json({ status: 'queued', message: 'Campaign insights AI request queued for L2 advisory review', tenantId });
});

export default app;
