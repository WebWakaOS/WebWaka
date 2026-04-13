/**
 * Cold Room routes — M10
 * Temperature stored as integer millidegrees Celsius (no floats)
 * ADL-010: AI at L2 max — temperature alert advisory only
 * P9: dailyRateKobo must be integers; capacity as integer kg
 * T3: all queries scoped to tenantId
 * GET /:id/ai-advisory — NDPR consent gate via aiConsentGate middleware
 */

import { Hono } from 'hono';
import type { Context, MiddlewareHandler } from 'hono';
import type { Env } from '../../types.js';
import { aiConsentGate } from '@webwaka/superagent';
import {
  ColdRoomRepository,
  guardClaimedToNafdacVerified,
  guardIntegerTemperature,
  guardFractionalKobo,
  isValidColdRoomTransition,
} from '@webwaka/verticals-cold-room';

type Auth = { userId: string; tenantId: string };
const app = new Hono<{ Bindings: Env }>();
function repo(c: { env: Env }) { return new ColdRoomRepository(c.env.DB); }
function auth(c: Context<{ Bindings: Env }>) { return c.get('auth') as Auth; }

app.post('/profiles', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ workspaceId: string; facilityName: string; nafdacColdChainCert?: string; sonCert?: string; capacityKg?: number; cacRc?: string }>();
  const profile = await repo(c).createProfile({ workspaceId: body.workspaceId, tenantId, facilityName: body.facilityName, nafdacColdChainCert: body.nafdacColdChainCert, sonCert: body.sonCert, capacityKg: body.capacityKg, cacRc: body.cacRc });
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
  const body = await c.req.json<{ to: string; nafdacColdChainCert?: string; kycTier?: number }>();
  const to = body.to as Parameters<typeof isValidColdRoomTransition>[1];
  const current = await repo(c).findProfileById(c.req.param('id'), tenantId);
  if (!current) return c.json({ error: 'not found' }, 404);
  if (!isValidColdRoomTransition(current.status, to)) return c.json({ error: `Invalid FSM transition: ${current.status} → ${to}` }, 422);
  if (to === 'nafdac_verified') {
    const g = guardClaimedToNafdacVerified({ nafdacColdChainCert: body.nafdacColdChainCert ?? current.nafdacColdChainCert, kycTier: body.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
    if (body.nafdacColdChainCert) await repo(c).updateNafdacCert(c.req.param('id'), tenantId, body.nafdacColdChainCert);
  }
  const updated = await repo(c).transition(c.req.param('id'), tenantId, to);
  return c.json(updated);
});

app.post('/profiles/:id/units', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ unitNumber: string; capacityKg: number; currentTempMc?: number }>();
  if (body.currentTempMc !== undefined) {
    const tg = guardIntegerTemperature(body.currentTempMc);
    if (!tg.allowed) return c.json({ error: tg.reason }, 422);
  }
  const unit = await repo(c).createUnit({ profileId: c.req.param('id'), tenantId, unitNumber: body.unitNumber, capacityKg: body.capacityKg, currentTempMc: body.currentTempMc });
  return c.json(unit, 201);
});

app.post('/profiles/:id/agreements', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ clientPhone: string; commodityType: string; quantityKg: number; dailyRateKobo: number; entryDate: number }>();
  const g = guardFractionalKobo(body.dailyRateKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const agreement = await repo(c).createAgreement({ profileId: c.req.param('id'), tenantId, clientPhone: body.clientPhone, commodityType: body.commodityType, quantityKg: body.quantityKg, dailyRateKobo: body.dailyRateKobo, entryDate: body.entryDate });
  return c.json(agreement, 201);
});

app.post('/profiles/:id/temp-log', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ unitId: string; logTime: number; temperatureMc: number; alertFlag?: boolean }>();
  const tg = guardIntegerTemperature(body.temperatureMc);
  if (!tg.allowed) return c.json({ error: tg.reason }, 422);
  const log = await repo(c).logTemperature({ profileId: c.req.param('id'), tenantId, unitId: body.unitId, logTime: body.logTime, temperatureMc: body.temperatureMc, alertFlag: body.alertFlag });
  return c.json(log, 201);
});

// AI advisory — P13: clientPhone stripped; facility capacity and status only
app.get(
  '/profiles/:id/ai-advisory',
  aiConsentGate as MiddlewareHandler<{ Bindings: Env }>,
  async (c) => {
    const { tenantId } = auth(c);
    const profile = await repo(c).findProfileById(c.req.param('id'), tenantId);
    if (!profile) return c.json({ error: 'not found' }, 404);
    const p = profile as Record<string, unknown>;
    return c.json({
      capability: 'TEMPERATURE_ALERT_ADVISORY',
      profile_summary: {
        status: p['status'],
        capacity_kg: p['capacityKg'],
        nafdac_certified: !!p['nafdacColdChainCert'],
      },
      count: 1,
    });
  },
);

export default app;
