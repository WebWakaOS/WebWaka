/**
 * Catering Service vertical routes — M9 Commerce P2 A5
 *
 * POST   /catering                              — Create profile
 * GET    /catering/workspace/:workspaceId       — List (T3)
 * GET    /catering/:id                          — Get profile
 * PATCH  /catering/:id                          — Update
 * POST   /catering/:id/transition               — FSM transition
 * POST   /catering/:id/events                   — Create event (P9)
 * GET    /catering/:id/events                   — List events
 * POST   /catering/:id/menus                    — Create menu (P9)
 * GET    /catering/:id/menus                    — List menus
 * POST   /catering/:id/staff                    — Add staff
 * GET    /catering/:id/staff                    — List staff
 * GET    /catering/:id/ai-advisory              — AI demand forecast (P10/P12/P13)
 *
 * Platform Invariants: T3, P9, P10, P12, P13
 * KYC Tier 2 required for events above ₦50,000,000 (50M kobo = ₦500,000)
 */

import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { CateringRepository, guardSeedToClaimed, guardClaimedToNafdacVerified, isValidCateringTransition } from '@webwaka/verticals-catering';
import type { CateringFSMState, CateringEventStatus, StaffRole } from '@webwaka/verticals-catering';
import { aiConsentGate } from '@webwaka/superagent';
import type { Env } from '../../env.js';

const KYC_TIER2_THRESHOLD_KOBO = 50_000_000; // ₦500,000 in kobo

export const cateringRoutes = new Hono<{ Bindings: Env }>();

cateringRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; business_name?: string; speciality?: string; nafdac_cert?: string; cac_number?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.business_name) return c.json({ error: 'workspace_id, business_name are required' }, 400);
  const repo = new CateringRepository(c.env.DB);
  const profile = await repo.createProfile({ workspaceId: body.workspace_id, tenantId: auth.tenantId, businessName: body.business_name, speciality: body.speciality as never, nafdacCert: body.nafdac_cert, cacNumber: body.cac_number });
  return c.json({ catering: profile }, 201);
});

cateringRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { workspaceId } = c.req.param();
  const repo = new CateringRepository(c.env.DB);
  const profile = await repo.findProfileById(workspaceId, auth.tenantId);
  return c.json({ catering: profile });
});

cateringRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new CateringRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Catering profile not found' }, 404);
  return c.json({ catering: profile });
});

cateringRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { business_name?: string; nafdac_cert?: string; cac_number?: string; speciality?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new CateringRepository(c.env.DB);
  const updated = await repo.updateProfile(id, auth.tenantId, { businessName: body.business_name, nafdacCert: body.nafdac_cert, cacNumber: body.cac_number, speciality: body.speciality as never });
  if (!updated) return c.json({ error: 'Catering profile not found' }, 404);
  return c.json({ catering: updated });
});

cateringRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; kycTier?: number };
  const { id } = c.req.param();
  let body: { to_status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to_status) return c.json({ error: 'to_status is required' }, 400);
  const repo = new CateringRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Profile not found' }, 404);
  const from = profile.status;
  const to = body.to_status as CateringFSMState;
  if (!isValidCateringTransition(from, to)) return c.json({ error: `Invalid FSM transition: ${from} → ${to}` }, 422);
  if (to === 'claimed') {
    const g = guardSeedToClaimed({ kycTier: auth.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  if (to === 'nafdac_verified') {
    const g = guardClaimedToNafdacVerified({ nafdacCert: profile.nafdacCert });
    if (!g.allowed) return c.json({ error: g.reason }, 422);
  }
  const updated = await repo.transitionProfile(id, auth.tenantId, to);
  return c.json({ catering: updated });
});

cateringRoutes.post('/:id/events', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; kycTier?: number };
  const { id } = c.req.param();
  let body: { client_phone?: string; event_type?: string; event_date?: number; guest_count?: number; price_per_head_kobo?: number; deposit_kobo?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.client_phone || !body.event_type || body.event_date === undefined || body.guest_count === undefined || body.price_per_head_kobo === undefined) {
    return c.json({ error: 'client_phone, event_type, event_date, guest_count, price_per_head_kobo are required' }, 400);
  }
  const totalKobo = body.price_per_head_kobo * body.guest_count;
  if (totalKobo > KYC_TIER2_THRESHOLD_KOBO && (auth.kycTier ?? 0) < 2) {
    return c.json({ error: 'KYC Tier 2 required for catering events above ₦500,000' }, 403);
  }
  const repo = new CateringRepository(c.env.DB);
  try {
    const event = await repo.createEvent({ workspaceId: id, tenantId: auth.tenantId, clientPhone: body.client_phone, eventType: body.event_type, eventDate: body.event_date, guestCount: body.guest_count, pricePerHeadKobo: body.price_per_head_kobo, depositKobo: body.deposit_kobo });
    return c.json({ event }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('[P9]')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

cateringRoutes.get('/:id/events', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const status = c.req.query('status') as CateringEventStatus | undefined;
  const repo = new CateringRepository(c.env.DB);
  const events = await repo.listEvents(id, auth.tenantId, status);
  return c.json({ events, count: events.length });
});

cateringRoutes.post('/:id/menus', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { menu_name?: string; cost_per_head_kobo?: number; description?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.menu_name || body.cost_per_head_kobo === undefined) return c.json({ error: 'menu_name, cost_per_head_kobo are required' }, 400);
  const repo = new CateringRepository(c.env.DB);
  try {
    const menu = await repo.createMenu({ workspaceId: id, tenantId: auth.tenantId, menuName: body.menu_name, costPerHeadKobo: body.cost_per_head_kobo, description: body.description });
    return c.json({ menu }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('[P9]')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

cateringRoutes.get('/:id/menus', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new CateringRepository(c.env.DB);
  const menus = await repo.listMenus(id, auth.tenantId);
  return c.json({ menus, count: menus.length });
});

cateringRoutes.post('/:id/staff', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { staff_name?: string; role?: string; nafdac_card_number?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.staff_name || !body.role) return c.json({ error: 'staff_name, role are required' }, 400);
  const repo = new CateringRepository(c.env.DB);
  const staff = await repo.createStaff({ workspaceId: id, tenantId: auth.tenantId, staffName: body.staff_name, role: body.role as StaffRole, nafdacCardNumber: body.nafdac_card_number });
  return c.json({ staff }, 201);
});

cateringRoutes.get('/:id/staff', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new CateringRepository(c.env.DB);
  const staff = await repo.listStaff(id, auth.tenantId);
  return c.json({ staff, count: staff.length });
});

// P10/P12/P13 gated AI advisory — event type aggregate, no client phone
cateringRoutes.get(
  '/:id/ai-advisory',
  aiConsentGate as MiddlewareHandler<{ Bindings: Env }>,
  async (c) => {
    const auth = c.get('auth') as { userId: string; tenantId: string };
    const { id } = c.req.param();
    const repo = new CateringRepository(c.env.DB);
    const menus = await repo.listMenus(id, auth.tenantId);
    // P13: menu aggregate only — no clientPhone in advisory payload
    const advisory = menus.map(m => ({ menu_name: m.menuName, cost_per_head_kobo: m.costPerHeadKobo }));
    return c.json({ capability: 'DEMAND_PLANNING', advisory_data: advisory, count: advisory.length });
  },
);
