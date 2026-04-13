/**
 * Food Processing routes — M12
 * ADL-010: AI at L2 max — production demand advisory only
 * NAFDAC batch traceability via nafdac_product_number + batch_number
 * P9: totalCostKobo / unitSalePriceKobo must be integers; weights as integers
 * T3: all queries scoped to tenantId
 * GET /:id/ai-advisory — NDPR consent gate via aiConsentGate middleware
 */

import { Hono } from 'hono';
import type { Context, MiddlewareHandler } from 'hono';
import type { Env } from '../../types.js';
import { aiConsentGate } from '@webwaka/superagent';
import {
  FoodProcessingRepository,
  guardClaimedToNafdacVerified,
  guardFractionalKobo,
  isValidFoodProcessingTransition,
} from '@webwaka/verticals-food-processing';

type Auth = { userId: string; tenantId: string };
const app = new Hono<{ Bindings: Env }>();
function repo(c: { env: Env }) { return new FoodProcessingRepository(c.env.DB); }
function auth(c: Context<{ Bindings: Env }>) { return c.get('auth') as Auth; }

app.post('/profiles', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ workspaceId: string; factoryName: string; nafdacManufacturingPermit?: string; sonProductCert?: string; cacRc?: string }>();
  const profile = await repo(c).createProfile({ workspaceId: body.workspaceId, tenantId, factoryName: body.factoryName, nafdacManufacturingPermit: body.nafdacManufacturingPermit, sonProductCert: body.sonProductCert, cacRc: body.cacRc });
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
  const to = body.to as Parameters<typeof isValidFoodProcessingTransition>[1];
  const current = await repo(c).findProfileById(c.req.param('id'), tenantId);
  if (!current) return c.json({ error: 'not found' }, 404);
  if (!isValidFoodProcessingTransition(current.status, to)) return c.json({ error: `Invalid FSM transition: ${current.status} → ${to}` }, 422);
  if (to === 'nafdac_verified') {
    const g = guardClaimedToNafdacVerified({ nafdacManufacturingPermit: body.nafdacManufacturingPermit ?? current.nafdacManufacturingPermit, kycTier: body.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
    if (body.nafdacManufacturingPermit) await repo(c).updatePermit(c.req.param('id'), tenantId, body.nafdacManufacturingPermit);
  }
  const updated = await repo(c).transition(c.req.param('id'), tenantId, to);
  return c.json(updated);
});

app.post('/profiles/:id/batches', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ productName: string; nafdacProductNumber?: string; batchNumber: string; productionDate: number; quantityUnits: number; unitSizeGrams: number; totalCostKobo: number; expiryDate?: number }>();
  const g = guardFractionalKobo(body.totalCostKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const batch = await repo(c).createBatch({ profileId: c.req.param('id'), tenantId, productName: body.productName, nafdacProductNumber: body.nafdacProductNumber, batchNumber: body.batchNumber, productionDate: body.productionDate, quantityUnits: body.quantityUnits, unitSizeGrams: body.unitSizeGrams, totalCostKobo: body.totalCostKobo, expiryDate: body.expiryDate });
  return c.json(batch, 201);
});

app.post('/profiles/:id/raw-materials', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ materialName: string; quantityKg: number; costPerKgKobo: number; supplier?: string; intakeDate: number }>();
  const g = guardFractionalKobo(body.costPerKgKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const raw = await repo(c).createRawMaterial({ profileId: c.req.param('id'), tenantId, materialName: body.materialName, quantityKg: body.quantityKg, costPerKgKobo: body.costPerKgKobo, supplier: body.supplier, intakeDate: body.intakeDate });
  return c.json(raw, 201);
});

app.post('/profiles/:id/finished-goods', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ productName: string; nafdacProductNumber?: string; unitsInStock?: number; unitSalePriceKobo: number }>();
  const g = guardFractionalKobo(body.unitSalePriceKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const good = await repo(c).createFinishedGood({ profileId: c.req.param('id'), tenantId, productName: body.productName, nafdacProductNumber: body.nafdacProductNumber, unitsInStock: body.unitsInStock, unitSalePriceKobo: body.unitSalePriceKobo });
  return c.json(good, 201);
});

// AI advisory — P13: no personal buyer/supplier data; factory-level compliance stats only
app.get(
  '/profiles/:id/ai-advisory',
  aiConsentGate as MiddlewareHandler<{ Bindings: Env }>,
  async (c) => {
    const { tenantId } = auth(c);
    const profile = await repo(c).findProfileById(c.req.param('id'), tenantId);
    if (!profile) return c.json({ error: 'not found' }, 404);
    const p = profile as Record<string, unknown>;
    return c.json({
      capability: 'PRODUCTION_DEMAND_ADVISORY',
      profile_summary: {
        status: p['status'],
        nafdac_permit: !!p['nafdacManufacturingPermit'],
        son_certified: !!p['sonProductCert'],
      },
      count: 1,
    });
  },
);

export default app;
