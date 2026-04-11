import { Hono } from 'hono';
import { PaintsDistributorRepository, isValidPaintsDistributorTransition } from '@webwaka/verticals-paints-distributor';
import type { PaintsDistributorFSMState } from '@webwaka/verticals-paints-distributor';
import type { Env } from '../../env.js';
export const paintsDistributorRoutes = new Hono<{ Bindings: Env }>();
paintsDistributorRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!b['workspace_id'] || !b['business_name']) return c.json({ error: 'workspace_id, business_name required' }, 400);
  return c.json({ paints_distributor: await new PaintsDistributorRepository(c.env.DB).createProfile({ workspaceId: b['workspace_id'] as string, tenantId: auth.tenantId, businessName: b['business_name'] as string, sonCert: b['son_cert'] as string | undefined, nafdacRef: b['nafdac_reg'] as string | undefined, cacRc: b['cac_rc'] as string | undefined }) }, 201);
});
paintsDistributorRoutes.get('/workspace/:workspaceId', async (c) => { const auth = c.get('auth') as { tenantId: string }; return c.json({ paints_distributor: await new PaintsDistributorRepository(c.env.DB).findProfileByWorkspace(c.req.param('workspaceId'), auth.tenantId) }); });
paintsDistributorRoutes.get('/:id', async (c) => { const auth = c.get('auth') as { tenantId: string }; const p = await new PaintsDistributorRepository(c.env.DB).findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404); return c.json({ paints_distributor: p }); });
paintsDistributorRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new PaintsDistributorRepository(c.env.DB); const p = await repo.findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404);
  const to = b['status'] as PaintsDistributorFSMState; if (!isValidPaintsDistributorTransition(p.status, to)) return c.json({ error: `Invalid FSM transition ${p.status} → ${to}` }, 422);
  return c.json({ paints_distributor: await repo.transitionStatus(c.req.param('id'), auth.tenantId, to) });
});
paintsDistributorRoutes.post('/:id/inventory', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ item: await new PaintsDistributorRepository(c.env.DB).addInventory(c.req.param('id'), auth.tenantId, { brandName: b['product_name'] as string, colourCode: b['colour'] as string | undefined, finishType: b['product_type'] as string | undefined, containerLitresX100: b['container_litres_x100'] as number ?? 0, qtyInStock: b['quantity_in_stock'] as number ?? 0, costPriceKobo: b['unit_cost_kobo'] as number, retailPriceKobo: b['retail_price_kobo'] as number, reorderLevel: b['reorder_level'] as number | undefined }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
paintsDistributorRoutes.get('/:id/inventory', async (c) => { const auth = c.get('auth') as { tenantId: string }; const items = await new PaintsDistributorRepository(c.env.DB).listInventory(c.req.param('id'), auth.tenantId); return c.json({ inventory: items, count: items.length }); });
paintsDistributorRoutes.post('/:id/orders', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ order: await new PaintsDistributorRepository(c.env.DB).createOrder(c.req.param('id'), auth.tenantId, { clientRefId: b['customer_ref_id'] as string, items: b['items'] as string, totalKobo: b['total_kobo'] as number, orderDate: b['order_date'] as number, isBulk: b['is_wholesale'] as boolean | undefined, deliveryDate: b['delivery_date'] as number | undefined }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
paintsDistributorRoutes.get('/:id/orders', async (c) => { const auth = c.get('auth') as { tenantId: string }; const orders = await new PaintsDistributorRepository(c.env.DB).listOrders(c.req.param('id'), auth.tenantId); return c.json({ orders, count: orders.length }); });
