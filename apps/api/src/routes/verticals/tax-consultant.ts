/**
 * Tax Consultant routes — M12
 * FSM: seeded → claimed → firs_verified → active → suspended
 * CRITICAL: L3 HITL MANDATORY for ALL AI calls (tax advice output)
 * P13: client_ref_id opaque; TIN/liability NEVER in AI payloads (tax privilege)
 * P9: all monetary in kobo integers
 * T3: all queries scoped to tenantId
 * P12: AI blocked on USSD
 */

import { Hono } from 'hono';
import type { Env } from '../../types.js';
import {
  TaxConsultantRepository,
  guardClaimedToFirsVerified,
  guardL3HitlRequired,
  guardFractionalKobo,
  guardNoTaxPrivilegeDataInAi,
  isValidTaxConsultantTransition,
} from '@webwaka/verticals-tax-consultant';

type Auth = { userId: string; tenantId: string };
const app = new Hono<{ Bindings: Env }>();
function repo(c: { env: Env }) { return new TaxConsultantRepository(c.env.DB); }
function auth(c: Parameters<Parameters<typeof app.use>[1]>[0]) { return c.get('auth') as Auth; }

app.post('/profiles', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ workspaceId: string; firmName: string; firsTaxAgentCert?: string; citnMembership?: string; cacRc?: string }>();
  const profile = await repo(c).createProfile({ workspaceId: body.workspaceId, tenantId, firmName: body.firmName, firsTaxAgentCert: body.firsTaxAgentCert, citnMembership: body.citnMembership, cacRc: body.cacRc });
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
  const body = await c.req.json<{ to: string; firsTaxAgentCert?: string }>();
  const to = body.to as Parameters<typeof isValidTaxConsultantTransition>[1];
  const current = await repo(c).findProfileById(c.req.param('id'), tenantId);
  if (!current) return c.json({ error: 'not found' }, 404);
  if (!isValidTaxConsultantTransition(current.status, to)) return c.json({ error: `Invalid FSM transition: ${current.status} → ${to}` }, 422);
  if (to === 'firs_verified') {
    const g = guardClaimedToFirsVerified({ firsTaxAgentCert: body.firsTaxAgentCert ?? current.firsTaxAgentCert });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  await repo(c).updateStatus(c.req.param('id'), tenantId, to);
  const updated = await repo(c).findProfileById(c.req.param('id'), tenantId);
  return c.json(updated);
});

app.post('/profiles/:id/tax-files', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ clientRefId: string; taxType: string; firsTin: string; filingPeriod: string; liabilityKobo: number }>();
  const g = guardFractionalKobo(body.liabilityKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const file = await repo(c).createTaxFile({ profileId: c.req.param('id'), tenantId, clientRefId: body.clientRefId, taxType: body.taxType as never, firsTin: body.firsTin, filingPeriod: body.filingPeriod, liabilityKobo: body.liabilityKobo });
  return c.json(file, 201);
});

app.post('/profiles/:id/remittances', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ clientRefId: string; taxType: string; period: string; amountKobo: number; remittanceDate: number; bankRef?: string }>();
  const g = guardFractionalKobo(body.amountKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const remittance = await repo(c).createRemittance({ profileId: c.req.param('id'), tenantId, clientRefId: body.clientRefId, taxType: body.taxType as never, period: body.period, amountKobo: body.amountKobo, remittanceDate: body.remittanceDate, bankRef: body.bankRef });
  return c.json(remittance, 201);
});

app.post('/profiles/:id/billing', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ clientRefId: string; period: string; professionalFeeKobo: number; paidKobo?: number }>();
  const g = guardFractionalKobo(body.professionalFeeKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const bill = await repo(c).createBilling({ profileId: c.req.param('id'), tenantId, clientRefId: body.clientRefId, period: body.period, professionalFeeKobo: body.professionalFeeKobo, paidKobo: body.paidKobo });
  return c.json(bill, 201);
});

app.post('/profiles/:id/ai/tax-advisory', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<Record<string, unknown>>();
  const hitlG = guardL3HitlRequired({ autonomyLevel: body.autonomyLevel as never });
  if (!hitlG.allowed) return c.json({ error: hitlG.reason }, 403);
  const piiG = guardNoTaxPrivilegeDataInAi(body);
  if (!piiG.allowed) return c.json({ error: piiG.reason }, 403);
  return c.json({ status: 'queued_for_hitl', message: 'Tax advisory AI request queued — L3 human review mandatory; tax privilege protected', tenantId });
});

export default app;
