import { Hono } from 'hono';
import { OkadaKekeRepository, isValidOkadaKekeTransition, guardLagosOkadaBan } from '@webwaka/verticals-okada-keke';
import type { OkadaKekeFSMState } from '@webwaka/verticals-okada-keke';
import type { Env } from '../../env.js';
export const okadaKekeRoutes = new Hono<{ Bindings: Env }>();
okadaKekeRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!b['workspace_id'] || !b['business_name']) return c.json({ error: 'workspace_id, business_name required' }, 400);
  const banCheck = guardLagosOkadaBan(b['operating_state'] as string ?? '', b['vehicle_category'] as string ?? '');
  if (!banCheck.allowed) return c.json({ error: banCheck.reason }, 422);
  try {
    return c.json({ okada_keke: await new OkadaKekeRepository(c.env.DB).createProfile({ workspaceId: b['workspace_id'] as string, tenantId: auth.tenantId, businessName: b['business_name'] as string, operatingState: b['operating_state'] as string | undefined, vehicleCategory: b['vehicle_category'] as string | undefined, nurtwMembership: b['nurtw_membership'] as string | undefined, lvaaReg: b['lvaa_reg'] as string | undefined, cacRc: b['cac_rc'] as string | undefined }) }, 201);
  } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
okadaKekeRoutes.get('/workspace/:workspaceId', async (c) => { const auth = c.get('auth') as { tenantId: string }; return c.json({ okada_keke: await new OkadaKekeRepository(c.env.DB).findProfileByWorkspace(c.req.param('workspaceId'), auth.tenantId) }); });
okadaKekeRoutes.get('/:id', async (c) => { const auth = c.get('auth') as { tenantId: string }; const p = await new OkadaKekeRepository(c.env.DB).findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404); return c.json({ okada_keke: p }); });
okadaKekeRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new OkadaKekeRepository(c.env.DB); const p = await repo.findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404);
  const to = b['status'] as OkadaKekeFSMState; if (!isValidOkadaKekeTransition(p.status, to)) return c.json({ error: `Invalid FSM transition ${p.status} → ${to}` }, 422);
  return c.json({ okada_keke: await repo.transitionStatus(c.req.param('id'), auth.tenantId, to, { nurtwMembership: b['nurtw_membership'] as string | undefined }) });
});
okadaKekeRoutes.post('/:id/vehicles', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  return c.json({ vehicle: await new OkadaKekeRepository(c.env.DB).addVehicle(c.req.param('id'), auth.tenantId, { category: b['category'] as string, makeModel: b['make_model'] as string | undefined, plateNumber: b['plate_number'] as string, vehicleYear: b['vehicle_year'] as number | undefined, motorVehicleLicence: b['motor_vehicle_licence'] as string | undefined, insurancePolicyRef: b['insurance_policy_ref'] as string | undefined }) }, 201);
});
okadaKekeRoutes.get('/:id/vehicles', async (c) => { const auth = c.get('auth') as { tenantId: string }; const vehicles = await new OkadaKekeRepository(c.env.DB).listVehicles(c.req.param('id'), auth.tenantId); return c.json({ vehicles, count: vehicles.length }); });
okadaKekeRoutes.post('/:id/pilots', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  return c.json({ pilot: await new OkadaKekeRepository(c.env.DB).addPilot(c.req.param('id'), auth.tenantId, { pilotRefId: b['pilot_ref_id'] as string, licenceNumber: b['licence_number'] as string | undefined, vehicleId: b['vehicle_id'] as string | undefined, lasgRiderBadge: b['lasg_rider_badge'] as string | undefined }) }, 201);
});
okadaKekeRoutes.get('/:id/pilots', async (c) => { const auth = c.get('auth') as { tenantId: string }; const pilots = await new OkadaKekeRepository(c.env.DB).listPilots(c.req.param('id'), auth.tenantId); return c.json({ pilots, count: pilots.length }); });
okadaKekeRoutes.post('/:id/trips', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ trip: await new OkadaKekeRepository(c.env.DB).recordTrip(c.req.param('id'), auth.tenantId, { pilotId: b['pilot_id'] as string, passengerRefId: b['passenger_ref_id'] as string, tripDate: b['trip_date'] as number, fareKobo: b['fare_kobo'] as number, paymentMethod: b['payment_method'] as string | undefined }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
okadaKekeRoutes.get('/:id/trips', async (c) => { const auth = c.get('auth') as { tenantId: string }; const trips = await new OkadaKekeRepository(c.env.DB).listTrips(c.req.param('id'), auth.tenantId); return c.json({ trips, count: trips.length }); });
