/**
 * Community Reporting (Content Flagging) Routes — Phase 2 T008
 *
 * POST   /content-flags                — authenticated reporter creates flag
 * GET    /content-flags                — admin/super_admin lists all flags (filterable)
 * PATCH  /content-flags/:id           — admin updates flag status
 *
 * Platform Invariants:
 *   T3 — tenantId from JWT on every query
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

export const communityReportRoutes = new Hono<AppEnv>();

// ── Schemas ────────────────────────────────────────────────────────────────

const CreateFlagSchema = z.object({
  contentType: z.enum(['post', 'comment', 'group', 'campaign', 'profile', 'message']),
  contentId: z.string().min(1).max(100),
  reason: z.enum(['spam', 'hate_speech', 'misinformation', 'harassment', 'illegal_content', 'other']),
  details: z.string().max(1000).optional(),
});

const UpdateFlagSchema = z.object({
  status: z.enum(['reviewed', 'dismissed', 'actioned']),
  reviewNote: z.string().max(500).optional(),
});

// ── Routes ─────────────────────────────────────────────────────────────────

communityReportRoutes.post('/', zValidator('json', CreateFlagSchema), async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId) return c.json({ error: 'unauthorized' }, 401);

  const body = c.req.valid('json');
  const db = c.env.DB as unknown as D1Like;
  const flagId = generateId('cflag');
  const ts = now();

  await db
    .prepare(
      `INSERT INTO content_flags
         (id, tenant_id, workspace_id, reporter_user_id, content_type, content_id, reason, details, status, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
    )
    .bind(
      flagId, auth.tenantId, auth.workspaceId ?? null, auth.userId,
      body.contentType, body.contentId, body.reason, body.details ?? null,
      'pending', ts,
    )
    .run();

  const flag = await db
    .prepare('SELECT * FROM content_flags WHERE id = ? AND tenant_id = ?')
    .bind(flagId, auth.tenantId)
    .first<Record<string, unknown>>();

  return c.json({ flag }, 201);
});

communityReportRoutes.get('/', async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId) return c.json({ error: 'unauthorized' }, 401);
  if (!['admin', 'super_admin', 'group_admin'].includes(auth.role ?? '')) {
    return c.json({ error: 'admin role required' }, 403);
  }

  const db = c.env.DB as unknown as D1Like;
  const status = c.req.query('status');
  const contentType = c.req.query('contentType');

  let sql = 'SELECT * FROM content_flags WHERE tenant_id = ?';
  const params: unknown[] = [auth.tenantId];

  if (status) { sql += ' AND status = ?'; params.push(status); }
  if (contentType) { sql += ' AND content_type = ?'; params.push(contentType); }
  sql += ' ORDER BY created_at DESC LIMIT 100';

  const { results } = await db.prepare(sql).bind(...params).all<Record<string, unknown>>();
  return c.json({ flags: results, total: results.length });
});

communityReportRoutes.patch('/:id', zValidator('json', UpdateFlagSchema), async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId) return c.json({ error: 'unauthorized' }, 401);
  if (!['admin', 'super_admin'].includes(auth.role ?? '')) {
    return c.json({ error: 'admin role required' }, 403);
  }

  const body = c.req.valid('json');
  const db = c.env.DB as unknown as D1Like;

  const flag = await db
    .prepare('SELECT id FROM content_flags WHERE id = ? AND tenant_id = ?')
    .bind(c.req.param('id'), auth.tenantId)
    .first<{ id: string }>();
  if (!flag) return c.json({ error: 'not_found' }, 404);

  await db
    .prepare(
      `UPDATE content_flags SET status = ?, review_note = ?, reviewed_by = ?, reviewed_at = ?
       WHERE id = ? AND tenant_id = ?`,
    )
    .bind(body.status, body.reviewNote ?? null, auth.userId, now(), flag.id, auth.tenantId)
    .run();

  const updated = await db
    .prepare('SELECT * FROM content_flags WHERE id = ? AND tenant_id = ?')
    .bind(flag.id, auth.tenantId)
    .first<Record<string, unknown>>();

  return c.json({ flag: updated });
});
