/**
 * Fish Market routes — M12
 * ADL-010: AI at L2 max — demand planning advisory only
 * P9: pricePerKgKobo / totalKobo must be integers; weights as integer grams; expiry as integer unix
 * T3: all queries scoped to tenantId
 * P13: buyerPhone stripped; fish type + weight aggregates only
 * GET /:id/ai-advisory — NDPR consent gate via aiConsentGate middleware
 */

import { Hono } from 'hono';
import type { Context, MiddlewareHandler } from 'hono';
import type { Env } from '../../types.js';
import { aiConsentGate } from '@webwaka/superagent';
import {
  FishMarketRepository,
  guardClaimedToNafdacVerified,
  guardIntegerGrams,
  guardExpiryAlert,
  guardFractionalKobo,
  isValidFishMarketTransition,
} from '@webwaka/verticals-fish-market';

type Auth = { userId: string; tenantId: string };
const app = new Hono<{ Bindings: Env }>();
function repo(c: { env: Env }) { return new FishMarketRepository(c.env.DB); }
function auth(c: Context<{ Bindings: Env }>) { return c.get('auth') as Auth; }

app.post('/profiles', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ workspaceId: string; businessName: string; nafdacFoodSafetyCert?: string; nifidaRegistration?: string; marketLocation?: string }>();
  const profile = await repo(c).createProfile({ workspaceId: body.workspaceId, tenantId, businessName: body.businessName, nafdacFoodSafetyCert: body.nafdacFoodSafetyCert, nifidaRegistration: body.nifidaRegistration, marketLocation: body.marketLocation });
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
  const body = await c.req.json<{ to: string; nafdacFoodSafetyCert?: string; kycTier?: number }>();
  const to = body.to as Parameters<typeof isValidFishMarketTransition>[1];
  const current = await repo(c).findProfileById(c.req.param('id'), tenantId);
  if (!current) return c.json({ error: 'not found' }, 404);
  if (!isValidFishMarketTransition(current.status, to)) return c.json({ error: `Invalid FSM transition: ${current.status} → ${to}` }, 422);
  if (to === 'nafdac_verified') {
    const g = guardClaimedToNafdacVerified({ nafdacFoodSafetyCert: body.nafdacFoodSafetyCert ?? current.nafdacFoodSafetyCert, kycTier: body.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
    if (body.nafdacFoodSafetyCert) await repo(c).updateNafdacCert(c.req.param('id'), tenantId, body.nafdacFoodSafetyCert);
  }
  const updated = await repo(c).transition(c.req.param('id'), tenantId, to);
  return c.json(updated);
});

app.post('/profiles/:id/stock', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ fishType: string; category?: string; weightGrams: number; costPerKgKobo: number; expiryDate: number; source?: string }>();
  const wg = guardIntegerGrams(body.weightGrams);
  if (!wg.allowed) return c.json({ error: wg.reason }, 422);
  const g = guardFractionalKobo(body.costPerKgKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const expG = guardExpiryAlert(body.expiryDate, Math.floor(Date.now() / 1000));
  if (!expG.allowed) return c.json({ error: expG.reason }, 422);
  const stock = await repo(c).createStock({ profileId: c.req.param('id'), tenantId, fishType: body.fishType, category: body.category as never, weightGrams: body.weightGrams, costPerKgKobo: body.costPerKgKobo, expiryDate: body.expiryDate, source: body.source });
  return c.json(stock, 201);
});

app.post('/profiles/:id/sales', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ buyerPhone: string; fishType: string; weightGrams: number; pricePerKgKobo: number; totalKobo: number; saleDate: number }>();
  const wg = guardIntegerGrams(body.weightGrams);
  if (!wg.allowed) return c.json({ error: wg.reason }, 422);
  const g = guardFractionalKobo(body.pricePerKgKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const sale = await repo(c).createSale({ profileId: c.req.param('id'), tenantId, buyerPhone: body.buyerPhone, fishType: body.fishType, weightGrams: body.weightGrams, pricePerKgKobo: body.pricePerKgKobo, totalKobo: body.totalKobo, saleDate: body.saleDate });
  return c.json(sale, 201);
});

app.post('/profiles/:id/wastage', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ wasteDate: number; fishType: string; weightGrams: number; reason?: string }>();
  const wg = guardIntegerGrams(body.weightGrams);
  if (!wg.allowed) return c.json({ error: wg.reason }, 422);
  const wastage = await repo(c).createWastage({ profileId: c.req.param('id'), tenantId, wasteDate: body.wasteDate, fishType: body.fishType, weightGrams: body.weightGrams, reason: body.reason });
  return c.json(wastage, 201);
});

// AI advisory — P13: buyerPhone stripped; business profile and market location only
app.get(
  '/profiles/:id/ai-advisory',
  aiConsentGate as MiddlewareHandler<{ Bindings: Env }>,
  async (c) => {
    const { tenantId } = auth(c);
    const profile = await repo(c).findProfileById(c.req.param('id'), tenantId);
    if (!profile) return c.json({ error: 'not found' }, 404);
    const p = profile as unknown as Record<string, unknown>;
    return c.json({
      capability: 'DEMAND_PLANNING_ADVISORY',
      profile_summary: {
        status: p['status'],
        market_location: p['marketLocation'],
        nafdac_certified: !!p['nafdacFoodSafetyCert'],
      },
      count: 1,
    });
  },
);

export default app;
