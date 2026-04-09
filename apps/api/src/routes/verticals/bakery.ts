/**
 * Bakery / Confectionery vertical routes — M9 Commerce P2 A2
 *
 * POST   /bakery                              — Create profile
 * GET    /bakery/workspace/:workspaceId       — List (T3)
 * GET    /bakery/:id                          — Get profile
 * PATCH  /bakery/:id                          — Update
 * POST   /bakery/:id/transition               — FSM transition
 * POST   /bakery/:id/products                 — Create product (P9)
 * GET    /bakery/:id/products                 — List products
 * POST   /bakery/:id/orders                   — Create order (P9)
 * GET    /bakery/:id/orders                   — List orders
 * GET    /bakery/:id/ai-advisory              — AI demand forecast (P10/P12/P13)
 *
 * Platform Invariants: T3, P9, P10, P12, P13
 */

import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { BakeryRepository, guardSeedToClaimed, guardClaimedToNafdacVerified, guardNafdacVerifiedToActive, isValidBakeryTransition } from '@webwaka/verticals-bakery';
import type { BakeryFSMState, BakeryOrderStatus, BakeryProductCategory } from '@webwaka/verticals-bakery';
import { aiConsentGate } from '@webwaka/superagent';
import type { Env } from '../../env.js';

export const bakeryRoutes = new Hono<{ Bindings: Env }>();

bakeryRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; bakery_name?: string; nafdac_number?: string; cac_number?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.bakery_name) return c.json({ error: 'workspace_id, bakery_name are required' }, 400);
  const repo = new BakeryRepository(c.env.DB);
  const profile = await repo.createProfile({ workspaceId: body.workspace_id, tenantId: auth.tenantId, bakeryName: body.bakery_name, nafdacNumber: body.nafdac_number, cacNumber: body.cac_number });
  return c.json({ bakery: profile }, 201);
});

bakeryRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { workspaceId } = c.req.param();
  const repo = new BakeryRepository(c.env.DB);
  const profile = await repo.findProfileById(workspaceId, auth.tenantId);
  return c.json({ bakery: profile });
});

bakeryRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new BakeryRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Bakery profile not found' }, 404);
  return c.json({ bakery: profile });
});

bakeryRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { bakery_name?: string; nafdac_number?: string; cac_number?: string; food_handler_count?: number; production_license_expiry?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new BakeryRepository(c.env.DB);
  const updated = await repo.updateProfile(id, auth.tenantId, { bakeryName: body.bakery_name, nafdacNumber: body.nafdac_number, cacNumber: body.cac_number, foodHandlerCount: body.food_handler_count, productionLicenseExpiry: body.production_license_expiry });
  if (!updated) return c.json({ error: 'Bakery profile not found' }, 404);
  return c.json({ bakery: updated });
});

bakeryRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; kycTier?: number };
  const { id } = c.req.param();
  let body: { to_status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to_status) return c.json({ error: 'to_status is required' }, 400);
  const repo = new BakeryRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Profile not found' }, 404);
  const from = profile.status;
  const to = body.to_status as BakeryFSMState;
  if (!isValidBakeryTransition(from, to)) return c.json({ error: `Invalid FSM transition: ${from} → ${to}` }, 422);
  if (to === 'claimed') {
    const g = guardSeedToClaimed({ kycTier: auth.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  if (to === 'nafdac_verified') {
    const g = guardClaimedToNafdacVerified({ nafdacNumber: profile.nafdacNumber });
    if (!g.allowed) return c.json({ error: g.reason }, 422);
  }
  if (to === 'active') {
    const g = guardNafdacVerifiedToActive({ productionLicenseExpiry: profile.productionLicenseExpiry });
    if (!g.allowed) return c.json({ error: g.reason }, 422);
  }
  const updated = await repo.transitionProfile(id, auth.tenantId, to);
  return c.json({ bakery: updated });
});

bakeryRoutes.post('/:id/products', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { product_name?: string; category?: string; unit_price_kobo?: number; production_cost_kobo?: number; daily_capacity?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.product_name || !body.category || body.unit_price_kobo === undefined) return c.json({ error: 'product_name, category, unit_price_kobo are required' }, 400);
  const repo = new BakeryRepository(c.env.DB);
  try {
    const product = await repo.createProduct({ workspaceId: id, tenantId: auth.tenantId, productName: body.product_name, category: body.category as BakeryProductCategory, unitPriceKobo: body.unit_price_kobo, productionCostKobo: body.production_cost_kobo, dailyCapacity: body.daily_capacity });
    return c.json({ product }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('[P9]')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

bakeryRoutes.get('/:id/products', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new BakeryRepository(c.env.DB);
  const products = await repo.listProducts(id, auth.tenantId);
  return c.json({ products, count: products.length });
});

bakeryRoutes.post('/:id/orders', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { customer_phone?: string; product_id?: string; quantity?: number; deposit_kobo?: number; balance_kobo?: number; delivery_date?: number; customization_notes?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.customer_phone || body.deposit_kobo === undefined || body.balance_kobo === undefined) return c.json({ error: 'customer_phone, deposit_kobo, balance_kobo are required' }, 400);
  const repo = new BakeryRepository(c.env.DB);
  try {
    const order = await repo.createOrder({ workspaceId: id, tenantId: auth.tenantId, customerPhone: body.customer_phone, productId: body.product_id, quantity: body.quantity ?? 1, depositKobo: body.deposit_kobo, balanceKobo: body.balance_kobo, deliveryDate: body.delivery_date, customizationNotes: body.customization_notes });
    return c.json({ order }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('[P9]')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

bakeryRoutes.get('/:id/orders', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const status = c.req.query('status') as BakeryOrderStatus | undefined;
  const repo = new BakeryRepository(c.env.DB);
  const orders = await repo.listOrders(id, auth.tenantId, status);
  return c.json({ orders, count: orders.length });
});

// P10/P12/P13 gated AI advisory — aggregate product sales, no customer PII
bakeryRoutes.get(
  '/:id/ai-advisory',
  aiConsentGate as MiddlewareHandler<{ Bindings: Env }>,
  async (c) => {
    const auth = c.get('auth') as { userId: string; tenantId: string };
    const { id } = c.req.param();
    const repo = new BakeryRepository(c.env.DB);
    const products = await repo.listProducts(id, auth.tenantId);
    // P13: product aggregate data only — no customer phone in payload
    const advisory = products.map(p => ({ product_name: p.productName, category: p.category, unit_price_kobo: p.unitPriceKobo, daily_capacity: p.dailyCapacity }));
    return c.json({ capability: 'DEMAND_PLANNING', advisory_data: advisory, count: advisory.length });
  },
);
