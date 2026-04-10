/**
 * Private School routes — M12
 * P13: student_ref_id opaque; individual grades never to AI
 * P9: termFeeKobo / monthlySalaryKobo must be integers
 * T3: all queries scoped to tenantId
 * P12: AI blocked on USSD
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
import type { Env } from '../../types.js';
import {
  PrivateSchoolRepository,
  guardClaimedToSubebVerified,
  guardFractionalKobo,
  isValidPrivateSchoolTransition,
} from '@webwaka/verticals-private-school';

type Auth = { userId: string; tenantId: string };
const app = new Hono<{ Bindings: Env }>();
function repo(c: { env: Env }) { return new PrivateSchoolRepository(c.env.DB); }
function auth(c: Context<{ Bindings: Env }>) { return c.get('auth') as Auth; }

app.post('/profiles', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ workspaceId: string; schoolName: string; subebApproval?: string; waecCentreNumber?: string; necoCentreNumber?: string; cacRc?: string; schoolType?: string }>();
  const profile = await repo(c).createProfile({ workspaceId: body.workspaceId, tenantId, schoolName: body.schoolName, subebApproval: body.subebApproval, waecCentreNumber: body.waecCentreNumber, necoCentreNumber: body.necoCentreNumber, cacRc: body.cacRc, schoolType: body.schoolType as never });
  return c.json(profile, 201);
});

app.get('/profiles/:id', async (c) => {
  const { tenantId } = auth(c);
  const p = await repo(c).findProfileById(c.req.param('id'), tenantId);
  if (!p) return c.json({ error: 'not found' }, 404);
  return c.json(p);
});

app.patch('/profiles/:id/transition', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ to: string; subebApproval?: string; kycTier?: number }>();
  const to = body.to as Parameters<typeof isValidPrivateSchoolTransition>[1];
  const current = await repo(c).findProfileById(c.req.param('id'), tenantId);
  if (!current) return c.json({ error: 'not found' }, 404);
  if (!isValidPrivateSchoolTransition(current.status, to)) return c.json({ error: `Invalid FSM transition: ${current.status} → ${to}` }, 422);
  if (to === 'subeb_verified') {
    const g = guardClaimedToSubebVerified({ subebApproval: body.subebApproval ?? current.subebApproval, kycTier: body.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
    if (body.subebApproval) await repo(c).updateProfile(c.req.param('id'), tenantId, { subebApproval: body.subebApproval });
  }
  const updated = await repo(c).transition(c.req.param('id'), tenantId, to);
  return c.json(updated);
});

app.post('/profiles/:id/students', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ classLevel: string; admissionDate?: number; termFeeKobo: number }>();
  const g = guardFractionalKobo(body.termFeeKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const student = await repo(c).createStudent({ profileId: c.req.param('id'), tenantId, classLevel: body.classLevel, admissionDate: body.admissionDate, termFeeKobo: body.termFeeKobo });
  return c.json(student, 201);
});

app.post('/profiles/:id/fees', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ studentRefId: string; term: string; feeKobo: number; paidKobo?: number; paymentDate?: number }>();
  const g = guardFractionalKobo(body.feeKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const log = await repo(c).createFeesLog({ profileId: c.req.param('id'), tenantId, studentRefId: body.studentRefId, term: body.term, feeKobo: body.feeKobo, paidKobo: body.paidKobo, paymentDate: body.paymentDate });
  return c.json(log, 201);
});

app.post('/profiles/:id/teachers', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ teacherName: string; qualification?: string; assignedClass?: string; monthlySalaryKobo: number }>();
  const g = guardFractionalKobo(body.monthlySalaryKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const teacher = await repo(c).createTeacher({ profileId: c.req.param('id'), tenantId, teacherName: body.teacherName, qualification: body.qualification, assignedClass: body.assignedClass, monthlySalaryKobo: body.monthlySalaryKobo });
  return c.json(teacher, 201);
});

export default app;
