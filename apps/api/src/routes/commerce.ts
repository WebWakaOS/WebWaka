/**
 * Commerce vertical routes — M8e
 *
 * POST /commerce/creator                     — Create creator profile
 * GET  /commerce/creator/:id                 — Get creator
 * PATCH /commerce/creator/:id               — Update creator
 * POST /commerce/creator/:id/transition      — FSM transition
 * POST /commerce/creator/:id/deals           — Create brand deal
 * GET  /commerce/creator/:id/deals           — List brand deals
 *
 * POST /commerce/sole-trader                 — Create sole trader
 * GET  /commerce/sole-trader/:id             — Get sole trader
 * POST /commerce/sole-trader/:id/transition  — FSM transition
 *
 * POST /commerce/market/stalls               — Create market stall
 * GET  /commerce/market/stalls/:id           — Get stall
 * PATCH /commerce/market/stalls/:id          — Update stall
 * GET  /commerce/market/workspace/:wid       — List stalls by workspace
 *
 * POST /commerce/professional                — Create professional profile
 * GET  /commerce/professional/:id            — Get professional
 * POST /commerce/professional/:id/transition — FSM transition
 *
 * POST /commerce/school                      — Create school
 * GET  /commerce/school/:id                  — Get school
 * POST /commerce/school/:id/transition       — FSM transition
 *
 * POST /commerce/clinic                      — Create clinic
 * GET  /commerce/clinic/:id                  — Get clinic
 * POST /commerce/clinic/:id/transition       — FSM transition
 *
 * POST /commerce/tech-hub                    — Create tech hub (scaffold)
 *
 * POST /commerce/restaurant/menu             — Create menu item (P9)
 * GET  /commerce/restaurant/menu/:id         — Get menu item
 * PATCH /commerce/restaurant/menu/:id        — Update menu item
 * GET  /commerce/restaurant/workspace/:wid   — List menu items
 *
 * Platform Invariants: T3, P9, P13
 */

import { Hono } from 'hono';
import { CreatorRepository } from '@webwaka/verticals-creator';
import { SoleTraderRepository } from '@webwaka/verticals-sole-trader';
import { MarketRepository } from '@webwaka/verticals-market';
import { ProfessionalRepository } from '@webwaka/verticals-professional';
import { SchoolRepository } from '@webwaka/verticals-school';
import { ClinicRepository } from '@webwaka/verticals-clinic';
import { TechHubRepository } from '@webwaka/verticals-tech-hub';
import { MenuRepository } from '@webwaka/verticals-restaurant';
import type { CreatorFSMState, CreatorNiche } from '@webwaka/verticals-creator';
import type { SoleTraderFSMState, TradeType } from '@webwaka/verticals-sole-trader';
import type { GoodsType } from '@webwaka/verticals-market';
import type { ProfessionalFSMState, Profession } from '@webwaka/verticals-professional';
import type { SchoolFSMState, SchoolType } from '@webwaka/verticals-school';
import type { ClinicFSMState, FacilityType } from '@webwaka/verticals-clinic';
import type { MenuCategory } from '@webwaka/verticals-restaurant';
import type { Env } from '../env.js';

export const commerceRoutes = new Hono<{ Bindings: Env }>();

// ── Creator ──────────────────────────────────────────────────────────────────

commerceRoutes.post('/creator', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.individual_id || !body.workspace_id || !body.niche) {
    return c.json({ error: 'individual_id, workspace_id, niche required' }, 400);
  }
  const repo = new CreatorRepository(c.env.DB);
  const creator = await repo.create({
    individualId: body.individual_id as string,
    workspaceId: body.workspace_id as string,
    tenantId: auth.tenantId,
    niche: body.niche as CreatorNiche,
    ...(body.follower_count !== undefined ? { followerCount: Number(body.follower_count) } : {}),
    ...(body.monthly_rate_kobo !== undefined ? { monthlyRateKobo: Number(body.monthly_rate_kobo) } : {}),
  });
  return c.json({ creator }, 201);
});

commerceRoutes.get('/creator/:id', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  const repo = new CreatorRepository(c.env.DB);
  const creator = await repo.findById(c.req.param('id'), auth.tenantId);
  if (!creator) return c.json({ error: 'Not found' }, 404);
  return c.json({ creator });
});

