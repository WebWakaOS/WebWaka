/**
 * Transport vertical routes — M8c
 *
 * POST   /transport/motor-park                  — Create motor park
 * GET    /transport/motor-park/:id              — Get motor park (T3)
 * PATCH  /transport/motor-park/:id              — Update motor park
 * POST   /transport/motor-park/:id/transition   — FSM transition
 * GET    /transport/motor-park/workspace/:wid   — List by workspace
 *
 * POST   /transport/routes                      — Create transport route
 * GET    /transport/routes/:id                  — Get route
 * PATCH  /transport/routes/:id                  — Update route
 * POST   /transport/routes/:id/license          — License a route
 *
 * POST   /transport/vehicles                    — Register vehicle
 * GET    /transport/vehicles/:id                — Get vehicle
 * PATCH  /transport/vehicles/:id                — Update vehicle
 * GET    /transport/vehicles/route/:routeId     — List by route
 *
 * POST   /transport/transit                     — Create transit operator
 * GET    /transport/transit/:id                 — Get transit operator
 * PATCH  /transport/transit/:id                 — Update
 * POST   /transport/transit/:id/transition      — FSM transition
 *
 * POST   /transport/rideshare                   — Create rideshare driver
 * GET    /transport/rideshare/:id               — Get rideshare driver
 * PATCH  /transport/rideshare/:id               — Update
 * POST   /transport/rideshare/:id/transition    — FSM transition
 *
 * POST   /transport/haulage                     — Create haulage operator (scaffold)
 * POST   /transport/rtu                         — Create RTU (scaffold)
 * POST   /transport/okada-keke                  — Create okada/keke co-op (scaffold)
 *
 * Platform Invariants: T3, P9, P12
 */

import { Hono } from 'hono';
import { MotorParkRepository, RouteRepository, VehicleRepository } from '@webwaka/verticals-motor-park';
import { TransitRepository } from '@webwaka/verticals-transit';
import { RideshareRepository } from '@webwaka/verticals-rideshare';
import { HaulageRepository } from '@webwaka/verticals-haulage';
import { RtuRepository } from '@webwaka/verticals-road-transport-union';
import { OkadaKekeRepository } from '@webwaka/verticals-okada-keke';
import type {
  ParkFSMState, UpdateParkInput,
  RouteType, VehicleType,
} from '@webwaka/verticals-motor-park';
import type { TransitFSMState } from '@webwaka/verticals-transit';
import type { RideshareFSMState } from '@webwaka/verticals-rideshare';
import type { Env } from '../env.js';
import { publishEvent } from '../lib/publish-event.js';
import { TransportEventType } from '@webwaka/events';

export const transportRoutes = new Hono<{ Bindings: Env }>();

// ── Motor Park ──────────────────────────────────────────────────────────────

transportRoutes.post('/motor-park', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.park_name || !body.lga || !body.state) {
    return c.json({ error: 'workspace_id, park_name, lga, state required' }, 400);
  }
  const repo = new MotorParkRepository(c.env.DB);
  const park = await repo.create({
    workspaceId: body.workspace_id as string,
    tenantId: auth.tenantId,
    parkName: body.park_name as string,
    lga: body.lga as string,
    state: body.state as string,
    ...(body.capacity !== undefined ? { capacity: Number(body.capacity) } : {}),
    ...(body.place_id !== undefined ? { placeId: body.place_id as string } : {}),
  });
  return c.json({ motor_park: park }, 201);
});

transportRoutes.get('/motor-park/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  const repo = new MotorParkRepository(c.env.DB);
  const parks = await repo.findByWorkspace(c.req.param('workspaceId'), auth.tenantId);
  return c.json({ motor_parks: parks });
});

transportRoutes.get('/motor-park/:id', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  const repo = new MotorParkRepository(c.env.DB);
  const park = await repo.findById(c.req.param('id'), auth.tenantId);
  if (!park) return c.json({ error: 'Not found' }, 404);
  return c.json({ motor_park: park });
});

transportRoutes.patch('/motor-park/:id', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new MotorParkRepository(c.env.DB);
  const input: UpdateParkInput = {
    ...(body.park_name !== undefined ? { parkName: body.park_name as string } : {}),
    ...(body.lga !== undefined ? { lga: body.lga as string } : {}),
    ...(body.state !== undefined ? { state: body.state as string } : {}),
    ...('frsc_operator_ref' in body ? { frscOperatorRef: (body.frsc_operator_ref as string | null) } : {}),
    ...('nurtw_ref' in body ? { nurtwRef: (body.nurtw_ref as string | null) } : {}),
    ...('capacity' in body ? { capacity: body.capacity != null ? Number(body.capacity) : null } : {}),
  };
  const park = await repo.update(c.req.param('id'), auth.tenantId, input);
  if (!park) return c.json({ error: 'Not found' }, 404);
  return c.json({ motor_park: park });
});

