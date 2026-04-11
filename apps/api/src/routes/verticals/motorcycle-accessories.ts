import { Hono } from 'hono';
import { MotorcycleAccessoriesRepository, isValidMotorcycleAccessoriesTransition } from '@webwaka/verticals-motorcycle-accessories';
import type { MotorcycleAccessoriesFSMState } from '@webwaka/verticals-motorcycle-accessories';
import type { Env } from '../../env.js';
export const motorcycleAccessoriesRoutes = new Hono<{ Bindings: Env }>();
motorcycleAccessoriesRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!b['workspace_id'] || !b['business_name']) return c.json({ error: 'workspace_id, business_name required' }, 400);
  return c.json({ motorcycle_accessories: await new MotorcycleAccessoriesRepository(c.env.DB).createProfile({ workspaceId: b['workspace_id'] as string, tenantId: auth.tenantId, businessName: b['business_name'] as string, sonCert: b['son_cert'] as string | undefined, cacRc: b['cac_rc'] as string | undefined }) }, 201);
});
motorcycleAccessoriesRoutes.get('/workspace/:workspaceId', async (c) => { const auth = c.get('auth') as { tenantId: string }; return c.json({ motorcycle_accessories: await new MotorcycleAccessoriesRepository(c.env.DB).findProfileByWorkspace(c.req.param('workspaceId'), auth.tenantId) }); });
motorcycleAccessoriesRoutes.get('/:id', async (c) => { const auth = c.get('auth') as { tenantId: string }; const p = await new MotorcycleAccessoriesRepository(c.env.DB).findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404); return c.json({ motorcycle_accessories: p }); });
motorcycleAccessoriesRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new MotorcycleAccessoriesRepository(c.env.DB); const p = await repo.findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404);
  const to = b['status'] as MotorcycleAccessoriesFSMState; if (!isValidMotorcycleAccessoriesTransition(p.status, to)) return c.json({ error: `Invalid FSM transition ${p.status} → ${to}` }, 422);
  return c.json({ motorcycle_accessories: await repo.transitionStatus(c.req.param('id'), auth.tenantId, to) });
});
motorcycleAccessoriesRoutes.post('/:id/inventory', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ item: await new MotorcycleAccessoriesRepository(c.env.DB).addInventoryItem(c.req.param('id'), auth.tenantId, { partName: b['part_name'] as string, partNumber: b['part_number'] as string | undefined, brand: b['brand'] as string | undefined, category: b['category'] as string | undefined, qtyInStock: b['qty_in_stock'] as number ?? 0, costPriceKobo: b['cost_price_kobo'] as number, retailPriceKobo: b['retail_price_kobo'] as number, wholesalePriceKobo: b['wholesale_price_kobo'] as number | undefined, reorderLevel: b['reorder_level'] as number | undefined }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
motorcycleAccessoriesRoutes.get('/:id/inventory', async (c) => { const auth = c.get('auth') as { tenantId: string }; const items = await new MotorcycleAccessoriesRepository(c.env.DB).listInventory(c.req.param('id'), auth.tenantId); return c.json({ inventory: items, count: items.length }); });
motorcycleAccessoriesRoutes.post('/:id/sales', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ sale: await new MotorcycleAccessoriesRepository(c.env.DB).recordSale(c.req.param('id'), auth.tenantId, { customerRefId: b['customer_ref_id'] as string | undefined, items: b['items'] as string, totalKobo: b['total_kobo'] as number, saleDate: b['sale_date'] as number, isWholesale: b['is_wholesale'] as boolean | undefined }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
motorcycleAccessoriesRoutes.get('/:id/sales', async (c) => { const auth = c.get('auth') as { tenantId: string }; const sales = await new MotorcycleAccessoriesRepository(c.env.DB).listSales(c.req.param('id'), auth.tenantId); return c.json({ sales, count: sales.length }); });
