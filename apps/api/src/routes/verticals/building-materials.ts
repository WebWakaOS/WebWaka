/**
 * Building Materials vertical routes — M12 Commerce P3
 *
 * POST   /building-materials                              — Create profile
 * GET    /building-materials/workspace/:workspaceId       — Get by workspace (T3)
 * GET    /building-materials/:id                          — Get profile (T3)
 * PATCH  /building-materials/:id                          — Update profile
 * POST   /building-materials/:id/transition               — FSM transition
 * POST   /building-materials/:id/catalogue                — Create catalogue item (P9)
 * GET    /building-materials/:id/catalogue                — List catalogue (T3)
 * POST   /building-materials/:id/orders                   — Create order (P9, P13)
 * GET    /building-materials/:id/orders                   — List orders (T3)
 * PATCH  /building-materials/:id/orders/:orderId/status   — Update order status
 * POST   /building-materials/:id/credit-accounts          — Create contractor credit account
 * GET    /building-materials/:id/credit-accounts          — List credit accounts (T3)
 * GET    /building-materials/:id/ai-advisory              — AI advisory (P13: contractor PII stripped)
 *
 * Platform Invariants: T3, P9, P13
 */

import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import {
  BuildingMaterialsRepository,
  guardSeedToClaimed,
  guardClaimedToCacVerified,
  isValidBuildingMaterialsTransition,
} from '@webwaka/verticals-building-materials';
import type { BuildingMaterialsFSMState, ProductCategory, OrderStatus } from '@webwaka/verticals-building-materials';
import { aiConsentGate } from '@webwaka/superagent';
import type { Env } from '../../env.js';

export const buildingMaterialsRoutes = new Hono<{ Bindings: Env }>();

buildingMaterialsRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; company_name?: string; cac_rc?: string; son_dealer_number?: string; market_cluster?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.company_name) return c.json({ error: 'workspace_id, company_name are required' }, 400);
  const repo = new BuildingMaterialsRepository(c.env.DB);
  const profile = await repo.createProfile({ workspaceId: body.workspace_id, tenantId: auth.tenantId, companyName: body.company_name, cacRc: body.cac_rc, sonDealerNumber: body.son_dealer_number, marketCluster: body.market_cluster });
  return c.json({ building_materials: profile }, 201);
});

buildingMaterialsRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { workspaceId } = c.req.param();
  const repo = new BuildingMaterialsRepository(c.env.DB);
  const profile = await repo.findProfileByWorkspace(workspaceId, auth.tenantId);
  return c.json({ building_materials: profile });
});

buildingMaterialsRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new BuildingMaterialsRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Building materials profile not found' }, 404);
  return c.json({ building_materials: profile });
});

buildingMaterialsRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { company_name?: string; cac_rc?: string; son_dealer_number?: string; market_cluster?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new BuildingMaterialsRepository(c.env.DB);
  const updated = await repo.updateProfile(id, auth.tenantId, { companyName: body.company_name, cacRc: body.cac_rc, sonDealerNumber: body.son_dealer_number, marketCluster: body.market_cluster });
  if (!updated) return c.json({ error: 'Profile not found' }, 404);
  return c.json({ building_materials: updated });
});

buildingMaterialsRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; kycTier?: number };
  const { id } = c.req.param();
  let body: { to_status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to_status) return c.json({ error: 'to_status is required' }, 400);
  const repo = new BuildingMaterialsRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Profile not found' }, 404);
  const from = profile.status;
  const to = body.to_status as BuildingMaterialsFSMState;
  if (!isValidBuildingMaterialsTransition(from, to)) return c.json({ error: `Invalid FSM transition: ${from} → ${to}` }, 422);
  if (to === 'claimed') {
    const g = guardSeedToClaimed({ kycTier: auth.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  if (to === 'cac_verified') {
    const g = guardClaimedToCacVerified({ cacRc: profile.cacRc ?? null });
    if (!g.allowed) return c.json({ error: g.reason }, 422);
  }
  const updated = await repo.transitionStatus(id, auth.tenantId, to);
  return c.json({ building_materials: updated });
});

buildingMaterialsRoutes.post('/:id/catalogue', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { product_name?: string; category?: string; unit?: string; unit_price_kobo?: number; quantity_in_stock?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.product_name || !body.category || !body.unit || body.unit_price_kobo === undefined) return c.json({ error: 'product_name, category, unit, unit_price_kobo are required' }, 400);
  const repo = new BuildingMaterialsRepository(c.env.DB);
  try {
    const item = await repo.createCatalogueItem({ workspaceId: id, tenantId: auth.tenantId, productName: body.product_name, category: body.category as ProductCategory, unit: body.unit, unitPriceKobo: body.unit_price_kobo, quantityInStock: body.quantity_in_stock });
    return c.json({ catalogue_item: item }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('P9')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

buildingMaterialsRoutes.get('/:id/catalogue', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new BuildingMaterialsRepository(c.env.DB);
  const items = await repo.listCatalogueItems(id, auth.tenantId);
  return c.json({ catalogue: items, count: items.length });
});

buildingMaterialsRoutes.post('/:id/orders', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { client_phone?: string; client_name?: string; order_items?: string; total_kobo?: number; credit_account_id?: string; delivery_address?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.client_phone || !body.client_name || body.total_kobo === undefined) return c.json({ error: 'client_phone, client_name, total_kobo are required' }, 400);
  const repo = new BuildingMaterialsRepository(c.env.DB);
  try {
    const order = await repo.createOrder({ workspaceId: id, tenantId: auth.tenantId, clientPhone: body.client_phone, clientName: body.client_name, orderItems: body.order_items, totalKobo: body.total_kobo, creditAccountId: body.credit_account_id, deliveryAddress: body.delivery_address });
    return c.json({ order }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('P9')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

buildingMaterialsRoutes.get('/:id/orders', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new BuildingMaterialsRepository(c.env.DB);
  const orders = await repo.listOrders(id, auth.tenantId);
  return c.json({ orders, count: orders.length });
});

buildingMaterialsRoutes.patch('/:id/orders/:orderId/status', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { orderId } = c.req.param();
  let body: { status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.status) return c.json({ error: 'status is required' }, 400);
  const repo = new BuildingMaterialsRepository(c.env.DB);
  const updated = await repo.updateOrderStatus(orderId, auth.tenantId, body.status as OrderStatus);
  if (!updated) return c.json({ error: 'Order not found' }, 404);
  return c.json({ order: updated });
});

buildingMaterialsRoutes.post('/:id/credit-accounts', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { contractor_phone?: string; contractor_name?: string; credit_limit_kobo?: number; balance_owing_kobo?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.contractor_phone || !body.contractor_name || body.credit_limit_kobo === undefined) return c.json({ error: 'contractor_phone, contractor_name, credit_limit_kobo are required' }, 400);
  const repo = new BuildingMaterialsRepository(c.env.DB);
  try {
    const account = await repo.createCreditAccount({ workspaceId: id, tenantId: auth.tenantId, contractorPhone: body.contractor_phone, contractorName: body.contractor_name, creditLimitKobo: body.credit_limit_kobo, balanceOwingKobo: body.balance_owing_kobo });
    return c.json({ credit_account: account }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('P9')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

buildingMaterialsRoutes.get('/:id/credit-accounts', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new BuildingMaterialsRepository(c.env.DB);
  const accounts = await repo.listCreditAccounts(id, auth.tenantId);
  return c.json({ credit_accounts: accounts, count: accounts.length });
});

// AI advisory — P13: contractor PII stripped; order values + status only
buildingMaterialsRoutes.get(
  '/:id/ai-advisory',
  aiConsentGate as MiddlewareHandler<{ Bindings: Env }>,
  async (c) => {
    const auth = c.get('auth') as { userId: string; tenantId: string };
    const { id } = c.req.param();
    const repo = new BuildingMaterialsRepository(c.env.DB);
    const orders = await repo.listOrders(id, auth.tenantId);
    const advisory = orders.map(o => ({ status: o.status, total_kobo: o.totalKobo }));
    return c.json({ capability: 'SALES_FORECAST', advisory_data: advisory, count: advisory.length });
  },
);
