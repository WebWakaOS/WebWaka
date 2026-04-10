import { Hono } from 'hono';
import { PlumbingSuppliesRepository, isValidPlumbingSuppliesTransition } from '@webwaka/verticals-plumbing-supplies';
import type { PlumbingSuppliesFSMState } from '@webwaka/verticals-plumbing-supplies';
import type { Env } from '../../env.js';
export const plumbingSuppliesRoutes = new Hono<{ Bindings: Env }>();
plumbingSuppliesRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!b['workspace_id'] || !b['business_name']) return c.json({ error: 'workspace_id, business_name required' }, 400);
  return c.json({ plumbing_supplies: await new PlumbingSuppliesRepository(c.env.DB).createProfile({ workspaceId: b['workspace_id'] as string, tenantId: auth.tenantId, businessName: b['business_name'] as string, sonCert: b['son_cert'] as string | undefined, cacRc: b['cac_rc'] as string | undefined }) }, 201);
});
plumbingSuppliesRoutes.get('/workspace/:workspaceId', async (c) => { const auth = c.get('auth') as { tenantId: string }; return c.json({ plumbing_supplies: await new PlumbingSuppliesRepository(c.env.DB).findProfileByWorkspace(c.req.param('workspaceId'), auth.tenantId) }); });
plumbingSuppliesRoutes.get('/:id', async (c) => { const auth = c.get('auth') as { tenantId: string }; const p = await new PlumbingSuppliesRepository(c.env.DB).findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404); return c.json({ plumbing_supplies: p }); });
plumbingSuppliesRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new PlumbingSuppliesRepository(c.env.DB); const p = await repo.findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404);
  const to = b['status'] as PlumbingSuppliesFSMState; if (!isValidPlumbingSuppliesTransition(p.status, to)) return c.json({ error: `Invalid FSM transition ${p.status} → ${to}` }, 422);
  return c.json({ plumbing_supplies: await repo.transitionStatus(c.req.param('id'), auth.tenantId, to) });
});
plumbingSuppliesRoutes.post('/:id/inventory', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ item: await new PlumbingSuppliesRepository(c.env.DB).addInventory(c.req.param('id'), auth.tenantId, { productName: b['product_name'] as string, productCode: b['sku'] as string | undefined, materialType: b['category'] as string | undefined, sizeMm: b['size_mm'] as number ?? 0, qtyInStock: b['quantity_in_stock'] as number ?? 0, costPriceKobo: b['unit_cost_kobo'] as number, retailPriceKobo: b['retail_price_kobo'] as number, reorderLevel: b['reorder_level'] as number | undefined }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
plumbingSuppliesRoutes.get('/:id/inventory', async (c) => { const auth = c.get('auth') as { tenantId: string }; const items = await new PlumbingSuppliesRepository(c.env.DB).listInventory(c.req.param('id'), auth.tenantId); return c.json({ inventory: items, count: items.length }); });
plumbingSuppliesRoutes.post('/:id/orders', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ order: await new PlumbingSuppliesRepository(c.env.DB).createOrder(c.req.param('id'), auth.tenantId, { clientRefId: b['customer_ref_id'] as string, items: b['items'] as string, totalKobo: b['total_kobo'] as number, orderDate: b['order_date'] as number, isBulk: b['is_wholesale'] as boolean | undefined, deliveryDate: b['delivery_date'] as number | undefined }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
plumbingSuppliesRoutes.get('/:id/orders', async (c) => { const auth = c.get('auth') as { tenantId: string }; const orders = await new PlumbingSuppliesRepository(c.env.DB).listOrders(c.req.param('id'), auth.tenantId); return c.json({ orders, count: orders.length }); });
