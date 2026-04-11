import { Hono } from 'hono';
import { GasDistributorRepository, isValidGasDistributorTransition } from '@webwaka/verticals-gas-distributor';
import type { GasDistributorFSMState } from '@webwaka/verticals-gas-distributor';
import type { Env } from '../../env.js';
export const gasDistributorRoutes = new Hono<{ Bindings: Env }>();
gasDistributorRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!b['workspace_id'] || !b['business_name']) return c.json({ error: 'workspace_id, business_name required' }, 400);
  return c.json({ gas_distributor: await new GasDistributorRepository(c.env.DB).createProfile({ workspaceId: b['workspace_id'] as string, tenantId: auth.tenantId, businessName: b['business_name'] as string, dprDealerLicence: b['dpr_dealer_licence'] as string | undefined, nuprcRef: b['nuprc_ref'] as string | undefined, lpgassocMembership: b['lpgassoc_membership'] as string | undefined, cacRc: b['cac_rc'] as string | undefined }) }, 201);
});
gasDistributorRoutes.get('/workspace/:workspaceId', async (c) => { const auth = c.get('auth') as { tenantId: string }; return c.json({ gas_distributor: await new GasDistributorRepository(c.env.DB).findProfileByWorkspace(c.req.param('workspaceId'), auth.tenantId) }); });
gasDistributorRoutes.get('/:id', async (c) => { const auth = c.get('auth') as { tenantId: string }; const p = await new GasDistributorRepository(c.env.DB).findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404); return c.json({ gas_distributor: p }); });
gasDistributorRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new GasDistributorRepository(c.env.DB); const p = await repo.findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404);
  const to = b['status'] as GasDistributorFSMState; if (!isValidGasDistributorTransition(p.status, to)) return c.json({ error: `Invalid FSM transition ${p.status} → ${to}` }, 422);
  return c.json({ gas_distributor: await repo.transitionStatus(c.req.param('id'), auth.tenantId, to, { dprDealerLicence: b['dpr_dealer_licence'] as string | undefined }) });
});
gasDistributorRoutes.post('/:id/inventory', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ item: await new GasDistributorRepository(c.env.DB).addInventory(c.req.param('id'), auth.tenantId, { cylinderSizeGrams: b['cylinder_size_grams'] as number, stockCount: b['stock_count'] as number ?? 0, refillPriceKobo: b['refill_price_kobo'] as number, bulkPriceKobo: b['bulk_price_kobo'] as number | undefined, reorderLevel: b['reorder_level'] as number | undefined }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
gasDistributorRoutes.get('/:id/inventory', async (c) => { const auth = c.get('auth') as { tenantId: string }; const items = await new GasDistributorRepository(c.env.DB).listInventory(c.req.param('id'), auth.tenantId); return c.json({ inventory: items, count: items.length }); });
gasDistributorRoutes.post('/:id/orders', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ order: await new GasDistributorRepository(c.env.DB).createOrder(c.req.param('id'), auth.tenantId, { customerRefId: b['customer_ref_id'] as string, cylinderSizeGrams: b['cylinder_size_grams'] as number, quantity: b['quantity'] as number, unitPriceKobo: b['unit_price_kobo'] as number, totalKobo: b['total_kobo'] as number, orderDate: b['order_date'] as number, isBulk: b['is_bulk'] as boolean | undefined, deliveryDate: b['delivery_date'] as number | undefined }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
gasDistributorRoutes.get('/:id/orders', async (c) => { const auth = c.get('auth') as { tenantId: string }; const orders = await new GasDistributorRepository(c.env.DB).listOrders(c.req.param('id'), auth.tenantId); return c.json({ orders, count: orders.length }); });
gasDistributorRoutes.post('/:id/safety-log', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  return c.json({ log: await new GasDistributorRepository(c.env.DB).createSafetyLog(c.req.param('id'), auth.tenantId, { inspectionDate: b['inspection_date'] as number, inspectorRef: b['inspector_ref'] as string | undefined, cylindersInspected: b['cylinders_inspected'] as number ?? 0, passed: b['passed'] as boolean ?? false, notes: b['notes'] as string | undefined }) }, 201);
});
