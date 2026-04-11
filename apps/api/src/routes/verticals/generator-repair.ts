import { Hono } from 'hono';
import { GeneratorRepairRepository, isValidGeneratorRepairTransition } from '@webwaka/verticals-generator-repair';
import type { GeneratorRepairFSMState } from '@webwaka/verticals-generator-repair';
import type { Env } from '../../env.js';
export const generatorRepairRoutes = new Hono<{ Bindings: Env }>();
generatorRepairRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!b['workspace_id'] || !b['business_name']) return c.json({ error: 'workspace_id, business_name required' }, 400);
  return c.json({ generator_repair: await new GeneratorRepairRepository(c.env.DB).createProfile({ workspaceId: b['workspace_id'] as string, tenantId: auth.tenantId, businessName: b['business_name'] as string, cacRc: b['cac_rc'] as string | undefined, sonCert: b['son_cert'] as string | undefined, corenAwareness: b['coren_awareness'] as string | undefined, serviceType: b['service_type'] as string | undefined }) }, 201);
});
generatorRepairRoutes.get('/workspace/:workspaceId', async (c) => { const auth = c.get('auth') as { tenantId: string }; return c.json({ generator_repair: await new GeneratorRepairRepository(c.env.DB).findProfileByWorkspace(c.req.param('workspaceId'), auth.tenantId) }); });
generatorRepairRoutes.get('/:id', async (c) => { const auth = c.get('auth') as { tenantId: string }; const p = await new GeneratorRepairRepository(c.env.DB).findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404); return c.json({ generator_repair: p }); });
generatorRepairRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new GeneratorRepairRepository(c.env.DB); const p = await repo.findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404);
  const to = b['status'] as GeneratorRepairFSMState; if (!isValidGeneratorRepairTransition(p.status, to)) return c.json({ error: `Invalid FSM transition ${p.status} → ${to}` }, 422);
  return c.json({ generator_repair: await repo.transitionStatus(c.req.param('id'), auth.tenantId, to, { cacRc: b['cac_rc'] as string | undefined }) });
});
generatorRepairRoutes.post('/:id/jobs', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ job: await new GeneratorRepairRepository(c.env.DB).createJob(c.req.param('id'), auth.tenantId, { customerRefId: b['customer_ref_id'] as string, equipmentType: b['equipment_type'] as string, brand: b['brand'] as string | undefined, serialNumber: b['serial_number'] as string | undefined, faultCategory: b['fault_category'] as string | undefined, labourCostKobo: b['labour_cost_kobo'] as number ?? 0, partsCostKobo: b['parts_cost_kobo'] as number ?? 0, totalCostKobo: b['total_cost_kobo'] as number, jobDate: b['job_date'] as number, warrantyDays: b['warranty_days'] as number | undefined }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
generatorRepairRoutes.get('/:id/jobs', async (c) => { const auth = c.get('auth') as { tenantId: string }; const jobs = await new GeneratorRepairRepository(c.env.DB).listJobs(c.req.param('id'), auth.tenantId); return c.json({ jobs, count: jobs.length }); });
generatorRepairRoutes.post('/:id/parts', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ part: await new GeneratorRepairRepository(c.env.DB).addPart(c.req.param('id'), auth.tenantId, { partName: b['part_name'] as string, brandCompatible: b['brand_compatible'] as string | undefined, quantityInStock: b['quantity_in_stock'] as number ?? 0, unitCostKobo: b['unit_cost_kobo'] as number, reorderLevel: b['reorder_level'] as number | undefined }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
generatorRepairRoutes.get('/:id/parts', async (c) => { const auth = c.get('auth') as { tenantId: string }; const parts = await new GeneratorRepairRepository(c.env.DB).listParts(c.req.param('id'), auth.tenantId); return c.json({ parts, count: parts.length }); });
