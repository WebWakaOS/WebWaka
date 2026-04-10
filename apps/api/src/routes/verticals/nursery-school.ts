/**
 * Nursery-school routes — P13 ABSOLUTE: NO child_ref_id anywhere.
 * AI cap: aggregate counts ONLY (highest P13) — no individual child data exposed.
 * All monetary in kobo (INTEGER). All queries scoped to tenant_id.
 */
import { Hono } from 'hono';
import { NurserySchoolRepository, isValidNurserySchoolTransition } from '@webwaka/verticals-nursery-school';
import type { NurserySchoolFSMState } from '@webwaka/verticals-nursery-school';
import type { Env } from '../../env.js';
export const nurserySchoolRoutes = new Hono<{ Bindings: Env }>();
nurserySchoolRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!b['workspace_id'] || !b['school_name']) return c.json({ error: 'workspace_id, school_name required' }, 400);
  return c.json({ nursery_school: await new NurserySchoolRepository(c.env.DB).createProfile({ workspaceId: b['workspace_id'] as string, tenantId: auth.tenantId, schoolName: b['school_name'] as string, nesCert: b['nes_cert'] as string | undefined, siwesRef: b['siwes_ref'] as string | undefined, cacScn: b['cac_scn'] as string | undefined, state: b['state'] as string | undefined, lga: b['lga'] as string | undefined }) }, 201);
});
nurserySchoolRoutes.get('/workspace/:workspaceId', async (c) => { const auth = c.get('auth') as { tenantId: string }; return c.json({ nursery_school: await new NurserySchoolRepository(c.env.DB).findProfileByWorkspace(c.req.param('workspaceId'), auth.tenantId) }); });
nurserySchoolRoutes.get('/:id', async (c) => { const auth = c.get('auth') as { tenantId: string }; const p = await new NurserySchoolRepository(c.env.DB).findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404); return c.json({ nursery_school: p }); });
nurserySchoolRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new NurserySchoolRepository(c.env.DB); const p = await repo.findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404);
  const to = b['status'] as NurserySchoolFSMState; if (!isValidNurserySchoolTransition(p.status, to)) return c.json({ error: `Invalid FSM transition ${p.status} → ${to}` }, 422);
  return c.json({ nursery_school: await repo.transitionStatus(c.req.param('id'), auth.tenantId, to, { nesCert: b['nes_cert'] as string | undefined }) });
});
nurserySchoolRoutes.post('/:id/enrollments', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if ('child_ref_id' in b) return c.json({ error: 'P13: child_ref_id is prohibited in nursery-school data' }, 422);
  const repo = new NurserySchoolRepository(c.env.DB);
  try {
    const enrollment = await repo.createEnrollment(c.req.param('id'), auth.tenantId, { guardianRefId: b['guardian_ref_id'] as string, ageBracket: b['age_bracket'] as string, classLevel: b['class_level'] as string, academicYear: b['academic_year'] as string, term: b['term'] as string, termFeeKobo: b['term_fee_kobo'] as number });
    return c.json({ enrollment }, 201);
  } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
nurserySchoolRoutes.get('/:id/enrollment-summary', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  const summary = await new NurserySchoolRepository(c.env.DB).getEnrollmentSummary(c.req.param('id'), auth.tenantId);
  return c.json({ summary });
});
nurserySchoolRoutes.post('/:id/teachers', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  return c.json({ teacher: await new NurserySchoolRepository(c.env.DB).addTeacher(c.req.param('id'), auth.tenantId, { teacherRefId: b['teacher_ref_id'] as string, trcnReg: b['trcn_reg'] as string | undefined, classAssignment: b['class_assignment'] as string | undefined }) }, 201);
});
nurserySchoolRoutes.get('/:id/teachers', async (c) => { const auth = c.get('auth') as { tenantId: string }; const teachers = await new NurserySchoolRepository(c.env.DB).listTeachers(c.req.param('id'), auth.tenantId); return c.json({ teachers, count: teachers.length }); });
nurserySchoolRoutes.post('/:id/fee-payments', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if ('child_ref_id' in b) return c.json({ error: 'P13: child_ref_id is prohibited in nursery-school data' }, 422);
  try { return c.json({ payment: await new NurserySchoolRepository(c.env.DB).recordFeePayment(c.req.param('id'), auth.tenantId, { enrollmentId: b['enrollment_id'] as string, guardianRefId: b['guardian_ref_id'] as string, amountKobo: b['amount_kobo'] as number, paymentDate: b['payment_date'] as number, academicYear: b['academic_year'] as string, term: b['term'] as string }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
nurserySchoolRoutes.get('/:id/fee-payments', async (c) => { const auth = c.get('auth') as { tenantId: string }; const payments = await new NurserySchoolRepository(c.env.DB).listFeePayments(c.req.param('id'), auth.tenantId); return c.json({ payments, count: payments.length }); });
