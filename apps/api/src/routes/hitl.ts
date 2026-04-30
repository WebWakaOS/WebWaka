/**
 * HITL (Human-In-The-Loop) Admin Routes
 * 
 * Phase A: Backend HITL Infrastructure
 * 
 * Provides admin endpoints for reviewing and approving AI-generated actions
 * that require human oversight (autonomy level 3).
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/require-role.js';

interface Auth {
  userId: string;
  tenantId: string;
  role?: 'user' | 'admin' | 'super_admin';
}

const app = new Hono<{ Bindings: Env }>();

/**
 * List all HITL actions with optional filters
 * GET /admin/hitl/actions?status=pending&vertical=bakery
 */
app.get('/actions', authMiddleware, requireRole('admin'), async (c) => {
  const { status, vertical, capability, priority } = c.req.query();
  
  const db = c.env.DB;
  const auth = c.get('auth') as Auth;
  const tenantId = auth.tenantId;

  let query = `
    SELECT 
      q.*,
      u.email as user_email,
      r.email as reviewer_email
    FROM ai_hitl_queue q
    LEFT JOIN users u ON q.user_id = u.id
    LEFT JOIN users r ON q.reviewer_id = r.id
    WHERE q.tenant_id = ?
  `;
  
  const params: string[] = [tenantId];

  if (status) {
    query += ' AND q.status = ?';
    params.push(status);
  }

  if (vertical) {
    query += ' AND q.vertical = ?';
    params.push(vertical);
  }

  if (capability) {
    query += ' AND q.capability = ?';
    params.push(capability);
  }

  query += ' ORDER BY q.created_at DESC LIMIT 100';

  const results = await db.prepare(query).bind(...params).all();

  const actions = results.results.map((row: any) => ({
    id: row.id,
    vertical: row.vertical,
    capability: row.capability,
    status: row.status,
    priority: derivePriority(row.hitl_level, row.capability),
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    userId: row.user_id,
    userEmail: row.user_email,
    proposedAction: JSON.parse(row.ai_request_payload),
    aiResponse: row.ai_response_payload ? JSON.parse(row.ai_response_payload) : null,
    aiReasoning: extractReasoning(row.ai_request_payload),
    requestedAt: row.created_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewer_id,
    reviewerEmail: row.reviewer_email,
    reviewNote: row.review_note,
    expiresAt: row.expires_at,
  }));

  return c.json({ actions, count: actions.length });
});

/**
 * Get a specific HITL action by ID
 * GET /admin/hitl/actions/:id
 */
app.get('/actions/:id', authMiddleware, requireRole('admin'), async (c) => {
  const { id } = c.req.param();
  const db = c.env.DB;
  const auth = c.get('auth') as Auth;
  const tenantId = auth.tenantId;

  const result = await db
    .prepare(
      `
      SELECT 
        q.*,
        u.email as user_email,
        r.email as reviewer_email
      FROM ai_hitl_queue q
      LEFT JOIN users u ON q.user_id = u.id
      LEFT JOIN users r ON q.reviewer_id = r.id
      WHERE q.id = ? AND q.tenant_id = ?
    `
    )
    .bind(id, tenantId)
    .first();

  if (!result) {
    return c.json({ error: 'HITL action not found' }, 404);
  }

  const action = {
    id: result.id,
    vertical: result.vertical,
    capability: result.capability,
    status: result.status,
    priority: derivePriority(result.hitl_level as number, result.capability as string),
    tenantId: result.tenant_id,
    workspaceId: result.workspace_id,
    userId: result.user_id,
    userEmail: result.user_email,
    proposedAction: JSON.parse(result.ai_request_payload as string),
    aiResponse: result.ai_response_payload ? JSON.parse(result.ai_response_payload as string) : null,
    aiReasoning: extractReasoning(result.ai_request_payload as string),
    requestedAt: result.created_at,
    reviewedAt: result.reviewed_at,
    reviewedBy: result.reviewer_id,
    reviewerEmail: result.reviewer_email,
    reviewNote: result.review_note,
    expiresAt: result.expires_at,
  };

  // Fetch related events
  const events = await db
    .prepare('SELECT * FROM ai_hitl_events WHERE queue_item_id = ? ORDER BY created_at DESC')
    .bind(id)
    .all();

  return c.json({ action, events: events.results });
});

