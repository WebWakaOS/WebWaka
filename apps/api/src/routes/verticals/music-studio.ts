/**
 * Music Studio routes — M10
 * FSM: seeded → claimed → coson_registered → active → suspended
 * AI: L2 cap — utilisation aggregate; P13 no royalty/deal data
 * P9: all monetary in kobo integers; hours/bpm as integers
 * T3: all queries scoped to tenantId
 * P12: AI blocked on USSD
 */

import { Hono } from 'hono';
import type { Env } from '../../types.js';
import {
  MusicStudioRepository,
  guardClaimedToCosonRegistered,
  guardL2AiCap,
  guardFractionalKobo,
  guardNoRoyaltyDataInAi,
  guardIntegerHours,
  guardIntegerBpm,
  isValidMusicStudioTransition,
} from '@webwaka/verticals-music-studio';

type Auth = { userId: string; tenantId: string };
const app = new Hono<{ Bindings: Env }>();
function repo(c: { env: Env }) { return new MusicStudioRepository(c.env.DB); }
function auth(c: Parameters<Parameters<typeof app.use>[1]>[0]) { return c.get('auth') as Auth; }

app.post('/profiles', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ workspaceId: string; studioName: string; cosonMembership?: string; mcsnRegistration?: string; cacRc?: string; studioType?: string }>();
  const profile = await repo(c).createProfile({ workspaceId: body.workspaceId, tenantId, studioName: body.studioName, cosonMembership: body.cosonMembership, mcsnRegistration: body.mcsnRegistration, cacRc: body.cacRc, studioType: body.studioType as never });
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
  const body = await c.req.json<{ to: string; cosonMembership?: string }>();
  const to = body.to as Parameters<typeof isValidMusicStudioTransition>[1];
  const current = await repo(c).findProfileById(c.req.param('id'), tenantId);
  if (!current) return c.json({ error: 'not found' }, 404);
  if (!isValidMusicStudioTransition(current.status, to)) return c.json({ error: `Invalid FSM transition: ${current.status} → ${to}` }, 422);
  if (to === 'coson_registered') {
    const g = guardClaimedToCosonRegistered({ cosonMembership: body.cosonMembership ?? current.cosonMembership });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  await repo(c).updateStatus(c.req.param('id'), tenantId, to);
  const updated = await repo(c).findProfileById(c.req.param('id'), tenantId);
  return c.json(updated);
});

app.post('/profiles/:id/sessions', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ artisteRefId: string; engineerRefId?: string; bookingDate: number; hours: number; sessionRateKobo: number; totalKobo: number }>();
  const hG = guardIntegerHours(body.hours);
  if (!hG.allowed) return c.json({ error: hG.reason }, 422);
  const g = guardFractionalKobo(body.totalKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const session = await repo(c).createSession({ profileId: c.req.param('id'), tenantId, artisteRefId: body.artisteRefId, engineerRefId: body.engineerRefId, bookingDate: body.bookingDate, hours: body.hours, sessionRateKobo: body.sessionRateKobo, totalKobo: body.totalKobo });
  return c.json(session, 201);
});

app.post('/profiles/:id/beats', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ beatName: string; producerRefId: string; genre: string; bpm: number; licenseType: string; licenseFeeKobo: number; streamsReference?: string }>();
  const bpmG = guardIntegerBpm(body.bpm);
  if (!bpmG.allowed) return c.json({ error: bpmG.reason }, 422);
  const g = guardFractionalKobo(body.licenseFeeKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const beat = await repo(c).createBeat({ profileId: c.req.param('id'), tenantId, beatName: body.beatName, producerRefId: body.producerRefId, genre: body.genre, bpm: body.bpm, licenseType: body.licenseType as never, licenseFeeKobo: body.licenseFeeKobo, streamsReference: body.streamsReference });
  return c.json(beat, 201);
});

app.post('/profiles/:id/equipment', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ equipmentName: string; brand?: string; purchaseCostKobo: number; condition?: string }>();
  const g = guardFractionalKobo(body.purchaseCostKobo);
  if (!g.allowed) return c.json({ error: g.reason }, 422);
  const equipment = await repo(c).createEquipment({ profileId: c.req.param('id'), tenantId, equipmentName: body.equipmentName, brand: body.brand, purchaseCostKobo: body.purchaseCostKobo, condition: body.condition as never });
  return c.json(equipment, 201);
});

app.post('/profiles/:id/ai/studio-utilisation', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<Record<string, unknown>>();
  const capG = guardL2AiCap({ autonomyLevel: body.autonomyLevel as never });
  if (!capG.allowed) return c.json({ error: capG.reason }, 403);
  const piiG = guardNoRoyaltyDataInAi(body);
  if (!piiG.allowed) return c.json({ error: piiG.reason }, 403);
  return c.json({ status: 'queued', message: 'Studio utilisation AI request queued for L2 advisory review', tenantId });
});

export default app;
