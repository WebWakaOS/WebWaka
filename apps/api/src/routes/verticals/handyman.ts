import { Hono } from 'hono';
import { HandymanRepository, isValidHandymanTransition } from '@webwaka/verticals-handyman';
import type { HandymanFSMState } from '@webwaka/verticals-handyman';
import type { Env } from '../../env.js';

export const handymanRoutes = new Hono<{ Bindings: Env }>();

handymanRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!b['workspace_id'] || !b['business_name']) return c.json({ error: 'workspace_id, business_name required' }, 400);
  const repo = new HandymanRepository(c.env.DB);
  const profile = await repo.createProfile({ workspaceId: b['workspace_id'] as string, tenantId: auth.tenantId, businessName: b['business_name'] as string, tradeType: b['trade_type'] as string | undefined, corenAwareness: b['coren_awareness'] as string | undefined, nabtebCert: b['nabteb_cert'] as string | undefined, cacRc: b['cac_rc'] as string | undefined, state: b['state'] as string | undefined, lga: b['lga'] as string | undefined });
  return c.json({ handyman: profile }, 201);
});
handymanRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const repo = new HandymanRepository(c.env.DB);
  const profile = await repo.findProfileByWorkspace(c.req.param('workspaceId'), auth.tenantId);
  return c.json({ handyman: profile });
});
handymanRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const repo = new HandymanRepository(c.env.DB);
  const profile = await repo.findProfileById(c.req.param('id'), auth.tenantId);
  if (!profile) return c.json({ error: 'Not found' }, 404);
  return c.json({ handyman: profile });
});
handymanRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new HandymanRepository(c.env.DB);
  const profile = await repo.findProfileById(c.req.param('id'), auth.tenantId);
  if (!profile) return c.json({ error: 'Not found' }, 404);
  const to = b['status'] as HandymanFSMState;
  if (!isValidHandymanTransition(profile.status, to)) return c.json({ error: `Invalid FSM transition ${profile.status} → ${to}` }, 422);
  return c.json({ handyman: await repo.transitionStatus(c.req.param('id'), auth.tenantId, to, { cacRc: b['cac_rc'] as string | undefined }) });
});
handymanRoutes.post('/:id/jobs', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!b['client_ref_id'] || !b['job_type'] || b['total_kobo'] === undefined || b['job_date'] === undefined) return c.json({ error: 'client_ref_id, job_type, total_kobo, job_date required' }, 400);
  const repo = new HandymanRepository(c.env.DB);
  try {
    const job = await repo.createJob(c.req.param('id'), auth.tenantId, { clientRefId: b['client_ref_id'] as string, jobType: b['job_type'] as string, description: b['description'] as string | undefined, materialCostKobo: b['material_cost_kobo'] as number ?? 0, labourCostKobo: b['labour_cost_kobo'] as number ?? 0, totalKobo: b['total_kobo'] as number, jobDate: b['job_date'] as number, warrantyDays: b['warranty_days'] as number | undefined });
    return c.json({ job }, 201);
  } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
handymanRoutes.get('/:id/jobs', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const repo = new HandymanRepository(c.env.DB);
  const jobs = await repo.listJobs(c.req.param('id'), auth.tenantId);
  return c.json({ jobs, count: jobs.length });
});
handymanRoutes.post('/:id/materials', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new HandymanRepository(c.env.DB);
  const material = await repo.createMaterial(c.req.param('id'), auth.tenantId, { materialName: b['material_name'] as string, unit: b['unit'] as string | undefined, quantity: b['quantity'] as number ?? 0, unitCostKobo: b['unit_cost_kobo'] as number, reorderLevel: b['reorder_level'] as number | undefined });
  return c.json({ material }, 201);
});
handymanRoutes.get('/:id/materials', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const repo = new HandymanRepository(c.env.DB);
  const materials = await repo.listMaterials(c.req.param('id'), auth.tenantId);
  return c.json({ materials, count: materials.length });
});
