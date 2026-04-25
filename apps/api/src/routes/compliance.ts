/**
 * COMP-001 / COMP-002 / ENH-039: NDPR Compliance Routes
 *
 * POST /compliance/dsar/request        — submit a Data Subject Access Request (auth required)
 * GET  /compliance/dsar/status/:id     — check DSAR status (auth required, own requests only)
 * POST /compliance/dsar/download/:id   — retrieve R2 export JSON (auth required, own + completed)
 *
 * T3 invariant: every DB query includes tenant_id from JWT, never from user input.
 * G23 invariant: no audit_log updates or deletes.
 * P13 invariant: export payload is returned directly — never logged.
 */

import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import type { Env } from '../env.js';

export const complianceRoutes = new Hono<{ Bindings: Env }>();

complianceRoutes.use('*', authMiddleware);

const EXPORT_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

// ---------------------------------------------------------------------------
// POST /compliance/dsar/request — submit a DSAR export request (COMP-001)
// ---------------------------------------------------------------------------
complianceRoutes.post('/dsar/request', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };

  // Rate-limit: one pending request per user at a time.
  const existing = await c.env.DB.prepare(
    `SELECT id FROM dsar_requests
     WHERE user_id = ? AND tenant_id = ? AND status = 'pending'
     LIMIT 1`,
  ).bind(auth.userId, auth.tenantId).first<{ id: string }>();

  if (existing) {
    return c.json({
      message: 'You already have a pending data export request.',
      requestId: existing.id,
    }, 409);
  }

  const requestId = crypto.randomUUID();
  const expiresAt = Math.floor(Date.now() / 1000) + EXPORT_TTL_SECONDS;

  await c.env.DB.prepare(
    `INSERT INTO dsar_requests (id, user_id, tenant_id, status, expires_at, requested_at)
     VALUES (?, ?, ?, 'pending', ?, unixepoch())`,
  ).bind(requestId, auth.userId, auth.tenantId, expiresAt).run();

  console.log(JSON.stringify({
    level: 'info',
    event: 'dsar_request_created',
    requestId,
    userId: auth.userId,
    tenantId: auth.tenantId,
  }));

  return c.json({
    requestId,
    message: 'Your data export request has been received. Processing takes up to 15 minutes.',
    estimatedCompletionAt: new Date((Math.floor(Date.now() / 1000) + 900) * 1000).toISOString(),
  }, 202);
});

// ---------------------------------------------------------------------------
// GET /compliance/dsar/status/:id — check DSAR status (own requests only)
// ---------------------------------------------------------------------------
complianceRoutes.get('/dsar/status/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const requestId = c.req.param('id');

  const row = await c.env.DB.prepare(
    `SELECT id, status, requested_at, completed_at, export_key
     FROM dsar_requests
     WHERE id = ? AND user_id = ? AND tenant_id = ?`,
  ).bind(requestId, auth.userId, auth.tenantId).first<{
    id: string; status: string; requested_at: number;
    completed_at: number | null; export_key: string | null;
  }>();

  if (!row) {
    return c.json({ message: 'Request not found.' }, 404);
  }

  const isCompleted = row.status === 'completed';
  const exportExpiresAt = isCompleted && row.completed_at
    ? new Date((row.completed_at + EXPORT_TTL_SECONDS) * 1000).toISOString()
    : null;

  return c.json({
    requestId: row.id,
    status: row.status,
    requestedAt: new Date(row.requested_at * 1000).toISOString(),
    completedAt: row.completed_at ? new Date(row.completed_at * 1000).toISOString() : null,
    expiresAt: exportExpiresAt,
    downloadAvailable: isCompleted && row.export_key !== null,
  });
});

// ---------------------------------------------------------------------------
// POST /compliance/dsar/download/:id — stream R2 export (own + completed only)
// ---------------------------------------------------------------------------
complianceRoutes.post('/dsar/download/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const requestId = c.req.param('id');

  const row = await c.env.DB.prepare(
    `SELECT status, export_key, completed_at
     FROM dsar_requests
     WHERE id = ? AND user_id = ? AND tenant_id = ?`,
  ).bind(requestId, auth.userId, auth.tenantId).first<{
    status: string; export_key: string | null; completed_at: number | null;
  }>();

  if (!row) return c.json({ message: 'Request not found.' }, 404);

  if (row.status !== 'completed' || !row.export_key) {
    return c.json({ message: 'Export not ready yet. Check status via GET /compliance/dsar/status/:id.' }, 425);
  }

  const exportExpiresAt = row.completed_at ? row.completed_at + EXPORT_TTL_SECONDS : 0;
  if (exportExpiresAt < Math.floor(Date.now() / 1000)) {
    return c.json({ message: 'Export has expired. Please submit a new DSAR request.' }, 410);
  }

  if (!c.env.ASSETS) {
    return c.json({ message: 'File storage not available. Please try again later.' }, 503);
  }

  const object = await c.env.ASSETS.get(row.export_key);
  if (!object) {
    return c.json({ message: 'Export data has expired from storage. Please submit a new DSAR request.' }, 410);
  }

  const body = await object.arrayBuffer();
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="waka-data-export-${requestId}.json"`,
      'Cache-Control': 'no-store',
    },
  });
});
