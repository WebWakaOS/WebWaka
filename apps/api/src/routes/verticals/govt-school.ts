import { Hono } from 'hono';
import { GovtSchoolRepository, isValidGovtSchoolTransition } from '@webwaka/verticals-govt-school';
import type { GovtSchoolFSMState } from '@webwaka/verticals-govt-school';
import type { Env } from '../../env.js';
export const govtSchoolRoutes = new Hono<{ Bindings: Env }>();
govtSchoolRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!b['workspace_id'] || !b['school_name']) return c.json({ error: 'workspace_id, school_name required' }, 400);
  return c.json({ govt_school: await new GovtSchoolRepository(c.env.DB).createProfile({ workspaceId: b['workspace_id'] as string, tenantId: auth.tenantId, schoolName: b['school_name'] as string, subebRef: b['subeb_ref'] as string | undefined, nesreaCert: b['nesrea_cert'] as string | undefined, ministryRef: b['ministry_ref'] as string | undefined, schoolLevel: b['school_level'] as string | undefined, state: b['state'] as string | undefined, lga: b['lga'] as string | undefined }) }, 201);
});
govtSchoolRoutes.get('/workspace/:workspaceId', async (c) => { const auth = c.get('auth') as { tenantId: string }; return c.json({ govt_school: await new GovtSchoolRepository(c.env.DB).findProfileByWorkspace(c.req.param('workspaceId'), auth.tenantId) }); });
govtSchoolRoutes.get('/:id', async (c) => { const auth = c.get('auth') as { tenantId: string }; const p = await new GovtSchoolRepository(c.env.DB).findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404); return c.json({ govt_school: p }); });
govtSchoolRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new GovtSchoolRepository(c.env.DB); const p = await repo.findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404);
  const to = b['status'] as GovtSchoolFSMState; if (!isValidGovtSchoolTransition(p.status, to)) return c.json({ error: `Invalid FSM transition ${p.status} → ${to}` }, 422);
  return c.json({ govt_school: await repo.transitionStatus(c.req.param('id'), auth.tenantId, to, { subebRef: b['subeb_ref'] as string | undefined }) });
});
govtSchoolRoutes.post('/:id/students', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  return c.json({ student: await new GovtSchoolRepository(c.env.DB).enrollStudent(c.req.param('id'), auth.tenantId, { studentId: b['student_ref_id'] as string, className: b['class_level'] as string, admissionDate: b['admission_date'] as number ?? Math.floor(Date.now()/1000), subsidy: b['subsidy'] as boolean | undefined }) }, 201);
});
govtSchoolRoutes.get('/:id/students', async (c) => { const auth = c.get('auth') as { tenantId: string }; const students = await new GovtSchoolRepository(c.env.DB).listStudents(c.req.param('id'), auth.tenantId); return c.json({ students, count: students.length }); });
govtSchoolRoutes.post('/:id/teachers', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  return c.json({ teacher: await new GovtSchoolRepository(c.env.DB).addTeacher(c.req.param('id'), auth.tenantId, { teacherRefId: b['teacher_ref_id'] as string, subjectArea: b['subject_area'] as string | undefined, qualifications: b['qualifications'] as string | undefined, employmentDate: b['employment_date'] as number | undefined }) }, 201);
});
govtSchoolRoutes.get('/:id/teachers', async (c) => { const auth = c.get('auth') as { tenantId: string }; const teachers = await new GovtSchoolRepository(c.env.DB).listTeachers(c.req.param('id'), auth.tenantId); return c.json({ teachers, count: teachers.length }); });
govtSchoolRoutes.post('/:id/results', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ result: await new GovtSchoolRepository(c.env.DB).recordResult(c.req.param('id'), auth.tenantId, { studentId: b['student_ref_id'] as string, term: b['term'] as string, subject: b['subject'] as string, score: b['score'] as number, maxScore: b['max_score'] as number ?? 100 }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
govtSchoolRoutes.get('/:id/results', async (c) => { const auth = c.get('auth') as { tenantId: string }; const results = await new GovtSchoolRepository(c.env.DB).listResults(c.req.param('id'), auth.tenantId); return c.json({ results, count: results.length }); });
