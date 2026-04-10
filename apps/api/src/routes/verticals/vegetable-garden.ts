/**
 * Vegetable Garden routes — M12
 * FSM: 3-state informal (seeded → claimed → active); FMARD code optional
 * ADL-010: AI at L2 max — harvest forecasts and price alerts advisory only
 * P9: pricePerKgKobo / costKobo / totalKobo must be integers; weights as integer grams; area as integer sqm
 * T3: all queries scoped to tenantId
 * P12: AI blocked on USSD
 */

import { Hono } from 'hono';
import type { Env } from '../../types.js';
import {
  VegetableGardenRepository,
  guardClaimedToActive,
  guardIntegerGrams,
  guardIntegerSqm,
  guardL2AiCap,
  guardFractionalKobo,
  isValidVegetableGardenTransition,
} from '@webwaka/verticals-vegetable-garden';

type Auth = { userId: string; tenantId: string };
const app = new Hono<{ Bindings: Env }>();
function repo(c: { env: Env }) { return new VegetableGardenRepository(c.env.DB); }
function auth(c: Parameters<Parameters<typeof app.use>[1]>[0]) { return c.get('auth') as Auth; }

app.post('/profiles', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ workspaceId: string; farmName: string; stateAgricReg?: string; fmardExtensionCode?: string; plotCount?: number }>();
  const profile = await repo(c).createProfile({ workspaceId: body.workspaceId, tenantId, farmName: body.farmName, stateAgricReg: body.stateAgricReg, fmardExtensionCode: body.fmardExtensionCode, plotCount: body.plotCount });
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
  const body = await c.req.json<{ to: string; kycTier?: number }>();
  const to = body.to as Parameters<typeof isValidVegetableGardenTransition>[1];
  const current = await repo(c).findProfileById(c.req.param('id'), tenantId);
  if (!current) return c.json({ error: 'not found' }, 404);
  if (!isValidVegetableGardenTransition(current.status, to)) return c.json({ error: `Invalid FSM transition: ${current.status} → ${to}` }, 422);
  if (to === 'active') {
    const g = guardClaimedToActive({ kycTier: body.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  const updated = await repo(c).transition(c.req.param('id'), tenantId, to);
  return c.json(updated);
});

app.post('/profiles/:id/plots', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ plotName: string; areaSqm: number; cropType: string; plantingDate?: number; expectedHarvestDate?: number }>();
  const sqmG = guardIntegerSqm(body.areaSqm);
  if (!sqmG.allowed) return c.json({ error: sqmG.reason }, 422);
  const plot = await repo(c).createPlot({ profileId: c.req.param('id'), tenantId, plotName: body.plotName, areaSqm: body.areaSqm, cropType: body.cropType, plantingDate: body.plantingDate, expectedHarvestDate: body.expectedHarvestDate });
  return c.json(plot, 201);
});

app.post('/profiles/:id/inputs', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ plotId: string; inputType: string; quantityGrams: number; costKobo: number; inputDate: number }>();
  const wg = guardIntegerGrams(body.quantityGrams);
  if (!wg.allowed) return c.json({ error: wg.reason }, 422);
  const g = guardFractionalKobo(body.costKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const input = await repo(c).createInput({ profileId: c.req.param('id'), tenantId, plotId: body.plotId, inputType: body.inputType as never, quantityGrams: body.quantityGrams, costKobo: body.costKobo, inputDate: body.inputDate });
  return c.json(input, 201);
});

app.post('/profiles/:id/harvests', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ plotId: string; harvestDate: number; weightGrams: number; cropType: string }>();
  const wg = guardIntegerGrams(body.weightGrams);
  if (!wg.allowed) return c.json({ error: wg.reason }, 422);
  const harvest = await repo(c).createHarvest({ profileId: c.req.param('id'), tenantId, plotId: body.plotId, harvestDate: body.harvestDate, weightGrams: body.weightGrams, cropType: body.cropType });
  return c.json(harvest, 201);
});

app.post('/profiles/:id/sales', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ buyerPhone: string; cropType: string; weightGrams: number; pricePerKgKobo: number; totalKobo: number; saleDate: number }>();
  const wg = guardIntegerGrams(body.weightGrams);
  if (!wg.allowed) return c.json({ error: wg.reason }, 422);
  const g = guardFractionalKobo(body.pricePerKgKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const sale = await repo(c).createSale({ profileId: c.req.param('id'), tenantId, buyerPhone: body.buyerPhone, cropType: body.cropType, weightGrams: body.weightGrams, pricePerKgKobo: body.pricePerKgKobo, totalKobo: body.totalKobo, saleDate: body.saleDate });
  return c.json(sale, 201);
});

app.post('/ai/prompt', async (c) => {
  const body = await c.req.json<{ autonomyLevel?: string | number }>();
  const g = guardL2AiCap({ autonomyLevel: body.autonomyLevel });
  if (!g.allowed) return c.json({ error: g.reason }, 403);
  return c.json({ status: 'ai_advisory_queued' });
});

export default app;