transportRoutes.post('/motor-park/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string; userId?: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.status) return c.json({ error: 'status required' }, 400);
  const repo = new MotorParkRepository(c.env.DB);
  const park = await repo.transition(c.req.param('id'), auth.tenantId, body.status as ParkFSMState);
  if (!park) return c.json({ error: 'Not found or transition failed' }, 404);
  // N-095: transport FSM event — map park status to canonical transport event
  const parkStatus = body.status as string;
  if (parkStatus === 'active') {
    void publishEvent(c.env, {
      eventId: crypto.randomUUID(),
      eventKey: TransportEventType.TransportBookingConfirmed,
      tenantId: auth.tenantId,
      actorId: auth.userId ?? 'system',
      actorType: 'user',
      payload: { entity_type: 'motor_park', entity_id: c.req.param('id'), status: parkStatus },
      source: 'api',
      severity: 'info',
    });
  }
  return c.json({ motor_park: park });
});

// ── Transport Routes ────────────────────────────────────────────────────────

transportRoutes.post('/routes', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.route_name || !body.route_type) {
    return c.json({ error: 'workspace_id, route_name, route_type required' }, 400);
  }
  const repo = new RouteRepository(c.env.DB);
  const route = await repo.create({
    workspaceId: body.workspace_id as string,
    tenantId: auth.tenantId,
    routeName: body.route_name as string,
    routeType: body.route_type as RouteType,
    ...(body.origin_place_id !== undefined ? { originPlaceId: body.origin_place_id as string } : {}),
    ...(body.dest_place_id !== undefined ? { destPlaceId: body.dest_place_id as string } : {}),
    ...(body.fare_kobo !== undefined ? { fareKobo: Number(body.fare_kobo) } : {}),
    ...(body.frequency_mins !== undefined ? { frequencyMins: Number(body.frequency_mins) } : {}),
  });
  return c.json({ route }, 201);
});

transportRoutes.get('/routes/:id', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  const repo = new RouteRepository(c.env.DB);
  const route = await repo.findById(c.req.param('id'), auth.tenantId);
  if (!route) return c.json({ error: 'Not found' }, 404);
  return c.json({ route });
});

transportRoutes.post('/routes/:id/license', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.license_ref || !body.license_expires) return c.json({ error: 'license_ref, license_expires required' }, 400);
  const repo = new RouteRepository(c.env.DB);
  const route = await repo.licenseRoute(c.req.param('id'), auth.tenantId, body.license_ref as string, Number(body.license_expires));
  if (!route) return c.json({ error: 'Not found' }, 404);
  return c.json({ route });
});

// ── Vehicles ────────────────────────────────────────────────────────────────

transportRoutes.post('/vehicles', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.plate_number || !body.vehicle_type) {
    return c.json({ error: 'workspace_id, plate_number, vehicle_type required' }, 400);
  }
  const repo = new VehicleRepository(c.env.DB);
  const vehicle = await repo.create({
    workspaceId: body.workspace_id as string,
    tenantId: auth.tenantId,
    plateNumber: body.plate_number as string,
    vehicleType: body.vehicle_type as VehicleType,
    ...(body.route_id !== undefined ? { routeId: body.route_id as string } : {}),
    ...(body.capacity !== undefined ? { capacity: Number(body.capacity) } : {}),
  });
  return c.json({ vehicle }, 201);
});

transportRoutes.get('/vehicles/route/:routeId', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  const repo = new VehicleRepository(c.env.DB);
  const vehicles = await repo.findByRoute(c.req.param('routeId'), auth.tenantId);
  return c.json({ vehicles });
});

transportRoutes.get('/vehicles/:id', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  const repo = new VehicleRepository(c.env.DB);
  const vehicle = await repo.findById(c.req.param('id'), auth.tenantId);
  if (!vehicle) return c.json({ error: 'Not found' }, 404);
  return c.json({ vehicle });
});

// ── Transit Operators ───────────────────────────────────────────────────────

transportRoutes.post('/transit', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.operator_name) return c.json({ error: 'workspace_id, operator_name required' }, 400);
  const repo = new TransitRepository(c.env.DB);
  const transit = await repo.create({
    workspaceId: body.workspace_id as string,
    tenantId: auth.tenantId,
    operatorName: body.operator_name as string,
    ...(body.cac_reg_number !== undefined ? { cacRegNumber: body.cac_reg_number as string } : {}),
    ...(body.fleet_size !== undefined ? { fleetSize: Number(body.fleet_size) } : {}),
  });
  // N-095: transport.booking_created event (transit operator registered)
  void publishEvent(c.env, {
    eventId: transit.id,
    eventKey: TransportEventType.TransportBookingCreated,
    tenantId: auth.tenantId,
    actorId: (auth as { tenantId: string; userId?: string }).userId ?? 'system',
    actorType: 'user',
    payload: { entity_type: 'transit', entity_id: transit.id, operator_name: body.operator_name as string },
    source: 'api',
    severity: 'info',
  });
  return c.json({ transit }, 201);
});

