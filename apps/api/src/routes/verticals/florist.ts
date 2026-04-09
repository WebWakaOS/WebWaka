/**
 * Florist / Garden Centre vertical routes — M9 Commerce P2 A8
 *
 * POST   /florist                              — Create profile
 * GET    /florist/workspace/:workspaceId       — List (T3)
 * GET    /florist/:id                          — Get profile
 * PATCH  /florist/:id                          — Update
 * POST   /florist/:id/transition               — FSM transition
 * POST   /florist/:id/arrangements             — Add arrangement (P9)
 * GET    /florist/:id/arrangements             — List arrangements
 * POST   /florist/:id/orders                   — Create order (P9)
 * GET    /florist/:id/orders                   — List orders
 * POST   /florist/:id/stock                    — Add stock (P9)
 * GET    /florist/:id/stock/expiring           — List expiring stock
 * GET    /florist/:id/ai-advisory              — AI seasonal demand (P10/P12/P13)
 *
 * Platform Invariants: T3, P9, P10, P12, P13
 * KYC Tier 2 required for event contracts above ₦300,000
 */

import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { FloristRepository, guardSeedToClaimed, guardClaimedToCacVerified, isValidFloristTransition } from '@webwaka/verticals-florist';
import type { FloristFSMState, FloristOrderStatus, FlowerOccasion, FloristSpeciality } from '@webwaka/verticals-florist';
import { aiConsentGate } from '@webwaka/superagent';
import type { Env } from '../../env.js';

const KYC_TIER2_THRESHOLD_KOBO = 30_000_000; // ₦300,000 in kobo

export const floristRoutes = new Hono<{ Bindings: Env }>();

floristRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; business_name?: string; speciality?: string; cac_number?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.business_name) return c.json({ error: 'workspace_id, business_name are required' }, 400);
  const repo = new FloristRepository(c.env.DB);
  const profile = await repo.createProfile({ workspaceId: body.workspace_id, tenantId: auth.tenantId, businessName: body.business_name, speciality: body.speciality as FloristSpeciality | undefined, cacNumber: body.cac_number });
  return c.json({ florist: profile }, 201);
});

floristRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { workspaceId } = c.req.param();
  const repo = new FloristRepository(c.env.DB);
  const profile = await repo.findProfileById(workspaceId, auth.tenantId);
  return c.json({ florist: profile });
});

floristRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new FloristRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Florist profile not found' }, 404);
  return c.json({ florist: profile });
});

floristRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { business_name?: string; speciality?: string; cac_number?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new FloristRepository(c.env.DB);
  const updated = await repo.updateProfile(id, auth.tenantId, { businessName: body.business_name, speciality: body.speciality as FloristSpeciality | undefined, cacNumber: body.cac_number });
  if (!updated) return c.json({ error: 'Florist profile not found' }, 404);
  return c.json({ florist: updated });
});

floristRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; kycTier?: number };
  const { id } = c.req.param();
  let body: { to_status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to_status) return c.json({ error: 'to_status is required' }, 400);
  const repo = new FloristRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Profile not found' }, 404);
  const from = profile.status;
  const to = body.to_status as FloristFSMState;
  if (!isValidFloristTransition(from, to)) return c.json({ error: `Invalid FSM transition: ${from} → ${to}` }, 422);
  if (to === 'claimed') {
    const g = guardSeedToClaimed({ kycTier: auth.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  if (to === 'cac_verified') {
    const g = guardClaimedToCacVerified({ cacNumber: profile.cacNumber });
    if (!g.allowed) return c.json({ error: g.reason }, 422);
  }
  const updated = await repo.transitionProfile(id, auth.tenantId, to);
  return c.json({ florist: updated });
});

floristRoutes.post('/:id/arrangements', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { name?: string; occasion?: string; price_kobo?: number; description?: string; image_url?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.name || !body.occasion || body.price_kobo === undefined) return c.json({ error: 'name, occasion, price_kobo are required' }, 400);
  const repo = new FloristRepository(c.env.DB);
  try {
    const arrangement = await repo.createArrangement({ workspaceId: id, tenantId: auth.tenantId, name: body.name, occasion: body.occasion as FlowerOccasion, priceKobo: body.price_kobo, description: body.description, imageUrl: body.image_url });
    return c.json({ arrangement }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('[P9]')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

floristRoutes.get('/:id/arrangements', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const occasion = c.req.query('occasion') as FlowerOccasion | undefined;
  const repo = new FloristRepository(c.env.DB);
  const arrangements = await repo.listArrangements(id, auth.tenantId, occasion);
  return c.json({ arrangements, count: arrangements.length });
});

floristRoutes.post('/:id/orders', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; kycTier?: number };
  const { id } = c.req.param();
  let body: { client_phone?: string; event_date?: number; deposit_kobo?: number; balance_kobo?: number; arrangement_id?: string; delivery_address?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.client_phone || body.event_date === undefined) return c.json({ error: 'client_phone, event_date are required' }, 400);
  const totalKobo = (body.deposit_kobo ?? 0) + (body.balance_kobo ?? 0);
  if (totalKobo > KYC_TIER2_THRESHOLD_KOBO && (auth.kycTier ?? 0) < 2) {
    return c.json({ error: 'KYC Tier 2 required for florist contracts above ₦300,000' }, 403);
  }
  const repo = new FloristRepository(c.env.DB);
  try {
    const order = await repo.createOrder({ workspaceId: id, tenantId: auth.tenantId, clientPhone: body.client_phone, eventDate: body.event_date, depositKobo: body.deposit_kobo, balanceKobo: body.balance_kobo, arrangementId: body.arrangement_id, deliveryAddress: body.delivery_address });
    return c.json({ order }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('[P9]')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

floristRoutes.get('/:id/orders', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const status = c.req.query('status') as FloristOrderStatus | undefined;
  const repo = new FloristRepository(c.env.DB);
  const orders = await repo.listOrders(id, auth.tenantId, status);
  return c.json({ orders, count: orders.length });
});

floristRoutes.post('/:id/stock', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { flower_name?: string; quantity_in_stock?: number; unit_cost_kobo?: number; expiry_date?: number; supplier_name?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.flower_name || body.quantity_in_stock === undefined || body.unit_cost_kobo === undefined) {
    return c.json({ error: 'flower_name, quantity_in_stock, unit_cost_kobo are required' }, 400);
  }
  const repo = new FloristRepository(c.env.DB);
  try {
    const stock = await repo.createStock({ workspaceId: id, tenantId: auth.tenantId, flowerName: body.flower_name, quantityInStock: body.quantity_in_stock, unitCostKobo: body.unit_cost_kobo, expiryDate: body.expiry_date, supplierName: body.supplier_name });
    return c.json({ stock }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('[P9]')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

floristRoutes.get('/:id/stock/expiring', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const daysParam = c.req.query('days') ?? '3';
  const daysAhead = Math.max(1, Math.min(30, parseInt(daysParam, 10) || 3));
  const thresholdUnix = Math.floor(Date.now() / 1000) + daysAhead * 86400;
  const repo = new FloristRepository(c.env.DB);
  const expiring = await repo.listExpiringStock(id, auth.tenantId, thresholdUnix);
  return c.json({ expiring_stock: expiring, count: expiring.length, threshold_days: daysAhead });
});

// P10/P12/P13 gated AI advisory — occasion-level aggregate, no client PII
floristRoutes.get(
  '/:id/ai-advisory',
  aiConsentGate as MiddlewareHandler<{ Bindings: Env }>,
  async (c) => {
    const auth = c.get('auth') as { userId: string; tenantId: string };
    const { id } = c.req.param();
    const repo = new FloristRepository(c.env.DB);
    const arrangements = await repo.listArrangements(id, auth.tenantId);
    // P13: aggregate by occasion only — no client phone or delivery address
    const byOccasion = arrangements.reduce<Record<string, number>>((acc, a) => { acc[a.occasion] = (acc[a.occasion] ?? 0) + 1; return acc; }, {});
    return c.json({ capability: 'DEMAND_PLANNING', advisory_data: { occasions: byOccasion, total_arrangements: arrangements.length } });
  },
);
