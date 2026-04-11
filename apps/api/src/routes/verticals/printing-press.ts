import { Hono } from 'hono';
import { PrintingPressRepository, isValidPrintingPressTransition } from '@webwaka/verticals-printing-press';
import type { PrintingPressFSMState } from '@webwaka/verticals-printing-press';
import type { Env } from '../../env.js';
export const printingPressRoutes = new Hono<{ Bindings: Env }>();
printingPressRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!b['workspace_id'] || !b['business_name']) return c.json({ error: 'workspace_id, business_name required' }, 400);
  return c.json({ printing_press: await new PrintingPressRepository(c.env.DB).createProfile({ workspaceId: b['workspace_id'] as string, tenantId: auth.tenantId, businessName: b['business_name'] as string, cacRc: b['cac_rc'] as string | undefined, ncpnMembership: b['ncpn_membership'] as string | undefined, printType: b['print_type'] as string | undefined }) }, 201);
});
printingPressRoutes.get('/workspace/:workspaceId', async (c) => { const auth = c.get('auth') as { tenantId: string }; return c.json({ printing_press: await new PrintingPressRepository(c.env.DB).findProfileByWorkspace(c.req.param('workspaceId'), auth.tenantId) }); });
printingPressRoutes.get('/:id', async (c) => { const auth = c.get('auth') as { tenantId: string }; const p = await new PrintingPressRepository(c.env.DB).findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404); return c.json({ printing_press: p }); });
printingPressRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new PrintingPressRepository(c.env.DB); const p = await repo.findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404);
  const to = b['status'] as PrintingPressFSMState; if (!isValidPrintingPressTransition(p.status, to)) return c.json({ error: `Invalid FSM transition ${p.status} → ${to}` }, 422);
  return c.json({ printing_press: await repo.transitionStatus(c.req.param('id'), auth.tenantId, to) });
});
printingPressRoutes.post('/:id/jobs', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ job: await new PrintingPressRepository(c.env.DB).createJob(c.req.param('id'), auth.tenantId, { clientRefId: b['client_ref_id'] as string, jobType: b['job_type'] as string, quantity: b['quantity'] as number ?? 1, descriptionSpec: b['description_spec'] as string | undefined, setupCostKobo: b['setup_cost_kobo'] as number ?? 0, printCostKobo: b['print_cost_kobo'] as number ?? 0, totalKobo: b['total_kobo'] as number, depositKobo: b['deposit_kobo'] as number | undefined, jobDate: b['job_date'] as number, deliveryDate: b['delivery_date'] as number | undefined }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
printingPressRoutes.get('/:id/jobs', async (c) => { const auth = c.get('auth') as { tenantId: string }; const jobs = await new PrintingPressRepository(c.env.DB).listJobs(c.req.param('id'), auth.tenantId); return c.json({ jobs, count: jobs.length }); });
printingPressRoutes.post('/:id/inventory', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ item: await new PrintingPressRepository(c.env.DB).addInventory(c.req.param('id'), auth.tenantId, { materialName: b['material_name'] as string, unit: b['unit'] as string | undefined, qtyInStock: b['quantity_in_stock'] as number ?? 0, unitCostKobo: b['unit_cost_kobo'] as number, reorderLevel: b['reorder_level'] as number | undefined }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
printingPressRoutes.get('/:id/inventory', async (c) => { const auth = c.get('auth') as { tenantId: string }; const items = await new PrintingPressRepository(c.env.DB).listInventory(c.req.param('id'), auth.tenantId); return c.json({ inventory: items, count: items.length }); });
