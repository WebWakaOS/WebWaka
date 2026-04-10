/**
 * Training Institute routes — M9
 * P13: student_ref_id opaque; no student PII to AI
 * P9: courseFeeKobo / enrolmentFeeKobo must be integers
 * T3: all queries scoped to tenantId
 * P12: AI blocked on USSD
 */

import { Hono } from 'hono';
import type { Env } from '../../types.js';
import {
  TrainingInstituteRepository,
  guardClaimedToNbteVerified,
  guardFractionalKobo,
  isValidTrainingInstituteTransition,
} from '@webwaka/verticals-training-institute';

type Auth = { userId: string; tenantId: string };
const app = new Hono<{ Bindings: Env }>();
function repo(c: { env: Env }) { return new TrainingInstituteRepository(c.env.DB); }
function auth(c: Parameters<Parameters<typeof app.use>[1]>[0]) { return c.get('auth') as Auth; }

app.post('/profiles', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ workspaceId: string; instituteName: string; nbteAccreditation?: string; itfRegistration?: string; nabtebCentreNumber?: string; cacRc?: string }>();
  const profile = await repo(c).createProfile({ workspaceId: body.workspaceId, tenantId, instituteName: body.instituteName, nbteAccreditation: body.nbteAccreditation, itfRegistration: body.itfRegistration, nabtebCentreNumber: body.nabtebCentreNumber, cacRc: body.cacRc });
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
  const body = await c.req.json<{ to: string; nbteAccreditation?: string; kycTier?: number }>();
  const to = body.to as Parameters<typeof isValidTrainingInstituteTransition>[1];
  const current = await repo(c).findProfileById(c.req.param('id'), tenantId);
  if (!current) return c.json({ error: 'not found' }, 404);
  if (!isValidTrainingInstituteTransition(current.status, to)) return c.json({ error: `Invalid FSM transition: ${current.status} → ${to}` }, 422);
  if (to === 'nbte_verified') {
    const g = guardClaimedToNbteVerified({ nbteAccreditation: body.nbteAccreditation ?? current.nbteAccreditation, kycTier: body.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
    if (body.nbteAccreditation) await repo(c).updateProfile(c.req.param('id'), tenantId, { nbteAccreditation: body.nbteAccreditation });
  }
  const updated = await repo(c).transition(c.req.param('id'), tenantId, to);
  return c.json(updated);
});

app.post('/profiles/:id/courses', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ courseName: string; tradeArea?: string; durationWeeks: number; courseFeeKobo: number; nbteApprovalNumber?: string }>();
  const g = guardFractionalKobo(body.courseFeeKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const course = await repo(c).createCourse({ profileId: c.req.param('id'), tenantId, courseName: body.courseName, tradeArea: body.tradeArea, durationWeeks: body.durationWeeks, courseFeeKobo: body.courseFeeKobo, nbteApprovalNumber: body.nbteApprovalNumber });
  return c.json(course, 201);
});

app.get('/profiles/:id/courses', async (c) => {
  const { tenantId } = auth(c);
  return c.json(await repo(c).listCourses(c.req.param('id'), tenantId));
});

app.post('/profiles/:id/students', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ courseId: string; enrolmentFeeKobo: number; examFeeKobo?: number; nabtebRegNumber?: string }>();
  const g = guardFractionalKobo(body.enrolmentFeeKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const student = await repo(c).createStudent({ profileId: c.req.param('id'), tenantId, courseId: body.courseId, enrolmentFeeKobo: body.enrolmentFeeKobo, examFeeKobo: body.examFeeKobo, nabtebRegNumber: body.nabtebRegNumber });
  return c.json(student, 201);
});

app.post('/profiles/:id/trainers', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ trainerName: string; qualification?: string; assignedCourses?: string }>();
  const trainer = await repo(c).createTrainer({ profileId: c.req.param('id'), tenantId, trainerName: body.trainerName, qualification: body.qualification, assignedCourses: body.assignedCourses });
  return c.json(trainer, 201);
});

export default app;
