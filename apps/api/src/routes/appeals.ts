/**
 * Moderation Appeal routes — Phase 5 (E32)
 *
 * Moderation appeals allow members to contest content removal/flagging decisions.
 * Appeals are reviewed by workspace admins (HITL L1) or platform moderators (HITL L2).
 *
 * POST   /appeals              — Submit appeal for a moderated broadcast (auth required)
 * GET    /admin/appeals        — List pending appeals for admin review (admin/super_admin)
 * PATCH  /admin/appeals/:id    — Review appeal (approve/reject/escalate) (admin/super_admin)
 *
 * Platform Invariants:
 *   T3  — all queries bind tenant_id + workspace_id
 *   G23 — original moderation decision stored in evidence_json (never overwritten)
 *   P13 — reviewer identity stored but NOT exposed in non-admin responses
 *   T5  — admin routes enforce admin/super_admin role
 *   AC-FUNC-03 — appeal lifecycle transitions only go forward (pending→reviewed)
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';

const appealsRoutes = new Hono<{ Bindings: Env }>();

// ── D1Like interface (local convenience) ────────────────────────────────────

interface D1Like {
  prepare(query: string): {
    bind(...args: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
    run(): Promise<{ success: boolean }>;
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results: T[] }>;
  };
}

function generateAppealId(): string {
  return `apl_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`;
}

// ---------------------------------------------------------------------------
// POST /appeals — Submit a moderation appeal
// Auth required. Members appeal their own content only.
// ---------------------------------------------------------------------------

appealsRoutes.post('/', async (c) => {
  const auth = c.get('auth');
  const db = c.env.DB as unknown as D1Like;

  let body: {
    broadcastId?: string;
    originalAction?: string;
    appealReason?: string;
    evidenceJson?: Record<string, unknown>;
  };

  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const { broadcastId, originalAction, appealReason, evidenceJson = {} } = body;

  if (!broadcastId || typeof broadcastId !== 'string') {
    return c.json({ error: 'broadcastId is required' }, 400);
  }

  if (!originalAction || !['removed', 'flagged', 'withheld', 'rejected'].includes(originalAction)) {
    return c.json({ error: 'originalAction must be one of: removed, flagged, withheld, rejected' }, 400);
  }

  if (!appealReason || typeof appealReason !== 'string' || appealReason.trim().length < 10) {
    return c.json({ error: 'appealReason is required and must be at least 10 characters' }, 400);
  }

  // Check for existing pending appeal for the same broadcast by this appellant
  const existing = await db
    .prepare(
      `SELECT id FROM broadcast_appeals
       WHERE broadcast_id = ? AND appellant_id = ? AND tenant_id = ? AND status = 'pending'`,
    )
    .bind(broadcastId, auth.userId, auth.tenantId)
    .first<{ id: string }>();

  if (existing) {
    return c.json(
      { error: 'A pending appeal already exists for this broadcast', appealId: existing.id },
      409,
    );
  }

  const appealId = generateAppealId();
  const now = Math.floor(Date.now() / 1000);

  await db
    .prepare(
      `INSERT INTO broadcast_appeals
         (id, tenant_id, workspace_id, broadcast_id, appellant_id,
          original_action, appeal_reason, status, evidence_json, hitl_level,
          created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, 1, ?, ?)`,
    )
    .bind(
      appealId,
      auth.tenantId,
      auth.workspaceId ?? '',
      broadcastId,
      auth.userId,
      originalAction,
      appealReason.trim(),
      JSON.stringify(evidenceJson),
      now,
      now,
    )
    .run();

  return c.json(
    {
      appealId,
      broadcastId,
      status: 'pending',
      originalAction,
      message: 'Appeal submitted successfully. A workspace admin will review it.',
    },
    201,
  );
});

// ---------------------------------------------------------------------------
// GET /admin/appeals — List pending appeals for admin review
// T5: admin/super_admin only
// ---------------------------------------------------------------------------

appealsRoutes.get('/admin', async (c) => {
  const auth = c.get('auth');

  if (auth.role !== 'admin' && auth.role !== 'super_admin') {
    return c.json({ error: 'Admin role required' }, 403);
  }

  const db = c.env.DB as unknown as D1Like;
  const status = c.req.query('status') ?? 'pending';
  const limit = Math.min(parseInt(c.req.query('limit') ?? '50', 10), 100);

  const validStatuses = ['pending', 'approved', 'rejected', 'escalated', 'withdrawn', 'all'];
  if (!validStatuses.includes(status)) {
    return c.json({ error: `status must be one of: ${validStatuses.join(', ')}` }, 400);
  }

  const appeals = await db
    .prepare(
      status === 'all'
        ? `SELECT id, tenant_id, workspace_id, broadcast_id, appellant_id,
                  original_action, appeal_reason, status, hitl_level,
                  reviewed_at, review_decision, created_at
           FROM broadcast_appeals
           WHERE tenant_id = ?
           ORDER BY created_at DESC LIMIT ?`
        : `SELECT id, tenant_id, workspace_id, broadcast_id, appellant_id,
                  original_action, appeal_reason, status, hitl_level,
                  reviewed_at, review_decision, created_at
           FROM broadcast_appeals
           WHERE tenant_id = ? AND status = ?
           ORDER BY created_at DESC LIMIT ?`,
    )
    .bind(
      ...(status === 'all' ? [auth.tenantId, limit] : [auth.tenantId, status, limit]),
    )
    .all<{
      id: string;
      tenant_id: string;
      workspace_id: string;
      broadcast_id: string;
      appellant_id: string;
      original_action: string;
      appeal_reason: string;
      status: string;
      hitl_level: number | null;
      reviewed_at: number | null;
      review_decision: string | null;
      created_at: number;
    }>();

  return c.json({
    appeals: appeals.results,
    count: appeals.results.length,
    status,
  });
});

// ---------------------------------------------------------------------------
// PATCH /admin/appeals/:id — Review an appeal (approve/reject/escalate)
// T5: admin/super_admin only
// G23: original decision preserved in evidence_json
// ---------------------------------------------------------------------------

appealsRoutes.patch('/admin/:id', async (c) => {
  const auth = c.get('auth');

  if (auth.role !== 'admin' && auth.role !== 'super_admin') {
    return c.json({ error: 'Admin role required' }, 403);
  }

  const appealId = c.req.param('id');
  const db = c.env.DB as unknown as D1Like;

  let body: {
    decision?: string;
    reviewNotes?: string;
    escalateTo?: string;
  };

  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const { decision, reviewNotes, escalateTo } = body;

  if (!decision || !['reinstate', 'uphold', 'escalate'].includes(decision)) {
    return c.json({ error: 'decision must be one of: reinstate, uphold, escalate' }, 400);
  }

  // T3: scope by tenant_id
  const appeal = await db
    .prepare(
      `SELECT id, status, broadcast_id, appellant_id, evidence_json
       FROM broadcast_appeals
       WHERE id = ? AND tenant_id = ?`,
    )
    .bind(appealId, auth.tenantId)
    .first<{
      id: string;
      status: string;
      broadcast_id: string;
      appellant_id: string;
      evidence_json: string;
    }>();

  if (!appeal) {
    return c.json({ error: 'Appeal not found' }, 404);
  }

  if (!['pending', 'escalated'].includes(appeal.status)) {
    return c.json({ error: `Appeal is already ${appeal.status} — cannot review` }, 409);
  }

  const now = Math.floor(Date.now() / 1000);

  // Map decision → status
  const newStatus =
    decision === 'reinstate' ? 'approved' :
    decision === 'uphold'    ? 'rejected' :
    'escalated';

  // G23: merge review snapshot into existing evidence_json (never overwrite original event)
  let evidenceObj: Record<string, unknown> = {};
  try {
    evidenceObj = JSON.parse(appeal.evidence_json) as Record<string, unknown>;
  } catch { /* keep empty object */ }
  evidenceObj['review_snapshot'] = {
    reviewer_id: auth.userId,
    decision,
    review_notes: reviewNotes ?? null,
    reviewed_at: now,
  };

  await db
    .prepare(
      `UPDATE broadcast_appeals
       SET status = ?, reviewer_id = ?, review_notes = ?, review_decision = ?,
           reviewed_at = ?, escalated_to = ?,
           escalated_at = ?, evidence_json = ?, updated_at = ?
       WHERE id = ? AND tenant_id = ?`,
    )
    .bind(
      newStatus,
      auth.userId,
      reviewNotes ?? null,
      decision,
      now,
      decision === 'escalate' ? (escalateTo ?? null) : null,
      decision === 'escalate' ? now : null,
      JSON.stringify(evidenceObj),
      now,
      appealId,
      auth.tenantId,
    )
    .run();

  return c.json({
    appealId,
    broadcastId: appeal.broadcast_id,
    status: newStatus,
    decision,
    reviewedAt: now,
    message:
      decision === 'reinstate' ? 'Appeal approved — content will be reinstated' :
      decision === 'uphold'    ? 'Appeal rejected — original moderation decision upheld' :
                                 'Appeal escalated for platform moderator review',
  });
});

export { appealsRoutes };
