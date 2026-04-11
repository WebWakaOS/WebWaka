import { Hono } from 'hono';
import { LaundryServiceRepository, isValidLaundryServiceTransition } from '@webwaka/verticals-laundry-service';
import type { LaundryServiceFSMState } from '@webwaka/verticals-laundry-service';
import type { Env } from '../../env.js';
export const laundryServiceRoutes = new Hono<{ Bindings: Env }>();
laundryServiceRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!b['workspace_id'] || !b['business_name']) return c.json({ error: 'workspace_id, business_name required' }, 400);
  return c.json({ laundry_service: await new LaundryServiceRepository(c.env.DB).createProfile({ workspaceId: b['workspace_id'] as string, tenantId: auth.tenantId, businessName: b['business_name'] as string, cacRc: b['cac_rc'] as string | undefined, serviceArea: b['service_area'] as string | undefined }) }, 201);
});
laundryServiceRoutes.get('/workspace/:workspaceId', async (c) => { const auth = c.get('auth') as { tenantId: string }; return c.json({ laundry_service: await new LaundryServiceRepository(c.env.DB).findProfileByWorkspace(c.req.param('workspaceId'), auth.tenantId) }); });
laundryServiceRoutes.get('/:id', async (c) => { const auth = c.get('auth') as { tenantId: string }; const p = await new LaundryServiceRepository(c.env.DB).findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404); return c.json({ laundry_service: p }); });
laundryServiceRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new LaundryServiceRepository(c.env.DB); const p = await repo.findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404);
  const to = b['status'] as LaundryServiceFSMState; if (!isValidLaundryServiceTransition(p.status, to)) return c.json({ error: `Invalid FSM transition ${p.status} → ${to}` }, 422);
  return c.json({ laundry_service: await repo.transitionStatus(c.req.param('id'), auth.tenantId, to) });
});
laundryServiceRoutes.post('/:id/orders', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ order: await new LaundryServiceRepository(c.env.DB).createOrder(c.req.param('id'), auth.tenantId, { customerRefId: b['customer_ref_id'] as string, itemCount: b['item_count'] as number ?? 0, itemTypes: b['item_types'] as string | undefined, totalKobo: b['total_kobo'] as number, pickupDate: b['pickup_date'] as number | undefined, expressService: b['express_service'] as boolean | undefined }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
laundryServiceRoutes.get('/:id/orders', async (c) => { const auth = c.get('auth') as { tenantId: string }; const orders = await new LaundryServiceRepository(c.env.DB).listOrders(c.req.param('id'), auth.tenantId); return c.json({ orders, count: orders.length }); });
laundryServiceRoutes.post('/:id/routes', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  return c.json({ route: await new LaundryServiceRepository(c.env.DB).addRoute(c.req.param('id'), auth.tenantId, { routeName: b['route_name'] as string, coverageAreas: b['coverage_areas'] as string, pickupDays: b['pickup_days'] as string | undefined }) }, 201);
});
