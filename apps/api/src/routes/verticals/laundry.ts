import { Hono } from 'hono';
import { LaundryRepository, isValidLaundryTransition } from '@webwaka/verticals-laundry';
import type { LaundryFSMState } from '@webwaka/verticals-laundry';
import type { Env } from '../../env.js';
export const laundryRoutes = new Hono<{ Bindings: Env }>();
laundryRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!b['workspace_id'] || !b['business_name']) return c.json({ error: 'workspace_id, business_name required' }, 400);
  return c.json({ laundry: await new LaundryRepository(c.env.DB).createProfile({ workspaceId: b['workspace_id'] as string, tenantId: auth.tenantId, businessName: b['business_name'] as string, cacRc: b['cac_rc'] as string | undefined, serviceType: b['service_type'] as string | undefined }) }, 201);
});
laundryRoutes.get('/workspace/:workspaceId', async (c) => { const auth = c.get('auth') as { tenantId: string }; return c.json({ laundry: await new LaundryRepository(c.env.DB).findProfileByWorkspace(c.req.param('workspaceId'), auth.tenantId) }); });
laundryRoutes.get('/:id', async (c) => { const auth = c.get('auth') as { tenantId: string }; const p = await new LaundryRepository(c.env.DB).findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404); return c.json({ laundry: p }); });
laundryRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new LaundryRepository(c.env.DB); const p = await repo.findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404);
  const to = b['status'] as LaundryFSMState; if (!isValidLaundryTransition(p.status, to)) return c.json({ error: `Invalid FSM transition ${p.status} → ${to}` }, 422);
  return c.json({ laundry: await repo.transitionStatus(c.req.param('id'), auth.tenantId, to) });
});
laundryRoutes.post('/:id/orders', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ order: await new LaundryRepository(c.env.DB).createOrder(c.req.param('id'), auth.tenantId, { customerRefId: b['customer_ref_id'] as string, itemCount: b['item_count'] as number ?? 0, itemTypes: b['item_types'] as string | undefined, totalKobo: b['total_kobo'] as number, pickupDate: b['pickup_date'] as number | undefined, expressService: b['express_service'] as boolean | undefined }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
laundryRoutes.get('/:id/orders', async (c) => { const auth = c.get('auth') as { tenantId: string }; const orders = await new LaundryRepository(c.env.DB).listOrders(c.req.param('id'), auth.tenantId); return c.json({ orders, count: orders.length }); });
laundryRoutes.post('/:id/subscriptions', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ subscription: await new LaundryRepository(c.env.DB).createSubscription(c.req.param('id'), auth.tenantId, { customerRefId: b['customer_ref_id'] as string, plan: b['plan'] as string, monthlyKobo: b['monthly_kobo'] as number, startDate: b['start_date'] as number, endDate: b['end_date'] as number | undefined }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
