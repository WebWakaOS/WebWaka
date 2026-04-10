/**
 * Accounting Firm routes — M9
 * FSM: seeded → claimed → ican_verified → active → suspended
 * AI: L2 cap — billing analytics aggregate only; P13 no client financial data
 * P9: all monetary in kobo integers
 * T3: all queries scoped to tenantId
 * P12: AI blocked on USSD
 */

import { Hono } from 'hono';
import type { Env } from '../../types.js';
import {
  AccountingFirmRepository,
  guardClaimedToIcanVerified,
  guardL2AiCap,
  guardFractionalKobo,
  guardNoClientDataInAi,
  isValidAccountingFirmTransition,
} from '@webwaka/verticals-accounting-firm';

type Auth = { userId: string; tenantId: string };
const app = new Hono<{ Bindings: Env }>();
function repo(c: { env: Env }) { return new AccountingFirmRepository(c.env.DB); }
function auth(c: Parameters<Parameters<typeof app.use>[1]>[0]) { return c.get('auth') as Auth; }

app.post('/profiles', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ workspaceId: string; firmName: string; icanRegistration?: string; ananRegistration?: string; firsAgentCert?: string; cacRc?: string }>();
  const profile = await repo(c).createProfile({ workspaceId: body.workspaceId, tenantId, firmName: body.firmName, icanRegistration: body.icanRegistration, ananRegistration: body.ananRegistration, firsAgentCert: body.firsAgentCert, cacRc: body.cacRc });
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
  const body = await c.req.json<{ to: string; icanRegistration?: string }>();
  const to = body.to as Parameters<typeof isValidAccountingFirmTransition>[1];
  const current = await repo(c).findProfileById(c.req.param('id'), tenantId);
  if (!current) return c.json({ error: 'not found' }, 404);
  if (!isValidAccountingFirmTransition(current.status, to)) return c.json({ error: `Invalid FSM transition: ${current.status} → ${to}` }, 422);
  if (to === 'ican_verified') {
    const g = guardClaimedToIcanVerified({ icanRegistration: body.icanRegistration ?? current.icanRegistration });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  await repo(c).updateStatus(c.req.param('id'), tenantId, to);
  const updated = await repo(c).findProfileById(c.req.param('id'), tenantId);
  return c.json(updated);
});

app.post('/profiles/:id/engagements', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ clientRefId: string; engagementType: string; engagementFeeKobo: number; startDate: number; endDate?: number }>();
  const g = guardFractionalKobo(body.engagementFeeKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const engagement = await repo(c).createEngagement({ profileId: c.req.param('id'), tenantId, clientRefId: body.clientRefId, engagementType: body.engagementType as never, engagementFeeKobo: body.engagementFeeKobo, startDate: body.startDate, endDate: body.endDate });
  return c.json(engagement, 201);
});

app.post('/profiles/:id/invoices', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ clientRefId: string; engagementId?: string; invoiceNumber: string; amountKobo: number; paidKobo?: number; issuedDate: number; dueDate?: number }>();
  const g = guardFractionalKobo(body.amountKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const invoice = await repo(c).createInvoice({ profileId: c.req.param('id'), tenantId, clientRefId: body.clientRefId, engagementId: body.engagementId, invoiceNumber: body.invoiceNumber, amountKobo: body.amountKobo, paidKobo: body.paidKobo, issuedDate: body.issuedDate, dueDate: body.dueDate });
  return c.json(invoice, 201);
});

app.post('/profiles/:id/cpd', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ memberRefId: string; cpdProvider: string; cpdHours: number; completionDate: number }>();
  const log = await repo(c).createCpdLog({ profileId: c.req.param('id'), tenantId, memberRefId: body.memberRefId, cpdProvider: body.cpdProvider, cpdHours: body.cpdHours, completionDate: body.completionDate });
  return c.json(log, 201);
});

app.post('/profiles/:id/ai/billing-insights', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<Record<string, unknown>>();
  const usdG = guardL2AiCap({ autonomyLevel: body.autonomyLevel as never });
  if (!usdG.allowed) return c.json({ error: usdG.reason }, 403);
  const piiG = guardNoClientDataInAi(body);
  if (!piiG.allowed) return c.json({ error: piiG.reason }, 403);
  return c.json({ status: 'queued', message: 'Billing insights AI request queued for L2 advisory review', tenantId });
});

export default app;