commerceRoutes.post('/creator/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.status) return c.json({ error: 'status required' }, 400);
  const repo = new CreatorRepository(c.env.DB);
  const creator = await repo.transition(c.req.param('id'), auth.tenantId, body.status as CreatorFSMState);
  if (!creator) return c.json({ error: 'Not found' }, 404);
  return c.json({ creator });
});

commerceRoutes.post('/creator/:id/deals', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.brand_name) return c.json({ error: 'workspace_id, brand_name required' }, 400);
  const repo = new CreatorRepository(c.env.DB);
  const deal = await repo.createDeal({
    workspaceId: body.workspace_id as string,
    tenantId: auth.tenantId,
    creatorId: c.req.param('id'),
    brandName: body.brand_name as string,
    ...(body.deal_value_kobo !== undefined ? { dealValueKobo: Number(body.deal_value_kobo) } : {}),
    ...(body.deliverables !== undefined ? { deliverables: JSON.stringify(body.deliverables) } : {}),
  });
  return c.json({ deal }, 201);
});

commerceRoutes.get('/creator/:id/deals', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  const repo = new CreatorRepository(c.env.DB);
  const deals = await repo.listDealsByCreator(c.req.param('id'), auth.tenantId);
  return c.json({ deals });
});

// ── Sole Trader ──────────────────────────────────────────────────────────────

commerceRoutes.post('/sole-trader', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.individual_id || !body.workspace_id || !body.trade_type || !body.lga || !body.state) {
    return c.json({ error: 'individual_id, workspace_id, trade_type, lga, state required' }, 400);
  }
  const repo = new SoleTraderRepository(c.env.DB);
  const trader = await repo.create({
    individualId: body.individual_id as string,
    workspaceId: body.workspace_id as string,
    tenantId: auth.tenantId,
    tradeType: body.trade_type as TradeType,
    lga: body.lga as string,
    state: body.state as string,
    ...(body.whatsapp_number !== undefined ? { whatsappNumber: body.whatsapp_number as string } : {}),
    ...(body.min_fee_kobo !== undefined ? { minFeeKobo: Number(body.min_fee_kobo) } : {}),
    ...(body.max_fee_kobo !== undefined ? { maxFeeKobo: Number(body.max_fee_kobo) } : {}),
  });
  return c.json({ sole_trader: trader }, 201);
});

commerceRoutes.get('/sole-trader/:id', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  const repo = new SoleTraderRepository(c.env.DB);
  const trader = await repo.findById(c.req.param('id'), auth.tenantId);
  if (!trader) return c.json({ error: 'Not found' }, 404);
  return c.json({ sole_trader: trader });
});

commerceRoutes.post('/sole-trader/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.status) return c.json({ error: 'status required' }, 400);
  const repo = new SoleTraderRepository(c.env.DB);
  const trader = await repo.transition(c.req.param('id'), auth.tenantId, body.status as SoleTraderFSMState);
  if (!trader) return c.json({ error: 'Not found' }, 404);
  return c.json({ sole_trader: trader });
});

// ── Market ───────────────────────────────────────────────────────────────────

commerceRoutes.post('/market/stalls', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.stall_number || !body.trader_name || !body.goods_type) {
    return c.json({ error: 'workspace_id, stall_number, trader_name, goods_type required' }, 400);
  }
  const repo = new MarketRepository(c.env.DB);
  const stall = await repo.createStall({
    workspaceId: body.workspace_id as string,
    tenantId: auth.tenantId,
    stallNumber: body.stall_number as string,
    traderName: body.trader_name as string,
    goodsType: body.goods_type as GoodsType,
    ...(body.phone !== undefined ? { phone: body.phone as string } : {}),
  });
  return c.json({ stall }, 201);
});

commerceRoutes.get('/market/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  const repo = new MarketRepository(c.env.DB);
  const stalls = await repo.findByWorkspace(c.req.param('workspaceId'), auth.tenantId);
  return c.json({ stalls });
});

