/**
 * Agro-Input routes — M10
 * ADL-010: AI at L2 max — no automated procurement/sales
 * P13: farmer aggregate counts only; no individual farmer details to AI
 * P9: pricePerUnitKobo / totalKobo must be integers
 * T3: all queries scoped to tenantId
 * P12: AI blocked on USSD
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
import type { Env } from '../../types.js';
import {
  AgroInputRepository,
  guardClaimedToNascVerified,
  guardL2AiCap,
  guardFractionalKobo,
  isValidAgroInputTransition,
} from '@webwaka/verticals-agro-input';

type Auth = { userId: string; tenantId: string };
const app = new Hono<{ Bindings: Env }>();
function repo(c: { env: Env }) { return new AgroInputRepository(c.env.DB); }
function auth(c: Context<{ Bindings: Env }>) { return c.get('auth') as Auth; }

app.post('/profiles', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ workspaceId: string; companyName: string; nascDealerNumber?: string; fepsanMembership?: string; nafdacAgrochemicalReg?: string; fmardAbpParticipant?: boolean; cacRc?: string }>();
  const profile = await repo(c).createProfile({ workspaceId: body.workspaceId, tenantId, companyName: body.companyName, nascDealerNumber: body.nascDealerNumber, fepsanMembership: body.fepsanMembership, nafdacAgrochemicalReg: body.nafdacAgrochemicalReg, fmardAbpParticipant: body.fmardAbpParticipant, cacRc: body.cacRc });
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
  const body = await c.req.json<{ to: string; nascDealerNumber?: string; kycTier?: number }>();
  const to = body.to as Parameters<typeof isValidAgroInputTransition>[1];
  const current = await repo(c).findProfileById(c.req.param('id'), tenantId);
  if (!current) return c.json({ error: 'not found' }, 404);
  if (!isValidAgroInputTransition(current.status, to)) return c.json({ error: `Invalid FSM transition: ${current.status} → ${to}` }, 422);
  if (to === 'nasc_verified') {
    const g = guardClaimedToNascVerified({ nascDealerNumber: body.nascDealerNumber ?? current.nascDealerNumber, kycTier: body.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
    if (body.nascDealerNumber) await repo(c).updateNascDealerNumber(c.req.param('id'), tenantId, body.nascDealerNumber);
  }
  const updated = await repo(c).transition(c.req.param('id'), tenantId, to);
  return c.json(updated);
});

app.post('/profiles/:id/catalogue', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ productName: string; category?: string; nascOrNafdacCertNumber?: string; unit?: string; pricePerUnitKobo: number; quantityInStock?: number }>();
  const g = guardFractionalKobo(body.pricePerUnitKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const item = await repo(c).createCatalogueItem({ profileId: c.req.param('id'), tenantId, productName: body.productName, category: body.category as never, nascOrNafdacCertNumber: body.nascOrNafdacCertNumber, unit: body.unit, pricePerUnitKobo: body.pricePerUnitKobo, quantityInStock: body.quantityInStock });
  return c.json(item, 201);
});

app.post('/profiles/:id/orders', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ farmerPhone: string; farmerName?: string; items?: string; totalKobo: number; abpSubsidyKobo?: number }>();
  const g = guardFractionalKobo(body.totalKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const order = await repo(c).createOrder({ profileId: c.req.param('id'), tenantId, farmerPhone: body.farmerPhone, farmerName: body.farmerName, items: body.items, totalKobo: body.totalKobo, abpSubsidyKobo: body.abpSubsidyKobo });
  return c.json(order, 201);
});

app.post('/profiles/:id/farmer-credit', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ farmerPhone: string; creditLimitKobo: number; abpWalletBalanceKobo?: number }>();
  const g = guardFractionalKobo(body.creditLimitKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const credit = await repo(c).createFarmerCredit({ profileId: c.req.param('id'), tenantId, farmerPhone: body.farmerPhone, creditLimitKobo: body.creditLimitKobo, abpWalletBalanceKobo: body.abpWalletBalanceKobo });
  return c.json(credit, 201);
});

app.post('/ai/prompt', async (c) => {
  const body = await c.req.json<{ autonomyLevel?: string | number }>();
  const g = guardL2AiCap({ autonomyLevel: body.autonomyLevel });
  if (!g.allowed) return c.json({ error: g.reason }, 403);
  return c.json({ status: 'ai_advisory_queued' });
});

export default app;
