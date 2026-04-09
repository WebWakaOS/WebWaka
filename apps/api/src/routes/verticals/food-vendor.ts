/**
 * Food Vendor / Street Food vertical routes — M9 Commerce P2 A9
 * 3-state informal FSM: seeded → claimed → active
 *
 * POST   /food-vendor                              — Create profile
 * GET    /food-vendor/workspace/:workspaceId       — List (T3)
 * GET    /food-vendor/:id                          — Get profile
 * PATCH  /food-vendor/:id                          — Update
 * POST   /food-vendor/:id/transition               — FSM transition
 * POST   /food-vendor/:id/menu                     — Add menu item (P9)
 * GET    /food-vendor/:id/menu                     — List menu
 * PATCH  /food-vendor/:id/menu/:itemId/toggle      — Toggle availability
 * POST   /food-vendor/:id/sales                    — Record daily sale (P9)
 * GET    /food-vendor/:id/sales                    — List sales
 * GET    /food-vendor/:id/ai-advisory              — AI demand forecast (P10/P12/P13)
 *
 * Platform Invariants: T3, P9, P10, P12, P13
 * L1 AI autonomy (informal sector)
 */

import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { FoodVendorRepository, guardSeedToClaimed, isValidFoodVendorTransition } from '@webwaka/verticals-food-vendor';
import type { FoodVendorFSMState, FoodType } from '@webwaka/verticals-food-vendor';
import { aiConsentGate } from '@webwaka/superagent';
import type { Env } from '../../env.js';

export const foodVendorRoutes = new Hono<{ Bindings: Env }>();

foodVendorRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; vendor_name?: string; food_type?: string; lga?: string; state?: string; location_description?: string; lg_permit_number?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.vendor_name || !body.lga || !body.state) return c.json({ error: 'workspace_id, vendor_name, lga, state are required' }, 400);
  const repo = new FoodVendorRepository(c.env.DB);
  const profile = await repo.createProfile({ workspaceId: body.workspace_id, tenantId: auth.tenantId, vendorName: body.vendor_name, foodType: (body.food_type ?? 'other') as FoodType, lga: body.lga, state: body.state, locationDescription: body.location_description, lgPermitNumber: body.lg_permit_number });
  return c.json({ food_vendor: profile }, 201);
});

foodVendorRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { workspaceId } = c.req.param();
  const repo = new FoodVendorRepository(c.env.DB);
  const profile = await repo.findProfileById(workspaceId, auth.tenantId);
  return c.json({ food_vendor: profile });
});

foodVendorRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new FoodVendorRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Food vendor profile not found' }, 404);
  return c.json({ food_vendor: profile });
});

foodVendorRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { vendor_name?: string; food_type?: string; lga?: string; state?: string; location_description?: string; lg_permit_number?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new FoodVendorRepository(c.env.DB);
  const updated = await repo.updateProfile(id, auth.tenantId, { vendorName: body.vendor_name, foodType: body.food_type as FoodType | undefined, lga: body.lga, state: body.state, locationDescription: body.location_description, lgPermitNumber: body.lg_permit_number });
  if (!updated) return c.json({ error: 'Food vendor profile not found' }, 404);
  return c.json({ food_vendor: updated });
});

foodVendorRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; kycTier?: number };
  const { id } = c.req.param();
  let body: { to_status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to_status) return c.json({ error: 'to_status is required' }, 400);
  const repo = new FoodVendorRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Profile not found' }, 404);
  const from = profile.status;
  const to = body.to_status as FoodVendorFSMState;
  if (!isValidFoodVendorTransition(from, to)) return c.json({ error: `Invalid FSM transition: ${from} → ${to}` }, 422);
  if (to === 'claimed') {
    const g = guardSeedToClaimed({ kycTier: auth.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  // claimed→active: no regulatory gate for informal sector
  const updated = await repo.transitionProfile(id, auth.tenantId, to);
  return c.json({ food_vendor: updated });
});

foodVendorRoutes.post('/:id/menu', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { item_name?: string; price_kobo?: number; available?: boolean };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.item_name || body.price_kobo === undefined) return c.json({ error: 'item_name, price_kobo are required' }, 400);
  const repo = new FoodVendorRepository(c.env.DB);
  try {
    const item = await repo.createMenuItem({ workspaceId: id, tenantId: auth.tenantId, itemName: body.item_name, priceKobo: body.price_kobo, available: body.available });
    return c.json({ menu_item: item }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('[P9]')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

foodVendorRoutes.get('/:id/menu', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const availableOnly = c.req.query('available') === 'true';
  const repo = new FoodVendorRepository(c.env.DB);
  const items = await repo.listMenu(id, auth.tenantId, availableOnly);
  return c.json({ menu: items, count: items.length });
});

foodVendorRoutes.patch('/:id/menu/:itemId/toggle', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { itemId } = c.req.param();
  let body: { available?: boolean };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (body.available === undefined) return c.json({ error: 'available is required' }, 400);
  const repo = new FoodVendorRepository(c.env.DB);
  const item = await repo.toggleMenuItem(itemId, auth.tenantId, body.available);
  if (!item) return c.json({ error: 'Menu item not found' }, 404);
  return c.json({ menu_item: item });
});

foodVendorRoutes.post('/:id/sales', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { sale_date?: number; total_kobo?: number; items_sold_count?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (body.sale_date === undefined || body.total_kobo === undefined) return c.json({ error: 'sale_date, total_kobo are required' }, 400);
  const repo = new FoodVendorRepository(c.env.DB);
  try {
    const sale = await repo.recordSale({ workspaceId: id, tenantId: auth.tenantId, saleDate: body.sale_date, totalKobo: body.total_kobo, itemsSoldCount: body.items_sold_count });
    return c.json({ sale }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('[P9]')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

foodVendorRoutes.get('/:id/sales', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new FoodVendorRepository(c.env.DB);
  const sales = await repo.listSales(id, auth.tenantId);
  return c.json({ sales, count: sales.length });
});

// P10/P12/P13 gated AI advisory — menu aggregate only, no customer PII
foodVendorRoutes.get(
  '/:id/ai-advisory',
  aiConsentGate as MiddlewareHandler<{ Bindings: Env }>,
  async (c) => {
    const auth = c.get('auth') as { userId: string; tenantId: string };
    const { id } = c.req.param();
    const repo = new FoodVendorRepository(c.env.DB);
    const [menu, aggregate] = await Promise.all([repo.listMenu(id, auth.tenantId), repo.getSalesAggregate(id, auth.tenantId)]);
    // P13: item_name + price aggregate — no customer data
    const advisory = { menu_item_count: menu.length, available_items: menu.filter(m => m.available).length, total_sales_kobo: aggregate.totalKobo, sales_count: aggregate.salesCount };
    return c.json({ capability: 'DEMAND_PLANNING', advisory_data: advisory });
  },
);
