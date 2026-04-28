/**
 * Mutual Aid Routes — Phase 2 T002 (FR-VM-16)
 *
 * POST   /mutual-aid                      — create request (P9, P10)
 * GET    /mutual-aid                      — list group requests
 * GET    /mutual-aid/:id                  — get request
 * POST   /mutual-aid/:id/vote             — cast vote (no duplicate)
 * POST   /mutual-aid/:id/disburse         — disburse approved request (admin)
 *
 * Platform Invariants:
 *   T3  — tenantId from JWT on every query
 *   P9  — amount_kobo integer guard (repository enforces)
 *   P10 — ndprConsented required on create
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';
import {
  createMutualAidRequest,
  getMutualAidRequest,
  listMutualAidRequests,
  castVote,
  getRequestVotes,
  disburseMutualAid,
} from '@webwaka/fundraising';

type AppEnv = { Bindings: Env; Variables: { auth: AuthContext } };

interface D1Like {
  prepare(sql: string): {
    bind(...args: unknown[]): {
      first<T>(): Promise<T | null>;
      run(): Promise<{ success: boolean }>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

export const mutualAidRoutes = new Hono<AppEnv>();

// ── Schemas ────────────────────────────────────────────────────────────────

const CreateRequestSchema = z.object({
  groupId: z.string().min(1),
  title: z.string().min(3).max(200),
  description: z.string().max(2000),
  amountKobo: z.number().int().positive(),
  currencyCode: z.string().length(3).optional(),
  votesRequired: z.number().int().min(1).max(100).optional(),
  ndprConsented: z.literal(true),
});

const VoteSchema = z.object({
  decision: z.enum(['approve', 'reject']),
  note: z.string().max(500).optional(),
});

const DisburseSchema = z.object({
  disbursementRef: z.string().max(100).optional(),
});

// ── Routes ─────────────────────────────────────────────────────────────────

mutualAidRoutes.post('/', zValidator('json', CreateRequestSchema), async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId) return c.json({ error: 'unauthorized' }, 401);

  const body = c.req.valid('json');
  const db = c.env.DB as unknown as D1Like;

  try {
    const request = await createMutualAidRequest(db, {
      tenantId: auth.tenantId,
      workspaceId: auth.workspaceId ?? body.groupId,
      groupId: body.groupId,
      requesterId: auth.userId,
      title: body.title,
      description: body.description,
      amountKobo: body.amountKobo,
      currencyCode: body.currencyCode,
      votesRequired: body.votesRequired,
      ndprConsented: body.ndprConsented,
    });
    return c.json({ request }, 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('P9_VIOLATION')) return c.json({ error: msg }, 422);
    if (msg.includes('P10_VIOLATION')) return c.json({ error: msg }, 422);
    throw err;
  }
});

mutualAidRoutes.get('/', async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId) return c.json({ error: 'unauthorized' }, 401);

  const groupId = c.req.query('groupId');
  if (!groupId) return c.json({ error: 'groupId query parameter required' }, 400);

  const db = c.env.DB as unknown as D1Like;
  const requests = await listMutualAidRequests(db, auth.tenantId, groupId);
  return c.json({ requests });
});

mutualAidRoutes.get('/:id', async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId) return c.json({ error: 'unauthorized' }, 401);

  const db = c.env.DB as unknown as D1Like;
  const [request, votes] = await Promise.all([
    getMutualAidRequest(db, c.req.param('id'), auth.tenantId),
    getRequestVotes(db, c.req.param('id'), auth.tenantId),
  ]);
  if (!request) return c.json({ error: 'not_found' }, 404);
  return c.json({ request, votes });
});

mutualAidRoutes.post('/:id/vote', zValidator('json', VoteSchema), async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId) return c.json({ error: 'unauthorized' }, 401);

  const body = c.req.valid('json');
  const db = c.env.DB as unknown as D1Like;

  const req = await getMutualAidRequest(db, c.req.param('id'), auth.tenantId);
  if (!req) return c.json({ error: 'not_found' }, 404);
  if (!['pending', 'voting'].includes(req.status)) {
    return c.json({ error: `cannot vote on request in status: ${req.status}` }, 409);
  }

  try {
    const vote = await castVote(db, {
      tenantId: auth.tenantId,
      requestId: c.req.param('id'),
      voterId: auth.userId,
      decision: body.decision,
      note: body.note,
    });
    return c.json({ vote }, 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('DUPLICATE_VOTE')) return c.json({ error: 'already_voted' }, 409);
    throw err;
  }
});

mutualAidRoutes.post('/:id/disburse', zValidator('json', DisburseSchema), async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId) return c.json({ error: 'unauthorized' }, 401);
  if (!['admin', 'super_admin', 'group_admin'].includes(auth.role ?? '')) {
    return c.json({ error: 'admin role required' }, 403);
  }

  const body = c.req.valid('json');
  const db = c.env.DB as unknown as D1Like;

  try {
    const request = await disburseMutualAid(db, {
      tenantId: auth.tenantId,
      requestId: c.req.param('id'),
      approvedBy: auth.userId,
      disbursementRef: body.disbursementRef,
    });
    return c.json({ request });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('INVALID_STATE')) return c.json({ error: msg }, 409);
    if (msg.includes('NOT_FOUND')) return c.json({ error: 'not_found' }, 404);
    throw err;
  }
});
