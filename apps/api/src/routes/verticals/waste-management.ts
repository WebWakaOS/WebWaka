/**
 * Waste Management / Recycler vertical routes — M11 Civic Extended
 *
 * POST   /waste-management                              — Create profile
 * GET    /waste-management/:id                          — Get profile (T3)
 * PATCH  /waste-management/:id                          — Update profile
 * POST   /waste-management/:id/transition               — FSM transition
 * POST   /waste-management/:id/routes                   — Create collection route
 * POST   /waste-management/:id/subscriptions            — Create subscription (P9)
 * POST   /waste-management/:id/tonnage                  — Log tonnage (integer kg)
 * POST   /waste-management/:id/recycling                — Create recycling purchase (P9)
 *
 * Platform Invariants: T3, P9 (integer kg weights)
 */

import { Hono } from 'hono';
import {
  WasteManagementRepository,
  isValidWasteMgmtTransition,
} from '@webwaka/verticals-waste-management';
import type { WasteMgmtFSMState, MaterialType } from '@webwaka/verticals-waste-management';
import type { Env } from '../../env.js';

export const wasteManagementRoutes = new Hono<{ Bindings: Env }>();

wasteManagementRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; company_name?: string; lawma_or_state_permit?: string; cac_rc?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.company_name) return c.json({ error: 'workspace_id, company_name required' }, 400);
  const repo = new WasteManagementRepository(c.env.DB);
  const profile = await repo.create({ workspaceId: body.workspace_id, tenantId: auth.tenantId, companyName: body.company_name, lawmaOrStatePermit: body.lawma_or_state_permit, cacRc: body.cac_rc });
  return c.json({ waste_management: profile }, 201);
});

wasteManagementRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new WasteManagementRepository(c.env.DB);
  const profile = await repo.findById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Waste management profile not found' }, 404);
  return c.json({ waste_management: profile });
});

wasteManagementRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new WasteManagementRepository(c.env.DB);
  const updated = await repo.update(id, auth.tenantId, { companyName: body['company_name'] as string | undefined, lawmaOrStatePermit: body['lawma_or_state_permit'] as string | null | undefined, fmenvCert: body['fmenv_cert'] as string | null | undefined, cacRc: body['cac_rc'] as string | null | undefined });
  if (!updated) return c.json({ error: 'Waste management profile not found' }, 404);
  return c.json({ waste_management: updated });
});

wasteManagementRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { to?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to) return c.json({ error: 'to state required' }, 400);
  const repo = new WasteManagementRepository(c.env.DB);
  const current = await repo.findById(id, auth.tenantId);
  if (!current) return c.json({ error: 'Waste management profile not found' }, 404);
  if (!isValidWasteMgmtTransition(current.status, body.to as WasteMgmtFSMState)) return c.json({ error: `Invalid transition ${current.status} → ${body.to}` }, 422);
  return c.json({ waste_management: await repo.transition(id, auth.tenantId, body.to as WasteMgmtFSMState) });
});

wasteManagementRoutes.post('/:id/routes', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { route_name?: string; zone?: string; truck_id?: string; collection_day?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.route_name) return c.json({ error: 'route_name required' }, 400);
  const repo = new WasteManagementRepository(c.env.DB);
  const route = await repo.createRoute({ profileId: id, tenantId: auth.tenantId, routeName: body.route_name, zone: body.zone, truckId: body.truck_id, collectionDay: body.collection_day });
  return c.json({ route }, 201);
});

wasteManagementRoutes.post('/:id/subscriptions', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { monthly_fee_kobo?: unknown; route_id?: string; client_phone?: string; payment_status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (body.monthly_fee_kobo === undefined) return c.json({ error: 'monthly_fee_kobo required' }, 400);
  if (!Number.isInteger(body.monthly_fee_kobo) || (body.monthly_fee_kobo as number) < 0) return c.json({ error: 'monthly_fee_kobo must be a non-negative integer (P9)' }, 422);
  const repo = new WasteManagementRepository(c.env.DB);
  const sub = await repo.createSubscription({ profileId: id, tenantId: auth.tenantId, monthlyFeeKobo: body.monthly_fee_kobo as number, routeId: body.route_id, clientPhone: body.client_phone, paymentStatus: body.payment_status });
  return c.json({ subscription: sub }, 201);
});

wasteManagementRoutes.post('/:id/tonnage', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { weight_kg?: unknown; waste_type?: string; route_id?: string; collection_date?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (body.weight_kg === undefined) return c.json({ error: 'weight_kg required' }, 400);
  if (!Number.isInteger(body.weight_kg) || (body.weight_kg as number) < 0) return c.json({ error: 'weight_kg must be a non-negative integer' }, 422);
  const repo = new WasteManagementRepository(c.env.DB);
  const log = await repo.createTonnageLog({ profileId: id, tenantId: auth.tenantId, weightKg: body.weight_kg as number, wasteType: body.waste_type, routeId: body.route_id, collectionDate: body.collection_date });
  return c.json({ tonnage_log: log }, 201);
});

wasteManagementRoutes.post('/:id/recycling', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { weight_kg?: unknown; price_per_kg_kobo?: unknown; material_type?: string; supplier_phone?: string; collection_date?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (body.weight_kg === undefined || body.price_per_kg_kobo === undefined) return c.json({ error: 'weight_kg, price_per_kg_kobo required' }, 400);
  if (!Number.isInteger(body.weight_kg) || (body.weight_kg as number) <= 0) return c.json({ error: 'weight_kg must be a positive integer' }, 422);
  if (!Number.isInteger(body.price_per_kg_kobo) || (body.price_per_kg_kobo as number) < 0) return c.json({ error: 'price_per_kg_kobo must be a non-negative integer (P9)' }, 422);
  const repo = new WasteManagementRepository(c.env.DB);
  const purchase = await repo.createRecyclingPurchase({ profileId: id, tenantId: auth.tenantId, weightKg: body.weight_kg as number, pricePerKgKobo: body.price_per_kg_kobo as number, materialType: body.material_type as MaterialType | undefined, supplierPhone: body.supplier_phone, collectionDate: body.collection_date });
  return c.json({ recycling_purchase: purchase }, 201);
});
