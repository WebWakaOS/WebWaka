/**
 * Cocoa Exporter routes — M12
 * KYC Tier 3 MANDATORY — export FX transactions
 * ADL-010: AI at L2 max — commodity price alerts advisory only
 * P13: farmer phone never in AI; company-level export stats only
 * P9: pricePerKgKobo / fobValueKobo must be integers
 * T3: all queries scoped to tenantId
 * GET /:id/ai-advisory — NDPR consent gate via aiConsentGate middleware
 */

import { Hono } from 'hono';
import type { Context, MiddlewareHandler } from 'hono';
import type { Env } from '../../types.js';
import { aiConsentGate } from '@webwaka/superagent';
import {
  CocoaExporterRepository,
  guardClaimedToNepcVerified,
  guardKycTier3Mandatory,
  guardFractionalKobo,
  isValidCocoaExporterTransition,
} from '@webwaka/verticals-cocoa-exporter';

type Auth = { userId: string; tenantId: string };
const app = new Hono<{ Bindings: Env }>();
function repo(c: { env: Env }) { return new CocoaExporterRepository(c.env.DB); }
function auth(c: Context<{ Bindings: Env }>) { return c.get('auth') as Auth; }

app.post('/profiles', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ workspaceId: string; companyName: string; nepcExporterLicence?: string; nxpNumber?: string; crinRegistered?: boolean; cbnForexDealer?: boolean; cacRc?: string }>();
  const profile = await repo(c).createProfile({ workspaceId: body.workspaceId, tenantId, companyName: body.companyName, nepcExporterLicence: body.nepcExporterLicence, nxpNumber: body.nxpNumber, crinRegistered: body.crinRegistered, cbnForexDealer: body.cbnForexDealer, cacRc: body.cacRc });
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
  const body = await c.req.json<{ to: string; nepcExporterLicence?: string; kycTier?: number }>();
  const to = body.to as Parameters<typeof isValidCocoaExporterTransition>[1];
  const current = await repo(c).findProfileById(c.req.param('id'), tenantId);
  if (!current) return c.json({ error: 'not found' }, 404);
  if (!isValidCocoaExporterTransition(current.status, to)) return c.json({ error: `Invalid FSM transition: ${current.status} → ${to}` }, 422);
  if (to === 'nepc_verified') {
    const kycCheck = guardKycTier3Mandatory({ kycTier: body.kycTier ?? 0 });
    if (!kycCheck.allowed) return c.json({ error: kycCheck.reason }, 403);
    const g = guardClaimedToNepcVerified({ nepcExporterLicence: body.nepcExporterLicence ?? current.nepcExporterLicence, kycTier: body.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
    if (body.nepcExporterLicence) await repo(c).updateNepcLicence(c.req.param('id'), tenantId, body.nepcExporterLicence);
  }
  const updated = await repo(c).transition(c.req.param('id'), tenantId, to);
  return c.json(updated);
});

app.post('/profiles/:id/procurement', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ farmerPhone: string; quantityKg: number; grade?: string; pricePerKgKobo: number; intakeDate: number }>();
  const g = guardFractionalKobo(body.pricePerKgKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const proc = await repo(c).createProcurement({ profileId: c.req.param('id'), tenantId, farmerPhone: body.farmerPhone, quantityKg: body.quantityKg, grade: body.grade as never, pricePerKgKobo: body.pricePerKgKobo, intakeDate: body.intakeDate });
  return c.json(proc, 201);
});

app.post('/profiles/:id/exports', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ buyerCountry: string; quantityKg: number; qualityCertRef?: string; nepcLicenceRef?: string; cbnFxForm?: string; fobValueKobo: number; shippingDate?: number }>();
  const g = guardFractionalKobo(body.fobValueKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const exp = await repo(c).createExport({ profileId: c.req.param('id'), tenantId, buyerCountry: body.buyerCountry, quantityKg: body.quantityKg, qualityCertRef: body.qualityCertRef, nepcLicenceRef: body.nepcLicenceRef, cbnFxForm: body.cbnFxForm, fobValueKobo: body.fobValueKobo, shippingDate: body.shippingDate });
  return c.json(exp, 201);
});

// AI advisory — P13: farmer phone never exposed; company-level export/compliance stats only
app.get(
  '/profiles/:id/ai-advisory',
  aiConsentGate as MiddlewareHandler<{ Bindings: Env }>,
  async (c) => {
    const { tenantId } = auth(c);
    const profile = await repo(c).findProfileById(c.req.param('id'), tenantId);
    if (!profile) return c.json({ error: 'not found' }, 404);
    const p = profile as unknown as Record<string, unknown>;
    return c.json({
      capability: 'COMMODITY_PRICE_ADVISORY',
      profile_summary: {
        status: p['status'],
        nepc_verified: !!p['nepcExporterLicence'],
        cbn_forex_dealer: !!p['cbnForexDealer'],
        crin_registered: !!p['crinRegistered'],
      },
      count: 1,
    });
  },
);

export default app;
