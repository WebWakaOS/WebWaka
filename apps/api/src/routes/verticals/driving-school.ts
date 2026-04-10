/**
 * Driving School routes — M9
 * P13: student_ref_id opaque; no student PII to AI
 * P9: enrolmentFeeKobo / purchaseCostKobo must be integers
 * T3: all queries scoped to tenantId
 * P12: AI blocked on USSD
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
import type { Env } from '../../types.js';
import {
  DrivingSchoolRepository,
  guardClaimedToFrscVerified,
  guardFractionalKobo,
  isValidDrivingSchoolTransition,
} from '@webwaka/verticals-driving-school';

type Auth = { userId: string; tenantId: string };

const app = new Hono<{ Bindings: Env }>();
function repo(c: { env: Env }) { return new DrivingSchoolRepository(c.env.DB); }
function auth(c: Context<{ Bindings: Env }>) { return c.get('auth') as Auth; }

app.post('/profiles', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ workspaceId: string; schoolName: string; frscRegistration?: string; state?: string; cacRc?: string }>();
  const profile = await repo(c).createProfile({ workspaceId: body.workspaceId, tenantId, schoolName: body.schoolName, frscRegistration: body.frscRegistration, state: body.state, cacRc: body.cacRc });
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
  const body = await c.req.json<{ to: string; frscRegistration?: string; kycTier?: number }>();
  const to = body.to as Parameters<typeof isValidDrivingSchoolTransition>[1];
  const current = await repo(c).findProfileById(c.req.param('id'), tenantId);
  if (!current) return c.json({ error: 'not found' }, 404);
  if (!isValidDrivingSchoolTransition(current.status, to)) return c.json({ error: `Invalid FSM transition: ${current.status} → ${to}` }, 422);
  if (to === 'frsc_verified') {
    const g = guardClaimedToFrscVerified({ frscRegistration: body.frscRegistration ?? current.frscRegistration, kycTier: body.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
    if (body.frscRegistration) await repo(c).updateProfile(c.req.param('id'), tenantId, { frscRegistration: body.frscRegistration });
  }
  const updated = await repo(c).transition(c.req.param('id'), tenantId, to);
  return c.json(updated);
});

app.post('/profiles/:id/students', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ courseType?: string; enrolmentFeeKobo: number; lessonsPaid?: number }>();
  const g = guardFractionalKobo(body.enrolmentFeeKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const student = await repo(c).createStudent({ profileId: c.req.param('id'), tenantId, courseType: body.courseType as never, enrolmentFeeKobo: body.enrolmentFeeKobo, lessonsPaid: body.lessonsPaid });
  return c.json(student, 201);
});

app.get('/profiles/:id/students', async (c) => {
  const { tenantId } = auth(c);
  return c.json(await repo(c).listStudents(c.req.param('id'), tenantId));
});

app.post('/profiles/:id/lessons', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ studentRefId: string; instructorId: string; vehicleId: string; lessonDate: number; lessonType?: string }>();
  const lesson = await repo(c).createLesson({ profileId: c.req.param('id'), tenantId, studentRefId: body.studentRefId, instructorId: body.instructorId, vehicleId: body.vehicleId, lessonDate: body.lessonDate, lessonType: body.lessonType as never });
  return c.json(lesson, 201);
});

app.post('/profiles/:id/vehicles', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ vehiclePlate: string; type?: string; purchaseCostKobo: number }>();
  const g = guardFractionalKobo(body.purchaseCostKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const vehicle = await repo(c).createVehicle({ profileId: c.req.param('id'), tenantId, vehiclePlate: body.vehiclePlate, type: body.type as never, purchaseCostKobo: body.purchaseCostKobo });
  return c.json(vehicle, 201);
});

app.get('/profiles/:id/vehicles', async (c) => {
  const { tenantId } = auth(c);
  return c.json(await repo(c).listVehicles(c.req.param('id'), tenantId));
});

export default app;
