import { Hono } from 'hono';
import { IronSteelRepository, isValidIronSteelTransition } from '@webwaka/verticals-iron-steel';
import type { IronSteelFSMState } from '@webwaka/verticals-iron-steel';
import type { Env } from '../../env.js';
export const ironSteelRoutes = new Hono<{ Bindings: Env }>();
ironSteelRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!b['workspace_id'] || !b['business_name']) return c.json({ error: 'workspace_id, business_name required' }, 400);
  return c.json({ iron_steel: await new IronSteelRepository(c.env.DB).createProfile({ workspaceId: b['workspace_id'] as string, tenantId: auth.tenantId, businessName: b['business_name'] as string, cisaMembership: b['cisa_membership'] as string | undefined, manilaMembership: b['manila_membership'] as string | undefined, cacRc: b['cac_rc'] as string | undefined }) }, 201);
});
ironSteelRoutes.get('/workspace/:workspaceId', async (c) => { const auth = c.get('auth') as { tenantId: string }; return c.json({ iron_steel: await new IronSteelRepository(c.env.DB).findProfileByWorkspace(c.req.param('workspaceId'), auth.tenantId) }); });
ironSteelRoutes.get('/:id', async (c) => { const auth = c.get('auth') as { tenantId: string }; const p = await new IronSteelRepository(c.env.DB).findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404); return c.json({ iron_steel: p }); });
ironSteelRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new IronSteelRepository(c.env.DB); const p = await repo.findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404);
  const to = b['status'] as IronSteelFSMState; if (!isValidIronSteelTransition(p.status, to)) return c.json({ error: `Invalid FSM transition ${p.status} → ${to}` }, 422);
  return c.json({ iron_steel: await repo.transitionStatus(c.req.param('id'), auth.tenantId, to) });
});
ironSteelRoutes.post('/:id/inventory', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ item: await new IronSteelRepository(c.env.DB).addInventory(c.req.param('id'), auth.tenantId, { productName: b['product_name'] as string, productCode: b['product_code'] as string | undefined, grade: b['grade'] as string | undefined, thicknessMmX10: b['thickness_mm_x10'] as number, widthMm: b['width_mm'] as number, lengthMm: b['length_mm'] as number, weightGramsPerMeter: b['weight_grams_per_meter'] as number, qtyInStock: b['qty_in_stock'] as number ?? 0, unitCostKobo: b['unit_cost_kobo'] as number, retailPriceKobo: b['retail_price_kobo'] as number, reorderLevel: b['reorder_level'] as number | undefined }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
ironSteelRoutes.get('/:id/inventory', async (c) => { const auth = c.get('auth') as { tenantId: string }; const items = await new IronSteelRepository(c.env.DB).listInventory(c.req.param('id'), auth.tenantId); return c.json({ inventory: items, count: items.length }); });
ironSteelRoutes.post('/:id/orders', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ order: await new IronSteelRepository(c.env.DB).createOrder(c.req.param('id'), auth.tenantId, { clientRefId: b['client_ref_id'] as string, items: b['items'] as string, totalKobo: b['total_kobo'] as number, orderDate: b['order_date'] as number, isBulk: b['is_bulk'] as boolean | undefined, deliveryDate: b['delivery_date'] as number | undefined }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
ironSteelRoutes.get('/:id/orders', async (c) => { const auth = c.get('auth') as { tenantId: string }; const orders = await new IronSteelRepository(c.env.DB).listOrders(c.req.param('id'), auth.tenantId); return c.json({ orders, count: orders.length }); });
