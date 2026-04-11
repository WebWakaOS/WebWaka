/**
 * Abattoir routes — M12
 * ADL-010: AI at L2 max — yield forecasts advisory only
 * P9: pricePerKgKobo / totalKobo must be integers; weights as integer kg
 * T3: all queries scoped to tenantId
 * P12: AI blocked on USSD
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
import type { Env } from '../../types.js';
import {
  AbattoirRepository,
  guardClaimedToNafdacVerified,
  guardL2AiCap,
  guardFractionalKobo,
  isValidAbattoirTransition,
} from '@webwaka/verticals-abattoir';

type Auth = { userId: string; tenantId: string };
const app = new Hono<{ Bindings: Env }>();
function repo(c: { env: Env }) { return new AbattoirRepository(c.env.DB); }
function auth(c: Context<{ Bindings: Env }>) { return c.get('auth') as Auth; }

app.post('/profiles', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ workspaceId: string; abattoirName: string; nafdacRegistration?: string; nvriApproval?: string; stateAnimalHealthCert?: string; cacRc?: string; capacityHeadPerDay?: number }>();
  const profile = await repo(c).createProfile({ workspaceId: body.workspaceId, tenantId, abattoirName: body.abattoirName, nafdacRegistration: body.nafdacRegistration, nvriApproval: body.nvriApproval, stateAnimalHealthCert: body.stateAnimalHealthCert, cacRc: body.cacRc, capacityHeadPerDay: body.capacityHeadPerDay });
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
  const body = await c.req.json<{ to: string; nafdacRegistration?: string; kycTier?: number }>();
  const to = body.to as Parameters<typeof isValidAbattoirTransition>[1];
  const current = await repo(c).findProfileById(c.req.param('id'), tenantId);
  if (!current) return c.json({ error: 'not found' }, 404);
  if (!isValidAbattoirTransition(current.status, to)) return c.json({ error: `Invalid FSM transition: ${current.status} → ${to}` }, 422);
  if (to === 'nafdac_verified') {
    const g = guardClaimedToNafdacVerified({ nafdacRegistration: body.nafdacRegistration ?? current.nafdacRegistration, kycTier: body.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
    if (body.nafdacRegistration) await repo(c).updateNafdacReg(c.req.param('id'), tenantId, body.nafdacRegistration);
  }
  const updated = await repo(c).transition(c.req.param('id'), tenantId, to);
  return c.json(updated);
});

app.post('/profiles/:id/slaughter-log', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ slaughterDate: number; animalType: string; headCount: number; vetInspected?: boolean; meatYieldKg: number }>();
  const log = await repo(c).createSlaughterLog({ profileId: c.req.param('id'), tenantId, slaughterDate: body.slaughterDate, animalType: body.animalType as never, headCount: body.headCount, vetInspected: body.vetInspected, meatYieldKg: body.meatYieldKg });
  return c.json(log, 201);
});

app.post('/profiles/:id/sales', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ buyerPhone: string; animalType: string; quantityKg: number; pricePerKgKobo: number; totalKobo: number; saleDate: number }>();
  const g = guardFractionalKobo(body.pricePerKgKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const sale = await repo(c).createSale({ profileId: c.req.param('id'), tenantId, buyerPhone: body.buyerPhone, animalType: body.animalType as never, quantityKg: body.quantityKg, pricePerKgKobo: body.pricePerKgKobo, totalKobo: body.totalKobo, saleDate: body.saleDate });
  return c.json(sale, 201);
});

app.get('/profiles/:id/sales', async (c) => {
  const { tenantId } = auth(c);
  return c.json(await repo(c).listSales(c.req.param('id'), tenantId));
});

app.post('/ai/prompt', async (c) => {
  const body = await c.req.json<{ autonomyLevel?: string | number }>();
  const g = guardL2AiCap({ autonomyLevel: body.autonomyLevel });
  if (!g.allowed) return c.json({ error: g.reason }, 403);
  return c.json({ status: 'ai_advisory_queued' });
});

export default app;
