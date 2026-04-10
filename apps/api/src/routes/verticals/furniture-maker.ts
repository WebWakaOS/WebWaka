import { Hono } from 'hono';
import { FurnitureMakerRepository, isValidFurnitureMakerTransition } from '@webwaka/verticals-furniture-maker';
import type { FurnitureMakerFSMState } from '@webwaka/verticals-furniture-maker';
import type { Env } from '../../env.js';
export const furnitureMakerRoutes = new Hono<{ Bindings: Env }>();
furnitureMakerRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!b['workspace_id'] || !b['business_name']) return c.json({ error: 'workspace_id, business_name required' }, 400);
  return c.json({ furniture_maker: await new FurnitureMakerRepository(c.env.DB).createProfile({ workspaceId: b['workspace_id'] as string, tenantId: auth.tenantId, businessName: b['business_name'] as string, cacRc: b['cac_rc'] as string | undefined, sonCert: b['son_cert'] as string | undefined, workshopType: b['workshop_type'] as string | undefined, state: b['state'] as string | undefined, lga: b['lga'] as string | undefined }) }, 201);
});
furnitureMakerRoutes.get('/workspace/:workspaceId', async (c) => { const auth = c.get('auth') as { tenantId: string }; return c.json({ furniture_maker: await new FurnitureMakerRepository(c.env.DB).findProfileByWorkspace(c.req.param('workspaceId'), auth.tenantId) }); });
furnitureMakerRoutes.get('/:id', async (c) => { const auth = c.get('auth') as { tenantId: string }; const p = await new FurnitureMakerRepository(c.env.DB).findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404); return c.json({ furniture_maker: p }); });
furnitureMakerRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new FurnitureMakerRepository(c.env.DB); const p = await repo.findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404);
  const to = b['status'] as FurnitureMakerFSMState; if (!isValidFurnitureMakerTransition(p.status, to)) return c.json({ error: `Invalid FSM transition ${p.status} → ${to}` }, 422);
  return c.json({ furniture_maker: await repo.transitionStatus(c.req.param('id'), auth.tenantId, to, { cacRc: b['cac_rc'] as string | undefined }) });
});
furnitureMakerRoutes.post('/:id/orders', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ order: await new FurnitureMakerRepository(c.env.DB).createOrder(c.req.param('id'), auth.tenantId, { clientRefId: b['client_ref_id'] as string, itemType: b['item_type'] as string, quantity: b['quantity'] as number ?? 1, unitPriceKobo: b['unit_price_kobo'] as number, totalKobo: b['total_kobo'] as number, depositKobo: b['deposit_kobo'] as number | undefined, deliveryDate: b['delivery_date'] as number | undefined }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
furnitureMakerRoutes.get('/:id/orders', async (c) => { const auth = c.get('auth') as { tenantId: string }; const orders = await new FurnitureMakerRepository(c.env.DB).listOrders(c.req.param('id'), auth.tenantId); return c.json({ orders, count: orders.length }); });
furnitureMakerRoutes.post('/:id/inventory', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ item: await new FurnitureMakerRepository(c.env.DB).addMaterialInventory(c.req.param('id'), auth.tenantId, { materialName: b['material_name'] as string, unit: b['unit'] as string | undefined, quantityInStock: b['quantity_in_stock'] as number ?? 0, unitCostKobo: b['unit_cost_kobo'] as number, reorderLevel: b['reorder_level'] as number | undefined, supplier: b['supplier'] as string | undefined }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
furnitureMakerRoutes.get('/:id/inventory', async (c) => { const auth = c.get('auth') as { tenantId: string }; const items = await new FurnitureMakerRepository(c.env.DB).listMaterialInventory(c.req.param('id'), auth.tenantId); return c.json({ inventory: items, count: items.length }); });