/**
 * Approve an HITL action
 * POST /admin/hitl/actions/:id/approve
 */
app.post('/actions/:id/approve', authMiddleware, requireRole('admin'), async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();
  const { note } = body;
  
  const db = c.env.DB;
  const auth = c.get('auth') as Auth;
  const tenantId = auth.tenantId;
  const userId = auth.userId;
  const now = new Date().toISOString();

  // Check if action exists and is pending
  const action = await db
    .prepare('SELECT * FROM ai_hitl_queue WHERE id = ? AND tenant_id = ?')
    .bind(id, tenantId)
    .first();

  if (!action) {
    return c.json({ error: 'HITL action not found' }, 404);
  }

  if (action.status !== 'pending') {
    return c.json({ error: `Action already ${action.status}` }, 400);
  }

  // Update action status
  await db
    .prepare(
      `
      UPDATE ai_hitl_queue 
      SET status = 'approved', 
          reviewer_id = ?, 
          reviewed_at = ?,
          review_note = ?
      WHERE id = ?
    `
    )
    .bind(userId, now, note || null, id)
    .run();

  // Log event
  await db
    .prepare(
      `
      INSERT INTO ai_hitl_events (id, tenant_id, queue_item_id, event_type, actor_id, note, created_at)
      VALUES (?, ?, ?, 'approved', ?, ?, ?)
    `
    )
    .bind(crypto.randomUUID(), tenantId, id, userId, note || null, now)
    .run();

  // TODO: Execute the approved action via SuperAgent or appropriate service
  
  return c.json({ 
    success: true, 
    message: 'Action approved successfully',
    actionId: id
  });
});

/**
 * Reject an HITL action
 * POST /admin/hitl/actions/:id/reject
 */
app.post('/actions/:id/reject', authMiddleware, requireRole('admin'), async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();
  const { note } = body;
  
  const db = c.env.DB;
  const auth = c.get('auth') as Auth;
  const tenantId = auth.tenantId;
  const userId = auth.userId;
  const now = new Date().toISOString();

  // Check if action exists and is pending
  const action = await db
    .prepare('SELECT * FROM ai_hitl_queue WHERE id = ? AND tenant_id = ?')
    .bind(id, tenantId)
    .first();

  if (!action) {
    return c.json({ error: 'HITL action not found' }, 404);
  }

  if (action.status !== 'pending') {
    return c.json({ error: `Action already ${action.status}` }, 400);
  }

  // Update action status
  await db
    .prepare(
      `
      UPDATE ai_hitl_queue 
      SET status = 'rejected', 
          reviewer_id = ?, 
          reviewed_at = ?,
          review_note = ?
      WHERE id = ?
    `
    )
    .bind(userId, now, note || null, id)
    .run();

  // Log event
  await db
    .prepare(
      `
      INSERT INTO ai_hitl_events (id, tenant_id, queue_item_id, event_type, actor_id, note, created_at)
      VALUES (?, ?, ?, 'rejected', ?, ?, ?)
    `
    )
    .bind(crypto.randomUUID(), tenantId, id, userId, note || null, now)
    .run();
  
  return c.json({ 
    success: true, 
    message: 'Action rejected successfully',
    actionId: id
  });
});

/**
 * Modify an HITL action (for future implementation)
 * POST /admin/hitl/actions/:id/modify
 */
app.post('/actions/:id/modify', authMiddleware, requireRole('admin'), async (c) => {
  return c.json({ 
    error: 'Modify functionality not yet implemented',
    message: 'Coming soon: Allow admins to modify AI suggestions before approval'
  }, 501);
});

/**
 * Helper: Derive priority from HITL level and capability
 */
function derivePriority(hitlLevel: number, capability: string): 'low' | 'medium' | 'high' {
  if (hitlLevel === 3) return 'high';
  if (hitlLevel === 2) return 'medium';
  return 'low';
}

/**
 * Helper: Extract AI reasoning from request payload
 */
function extractReasoning(payload: string): string {
  try {
    const parsed = JSON.parse(payload);
    return parsed.reasoning || parsed.context || parsed.explanation || 'No reasoning provided';
  } catch {
    return 'Unable to extract reasoning';
  }
}

export default app;
