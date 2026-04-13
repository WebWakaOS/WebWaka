/**
 * Palm Oil routes — M12
 * ADL-010: AI at L2 max — palm oil yield forecast and price alert advisory only
 * FFB weight as integer kg; oil output as integer ml (no float litres)
 * P9: costPerKgKobo / productionCostKobo / pricePerLitreKobo / totalKobo must be integers
 * T3: all queries scoped to tenantId
 * P13: supplierPhone stripped; mill-level production capacity only
 * GET /:id/ai-advisory — NDPR consent gate via aiConsentGate middleware
 */

import { Hono } from 'hono';
import type { Context, MiddlewareHandler } from 'hono';
import type { Env } from '../../types.js';
import { aiConsentGate } from '@webwaka/superagent';
import {
  PalmOilRepository,
  guardClaimedToNafdacVerified,
  guardIntegerMl,
  guardFractionalKobo,
  isValidPalmOilTransition,
} from '@webwaka/verticals-palm-oil';

type Auth = { userId: string; tenantId: string };
const app = new Hono<{ Bindings: Env }>();
function repo(c: { env: Env }) { return new PalmOilRepository(c.env.DB); }
function auth(c: Context<{ Bindings: Env }>) { return c.get('auth') as Auth; }

app.post('/profiles', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ workspaceId: string; millName: string; nafdacProductNumber?: string; niforAffiliation?: string; stateAgricExtensionReg?: string }>();
  const profile = await repo(c).createProfile({ workspaceId: body.workspaceId, tenantId, millName: body.millName, nafdacProductNumber: body.nafdacProductNumber, niforAffiliation: body.niforAffiliation, stateAgricExtensionReg: body.stateAgricExtensionReg });
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
  const body = await c.req.json<{ to: string; nafdacProductNumber?: string; kycTier?: number }>();
  const to = body.to as Parameters<typeof isValidPalmOilTransition>[1];
  const current = await repo(c).findProfileById(c.req.param('id'), tenantId);
  if (!current) return c.json({ error: 'not found' }, 404);
  if (!isValidPalmOilTransition(current.status, to)) return c.json({ error: `Invalid FSM transition: ${current.status} → ${to}` }, 422);
  if (to === 'nafdac_verified') {
    const g = guardClaimedToNafdacVerified({ nafdacProductNumber: body.nafdacProductNumber ?? current.nafdacProductNumber, kycTier: body.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
    if (body.nafdacProductNumber) await repo(c).updateNafdacNumber(c.req.param('id'), tenantId, body.nafdacProductNumber);
  }
  const updated = await repo(c).transition(c.req.param('id'), tenantId, to);
  return c.json(updated);
});

app.post('/profiles/:id/ffb-intake', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ ffbSource?: string; quantityKg: number; costPerKgKobo: number; intakeDate: number; supplierPhone?: string }>();
  const g = guardFractionalKobo(body.costPerKgKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const intake = await repo(c).createFfbIntake({ profileId: c.req.param('id'), tenantId, ffbSource: body.ffbSource as never, quantityKg: body.quantityKg, costPerKgKobo: body.costPerKgKobo, intakeDate: body.intakeDate, supplierPhone: body.supplierPhone });
  return c.json(intake, 201);
});

app.post('/profiles/:id/batches', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ processingDate: number; ffbInputKg: number; oilOutputMl: number; kernelOutputKg?: number; productionCostKobo: number }>();
  const mlG = guardIntegerMl(body.oilOutputMl);
  if (!mlG.allowed) return c.json({ error: mlG.reason }, 422);
  const g = guardFractionalKobo(body.productionCostKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const batch = await repo(c).createBatch({ profileId: c.req.param('id'), tenantId, processingDate: body.processingDate, ffbInputKg: body.ffbInputKg, oilOutputMl: body.oilOutputMl, kernelOutputKg: body.kernelOutputKg, productionCostKobo: body.productionCostKobo });
  return c.json(batch, 201);
});

app.post('/profiles/:id/sales', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ buyerPhone: string; quantityMl: number; pricePerLitreKobo: number; totalKobo: number; saleDate: number }>();
  const mlG = guardIntegerMl(body.quantityMl);
  if (!mlG.allowed) return c.json({ error: mlG.reason }, 422);
  const g = guardFractionalKobo(body.pricePerLitreKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const sale = await repo(c).createSale({ profileId: c.req.param('id'), tenantId, buyerPhone: body.buyerPhone, quantityMl: body.quantityMl, pricePerLitreKobo: body.pricePerLitreKobo, totalKobo: body.totalKobo, saleDate: body.saleDate });
  return c.json(sale, 201);
});

// AI advisory — P13: supplierPhone stripped; mill-level production capacity and compliance only
app.get(
  '/profiles/:id/ai-advisory',
  aiConsentGate as MiddlewareHandler<{ Bindings: Env }>,
  async (c) => {
    const { tenantId } = auth(c);
    const profile = await repo(c).findProfileById(c.req.param('id'), tenantId);
    if (!profile) return c.json({ error: 'not found' }, 404);
    const p = profile as Record<string, unknown>;
    return c.json({
      capability: 'PALM_OIL_YIELD_ADVISORY',
      profile_summary: {
        status: p['status'],
        nafdac_certified: !!p['nafdacProductNumber'],
        nifor_affiliated: !!p['niforAffiliation'],
      },
      count: 1,
    });
  },
);

export default app;
