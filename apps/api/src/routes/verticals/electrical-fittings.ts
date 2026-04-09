/**
 * Electrical Fittings vertical routes — M11 Commerce P3
 *
 * POST   /electrical-fittings                              — Create profile
 * GET    /electrical-fittings/workspace/:workspaceId       — Get by workspace (T3)
 * GET    /electrical-fittings/:id                          — Get profile (T3)
 * PATCH  /electrical-fittings/:id                          — Update profile
 * POST   /electrical-fittings/:id/transition               — FSM transition
 * POST   /electrical-fittings/:id/catalogue                — Create catalogue item (P9)
 * GET    /electrical-fittings/:id/catalogue                — List catalogue (T3)
 * POST   /electrical-fittings/:id/orders                   — Create order (P9)
 * GET    /electrical-fittings/:id/orders                   — List orders (T3)
 * PATCH  /electrical-fittings/:id/orders/:orderId/status   — Update order status
 * GET    /electrical-fittings/:id/ai-advisory              — AI advisory
 *
 * Platform Invariants: T3, P9
 */

import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import {
  ElectricalFittingsRepository,
  guardSeedToClaimed,
  guardClaimedToCacVerified,
  isValidElectricalFittingsTransition,
} from '@webwaka/verticals-electrical-fittings';
import type { ElectricalFittingsFSMState, ProductType, OrderStatus } from '@webwaka/verticals-electrical-fittings';
import { aiConsentGate } from '@webwaka/superagent';
import type { Env } from '../../env.js';

export const electricalFittingsRoutes = new Hono<{ Bindings: Env }>();

electricalFittingsRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; company_name?: string; cac_rc?: string; son_dealer_reg?: string; market_location?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.company_name) return c.json({ error: 'workspace_id, company_name are required' }, 400);
  const repo = new ElectricalFittingsRepository(c.env.DB);
  const profile = await repo.createProfile({ workspaceId: body.workspace_id, tenantId: auth.tenantId, companyName: body.company_name, cacRc: body.cac_rc, sonDealerReg: body.son_dealer_reg, marketLocation: body.market_location });
  return c.json({ electrical_fittings: profile }, 201);
});

electricalFittingsRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { workspaceId } = c.req.param();
  const repo = new ElectricalFittingsRepository(c.env.DB);
  const profile = await repo.findProfileByWorkspace(workspaceId, auth.tenantId);
  return c.json({ electrical_fittings: profile });
});

electricalFittingsRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new ElectricalFittingsRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Electrical fittings profile not found' }, 404);
  return c.json({ electrical_fittings: profile });
});

electricalFittingsRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { company_name?: string; cac_rc?: string; son_dealer_reg?: string; market_location?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new ElectricalFittingsRepository(c.env.DB);
  const updated = await repo.updateProfile(id, auth.tenantId, { companyName: body.company_name, cacRc: body.cac_rc, sonDealerReg: body.son_dealer_reg, marketLocation: body.market_location });
  if (!updated) return c.json({ error: 'Profile not found' }, 404);
  return c.json({ electrical_fittings: updated });
});

electricalFittingsRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; kycTier?: number };
  const { id } = c.req.param();
  let body: { to_status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to_status) return c.json({ error: 'to_status is required' }, 400);
  const repo = new ElectricalFittingsRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Profile not found' }, 404);
  const from = profile.status;
  const to = body.to_status as ElectricalFittingsFSMState;
  if (!isValidElectricalFittingsTransition(from, to)) return c.json({ error: `Invalid FSM transition: ${from} → ${to}` }, 422);
  if (to === 'claimed') {
    const g = guardSeedToClaimed({ kycTier: auth.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  if (to === 'cac_verified') {
    const g = guardClaimedToCacVerified({ cacRc: profile.cacRc ?? null });
    if (!g.allowed) return c.json({ error: g.reason }, 422);
  }
  const updated = await repo.transitionStatus(id, auth.tenantId, to);
  return c.json({ electrical_fittings: updated });
});

electricalFittingsRoutes.post('/:id/catalogue', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { product_name?: string; type?: string; son_type_number?: string; unit?: string; unit_price_kobo?: number; quantity_in_stock?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.product_name || !body.type || !body.unit || body.unit_price_kobo === undefined) return c.json({ error: 'product_name, type, unit, unit_price_kobo are required' }, 400);
  const repo = new ElectricalFittingsRepository(c.env.DB);
  try {
    const item = await repo.createCatalogueItem({ workspaceId: id, tenantId: auth.tenantId, productName: body.product_name, type: body.type as ProductType, sonTypeNumber: body.son_type_number, unit: body.unit, unitPriceKobo: body.unit_price_kobo, quantityInStock: body.quantity_in_stock });
    return c.json({ catalogue_item: item }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('P9')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

electricalFittingsRoutes.get('/:id/catalogue', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new ElectricalFittingsRepository(c.env.DB);
  const items = await repo.listCatalogueItems(id, auth.tenantId);
  return c.json({ catalogue: items, count: items.length });
});

electricalFittingsRoutes.post('/:id/orders', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { client_phone?: string; items?: string; total_kobo?: number; credit_account_id?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.client_phone || body.total_kobo === undefined) return c.json({ error: 'client_phone, total_kobo are required' }, 400);
  const repo = new ElectricalFittingsRepository(c.env.DB);
  try {
    const order = await repo.createOrder({ workspaceId: id, tenantId: auth.tenantId, clientPhone: body.client_phone, items: body.items, totalKobo: body.total_kobo, creditAccountId: body.credit_account_id });
    return c.json({ order }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('P9')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

electricalFittingsRoutes.get('/:id/orders', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new ElectricalFittingsRepository(c.env.DB);
  const orders = await repo.listOrders(id, auth.tenantId);
  return c.json({ orders, count: orders.length });
});

electricalFittingsRoutes.patch('/:id/orders/:orderId/status', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { orderId } = c.req.param();
  let body: { status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.status) return c.json({ error: 'status is required' }, 400);
  const repo = new ElectricalFittingsRepository(c.env.DB);
  const updated = await repo.updateOrderStatus(orderId, auth.tenantId, body.status as OrderStatus);
  if (!updated) return c.json({ error: 'Order not found' }, 404);
  return c.json({ order: updated });
});

electricalFittingsRoutes.get(
  '/:id/ai-advisory',
  aiConsentGate as MiddlewareHandler<{ Bindings: Env }>,
  async (c) => {
    const auth = c.get('auth') as { userId: string; tenantId: string };
    const { id } = c.req.param();
    const repo = new ElectricalFittingsRepository(c.env.DB);
    const orders = await repo.listOrders(id, auth.tenantId);
    const advisory = orders.map(o => ({ status: o.status, total_kobo: o.totalKobo }));
    return c.json({ capability: 'SALES_FORECAST', advisory_data: advisory, count: advisory.length });
  },
);
