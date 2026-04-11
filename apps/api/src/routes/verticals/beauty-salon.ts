/**
 * Beauty Salon / Barber Shop vertical routes — M9 Commerce P2 A3
 *
 * POST   /beauty-salon                              — Create profile
 * GET    /beauty-salon/workspace/:workspaceId       — List (T3)
 * GET    /beauty-salon/:id                          — Get profile
 * PATCH  /beauty-salon/:id                          — Update
 * POST   /beauty-salon/:id/transition               — FSM transition
 * POST   /beauty-salon/:id/services                 — Create service (P9)
 * GET    /beauty-salon/:id/services                 — List services
 * POST   /beauty-salon/:id/appointments             — Book appointment (P9)
 * GET    /beauty-salon/:id/appointments             — List appointments
 * GET    /beauty-salon/:id/ai-advisory              — AI scheduling advisory (P10/P12/P13)
 *
 * Platform Invariants: T3, P9, P10, P12, P13
 */

import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { BeautySalonRepository, guardSeedToClaimed, guardClaimedToPermitVerified, isValidBeautySalonTransition } from '@webwaka/verticals-beauty-salon';
import type { BeautySalonFSMState, AppointmentStatus, SalonType } from '@webwaka/verticals-beauty-salon';
import { aiConsentGate } from '@webwaka/superagent';
import type { Env } from '../../env.js';

export const beautySalonRoutes = new Hono<{ Bindings: Env }>();

beautySalonRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; salon_name?: string; salon_type?: string; state?: string; nasc_number?: string; state_permit_number?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.salon_name || !body.state) return c.json({ error: 'workspace_id, salon_name, state are required' }, 400);
  const repo = new BeautySalonRepository(c.env.DB);
  const profile = await repo.createProfile({ workspaceId: body.workspace_id, tenantId: auth.tenantId, salonName: body.salon_name, salonType: (body.salon_type ?? 'salon') as SalonType, state: body.state, nascNumber: body.nasc_number, statePermitNumber: body.state_permit_number });
  return c.json({ beauty_salon: profile }, 201);
});

beautySalonRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { workspaceId } = c.req.param();
  const repo = new BeautySalonRepository(c.env.DB);
  const profile = await repo.findProfileById(workspaceId, auth.tenantId);
  return c.json({ beauty_salon: profile });
});

beautySalonRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new BeautySalonRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Beauty salon profile not found' }, 404);
  return c.json({ beauty_salon: profile });
});

beautySalonRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { salon_name?: string; salon_type?: string; state?: string; nasc_number?: string; state_permit_number?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new BeautySalonRepository(c.env.DB);
  const updated = await repo.updateProfile(id, auth.tenantId, { salonName: body.salon_name, salonType: body.salon_type as SalonType | undefined, state: body.state, nascNumber: body.nasc_number, statePermitNumber: body.state_permit_number });
  if (!updated) return c.json({ error: 'Beauty salon profile not found' }, 404);
  return c.json({ beauty_salon: updated });
});

beautySalonRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; kycTier?: number };
  const { id } = c.req.param();
  let body: { to_status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to_status) return c.json({ error: 'to_status is required' }, 400);
  const repo = new BeautySalonRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Profile not found' }, 404);
  const from = profile.status;
  const to = body.to_status as BeautySalonFSMState;
  if (!isValidBeautySalonTransition(from, to)) return c.json({ error: `Invalid FSM transition: ${from} → ${to}` }, 422);
  if (to === 'claimed') {
    const g = guardSeedToClaimed({ kycTier: auth.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  if (to === 'permit_verified') {
    const g = guardClaimedToPermitVerified({ statePermitNumber: profile.statePermitNumber });
    if (!g.allowed) return c.json({ error: g.reason }, 422);
  }
  const updated = await repo.transitionProfile(id, auth.tenantId, to);
  return c.json({ beauty_salon: updated });
});

beautySalonRoutes.post('/:id/services', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { service_name?: string; duration_minutes?: number; price_kobo?: number; staff_id?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.service_name || body.duration_minutes === undefined || body.price_kobo === undefined) return c.json({ error: 'service_name, duration_minutes, price_kobo are required' }, 400);
  const repo = new BeautySalonRepository(c.env.DB);
  try {
    const service = await repo.createService({ workspaceId: id, tenantId: auth.tenantId, serviceName: body.service_name, durationMinutes: body.duration_minutes, priceKobo: body.price_kobo, staffId: body.staff_id });
    return c.json({ service }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('[P9]')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

beautySalonRoutes.get('/:id/services', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new BeautySalonRepository(c.env.DB);
  const services = await repo.listServices(id, auth.tenantId);
  return c.json({ services, count: services.length });
});

beautySalonRoutes.post('/:id/appointments', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { client_phone?: string; service_id?: string; staff_id?: string; appointment_time?: number; deposit_kobo?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.client_phone || body.appointment_time === undefined) return c.json({ error: 'client_phone, appointment_time are required' }, 400);
  const repo = new BeautySalonRepository(c.env.DB);
  try {
    const appointment = await repo.createAppointment({ workspaceId: id, tenantId: auth.tenantId, clientPhone: body.client_phone, serviceId: body.service_id, staffId: body.staff_id, appointmentTime: body.appointment_time, depositKobo: body.deposit_kobo });
    return c.json({ appointment }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('[P9]')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

beautySalonRoutes.get('/:id/appointments', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const status = c.req.query('status') as AppointmentStatus | undefined;
  const repo = new BeautySalonRepository(c.env.DB);
  const appointments = await repo.listAppointments(id, auth.tenantId, status);
  return c.json({ appointments, count: appointments.length });
});

// P10/P12/P13 gated AI advisory — aggregate service demand, no client PII
beautySalonRoutes.get(
  '/:id/ai-advisory',
  aiConsentGate as MiddlewareHandler<{ Bindings: Env }>,
  async (c) => {
    const auth = c.get('auth') as { userId: string; tenantId: string };
    const { id } = c.req.param();
    const repo = new BeautySalonRepository(c.env.DB);
    const services = await repo.listServices(id, auth.tenantId);
    // P13: aggregate service data only — no clientPhone
    const advisory = services.map(s => ({ service_name: s.serviceName, duration_minutes: s.durationMinutes, price_kobo: s.priceKobo }));
    return c.json({ capability: 'APPOINTMENT_OPTIMISATION', advisory_data: advisory, count: advisory.length });
  },
);
