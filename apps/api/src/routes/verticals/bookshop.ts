/**
 * Bookshop / Stationery Store vertical routes — M9 Commerce P2 A4
 *
 * POST   /bookshop                              — Create profile
 * GET    /bookshop/workspace/:workspaceId       — List (T3)
 * GET    /bookshop/:id                          — Get profile
 * PATCH  /bookshop/:id                          — Update
 * POST   /bookshop/:id/transition               — FSM transition
 * POST   /bookshop/:id/catalogue                — Add book (P9)
 * GET    /bookshop/:id/catalogue                — List catalogue
 * POST   /bookshop/:id/orders                   — Create order (P9)
 * GET    /bookshop/:id/orders                   — List orders
 * GET    /bookshop/:id/ai-advisory              — AI demand forecast (P10/P12/P13)
 *
 * Platform Invariants: T3, P9, P10, P12, P13
 */

import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { BookshopRepository, guardSeedToClaimed, guardClaimedToCacVerified, isValidBookshopTransition } from '@webwaka/verticals-bookshop';
import type { BookshopFSMState, BookCategory } from '@webwaka/verticals-bookshop';
import { aiConsentGate } from '@webwaka/superagent';
import type { Env } from '../../env.js';

export const bookshopRoutes = new Hono<{ Bindings: Env }>();

bookshopRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; shop_name?: string; state?: string; lga?: string; cac_number?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.shop_name || !body.state || !body.lga) return c.json({ error: 'workspace_id, shop_name, state, lga are required' }, 400);
  const repo = new BookshopRepository(c.env.DB);
  const profile = await repo.createProfile({ workspaceId: body.workspace_id, tenantId: auth.tenantId, shopName: body.shop_name, state: body.state, lga: body.lga, cacNumber: body.cac_number });
  return c.json({ bookshop: profile }, 201);
});

bookshopRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { workspaceId } = c.req.param();
  const repo = new BookshopRepository(c.env.DB);
  const profile = await repo.findProfileById(workspaceId, auth.tenantId);
  return c.json({ bookshop: profile });
});

bookshopRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new BookshopRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Bookshop profile not found' }, 404);
  return c.json({ bookshop: profile });
});

bookshopRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { shop_name?: string; state?: string; lga?: string; cac_number?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new BookshopRepository(c.env.DB);
  const updated = await repo.updateProfile(id, auth.tenantId, { shopName: body.shop_name, state: body.state, lga: body.lga, cacNumber: body.cac_number });
  if (!updated) return c.json({ error: 'Bookshop profile not found' }, 404);
  return c.json({ bookshop: updated });
});

bookshopRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; kycTier?: number };
  const { id } = c.req.param();
  let body: { to_status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to_status) return c.json({ error: 'to_status is required' }, 400);
  const repo = new BookshopRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Profile not found' }, 404);
  const from = profile.status;
  const to = body.to_status as BookshopFSMState;
  if (!isValidBookshopTransition(from, to)) return c.json({ error: `Invalid FSM transition: ${from} → ${to}` }, 422);
  if (to === 'claimed') {
    const g = guardSeedToClaimed({ kycTier: auth.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  if (to === 'cac_verified') {
    const g = guardClaimedToCacVerified({ cacNumber: profile.cacNumber });
    if (!g.allowed) return c.json({ error: g.reason }, 422);
  }
  const updated = await repo.transitionProfile(id, auth.tenantId, to);
  return c.json({ bookshop: updated });
});

bookshopRoutes.post('/:id/catalogue', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { title?: string; category?: string; unit_price_kobo?: number; isbn?: string; author?: string; publisher?: string; quantity_in_stock?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.title || !body.category || body.unit_price_kobo === undefined) return c.json({ error: 'title, category, unit_price_kobo are required' }, 400);
  const repo = new BookshopRepository(c.env.DB);
  try {
    const item = await repo.createCatalogueItem({ workspaceId: id, tenantId: auth.tenantId, title: body.title, category: body.category as BookCategory, unitPriceKobo: body.unit_price_kobo, isbn: body.isbn, author: body.author, publisher: body.publisher, quantityInStock: body.quantity_in_stock });
    return c.json({ item }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('[P9]')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

bookshopRoutes.get('/:id/catalogue', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const category = c.req.query('category') as BookCategory | undefined;
  const repo = new BookshopRepository(c.env.DB);
  const items = await repo.listCatalogue(id, auth.tenantId, category);
  return c.json({ catalogue: items, count: items.length });
});

bookshopRoutes.post('/:id/orders', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { customer_phone?: string; order_items?: string; total_kobo?: number; delivery_method?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.customer_phone || body.total_kobo === undefined) return c.json({ error: 'customer_phone, total_kobo are required' }, 400);
  const repo = new BookshopRepository(c.env.DB);
  try {
    const order = await repo.createOrder({ workspaceId: id, tenantId: auth.tenantId, customerPhone: body.customer_phone, orderItems: body.order_items ?? '[]', totalKobo: body.total_kobo, deliveryMethod: body.delivery_method as never });
    return c.json({ order }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('[P9]')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

bookshopRoutes.get('/:id/orders', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new BookshopRepository(c.env.DB);
  const orders = await repo.listOrders(id, auth.tenantId);
  return c.json({ orders, count: orders.length });
});

// P10/P12/P13 gated AI advisory — aggregate catalogue stats, no customer PII
bookshopRoutes.get(
  '/:id/ai-advisory',
  aiConsentGate as MiddlewareHandler<{ Bindings: Env }>,
  async (c) => {
    const auth = c.get('auth') as { userId: string; tenantId: string };
    const { id } = c.req.param();
    const repo = new BookshopRepository(c.env.DB);
    const items = await repo.listCatalogue(id, auth.tenantId);
    // P13: aggregate only — no customer phone
    const advisory = items.map(i => ({ title: i.title, category: i.category, unit_price_kobo: i.unitPriceKobo, quantity_in_stock: i.quantityInStock }));
    return c.json({ capability: 'DEMAND_PLANNING', advisory_data: advisory, count: advisory.length });
  },
);