commerceRoutes.get('/market/stalls/:id', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  const repo = new MarketRepository(c.env.DB);
  const stall = await repo.findStallById(c.req.param('id'), auth.tenantId);
  if (!stall) return c.json({ error: 'Not found' }, 404);
  return c.json({ stall });
});

commerceRoutes.patch('/market/stalls/:id', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new MarketRepository(c.env.DB);
  const stall = await repo.updateStall(c.req.param('id'), auth.tenantId, {
    ...(body.trader_name !== undefined ? { traderName: body.trader_name as string } : {}),
    ...(body.goods_type !== undefined ? { goodsType: body.goods_type as GoodsType } : {}),
    ...(body.stall_number !== undefined ? { stallNumber: body.stall_number as string } : {}),
    ...('phone' in body ? { phone: body.phone as string | null } : {}),
    ...(body.status !== undefined ? { status: body.status as 'active' | 'vacant' | 'suspended' } : {}),
  });
  if (!stall) return c.json({ error: 'Not found' }, 404);
  return c.json({ stall });
});

// ── Professional ─────────────────────────────────────────────────────────────

commerceRoutes.post('/professional', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.individual_id || !body.workspace_id || !body.profession) {
    return c.json({ error: 'individual_id, workspace_id, profession required' }, 400);
  }
  const repo = new ProfessionalRepository(c.env.DB);
  const professional = await repo.create({
    individualId: body.individual_id as string,
    workspaceId: body.workspace_id as string,
    tenantId: auth.tenantId,
    profession: body.profession as Profession,
    ...(body.years_experience !== undefined ? { yearsExperience: Number(body.years_experience) } : {}),
    ...(body.consultation_fee_kobo !== undefined ? { consultationFeeKobo: Number(body.consultation_fee_kobo) } : {}),
  });
  return c.json({ professional }, 201);
});

commerceRoutes.get('/professional/:id', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  const repo = new ProfessionalRepository(c.env.DB);
  const professional = await repo.findById(c.req.param('id'), auth.tenantId);
  if (!professional) return c.json({ error: 'Not found' }, 404);
  return c.json({ professional });
});

commerceRoutes.post('/professional/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.status) return c.json({ error: 'status required' }, 400);
  const repo = new ProfessionalRepository(c.env.DB);
  const professional = await repo.transition(c.req.param('id'), auth.tenantId, body.status as ProfessionalFSMState);
  if (!professional) return c.json({ error: 'Not found' }, 404);
  return c.json({ professional });
});

// ── School ───────────────────────────────────────────────────────────────────

commerceRoutes.post('/school', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.organization_id || !body.workspace_id || !body.school_name || !body.school_type) {
    return c.json({ error: 'organization_id, workspace_id, school_name, school_type required' }, 400);
  }
  const repo = new SchoolRepository(c.env.DB);
  const school = await repo.create({
    organizationId: body.organization_id as string,
    workspaceId: body.workspace_id as string,
    tenantId: auth.tenantId,
    schoolName: body.school_name as string,
    schoolType: body.school_type as SchoolType,
    ...(body.cac_reg_number !== undefined ? { cacRegNumber: body.cac_reg_number as string } : {}),
  });
  return c.json({ school }, 201);
});

commerceRoutes.get('/school/:id', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  const repo = new SchoolRepository(c.env.DB);
  const school = await repo.findById(c.req.param('id'), auth.tenantId);
  if (!school) return c.json({ error: 'Not found' }, 404);
  return c.json({ school });
});

commerceRoutes.post('/school/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.status) return c.json({ error: 'status required' }, 400);
  const repo = new SchoolRepository(c.env.DB);
  const school = await repo.transition(c.req.param('id'), auth.tenantId, body.status as SchoolFSMState);
  if (!school) return c.json({ error: 'Not found' }, 404);
  return c.json({ school });
});

// ── Clinic ───────────────────────────────────────────────────────────────────

