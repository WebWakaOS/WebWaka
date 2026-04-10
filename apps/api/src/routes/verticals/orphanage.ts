/**
 * Orphanage routes — P13 ABSOLUTE: L3 HITL ALL. No AI output about individual children.
 * Every query is scoped to tenant_id (P9/T3). All monetary in kobo.
 */
import { Hono } from 'hono';
import { OrphanageRepository, isValidOrphanageTransition } from '@webwaka/verticals-orphanage';
import type { OrphanageFSMState } from '@webwaka/verticals-orphanage';
import type { Env } from '../../env.js';
export const orphanageRoutes = new Hono<{ Bindings: Env }>();
orphanageRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!b['workspace_id'] || !b['facility_name']) return c.json({ error: 'workspace_id, facility_name required' }, 400);
  return c.json({ orphanage: await new OrphanageRepository(c.env.DB).createProfile({ workspaceId: b['workspace_id'] as string, tenantId: auth.tenantId, facilityName: b['facility_name'] as string, mosswRef: b['mossw_ref'] as string | undefined, cacScn: b['cac_scn'] as string | undefined, nccsRef: b['nccs_ref'] as string | undefined, state: b['state'] as string | undefined, lga: b['lga'] as string | undefined, capacity: b['capacity'] as number | undefined }) }, 201);
});
orphanageRoutes.get('/workspace/:workspaceId', async (c) => { const auth = c.get('auth') as { tenantId: string }; return c.json({ orphanage: await new OrphanageRepository(c.env.DB).findProfileByWorkspace(c.req.param('workspaceId'), auth.tenantId) }); });
orphanageRoutes.get('/:id', async (c) => { const auth = c.get('auth') as { tenantId: string }; const p = await new OrphanageRepository(c.env.DB).findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404); return c.json({ orphanage: p }); });
orphanageRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new OrphanageRepository(c.env.DB); const p = await repo.findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404);
  const to = b['status'] as OrphanageFSMState; if (!isValidOrphanageTransition(p.status, to)) return c.json({ error: `Invalid FSM transition ${p.status} → ${to}` }, 422);
  return c.json({ orphanage: await repo.transitionStatus(c.req.param('id'), auth.tenantId, to, { mosswRef: b['mossw_ref'] as string | undefined, nccsRef: b['nccs_ref'] as string | undefined }) });
});
orphanageRoutes.post('/:id/intake', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if ('child_ref_id' in b) return c.json({ error: 'P13: child_ref_id is prohibited — use anonymous intake record instead' }, 422);
  try {
    const intake = await new OrphanageRepository(c.env.DB).recordIntake(c.req.param('id'), auth.tenantId, { ageBracket: b['age_bracket'] as string, genderCode: b['gender_code'] as string, intakeDate: b['intake_date'] as number, mosswCaseRef: b['mossw_case_ref'] as string | undefined, guardianPresent: b['guardian_present'] as boolean | undefined });
    return c.json({ intake }, 201);
  } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
orphanageRoutes.get('/:id/occupancy-summary', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  const summary = await new OrphanageRepository(c.env.DB).getOccupancySummary(c.req.param('id'), auth.tenantId);
  return c.json({ summary });
});
orphanageRoutes.post('/:id/staff', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  return c.json({ staff: await new OrphanageRepository(c.env.DB).addStaff(c.req.param('id'), auth.tenantId, { staffRefId: b['staff_ref_id'] as string, role: b['role'] as string, qualificationCode: b['qualification_code'] as string | undefined, childSafeguardingCert: b['child_safeguarding_cert'] as string | undefined }) }, 201);
});
orphanageRoutes.get('/:id/staff', async (c) => { const auth = c.get('auth') as { tenantId: string }; const staff = await new OrphanageRepository(c.env.DB).listStaff(c.req.param('id'), auth.tenantId); return c.json({ staff, count: staff.length }); });
orphanageRoutes.post('/:id/inspections', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  return c.json({ inspection: await new OrphanageRepository(c.env.DB).recordInspection(c.req.param('id'), auth.tenantId, { inspectionDate: b['inspection_date'] as number, inspectorRef: b['inspector_ref'] as string | undefined, agency: b['agency'] as string | undefined, outcome: b['outcome'] as string | undefined, nextInspectionDate: b['next_inspection_date'] as number | undefined, notes: b['notes'] as string | undefined }) }, 201);
});
orphanageRoutes.get('/:id/inspections', async (c) => { const auth = c.get('auth') as { tenantId: string }; const inspections = await new OrphanageRepository(c.env.DB).listInspections(c.req.param('id'), auth.tenantId); return c.json({ inspections, count: inspections.length }); });
orphanageRoutes.post('/:id/donations', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  return c.json({ donation: await new OrphanageRepository(c.env.DB).recordDonation(c.req.param('id'), auth.tenantId, { donorRefId: b['donor_ref_id'] as string | undefined, donationType: b['donation_type'] as string, amountKobo: b['amount_kobo'] as number | undefined, itemDescription: b['item_description'] as string | undefined, donationDate: b['donation_date'] as number }) }, 201);
});
orphanageRoutes.get('/:id/donations', async (c) => { const auth = c.get('auth') as { tenantId: string }; const donations = await new OrphanageRepository(c.env.DB).listDonations(c.req.param('id'), auth.tenantId); return c.json({ donations, count: donations.length }); });
