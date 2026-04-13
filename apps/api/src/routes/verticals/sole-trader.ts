/**
 * Sole Trader routes — M9
 * FSM: seeded → claimed → active
 * AI: L2 cap; P13 no personal ID in AI
 * P9: all monetary in kobo integers; T3: tenantId scoped; Tier 1 KYC
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
import type { Env } from '../../types.js';
import {
  SoleTraderRepository,
  isValidSoleTraderTransition,
} from '@webwaka/verticals-sole-trader';

type Auth = { userId: string; tenantId: string };
const app = new Hono<{ Bindings: Env }>();
function repo(c: { env: Env }) { return new SoleTraderRepository(c.env.DB); }
function auth(c: Context<{ Bindings: Env }>) { return c.get('auth') as Auth; }

app.post('/profiles', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ workspaceId: string; individualId: string; tradeType: string; lga?: string; state?: string; skills?: string; minFeeKobo?: number; maxFeeKobo?: number }>();
  const profile = await repo(c).create({ workspaceId: body.workspaceId, tenantId, individualId: body.individualId, tradeType: body.tradeType as never, lga: body.lga ?? '', state: body.state ?? '', skills: body.skills, minFeeKobo: body.minFeeKobo, maxFeeKobo: body.maxFeeKobo });
  return c.json(profile, 201);
});

app.get('/profiles/:id', async (c) => {
  const { tenantId } = auth(c);
  const p = await repo(c).findById(c.req.param('id'), tenantId);
  if (!p) return c.json({ error: 'not found' }, 404);
  return c.json(p);
});

app.patch('/profiles/:id/transition', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ to: string }>();
  const to = body.to as Parameters<typeof isValidSoleTraderTransition>[1];
  const current = await repo(c).findById(c.req.param('id'), tenantId);
  if (!current) return c.json({ error: 'not found' }, 404);
  if (!isValidSoleTraderTransition(current.status, to)) return c.json({ error: `Invalid FSM transition: ${current.status} → ${to}` }, 422);
  const updated = await repo(c).transition(c.req.param('id'), tenantId, to);
  return c.json(updated);
});

export default app;
