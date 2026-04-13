/**
 * Savings Group (Ajo / Esusu) routes — M9
 * FSM: seeded → claimed → cac_registered → active → suspended
 * AI: L2 cap; P13 no member PII to AI
 * P9: all contribution amounts in kobo integers; T3: tenantId scoped; Tier 1 KYC
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
import type { Env } from '../../types.js';
import {
  SavingsGroupRepository,
  isValidSavingsGroupTransition,
  guardClaimedToCacRegistered,
  guardContributionAmountIsInteger,
} from '@webwaka/verticals-savings-group';

type Auth = { userId: string; tenantId: string };
const app = new Hono<{ Bindings: Env }>();
function repo(c: { env: Env }) { return new SavingsGroupRepository(c.env.DB); }
function auth(c: Context<{ Bindings: Env }>) { return c.get('auth') as Auth; }

app.post('/profiles', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ workspaceId: string; groupName: string; contributionAmountKobo: number; contributionFrequency?: string; cacRc?: string; maxMembers?: number }>();
  const group = await repo(c).createGroup({ workspaceId: body.workspaceId, tenantId, groupName: body.groupName, contributionAmountKobo: body.contributionAmountKobo, contributionFrequency: body.contributionFrequency as never, cacRc: body.cacRc, maxMembers: body.maxMembers });
  return c.json(group, 201);
});

app.get('/profiles/:id', async (c) => {
  const { tenantId } = auth(c);
  const p = await repo(c).findGroupById(c.req.param('id'), tenantId);
  if (!p) return c.json({ error: 'not found' }, 404);
  return c.json(p);
});

app.patch('/profiles/:id/transition', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ to: string; cacRc?: string }>();
  const to = body.to as Parameters<typeof isValidSavingsGroupTransition>[1];
  const current = await repo(c).findGroupById(c.req.param('id'), tenantId);
  if (!current) return c.json({ error: 'not found' }, 404);
  if (!isValidSavingsGroupTransition(current.status, to)) return c.json({ error: `Invalid FSM transition: ${current.status} → ${to}` }, 422);
  if (to === 'cac_registered') {
    const g = guardClaimedToCacRegistered({ cacRc: body.cacRc ?? null });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  const updated = await repo(c).transitionStatus(c.req.param('id'), tenantId, to, { cacRc: body.cacRc });
  return c.json(updated);
});

app.post('/profiles/:id/members', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ memberRefId: string; role?: string; kycTier?: number; payoutPosition?: number }>();
  const member = await repo(c).addMember(c.req.param('id'), tenantId, { memberRefId: body.memberRefId, role: body.role as never, kycTier: body.kycTier, payoutPosition: body.payoutPosition });
  return c.json(member, 201);
});

app.post('/profiles/:id/contributions', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ memberRefId: string; amountKobo: number; cycleNumber: number; paymentMethod?: string; payStackRef?: string; paidAt?: number }>();
  const g = guardContributionAmountIsInteger({ amountKobo: body.amountKobo });
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const contribution = await repo(c).recordContribution(c.req.param('id'), tenantId, { memberRefId: body.memberRefId, amountKobo: body.amountKobo, cycleNumber: body.cycleNumber, paymentMethod: body.paymentMethod as never, payStackRef: body.payStackRef, contributionDate: body.paidAt ?? Math.floor(Date.now() / 1000) });
  return c.json(contribution, 201);
});

export default app;
