/**
 * Artisanal Mining vertical routes — M12 Commerce P3
 *
 * POST   /artisanal-mining                         — Create profile
 * GET    /artisanal-mining/workspace/:workspaceId  — Get by workspace (T3)
 * GET    /artisanal-mining/:id                     — Get profile (T3)
 * PATCH  /artisanal-mining/:id                     — Update profile
 * POST   /artisanal-mining/:id/transition          — FSM transition
 * POST   /artisanal-mining/:id/production-logs     — Create production log (P9; P13: offtaker stripped)
 * GET    /artisanal-mining/:id/production-logs     — List production logs (T3)
 * POST   /artisanal-mining/:id/permits             — Create mining permit
 * GET    /artisanal-mining/:id/permits             — List permits (T3)
 * GET    /artisanal-mining/:id/ai-advisory         — AI advisory (P13: offtaker names stripped)
 *
 * Platform Invariants: T3, P9, P13
 */

import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import {
  ArtisanalMiningRepository,
  guardSeedToClaimed,
  guardClaimedToMmsdVerified,
  isValidArtisanalMiningTransition,
} from '@webwaka/verticals-artisanal-mining';
import type { ArtisanalMiningFSMState } from '@webwaka/verticals-artisanal-mining';
import { aiConsentGate } from '@webwaka/superagent';
import type { Env } from '../../env.js';

export const artisanalMiningRoutes = new Hono<{ Bindings: Env }>();

artisanalMiningRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; company_name?: string; mmsd_permit?: string; mineral_type?: string; state?: string; lga?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.company_name) return c.json({ error: 'workspace_id, company_name are required' }, 400);
  const repo = new ArtisanalMiningRepository(c.env.DB);
  const profile = await repo.createProfile({ workspaceId: body.workspace_id, tenantId: auth.tenantId, companyName: body.company_name, mmsdPermit: body.mmsd_permit, mineralType: body.mineral_type, state: body.state, lga: body.lga });
  return c.json({ artisanal_mining: profile }, 201);
});

artisanalMiningRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { workspaceId } = c.req.param();
  const repo = new ArtisanalMiningRepository(c.env.DB);
  const profile = await repo.findProfileByWorkspace(workspaceId, auth.tenantId);
  return c.json({ artisanal_mining: profile });
});

artisanalMiningRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new ArtisanalMiningRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Artisanal mining profile not found' }, 404);
  return c.json({ artisanal_mining: profile });
});

artisanalMiningRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { company_name?: string; mmsd_permit?: string; mineral_type?: string; state?: string; lga?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new ArtisanalMiningRepository(c.env.DB);
  const updated = await repo.updateProfile(id, auth.tenantId, { companyName: body.company_name, mmsdPermit: body.mmsd_permit, mineralType: body.mineral_type, state: body.state, lga: body.lga });
  if (!updated) return c.json({ error: 'Profile not found' }, 404);
  return c.json({ artisanal_mining: updated });
});

artisanalMiningRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; kycTier?: number };
  const { id } = c.req.param();
  let body: { to_status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to_status) return c.json({ error: 'to_status is required' }, 400);
  const repo = new ArtisanalMiningRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Profile not found' }, 404);
  const from = profile.status;
  const to = body.to_status as ArtisanalMiningFSMState;
  if (!isValidArtisanalMiningTransition(from, to)) return c.json({ error: `Invalid FSM transition: ${from} → ${to}` }, 422);
  if (to === 'claimed') {
    const g = guardSeedToClaimed({ kycTier: auth.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  if (to === 'mmsd_verified') {
    const g = guardClaimedToMmsdVerified({ mmsdPermit: profile.mmsdPermit ?? null, kycTier: auth.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 422);
  }
  const updated = await repo.transitionStatus(id, auth.tenantId, to);
  return c.json({ artisanal_mining: updated });
});

artisanalMiningRoutes.post('/:id/production-logs', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { mineral_type?: string; weight_grams?: number; quality_grade?: string; sale_price_kobo?: number; offtaker_name?: string; sale_date?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.mineral_type || body.weight_grams === undefined || body.sale_price_kobo === undefined) return c.json({ error: 'mineral_type, weight_grams, sale_price_kobo are required' }, 400);
  const repo = new ArtisanalMiningRepository(c.env.DB);
  try {
    const log = await repo.createProductionLog({ workspaceId: id, tenantId: auth.tenantId, mineralType: body.mineral_type, weightGrams: body.weight_grams, qualityGrade: body.quality_grade, salePriceKobo: body.sale_price_kobo, offtakerName: body.offtaker_name, saleDate: body.sale_date });
    return c.json({ production_log: log }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('P9')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

artisanalMiningRoutes.get('/:id/production-logs', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new ArtisanalMiningRepository(c.env.DB);
  const logs = await repo.listProductionLogs(id, auth.tenantId);
  return c.json({ production_logs: logs, count: logs.length });
});

artisanalMiningRoutes.post('/:id/permits', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { permit_number?: string; permit_type?: string; valid_from?: number; valid_until?: number; state?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.permit_number) return c.json({ error: 'permit_number is required' }, 400);
  const repo = new ArtisanalMiningRepository(c.env.DB);
  const permit = await repo.createPermit({ workspaceId: id, tenantId: auth.tenantId, permitNumber: body.permit_number, permitType: body.permit_type, validFrom: body.valid_from, validUntil: body.valid_until, state: body.state });
  return c.json({ permit }, 201);
});

artisanalMiningRoutes.get('/:id/permits', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new ArtisanalMiningRepository(c.env.DB);
  const permits = await repo.listPermits(id, auth.tenantId);
  return c.json({ permits, count: permits.length });
});

// AI advisory — P13: offtaker_name stripped; mineral + weight + price only
artisanalMiningRoutes.get(
  '/:id/ai-advisory',
  aiConsentGate as MiddlewareHandler<{ Bindings: Env }>,
  async (c) => {
    const auth = c.get('auth') as { userId: string; tenantId: string };
    const { id } = c.req.param();
    const repo = new ArtisanalMiningRepository(c.env.DB);
    const logs = await repo.listProductionLogs(id, auth.tenantId);
    const advisory = logs.map(r => ({ mineral_type: r.mineralType, weight_grams: r.weightGrams, quality_grade: r.qualityGrade, sale_price_kobo: r.salePriceKobo }));
    return c.json({ capability: 'PRODUCTION_TREND', advisory_data: advisory, count: advisory.length });
  },
);
