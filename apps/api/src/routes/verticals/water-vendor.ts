/**
 * Water Vendor vertical routes — M10 Commerce P3
 *
 * POST   /water-vendor                         — Create profile
 * GET    /water-vendor/workspace/:workspaceId  — Get by workspace (T3)
 * GET    /water-vendor/:id                     — Get profile (T3)
 * PATCH  /water-vendor/:id                     — Update profile
 * POST   /water-vendor/:id/transition          — FSM transition
 * POST   /water-vendor/:id/product-prices      — Create product price (P9 volume integer)
 * GET    /water-vendor/:id/product-prices      — List product prices (T3)
 * POST   /water-vendor/:id/delivery-orders     — Create delivery order (P9)
 * GET    /water-vendor/:id/delivery-orders     — List delivery orders (T3)
 * PATCH  /water-vendor/:id/delivery-orders/:orderId/status — Update delivery status
 * GET    /water-vendor/:id/ai-advisory         — AI advisory
 *
 * Platform Invariants: T3, P9
 */

import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import {
  WaterVendorRepository,
  guardSeedToClaimed,
  guardClaimedToNafdacVerified,
  isValidWaterVendorTransition,
} from '@webwaka/verticals-water-vendor';
import type { WaterVendorFSMState } from '@webwaka/verticals-water-vendor';
import { aiConsentGate } from '@webwaka/superagent';
import type { Env } from '../../env.js';

export const waterVendorRoutes = new Hono<{ Bindings: Env }>();

waterVendorRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; brand_name?: string; nafdac_number?: string; cac_rc?: string; factory_address?: string; state?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.brand_name) return c.json({ error: 'workspace_id, brand_name are required' }, 400);
  const repo = new WaterVendorRepository(c.env.DB);
  const profile = await repo.createProfile({ workspaceId: body.workspace_id, tenantId: auth.tenantId, brandName: body.brand_name, nafdacNumber: body.nafdac_number, cacRc: body.cac_rc, factoryAddress: body.factory_address, state: body.state });
  return c.json({ water_vendor: profile }, 201);
});

waterVendorRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { workspaceId } = c.req.param();
  const repo = new WaterVendorRepository(c.env.DB);
  const profile = await repo.findProfileByWorkspace(workspaceId, auth.tenantId);
  return c.json({ water_vendor: profile });
});

waterVendorRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new WaterVendorRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Water vendor profile not found' }, 404);
  return c.json({ water_vendor: profile });
});

waterVendorRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { brand_name?: string; nafdac_number?: string; cac_rc?: string; factory_address?: string; state?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new WaterVendorRepository(c.env.DB);
  const updated = await repo.updateProfile(id, auth.tenantId, { brandName: body.brand_name, nafdacNumber: body.nafdac_number, cacRc: body.cac_rc, factoryAddress: body.factory_address, state: body.state });
  if (!updated) return c.json({ error: 'Profile not found' }, 404);
  return c.json({ water_vendor: updated });
});

waterVendorRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; kycTier?: number };
  const { id } = c.req.param();
  let body: { to_status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to_status) return c.json({ error: 'to_status is required' }, 400);
  const repo = new WaterVendorRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Profile not found' }, 404);
  const from = profile.status;
  const to = body.to_status as WaterVendorFSMState;
  if (!isValidWaterVendorTransition(from, to)) return c.json({ error: `Invalid FSM transition: ${from} → ${to}` }, 422);
  if (to === 'claimed') {
    const g = guardSeedToClaimed({ kycTier: auth.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  if (to === 'nafdac_verified') {
    const g = guardClaimedToNafdacVerified({ nafdacNumber: profile.nafdacNumber ?? null, kycTier: auth.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 422);
  }
  const updated = await repo.transitionStatus(id, auth.tenantId, to);
  return c.json({ water_vendor: updated });
});

waterVendorRoutes.post('/:id/product-prices', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { product_type?: string; volume_litres?: number; unit_price_kobo?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.product_type || body.volume_litres === undefined || body.unit_price_kobo === undefined) return c.json({ error: 'product_type, volume_litres, unit_price_kobo are required' }, 400);
  const repo = new WaterVendorRepository(c.env.DB);
  try {
    const price = await repo.createProductPrice({ workspaceId: id, tenantId: auth.tenantId, productType: body.product_type as never, volumeLitres: body.volume_litres, unitPriceKobo: body.unit_price_kobo });
    return c.json({ product_price: price }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('P9')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

waterVendorRoutes.get('/:id/product-prices', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new WaterVendorRepository(c.env.DB);
  const prices = await repo.listProductPrices(id, auth.tenantId);
  return c.json({ product_prices: prices, count: prices.length });
});

waterVendorRoutes.post('/:id/delivery-orders', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { client_phone?: string; delivery_address?: string; product_type?: string; quantity_units?: number; total_kobo?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.client_phone || !body.delivery_address || !body.product_type || body.quantity_units === undefined || body.total_kobo === undefined) return c.json({ error: 'client_phone, delivery_address, product_type, quantity_units, total_kobo are required' }, 400);
  const repo = new WaterVendorRepository(c.env.DB);
  try {
    const order = await repo.createDeliveryOrder({ workspaceId: id, tenantId: auth.tenantId, clientPhone: body.client_phone, deliveryAddress: body.delivery_address, productType: body.product_type as never, quantityUnits: body.quantity_units, totalKobo: body.total_kobo });
    return c.json({ delivery_order: order }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('P9')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

waterVendorRoutes.get('/:id/delivery-orders', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new WaterVendorRepository(c.env.DB);
  const orders = await repo.listDeliveryOrders(id, auth.tenantId);
  return c.json({ delivery_orders: orders, count: orders.length });
});

waterVendorRoutes.patch('/:id/delivery-orders/:orderId/status', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { orderId } = c.req.param();
  let body: { status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.status) return c.json({ error: 'status is required' }, 400);
  const repo = new WaterVendorRepository(c.env.DB);
  const updated = await repo.updateDeliveryStatus(orderId, auth.tenantId, body.status as never);
  if (!updated) return c.json({ error: 'Delivery order not found' }, 404);
  return c.json({ delivery_order: updated });
});

waterVendorRoutes.get(
  '/:id/ai-advisory',
  aiConsentGate as MiddlewareHandler<{ Bindings: Env }>,
  async (c) => {
    const auth = c.get('auth') as { userId: string; tenantId: string };
    const { id } = c.req.param();
    const repo = new WaterVendorRepository(c.env.DB);
    const orders = await repo.listDeliveryOrders(id, auth.tenantId);
    const advisory = orders.map(o => ({ product_type: o.productType, quantity_units: o.quantityUnits, total_kobo: o.totalKobo, status: o.status }));
    return c.json({ capability: 'DEMAND_FORECAST', advisory_data: advisory, count: advisory.length });
  },
);
