/**
 * Cassava Miller routes — M12
 * ADL-010: AI at L2 max — milling yield forecast and price alerts advisory only
 * P9: costPerKgKobo / millingCostKobo / totalKobo must be integers; weights as integer kg
 * T3: all queries scoped to tenantId
 * GET /:id/ai-advisory — NDPR consent gate via aiConsentGate middleware
 */

import { Hono } from 'hono';
import type { Context, MiddlewareHandler } from 'hono';
import type { Env } from '../../types.js';
import { aiConsentGate } from '@webwaka/superagent';
import {
  CassavaMillerRepository,
  guardClaimedToNafdacVerified,
  guardFractionalKobo,
  isValidCassavaMillerTransition,
} from '@webwaka/verticals-cassava-miller';

type Auth = { userId: string; tenantId: string };
const app = new Hono<{ Bindings: Env }>();
function repo(c: { env: Env }) { return new CassavaMillerRepository(c.env.DB); }
function auth(c: Context<{ Bindings: Env }>) { return c.get('auth') as Auth; }

app.post('/profiles', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ workspaceId: string; millName: string; nafdacManufacturingPermit?: string; sonProductCert?: string; cacRc?: string; processingCapacityKgPerDay?: number }>();
  const profile = await repo(c).createProfile({ workspaceId: body.workspaceId, tenantId, millName: body.millName, nafdacManufacturingPermit: body.nafdacManufacturingPermit, sonProductCert: body.sonProductCert, cacRc: body.cacRc, processingCapacityKgPerDay: body.processingCapacityKgPerDay });
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
  const body = await c.req.json<{ to: string; nafdacManufacturingPermit?: string; kycTier?: number }>();
  const to = body.to as Parameters<typeof isValidCassavaMillerTransition>[1];
  const current = await repo(c).findProfileById(c.req.param('id'), tenantId);
  if (!current) return c.json({ error: 'not found' }, 404);
  if (!isValidCassavaMillerTransition(current.status, to)) return c.json({ error: `Invalid FSM transition: ${current.status} → ${to}` }, 422);
  if (to === 'nafdac_verified') {
    const g = guardClaimedToNafdacVerified({ nafdacManufacturingPermit: body.nafdacManufacturingPermit ?? current.nafdacManufacturingPermit, kycTier: body.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
    if (body.nafdacManufacturingPermit) await repo(c).updatePermit(c.req.param('id'), tenantId, body.nafdacManufacturingPermit);
  }
  const updated = await repo(c).transition(c.req.param('id'), tenantId, to);
  return c.json(updated);
});

app.post('/profiles/:id/intake', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ cropType: string; quantityKg: number; supplierPhone?: string; intakeDate: number; costPerKgKobo: number }>();
  const g = guardFractionalKobo(body.costPerKgKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const log = await repo(c).createIntakeLog({ profileId: c.req.param('id'), tenantId, cropType: body.cropType as never, quantityKg: body.quantityKg, supplierPhone: body.supplierPhone, intakeDate: body.intakeDate, costPerKgKobo: body.costPerKgKobo });
  return c.json(log, 201);
});

app.post('/profiles/:id/batches', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ batchDate: number; cropType: string; rawInputKg: number; productOutputKg: number; productType: string; millingCostKobo: number }>();
  const g = guardFractionalKobo(body.millingCostKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const batch = await repo(c).createBatch({ profileId: c.req.param('id'), tenantId, batchDate: body.batchDate, cropType: body.cropType as never, rawInputKg: body.rawInputKg, productOutputKg: body.productOutputKg, productType: body.productType as never, millingCostKobo: body.millingCostKobo });
  return c.json(batch, 201);
});

app.post('/profiles/:id/sales', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ buyerPhone: string; productType: string; quantityKg: number; pricePerKgKobo: number; totalKobo: number; saleDate: number }>();
  const g = guardFractionalKobo(body.pricePerKgKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const sale = await repo(c).createSale({ profileId: c.req.param('id'), tenantId, buyerPhone: body.buyerPhone, productType: body.productType as never, quantityKg: body.quantityKg, pricePerKgKobo: body.pricePerKgKobo, totalKobo: body.totalKobo, saleDate: body.saleDate });
  return c.json(sale, 201);
});

// AI advisory — P13: supplierPhone stripped; mill-level capacity/status only
app.get(
  '/profiles/:id/ai-advisory',
  aiConsentGate as MiddlewareHandler<{ Bindings: Env }>,
  async (c) => {
    const { tenantId } = auth(c);
    const profile = await repo(c).findProfileById(c.req.param('id'), tenantId);
    if (!profile) return c.json({ error: 'not found' }, 404);
    const p = profile as unknown as Record<string, unknown>;
    return c.json({
      capability: 'MILLING_YIELD_FORECAST',
      profile_summary: {
        status: p['status'],
        processing_capacity_kg_per_day: p['processingCapacityKgPerDay'],
        nafdac_verified: !!p['nafdacManufacturingPermit'],
      },
      count: 1,
    });
  },
);

export default app;
