import { Hono } from 'hono';
import { LandSurveyorRepository, isValidLandSurveyorTransition } from '@webwaka/verticals-land-surveyor';
import type { LandSurveyorFSMState } from '@webwaka/verticals-land-surveyor';
import type { Env } from '../../env.js';
export const landSurveyorRoutes = new Hono<{ Bindings: Env }>();
landSurveyorRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!b['workspace_id'] || !b['business_name']) return c.json({ error: 'workspace_id, business_name required' }, 400);
  return c.json({ land_surveyor: await new LandSurveyorRepository(c.env.DB).createProfile({ workspaceId: b['workspace_id'] as string, tenantId: auth.tenantId, businessName: b['business_name'] as string, surconReg: b['surcon_reg'] as string | undefined, cacRc: b['cac_rc'] as string | undefined, state: b['state'] as string | undefined, lga: b['lga'] as string | undefined }) }, 201);
});
landSurveyorRoutes.get('/workspace/:workspaceId', async (c) => { const auth = c.get('auth') as { tenantId: string }; return c.json({ land_surveyor: await new LandSurveyorRepository(c.env.DB).findProfileByWorkspace(c.req.param('workspaceId'), auth.tenantId) }); });
landSurveyorRoutes.get('/:id', async (c) => { const auth = c.get('auth') as { tenantId: string }; const p = await new LandSurveyorRepository(c.env.DB).findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404); return c.json({ land_surveyor: p }); });
landSurveyorRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new LandSurveyorRepository(c.env.DB); const p = await repo.findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404);
  const to = b['status'] as LandSurveyorFSMState; if (!isValidLandSurveyorTransition(p.status, to)) return c.json({ error: `Invalid FSM transition ${p.status} → ${to}` }, 422);
  return c.json({ land_surveyor: await repo.transitionStatus(c.req.param('id'), auth.tenantId, to, { surconReg: b['surcon_reg'] as string | undefined }) });
});
landSurveyorRoutes.post('/:id/jobs', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ job: await new LandSurveyorRepository(c.env.DB).createSurveyJob(c.req.param('id'), auth.tenantId, { clientRefId: b['client_ref_id'] as string, landRefId: b['land_ref_id'] as string, surveyType: b['survey_type'] as string, locationState: b['location_state'] as string, locationLga: b['location_lga'] as string | undefined, feePaidKobo: b['fee_paid_kobo'] as number, jobDate: b['job_date'] as number }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
landSurveyorRoutes.get('/:id/jobs', async (c) => { const auth = c.get('auth') as { tenantId: string }; const jobs = await new LandSurveyorRepository(c.env.DB).listSurveyJobs(c.req.param('id'), auth.tenantId); return c.json({ jobs, count: jobs.length }); });
landSurveyorRoutes.post('/:id/plans', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ plan: await new LandSurveyorRepository(c.env.DB).createSurveyPlan(b['job_id'] as string, auth.tenantId, { planNumber: b['plan_number'] as string, beaconCount: b['beacon_count'] as number | undefined, areaSqmX100: b['area_sqm_x100'] as number, sealDate: b['seal_date'] as number | undefined, bearingNotes: b['bearing_notes'] as string | undefined }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
