/**
 * Recording Label routes — M12
 * FSM: seeded → claimed → coson_registered → active → suspended
 * AI: L2 cap — catalogue aggregate; P13 no artiste_ref_id or royalty splits
 * royalty_split_bps: INTEGER basis points — NO FLOATS
 * Kobo arithmetic: artiste_share_kobo + label_share_kobo = gross_kobo enforced
 * P9: all monetary in kobo integers
 * T3: all queries scoped to tenantId
 * P12: AI blocked on USSD
 */

import { Hono } from 'hono';
import type { Env } from '../../types.js';
import {
  RecordingLabelRepository,
  guardClaimedToCosonRegistered,
  guardL2AiCap,
  guardFractionalKobo,
  guardNoRoyaltyDataInAi,
  guardIntegerBps,
  guardRoyaltyArithmetic,
  isValidRecordingLabelTransition,
} from '@webwaka/verticals-recording-label';

type Auth = { userId: string; tenantId: string };
const app = new Hono<{ Bindings: Env }>();
function repo(c: { env: Env }) { return new RecordingLabelRepository(c.env.DB); }
function auth(c: Parameters<Parameters<typeof app.use>[1]>[0]) { return c.get('auth') as Auth; }

app.post('/profiles', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ workspaceId: string; labelName: string; cosonMembership?: string; mcsnRegistration?: string; cacRc?: string }>();
  const profile = await repo(c).createProfile({ workspaceId: body.workspaceId, tenantId, labelName: body.labelName, cosonMembership: body.cosonMembership, mcsnRegistration: body.mcsnRegistration, cacRc: body.cacRc });
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
  const to = body.to as Parameters<typeof isValidRecordingLabelTransition>[1];
  const current = await repo(c).findProfileById(c.req.param('id'), tenantId);
  if (!current) return c.json({ error: 'not found' }, 404);
  if (!isValidRecordingLabelTransition(current.status, to)) return c.json({ error: `Invalid FSM transition: ${current.status} → ${to}` }, 422);
  if (to === 'coson_registered') {
    const g = guardClaimedToCosonRegistered({ cosonMembership: body.cosonMembership ?? current.cosonMembership });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  await repo(c).updateStatus(c.req.param('id'), tenantId, to);
  const updated = await repo(c).findProfileById(c.req.param('id'), tenantId);
  return c.json(updated);
});

app.post('/profiles/:id/artistes', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ artisteRefId: string; royaltySplitBps: number; contractStart: number; contractEnd?: number }>();
  const bpsG = guardIntegerBps(body.royaltySplitBps);
  if (!bpsG.allowed) return c.json({ error: bpsG.reason }, 422);
  const artiste = await repo(c).createArtiste({ profileId: c.req.param('id'), tenantId, artisteRefId: body.artisteRefId, royaltySplitBps: body.royaltySplitBps, contractStart: body.contractStart, contractEnd: body.contractEnd });
  return c.json(artiste, 201);
});

app.post('/profiles/:id/releases', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ artisteRefId: string; releaseName: string; genre: string; releaseDate: number; streamingRevenueKobo?: number }>();
  if (body.streamingRevenueKobo !== undefined) {
    const g = guardFractionalKobo(body.streamingRevenueKobo);
    if (!g.allowed) return c.json({ error: g.reason }, 422);
  }
  const release = await repo(c).createRelease({ profileId: c.req.param('id'), tenantId, artisteRefId: body.artisteRefId, releaseName: body.releaseName, genre: body.genre, releaseDate: body.releaseDate, streamingRevenueKobo: body.streamingRevenueKobo });
  return c.json(release, 201);
});

app.post('/profiles/:id/royalty-distributions', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ artisteRefId: string; period: string; grossKobo: number; artisteShareKobo: number; labelShareKobo: number; distributedDate: number }>();
  const arithG = guardRoyaltyArithmetic({ grossKobo: body.grossKobo, artisteShareKobo: body.artisteShareKobo, labelShareKobo: body.labelShareKobo });
  if (!arithG.allowed) return c.json({ error: arithG.reason }, 422);
  const dist = await repo(c).createRoyaltyDistribution({ profileId: c.req.param('id'), tenantId, artisteRefId: body.artisteRefId, period: body.period, grossKobo: body.grossKobo, artisteShareKobo: body.artisteShareKobo, labelShareKobo: body.labelShareKobo, distributedDate: body.distributedDate });
  return c.json(dist, 201);
});

app.post('/profiles/:id/ai/catalogue-insights', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<Record<string, unknown>>();
  const capG = guardL2AiCap({ autonomyLevel: body.autonomyLevel as never });
  if (!capG.allowed) return c.json({ error: capG.reason }, 403);
  const piiG = guardNoRoyaltyDataInAi(body);
  if (!piiG.allowed) return c.json({ error: piiG.reason }, 403);
  return c.json({ status: 'queued', message: 'Catalogue insights AI request queued for L2 advisory review', tenantId });
});

export default app;
