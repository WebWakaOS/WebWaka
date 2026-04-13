/**
 * NGO / Non-Profit routes — M8d
 * FSM: seeded → claimed → cac_registered → active → suspended
 * AI: L2 cap; P13 no beneficiary PII to AI
 * P9: all monetary in kobo integers; T3: tenantId scoped; Tier 2 KYC
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
import type { Env } from '../../types.js';
import {
  NgoRepository,
  isValidNgoTransition,
} from '@webwaka/verticals-ngo';

type Auth = { userId: string; tenantId: string };
const app = new Hono<{ Bindings: Env }>();
function repo(c: { env: Env }) { return new NgoRepository(c.env.DB); }
function auth(c: Context<{ Bindings: Env }>) { return c.get('auth') as Auth; }

app.post('/profiles', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ workspaceId: string; organizationId: string; sector: string }>();
  const profile = await repo(c).create({ workspaceId: body.workspaceId, tenantId, organizationId: body.organizationId, sector: body.sector as never });
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
  const to = body.to as Parameters<typeof isValidNgoTransition>[1];
  const current = await repo(c).findById(c.req.param('id'), tenantId);
  if (!current) return c.json({ error: 'not found' }, 404);
  if (!isValidNgoTransition(current.status, to)) return c.json({ error: `Invalid FSM transition: ${current.status} → ${to}` }, 422);
  const updated = await repo(c).transition(c.req.param('id'), tenantId, to);
  return c.json(updated);
});

app.post('/profiles/:id/funding', async (c) => {
  const { tenantId } = auth(c);
  const body = await c.req.json<{ donorName: string; amountKobo: number; currency?: string; purpose?: string; paystackRef?: string }>();
  const record = await repo(c).createFunding({ workspaceId: '', tenantId, donorName: body.donorName, amountKobo: body.amountKobo, currency: body.currency ?? 'NGN', purpose: body.purpose, paystackRef: body.paystackRef });
  return c.json(record, 201);
});

export default app;
