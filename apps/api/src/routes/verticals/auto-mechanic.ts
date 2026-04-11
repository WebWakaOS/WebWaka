/**
 * Auto Mechanic / Garage vertical routes — M9 Commerce P2 A1
 *
 * POST   /auto-mechanic                          — Create profile
 * GET    /auto-mechanic/workspace/:workspaceId   — List by workspace (T3)
 * GET    /auto-mechanic/:id                      — Get profile (T3)
 * PATCH  /auto-mechanic/:id                      — Update profile
 * POST   /auto-mechanic/:id/transition           — FSM transition
 * POST   /auto-mechanic/:id/job-cards            — Create job card (P9)
 * GET    /auto-mechanic/:id/job-cards            — List job cards (T3)
 * POST   /auto-mechanic/:id/parts               — Add part (P9)
 * GET    /auto-mechanic/:id/parts               — List parts (T3)
 * GET    /auto-mechanic/:id/ai-advisory         — AI demand forecast (P10/P12/P13)
 *
 * Platform Invariants: T3, P9, P10, P12, P13
 */

import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { AutoMechanicRepository, guardSeedToClaimed, guardClaimedToCacVerified, guardCacVerifiedToActive, isValidAutoMechanicTransition } from '@webwaka/verticals-auto-mechanic';
import type { AutoMechanicFSMState } from '@webwaka/verticals-auto-mechanic';
import { aiConsentGate } from '@webwaka/superagent';
import type { Env } from '../../env.js';

export const autoMechanicRoutes = new Hono<{ Bindings: Env }>();

autoMechanicRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; workshop_name?: string; state?: string; lga?: string; cac_number?: string; vio_registration?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.workshop_name || !body.state || !body.lga) {
    return c.json({ error: 'workspace_id, workshop_name, state, lga are required' }, 400);
  }
  const repo = new AutoMechanicRepository(c.env.DB);
  const profile = await repo.createProfile({ workspaceId: body.workspace_id, tenantId: auth.tenantId, workshopName: body.workshop_name, state: body.state, lga: body.lga, cacNumber: body.cac_number, vioRegistration: body.vio_registration });
  return c.json({ auto_mechanic: profile }, 201);
});

autoMechanicRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { workspaceId } = c.req.param();
  const repo = new AutoMechanicRepository(c.env.DB);
  const profiles = await repo.findProfilesByWorkspace(workspaceId, auth.tenantId);
  return c.json({ auto_mechanics: profiles, count: profiles.length });
});

autoMechanicRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new AutoMechanicRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Auto mechanic profile not found' }, 404);
  return c.json({ auto_mechanic: profile });
});

autoMechanicRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { workshop_name?: string; state?: string; lga?: string; cac_number?: string; vio_registration?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new AutoMechanicRepository(c.env.DB);
  const updated = await repo.updateProfile(id, auth.tenantId, { workshopName: body.workshop_name, state: body.state, lga: body.lga, cacNumber: body.cac_number, vioRegistration: body.vio_registration });
  if (!updated) return c.json({ error: 'Auto mechanic profile not found' }, 404);
  return c.json({ auto_mechanic: updated });
});

autoMechanicRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; kycTier?: number };
  const { id } = c.req.param();
  let body: { to_status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to_status) return c.json({ error: 'to_status is required' }, 400);
  const repo = new AutoMechanicRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Profile not found' }, 404);
  const from = profile.status;
  const to = body.to_status as AutoMechanicFSMState;
  if (!isValidAutoMechanicTransition(from, to)) return c.json({ error: `Invalid FSM transition: ${from} → ${to}` }, 422);
  if (to === 'claimed') {
    const g = guardSeedToClaimed({ kycTier: auth.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  if (to === 'cac_verified') {
    const g = guardClaimedToCacVerified({ cacNumber: profile.cacNumber });
    if (!g.allowed) return c.json({ error: g.reason }, 422);
  }
  if (to === 'active') {
    const g = guardCacVerifiedToActive({ vioRegistration: profile.vioRegistration });
    if (!g.allowed) return c.json({ error: g.reason }, 422);
  }
  const updated = await repo.transitionProfile(id, auth.tenantId, to);
  return c.json({ auto_mechanic: updated });
});

autoMechanicRoutes.post('/:id/job-cards', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { vehicle_plate?: string; customer_phone?: string; complaint?: string; labour_cost_kobo?: number; parts_cost_kobo?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.vehicle_plate || !body.customer_phone || !body.complaint || body.labour_cost_kobo === undefined) {
    return c.json({ error: 'vehicle_plate, customer_phone, complaint, labour_cost_kobo are required' }, 400);
  }
  const repo = new AutoMechanicRepository(c.env.DB);
  try {
    const card = await repo.createJobCard({ workspaceId: id, tenantId: auth.tenantId, vehiclePlate: body.vehicle_plate, customerPhone: body.customer_phone, complaint: body.complaint, labourCostKobo: body.labour_cost_kobo, partsCostKobo: body.parts_cost_kobo });
    return c.json({ job_card: card }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('[P9]')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

autoMechanicRoutes.get('/:id/job-cards', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new AutoMechanicRepository(c.env.DB);
  const cards = await repo.listJobCards(id, auth.tenantId);
  return c.json({ job_cards: cards, count: cards.length });
});

autoMechanicRoutes.post('/:id/parts', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { part_name?: string; quantity_in_stock?: number; unit_cost_kobo?: number; part_number?: string; supplier?: string; reorder_level?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.part_name || body.quantity_in_stock === undefined || body.unit_cost_kobo === undefined) {
    return c.json({ error: 'part_name, quantity_in_stock, unit_cost_kobo are required' }, 400);
  }
  const repo = new AutoMechanicRepository(c.env.DB);
  try {
    const part = await repo.createPart({ workspaceId: id, tenantId: auth.tenantId, partName: body.part_name, quantityInStock: body.quantity_in_stock, unitCostKobo: body.unit_cost_kobo, partNumber: body.part_number, supplier: body.supplier, reorderLevel: body.reorder_level });
    return c.json({ part }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('[P9]')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

autoMechanicRoutes.get('/:id/parts', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new AutoMechanicRepository(c.env.DB);
  const parts = await repo.listParts(id, auth.tenantId);
  return c.json({ parts, count: parts.length });
});

// P10/P12/P13 gated AI advisory — aggregate parts demand, no PII sent
autoMechanicRoutes.get(
  '/:id/ai-advisory',
  aiConsentGate as MiddlewareHandler<{ Bindings: Env }>,
  async (c) => {
    const auth = c.get('auth') as { userId: string; tenantId: string };
    const { id } = c.req.param();
    const repo = new AutoMechanicRepository(c.env.DB);
    const lowStock = await repo.listLowStockParts(id, auth.tenantId);
    // P13: aggregate stats only — no customer phone or IMEI
    const advisory = lowStock.map(p => ({ part_name: p.partName, quantity_in_stock: p.quantityInStock, reorder_level: p.reorderLevel, unit_cost_kobo: p.unitCostKobo }));
    return c.json({ capability: 'DEMAND_PLANNING', advisory_data: advisory, count: advisory.length });
  },
);
