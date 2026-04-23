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
  let body: { workspaceId: string; organizationId: string; sector: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
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
  let body: { to: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const to = body.to as Parameters<typeof isValidNgoTransition>[1];
  const current = await repo(c).findById(c.req.param('id'), tenantId);
  if (!current) return c.json({ error: 'not found' }, 404);
  if (!isValidNgoTransition(current.status, to)) return c.json({ error: `Invalid FSM transition: ${current.status} → ${to}` }, 422);
  const updated = await repo(c).transition(c.req.param('id'), tenantId, to);
  return c.json(updated);
});

app.post('/profiles/:id/funding', async (c) => {
  const { tenantId } = auth(c);
  let body: { donorName: string; amountKobo: number; currency?: string; purpose?: string; paystackRef?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  // Fetch the profile to obtain its workspaceId (required by createFunding)
  const profile = await repo(c).findById(c.req.param('id'), tenantId);
  if (!profile) return c.json({ error: 'not found' }, 404);
  const record = await repo(c).createFunding({ workspaceId: profile.workspaceId, tenantId, donorName: body.donorName, amountKobo: body.amountKobo, currency: body.currency ?? 'NGN', purpose: body.purpose, paystackRef: body.paystackRef });
  return c.json(record, 201);
});

export default app;