transportRoutes.get('/transit/:id', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  const repo = new TransitRepository(c.env.DB);
  const transit = await repo.findById(c.req.param('id'), auth.tenantId);
  if (!transit) return c.json({ error: 'Not found' }, 404);
  return c.json({ transit });
});

transportRoutes.post('/transit/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string; userId?: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.status) return c.json({ error: 'status required' }, 400);
  const repo = new TransitRepository(c.env.DB);
  const transit = await repo.transition(c.req.param('id'), auth.tenantId, body.status as TransitFSMState);
  if (!transit) return c.json({ error: 'Not found' }, 404);
  // N-095: transit FSM event
  const transitStatus = body.status as string;
  const transitEventKey =
    transitStatus === 'active' ? TransportEventType.TransportTripStarted :
    transitStatus === 'completed' ? TransportEventType.TransportTripCompleted :
    transitStatus === 'suspended' ? TransportEventType.TransportBookingCancelled : null;
  if (transitEventKey) {
    void publishEvent(c.env, {
      eventId: crypto.randomUUID(),
      eventKey: transitEventKey,
      tenantId: auth.tenantId,
      actorId: auth.userId ?? 'system',
      actorType: 'user',
      payload: { entity_type: 'transit', entity_id: c.req.param('id'), status: transitStatus },
      source: 'api',
      severity: 'info',
    });
  }
  return c.json({ transit });
});

// ── Rideshare Drivers ───────────────────────────────────────────────────────

transportRoutes.post('/rideshare', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.individual_id) return c.json({ error: 'workspace_id, individual_id required' }, 400);
  const repo = new RideshareRepository(c.env.DB);
  const driver = await repo.create({
    individualId: body.individual_id as string,
    workspaceId: body.workspace_id as string,
    tenantId: auth.tenantId,
    ...(body.vehicle_type !== undefined ? { vehicleType: body.vehicle_type as string } : {}),
    ...(body.plate_number !== undefined ? { plateNumber: body.plate_number as string } : {}),
    ...(body.seat_count !== undefined ? { seatCount: Number(body.seat_count) } : {}),
  });
  return c.json({ rideshare: driver }, 201);
});

transportRoutes.get('/rideshare/:id', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  const repo = new RideshareRepository(c.env.DB);
  const driver = await repo.findById(c.req.param('id'), auth.tenantId);
  if (!driver) return c.json({ error: 'Not found' }, 404);
  return c.json({ rideshare: driver });
});

transportRoutes.post('/rideshare/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string; userId?: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.status) return c.json({ error: 'status required' }, 400);
  const repo = new RideshareRepository(c.env.DB);
  const driver = await repo.transition(c.req.param('id'), auth.tenantId, body.status as RideshareFSMState);
  if (!driver) return c.json({ error: 'Not found' }, 404);
  // N-095: rideshare FSM event
  const rideStatus = body.status as string;
  const rideEventKey =
    rideStatus === 'active' ? TransportEventType.TransportBookingConfirmed :
    rideStatus === 'on_trip' ? TransportEventType.TransportTripStarted :
    rideStatus === 'completed' ? TransportEventType.TransportTripCompleted :
    rideStatus === 'suspended' ? TransportEventType.TransportBookingCancelled : null;
  if (rideEventKey) {
    void publishEvent(c.env, {
      eventId: crypto.randomUUID(),
      eventKey: rideEventKey,
      tenantId: auth.tenantId,
      actorId: auth.userId ?? 'system',
      actorType: 'user',
      payload: { entity_type: 'rideshare', entity_id: c.req.param('id'), status: rideStatus },
      source: 'api',
      severity: 'info',
    });
  }
  return c.json({ rideshare: driver });
});

// ── Scaffolds (minimal CRUD) ────────────────────────────────────────────────

transportRoutes.post('/haulage', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id) return c.json({ error: 'workspace_id required' }, 400);
  const repo = new HaulageRepository(c.env.DB);
  const profile = await repo.create({ workspaceId: body.workspace_id as string, tenantId: auth.tenantId });
  return c.json({ haulage: profile }, 201);
});

transportRoutes.post('/rtu', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.union_name) return c.json({ error: 'workspace_id, union_name required' }, 400);
  const repo = new RtuRepository(c.env.DB);
  const profile = await repo.create({ workspaceId: body.workspace_id as string, tenantId: auth.tenantId, unionName: body.union_name as string });
  return c.json({ rtu: profile }, 201);
});

transportRoutes.post('/okada-keke', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.operator_type) return c.json({ error: 'workspace_id, operator_type required' }, 400);
  const repo = new OkadaKekeRepository(c.env.DB);
  const profile = await repo.create({
    workspaceId: body.workspace_id as string,
    tenantId: auth.tenantId,
    operatorType: body.operator_type as 'okada' | 'keke' | 'both',
  });
  return c.json({ okada_keke: profile }, 201);
});