commerceRoutes.post('/clinic', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.organization_id || !body.workspace_id || !body.facility_name || !body.facility_type) {
    return c.json({ error: 'organization_id, workspace_id, facility_name, facility_type required' }, 400);
  }
  const repo = new ClinicRepository(c.env.DB);
  const clinic = await repo.create({
    organizationId: body.organization_id as string,
    workspaceId: body.workspace_id as string,
    tenantId: auth.tenantId,
    facilityName: body.facility_name as string,
    facilityType: body.facility_type as FacilityType,
    ...(body.cac_reg_number !== undefined ? { cacRegNumber: body.cac_reg_number as string } : {}),
    ...(body.bed_count !== undefined ? { bedCount: Number(body.bed_count) } : {}),
  });
  return c.json({ clinic }, 201);
});

commerceRoutes.get('/clinic/:id', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  const repo = new ClinicRepository(c.env.DB);
  const clinic = await repo.findById(c.req.param('id'), auth.tenantId);
  if (!clinic) return c.json({ error: 'Not found' }, 404);
  return c.json({ clinic });
});

commerceRoutes.post('/clinic/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.status) return c.json({ error: 'status required' }, 400);
  const repo = new ClinicRepository(c.env.DB);
  const clinic = await repo.transition(c.req.param('id'), auth.tenantId, body.status as ClinicFSMState);
  if (!clinic) return c.json({ error: 'Not found' }, 404);
  return c.json({ clinic });
});

// ── Tech Hub ─────────────────────────────────────────────────────────────────

commerceRoutes.post('/tech-hub', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.hub_name || !body.lga || !body.state) {
    return c.json({ error: 'workspace_id, hub_name, lga, state required' }, 400);
  }
  const repo = new TechHubRepository(c.env.DB);
  const hub = await repo.create({
    workspaceId: body.workspace_id as string,
    tenantId: auth.tenantId,
    hubName: body.hub_name as string,
    lga: body.lga as string,
    state: body.state as string,
    ...(body.desk_count !== undefined ? { deskCount: Number(body.desk_count) } : {}),
    ...(body.focus_areas !== undefined ? { focusAreas: body.focus_areas as string } : {}),
  });
  return c.json({ tech_hub: hub }, 201);
});

// ── Restaurant Menu ──────────────────────────────────────────────────────────

commerceRoutes.post('/restaurant/menu', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.name || !body.price_kobo) {
    return c.json({ error: 'workspace_id, name, price_kobo required' }, 400);
  }
  const repo = new MenuRepository(c.env.DB);
  try {
    const item = await repo.createItem({
      workspaceId: body.workspace_id as string,
      tenantId: auth.tenantId,
      name: body.name as string,
      priceKobo: Number(body.price_kobo),
      ...(body.category !== undefined ? { category: body.category as MenuCategory } : {}),
      ...(body.description !== undefined ? { description: body.description as string } : {}),
      ...(body.photo_url !== undefined ? { photoUrl: body.photo_url as string } : {}),
    });
    return c.json({ menu_item: item }, 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg.includes('P9')) return c.json({ error: msg }, 422);
    throw e;
  }
});

commerceRoutes.get('/restaurant/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  const repo = new MenuRepository(c.env.DB);
  const items = await repo.listMenu(c.req.param('workspaceId'), auth.tenantId);
  return c.json({ menu_items: items });
});

commerceRoutes.get('/restaurant/menu/:id', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  const repo = new MenuRepository(c.env.DB);
  const item = await repo.findItemById(c.req.param('id'), auth.tenantId);
  if (!item) return c.json({ error: 'Not found' }, 404);
  return c.json({ menu_item: item });
});

commerceRoutes.patch('/restaurant/menu/:id', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new MenuRepository(c.env.DB);
  const item = await repo.updateItem(c.req.param('id'), auth.tenantId, {
    ...(body.name !== undefined ? { name: body.name as string } : {}),
    ...(body.price_kobo !== undefined ? { priceKobo: Number(body.price_kobo) } : {}),
    ...(body.category !== undefined ? { category: body.category as MenuCategory } : {}),
    ...(body.available !== undefined ? { available: Boolean(body.available) } : {}),
    ...('description' in body ? { description: body.description as string | null } : {}),
    ...('photo_url' in body ? { photoUrl: body.photo_url as string | null } : {}),
  });
  if (!item) return c.json({ error: 'Not found' }, 404);
  return c.json({ menu_item: item });
});
