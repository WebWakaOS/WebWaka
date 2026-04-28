/**
 * Group Polls/Surveys Routes — Phase 2 T006
 *
 * POST   /groups/:id/polls                — create poll
 * GET    /groups/:id/polls                — list polls for group
 * GET    /groups/:id/polls/:pollId        — get poll with vote totals
 * POST   /groups/:id/polls/:pollId/vote   — cast vote (one per member, 409 on duplicate)
 * POST   /groups/:id/polls/:pollId/close  — close poll (admin)
 *
 * Platform Invariants:
 *   T3 — tenantId from JWT
 *   Poll model: question, up to 10 options, one vote per member, optional closes_at
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';

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

function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 18)}`;
}

function now(): number {
  return Math.floor(Date.now() / 1000);
}

export const pollsRoutes = new Hono<AppEnv>();

// ── Schemas ────────────────────────────────────────────────────────────────

const CreatePollSchema = z.object({
  question: z.string().min(3).max(500),
  options: z.array(z.string().min(1).max(200)).min(2).max(10),
  isMultipleChoice: z.boolean().optional().default(false),
  closesAt: z.number().int().positive().optional(),
});

const VoteSchema = z.object({
  optionIndex: z.number().int().min(0).max(9),
});

// ── Routes ─────────────────────────────────────────────────────────────────

pollsRoutes.post('/:groupId/polls', zValidator('json', CreatePollSchema), async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId) return c.json({ error: 'unauthorized' }, 401);

  const body = c.req.valid('json');
  const groupId = c.req.param('groupId');
  const db = c.env.DB as unknown as D1Like;
  const pollId = generateId('poll');
  const ts = now();

  await db
    .prepare(
      `INSERT INTO group_polls
         (id, tenant_id, group_id, created_by, question, options_json, is_multiple_choice,
          status, closes_at, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .bind(
      pollId, auth.tenantId, groupId, auth.userId, body.question,
      JSON.stringify(body.options), body.isMultipleChoice ? 1 : 0,
      'open', body.closesAt ?? null, ts, ts,
    )
    .run();

  const poll = await db
    .prepare('SELECT * FROM group_polls WHERE id = ? AND tenant_id = ?')
    .bind(pollId, auth.tenantId)
    .first<Record<string, unknown>>();

  return c.json({ poll }, 201);
});

pollsRoutes.get('/:groupId/polls', async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId) return c.json({ error: 'unauthorized' }, 401);

  const groupId = c.req.param('groupId');
  const db = c.env.DB as unknown as D1Like;

  const { results } = await db
    .prepare(
      `SELECT * FROM group_polls WHERE tenant_id = ? AND group_id = ? ORDER BY created_at DESC LIMIT 50`,
    )
    .bind(auth.tenantId, groupId)
    .all<Record<string, unknown>>();

  return c.json({ polls: results });
});

pollsRoutes.get('/:groupId/polls/:pollId', async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId) return c.json({ error: 'unauthorized' }, 401);

  const { groupId, pollId } = c.req.param();
  const db = c.env.DB as unknown as D1Like;

  const poll = await db
    .prepare('SELECT * FROM group_polls WHERE id = ? AND tenant_id = ? AND group_id = ?')
    .bind(pollId, auth.tenantId, groupId)
    .first<Record<string, unknown>>();
  if (!poll) return c.json({ error: 'not_found' }, 404);

  const { results: votes } = await db
    .prepare(
      `SELECT option_index, COUNT(*) as cnt
       FROM group_poll_votes WHERE poll_id = ? AND tenant_id = ? GROUP BY option_index`,
    )
    .bind(pollId, auth.tenantId)
    .all<{ option_index: number; cnt: number }>();

  const options = JSON.parse(poll.options_json as string ?? '[]') as string[];
  const voteTotals = options.map((opt: string, i: number) => ({
    index: i,
    label: opt,
    votes: votes.find((v) => v.option_index === i)?.cnt ?? 0,
  }));

  return c.json({ poll, voteTotals });
});

pollsRoutes.post('/:groupId/polls/:pollId/vote', zValidator('json', VoteSchema), async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId) return c.json({ error: 'unauthorized' }, 401);

  const { groupId, pollId } = c.req.param();
  const body = c.req.valid('json');
  const db = c.env.DB as unknown as D1Like;

  const poll = await db
    .prepare('SELECT * FROM group_polls WHERE id = ? AND tenant_id = ? AND group_id = ?')
    .bind(pollId, auth.tenantId, groupId)
    .first<{ status: string; closes_at: number | null; options_json: string }>();
  if (!poll) return c.json({ error: 'not_found' }, 404);
  if (poll.status !== 'open') return c.json({ error: 'poll_closed' }, 409);
  if (poll.closes_at && poll.closes_at < now()) return c.json({ error: 'poll_expired' }, 409);

  const options = JSON.parse(poll.options_json ?? '[]') as unknown[];
  if (body.optionIndex >= options.length) {
    return c.json({ error: 'invalid_option_index' }, 422);
  }

  const existing = await db
    .prepare('SELECT id FROM group_poll_votes WHERE poll_id = ? AND tenant_id = ? AND voter_id = ?')
    .bind(pollId, auth.tenantId, auth.userId)
    .first<{ id: string }>();
  if (existing) return c.json({ error: 'already_voted' }, 409);

  const voteId = generateId('pv');
  await db
    .prepare(
      'INSERT INTO group_poll_votes (id, poll_id, tenant_id, group_id, voter_id, option_index, created_at) VALUES (?,?,?,?,?,?,?)',
    )
    .bind(voteId, pollId, auth.tenantId, groupId, auth.userId, body.optionIndex, now())
    .run();

  const { results: updatedVotes } = await db
    .prepare(
      `SELECT option_index, COUNT(*) as cnt FROM group_poll_votes WHERE poll_id = ? AND tenant_id = ? GROUP BY option_index`,
    )
    .bind(pollId, auth.tenantId)
    .all<{ option_index: number; cnt: number }>();

  return c.json({ voteId, voteTotals: updatedVotes }, 201);
});

pollsRoutes.post('/:groupId/polls/:pollId/close', async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId) return c.json({ error: 'unauthorized' }, 401);
  if (!['admin', 'super_admin', 'group_admin'].includes(auth.role ?? '')) {
    return c.json({ error: 'admin role required' }, 403);
  }

  const { groupId, pollId } = c.req.param();
  const db = c.env.DB as unknown as D1Like;

  const poll = await db
    .prepare('SELECT id FROM group_polls WHERE id = ? AND tenant_id = ? AND group_id = ?')
    .bind(pollId, auth.tenantId, groupId)
    .first<{ id: string }>();
  if (!poll) return c.json({ error: 'not_found' }, 404);

  await db
    .prepare(`UPDATE group_polls SET status = 'closed', updated_at = ? WHERE id = ? AND tenant_id = ?`)
    .bind(now(), pollId, auth.tenantId)
    .run();

  return c.json({ success: true });
});
