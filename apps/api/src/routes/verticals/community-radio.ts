/**
 * Community Radio / TV Station routes — M9
 * FSM: seeded → claimed → nbc_licensed → active
 * AI: L2 cap; P13 no listener PII to AI
 * P9: all monetary in kobo integers; T3: tenantId scoped; Tier 2 KYC
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
import type { Env } from '../../types.js';
import {
  CommunityRadioRepository,
  isValidCommunityRadioTransition,
} from '@webwaka/verticals-community-radio';

type Auth = { userId: string; tenantId: string };
const app = new Hono<{ Bindings: Env }>();
function repo(c: { env: Env }) { return new CommunityRadioRepository(c.env.DB); }
function auth(c: Context<{ Bindings: Env }>) { return c.get('auth') as Auth; }

app.post('/profiles', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ workspaceId: string; displayName: string }>();
  const profile = await repo(c).createProfile({ workspaceId: body.workspaceId, tenantId, displayName: body.displayName });
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
  const body = await c.req.json<{ to: string }>();
  const to = body.to as Parameters<typeof isValidCommunityRadioTransition>[1];
  const current = await repo(c).findProfileById(c.req.param('id'), tenantId);
  if (!current) return c.json({ error: 'not found' }, 404);
  if (!isValidCommunityRadioTransition(current.status, to)) return c.json({ error: `Invalid FSM transition: ${current.status} → ${to}` }, 422);
  await repo(c).updateStatus(c.req.param('id'), tenantId, to);
  const updated = await repo(c).findProfileById(c.req.param('id'), tenantId);
  return c.json(updated);
});

export default app;
