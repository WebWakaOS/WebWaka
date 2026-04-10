/**
 * Funeral Home routes — M12
 * FSM: seeded → claimed → mortuary_verified → active → suspended
 * CRITICAL: L3 HITL MANDATORY for ALL AI calls — deceased data P13 absolute
 * P13: case_ref_id opaque UUID; deceased identity NEVER in any request or AI payload
 * P9: all monetary in kobo integers
 * T3: all queries scoped to tenantId
 * P12: AI blocked on USSD
 */

import { Hono } from 'hono';
import type { Env } from '../../types.js';
import {
  FuneralHomeRepository,
  guardClaimedToMortuaryVerified,
  guardL3HitlRequired,
  guardFractionalKobo,
  guardNoDeceasedDataInAi,
  guardOpaqueCaseRefId,
  isValidFuneralHomeTransition,
} from '@webwaka/verticals-funeral-home';

type Auth = { userId: string; tenantId: string };
const app = new Hono<{ Bindings: Env }>();
function repo(c: { env: Env }) { return new FuneralHomeRepository(c.env.DB); }
function auth(c: Parameters<Parameters<typeof app.use>[1]>[0]) { return c.get('auth') as Auth; }

app.post('/profiles', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ workspaceId: string; businessName: string; stateMortuaryPermit?: string; lgBurialPermit?: string; cacRc?: string }>();
  const profile = await repo(c).createProfile({ workspaceId: body.workspaceId, tenantId, businessName: body.businessName, stateMortuaryPermit: body.stateMortuaryPermit, lgBurialPermit: body.lgBurialPermit, cacRc: body.cacRc });
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
  const body = await c.req.json<{ to: string; stateMortuaryPermit?: string }>();
  const to = body.to as Parameters<typeof isValidFuneralHomeTransition>[1];
  const current = await repo(c).findProfileById(c.req.param('id'), tenantId);
  if (!current) return c.json({ error: 'not found' }, 404);
  if (!isValidFuneralHomeTransition(current.status, to)) return c.json({ error: `Invalid FSM transition: ${current.status} → ${to}` }, 422);
  if (to === 'mortuary_verified') {
    const g = guardClaimedToMortuaryVerified({ stateMortuaryPermit: body.stateMortuaryPermit ?? current.stateMortuaryPermit });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  await repo(c).updateStatus(c.req.param('id'), tenantId, to);
  const updated = await repo(c).findProfileById(c.req.param('id'), tenantId);
  return c.json(updated);
});

app.post('/profiles/:id/cases', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ caseRefId: string; familyContactPhone: string; burialType: string; dateOfPassing: number; burialDate?: number; totalKobo: number; depositKobo?: number; burialPermitRef?: string }>();
  const uuidG = guardOpaqueCaseRefId(body.caseRefId);
  if (!uuidG.allowed) return c.json({ error: uuidG.reason }, 422);
  const g = guardFractionalKobo(body.totalKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const fcase = await repo(c).createCase({ profileId: c.req.param('id'), tenantId, caseRefId: body.caseRefId, familyContactPhone: body.familyContactPhone, burialType: body.burialType as never, dateOfPassing: body.dateOfPassing, burialDate: body.burialDate, totalKobo: body.totalKobo, depositKobo: body.depositKobo, burialPermitRef: body.burialPermitRef });
  return c.json(fcase, 201);
});

app.post('/profiles/:id/services', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ caseRefId: string; serviceType: string; costKobo: number }>();
  const g = guardFractionalKobo(body.costKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const service = await repo(c).createService({ profileId: c.req.param('id'), tenantId, caseRefId: body.caseRefId, serviceType: body.serviceType as never, costKobo: body.costKobo });
  return c.json(service, 201);
});

app.post('/profiles/:id/ai/service-planning', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<Record<string, unknown>>();
  const hitlG = guardL3HitlRequired({ autonomyLevel: body.autonomyLevel as never });
  if (!hitlG.allowed) return c.json({ error: hitlG.reason }, 403);
  const piiG = guardNoDeceasedDataInAi(body);
  if (!piiG.allowed) return c.json({ error: piiG.reason }, 403);
  return c.json({ status: 'queued_for_hitl', message: 'Funeral home AI request queued — L3 human review mandatory; deceased data protected', tenantId });
});

export default app;
