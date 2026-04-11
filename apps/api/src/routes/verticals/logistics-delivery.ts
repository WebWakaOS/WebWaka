import { Hono } from 'hono';
import { LogisticsDeliveryRepository, isValidLogisticsDeliveryTransition } from '@webwaka/verticals-logistics-delivery';
import type { LogisticsDeliveryFSMState } from '@webwaka/verticals-logistics-delivery';
import type { Env } from '../../env.js';

export const logisticsDeliveryRoutes = new Hono<{ Bindings: Env }>();

logisticsDeliveryRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!b['workspace_id'] || !b['business_name']) return c.json({ error: 'workspace_id, business_name required' }, 400);
  const repo = new LogisticsDeliveryRepository(c.env.DB);
  const profile = await repo.createProfile({ workspaceId: b['workspace_id'] as string, tenantId: auth.tenantId, businessName: b['business_name'] as string, frscCert: b['frsc_cert'] as string | undefined, cacRc: b['cac_rc'] as string | undefined, serviceType: b['service_type'] as unknown as import('@webwaka/verticals-logistics-delivery').ServiceType | undefined });
  return c.json({ logistics_delivery: profile }, 201);
});
logisticsDeliveryRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const repo = new LogisticsDeliveryRepository(c.env.DB);
  return c.json({ logistics_delivery: await repo.findProfileByWorkspace(c.req.param('workspaceId'), auth.tenantId) });
});
logisticsDeliveryRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const repo = new LogisticsDeliveryRepository(c.env.DB);
  const profile = await repo.findProfileById(c.req.param('id'), auth.tenantId);
  if (!profile) return c.json({ error: 'Not found' }, 404);
  return c.json({ logistics_delivery: profile });
});
logisticsDeliveryRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new LogisticsDeliveryRepository(c.env.DB);
  const profile = await repo.findProfileById(c.req.param('id'), auth.tenantId);
  if (!profile) return c.json({ error: 'Not found' }, 404);
  const to = b['status'] as LogisticsDeliveryFSMState;
  if (!isValidLogisticsDeliveryTransition(profile.status, to)) return c.json({ error: `Invalid FSM transition ${profile.status} → ${to}` }, 422);
  return c.json({ logistics_delivery: await repo.transitionStatus(c.req.param('id'), auth.tenantId, to, { frscCert: b['frsc_cert'] as string | undefined }) });
});
logisticsDeliveryRoutes.post('/:id/orders', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new LogisticsDeliveryRepository(c.env.DB);
  try {
    const order = await repo.createOrder(c.req.param('id'), auth.tenantId, { senderRefId: b['sender_ref_id'] as string, recipientRefId: b['recipient_ref_id'] as string, pickupAddress: b['pickup_address'] as string, deliveryAddress: b['delivery_address'] as string, packageType: b['package_type'] as string | undefined, weightGrams: b['weight_grams'] as number, declaredValueKobo: b['declared_value_kobo'] as number, deliveryFeeKobo: b['delivery_fee_kobo'] as number, pickupDate: b['pickup_date'] as number | undefined });
    return c.json({ order }, 201);
  } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
logisticsDeliveryRoutes.get('/:id/orders', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const repo = new LogisticsDeliveryRepository(c.env.DB);
  const orders = await repo.listOrders(c.req.param('id'), auth.tenantId);
  return c.json({ orders, count: orders.length });
});
logisticsDeliveryRoutes.post('/:id/fleet', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new LogisticsDeliveryRepository(c.env.DB);
  const vehicle = await repo.createFleetVehicle(c.req.param('id'), auth.tenantId, { vehicleType: b['vehicle_type'] as string, plateNumber: b['plate_number'] as string, capacityKgX100: b['capacity_kg_x100'] as number, driverRefId: b['driver_ref_id'] as string | undefined });
  return c.json({ vehicle }, 201);
});
logisticsDeliveryRoutes.get('/:id/fleet', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const repo = new LogisticsDeliveryRepository(c.env.DB);
  const fleet = await repo.listFleet(c.req.param('id'), auth.tenantId);
  return c.json({ fleet, count: fleet.length });
});
