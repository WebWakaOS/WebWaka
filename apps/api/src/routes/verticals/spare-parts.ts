/**
 * Spare Parts Dealer vertical routes — M11 Commerce P3
 *
 * POST   /spare-parts                         — Create profile
 * GET    /spare-parts/workspace/:workspaceId  — Get by workspace (T3)
 * GET    /spare-parts/:id                     — Get profile (T3)
 * PATCH  /spare-parts/:id                     — Update profile
 * POST   /spare-parts/:id/transition          — FSM transition
 * POST   /spare-parts/:id/catalogue           — Create part (P9)
 * GET    /spare-parts/:id/catalogue           — List parts (T3)
 * POST   /spare-parts/:id/mechanic-credits    — Create mechanic credit (P9, P13)
 * GET    /spare-parts/:id/mechanic-credits    — List mechanic credits (T3)
 * POST   /spare-parts/:id/orders              — Create order (P9)
 * GET    /spare-parts/:id/orders              — List orders (T3)
 * PATCH  /spare-parts/:id/orders/:orderId/status — Update order status
 * GET    /spare-parts/:id/ai-advisory         — AI advisory (P13: mechanic PII stripped)
 *
 * Platform Invariants: T3, P9, P13
 */

import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import {
  SparePartsRepository,
  guardSeedToClaimed,
  guardClaimedToCacVerified,
  isValidSparePartsTransition,
} from '@webwaka/verticals-spare-parts';
import type { SparePartsFSMState } from '@webwaka/verticals-spare-parts';
import { aiConsentGate } from '@webwaka/superagent';
import type { Env } from '../../env.js';

export const sparePartsRoutes = new Hono<{ Bindings: Env }>();

sparePartsRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; shop_name?: string; cac_rc?: string; son_dealer_number?: string; market_location?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.shop_name) return c.json({ error: 'workspace_id, shop_name are required' }, 400);
  const repo = new SparePartsRepository(c.env.DB);
  const profile = await repo.createProfile({ workspaceId: body.workspace_id, tenantId: auth.tenantId, shopName: body.shop_name, cacRc: body.cac_rc, sonDealerNumber: body.son_dealer_number, marketLocation: body.market_location });
  return c.json({ spare_parts: profile }, 201);
});

sparePartsRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { workspaceId } = c.req.param();
  const repo = new SparePartsRepository(c.env.DB);
  const profile = await repo.findProfileByWorkspace(workspaceId, auth.tenantId);
  return c.json({ spare_parts: profile });
});

sparePartsRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new SparePartsRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Spare parts profile not found' }, 404);
  return c.json({ spare_parts: profile });
});

sparePartsRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { shop_name?: string; cac_rc?: string; son_dealer_number?: string; market_location?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new SparePartsRepository(c.env.DB);
  const updated = await repo.updateProfile(id, auth.tenantId, { shopName: body.shop_name, cacRc: body.cac_rc, sonDealerNumber: body.son_dealer_number, marketLocation: body.market_location });
  if (!updated) return c.json({ error: 'Profile not found' }, 404);
  return c.json({ spare_parts: updated });
});

sparePartsRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; kycTier?: number };
  const { id } = c.req.param();
  let body: { to_status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to_status) return c.json({ error: 'to_status is required' }, 400);
  const repo = new SparePartsRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Profile not found' }, 404);
  const from = profile.status;
  const to = body.to_status as SparePartsFSMState;
  if (!isValidSparePartsTransition(from, to)) return c.json({ error: `Invalid FSM transition: ${from} → ${to}` }, 422);
  if (to === 'claimed') {
    const g = guardSeedToClaimed({ kycTier: auth.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  if (to === 'cac_verified') {
    const g = guardClaimedToCacVerified({ cacRc: profile.cacRc ?? null });
    if (!g.allowed) return c.json({ error: g.reason }, 422);
  }
  const updated = await repo.transitionStatus(id, auth.tenantId, to);
  return c.json({ spare_parts: updated });
});

sparePartsRoutes.post('/:id/catalogue', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { part_name?: string; part_number?: string; category?: string; compatible_makes?: string; unit_price_kobo?: number; quantity_in_stock?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.part_name || !body.category || body.unit_price_kobo === undefined) return c.json({ error: 'part_name, category, unit_price_kobo are required' }, 400);
  const repo = new SparePartsRepository(c.env.DB);
  try {
    const part = await repo.createPart({ workspaceId: id, tenantId: auth.tenantId, partName: body.part_name, partNumber: body.part_number, category: body.category as never, compatibleMakes: body.compatible_makes, unitPriceKobo: body.unit_price_kobo, quantityInStock: body.quantity_in_stock });
    return c.json({ part }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('P9')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

sparePartsRoutes.get('/:id/catalogue', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new SparePartsRepository(c.env.DB);
  const parts = await repo.listParts(id, auth.tenantId);
  return c.json({ parts, count: parts.length });
});

sparePartsRoutes.post('/:id/mechanic-credits', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { mechanic_phone?: string; mechanic_name?: string; credit_limit_kobo?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.mechanic_phone || !body.mechanic_name || body.credit_limit_kobo === undefined) return c.json({ error: 'mechanic_phone, mechanic_name, credit_limit_kobo are required' }, 400);
  const repo = new SparePartsRepository(c.env.DB);
  try {
    const credit = await repo.createMechanicCredit({ workspaceId: id, tenantId: auth.tenantId, mechanicPhone: body.mechanic_phone, mechanicName: body.mechanic_name, creditLimitKobo: body.credit_limit_kobo });
    return c.json({ mechanic_credit: credit }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('P9')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

sparePartsRoutes.get('/:id/mechanic-credits', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new SparePartsRepository(c.env.DB);
  const credits = await repo.listMechanicCredits(id, auth.tenantId);
  return c.json({ mechanic_credits: credits, count: credits.length });
});

sparePartsRoutes.post('/:id/orders', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { client_phone?: string; items?: string; total_kobo?: number; credit_account_id?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.client_phone || body.total_kobo === undefined) return c.json({ error: 'client_phone, total_kobo are required' }, 400);
  const repo = new SparePartsRepository(c.env.DB);
  try {
    const order = await repo.createOrder({ workspaceId: id, tenantId: auth.tenantId, clientPhone: body.client_phone, items: body.items, totalKobo: body.total_kobo, creditAccountId: body.credit_account_id });
    return c.json({ order }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('P9')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

sparePartsRoutes.get('/:id/orders', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new SparePartsRepository(c.env.DB);
  const orders = await repo.listOrders(id, auth.tenantId);
  return c.json({ orders, count: orders.length });
});

sparePartsRoutes.patch('/:id/orders/:orderId/status', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { orderId } = c.req.param();
  let body: { status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.status) return c.json({ error: 'status is required' }, 400);
  const repo = new SparePartsRepository(c.env.DB);
  const updated = await repo.updateOrderStatus(orderId, auth.tenantId, body.status as never);
  if (!updated) return c.json({ error: 'Order not found' }, 404);
  return c.json({ order: updated });
});

// AI advisory — P13: mechanic PII stripped; category + price only
sparePartsRoutes.get(
  '/:id/ai-advisory',
  aiConsentGate as MiddlewareHandler<{ Bindings: Env }>,
  async (c) => {
    const auth = c.get('auth') as { userId: string; tenantId: string };
    const { id } = c.req.param();
    const repo = new SparePartsRepository(c.env.DB);
    const parts = await repo.listParts(id, auth.tenantId);
    const advisory = parts.map(p => ({ category: p.category, unit_price_kobo: p.unitPriceKobo, quantity_in_stock: p.quantityInStock }));
    return c.json({ capability: 'DEMAND_PLANNING', advisory_data: advisory, count: advisory.length });
  },
);
