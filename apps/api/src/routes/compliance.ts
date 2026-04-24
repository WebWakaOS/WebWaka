/**
 * COMP-001 / ENH-039: NDPR Compliance Routes
 *
 * POST /compliance/dsar/request        — submit a Data Subject Access Request (auth required)
 * GET  /compliance/dsar/status/:id     — check DSAR status (auth required, own requests only)
 * POST /compliance/dsar/download/:id   — retrieve KV export link (auth required)
 *
 * T3 invariant: every DB query includes tenant_id from JWT, never from user input.
 * G23 invariant: no audit_log updates or deletes.
 */

import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import type { Env } from '../env.js';

export const complianceRoutes = new Hono<{ Bindings: Env }>();

complianceRoutes.use('*', authMiddleware);

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
  const expiresAt = Math.floor(Date.now() / 1000) + 86400; // 24 h

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
    message: 'Your data export request has been received. A download link will be available within 24 hours.',
    estimatedCompletionAt: new Date(expiresAt * 1000).toISOString(),
  }, 202);
});

// ---------------------------------------------------------------------------
// GET /compliance/dsar/status/:id — check DSAR status (own requests only)
// ---------------------------------------------------------------------------
complianceRoutes.get('/dsar/status/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const requestId = c.req.param('id');

  const row = await c.env.DB.prepare(
    `SELECT id, status, requested_at, completed_at, expires_at, download_key
     FROM dsar_requests
     WHERE id = ? AND user_id = ? AND tenant_id = ?`,
  ).bind(requestId, auth.userId, auth.tenantId).first<{
    id: string; status: string; requested_at: number;
    completed_at: number | null; expires_at: number; download_key: string | null;
  }>();

  if (!row) {
    return c.json({ message: 'Request not found.' }, 404);
  }

  return c.json({
    requestId: row.id,
    status: row.status,
    requestedAt: new Date(row.requested_at * 1000).toISOString(),
    completedAt: row.completed_at ? new Date(row.completed_at * 1000).toISOString() : null,
    expiresAt: new Date(row.expires_at * 1000).toISOString(),
    downloadAvailable: row.status === 'ready' && row.download_key !== null,
  });
});

// ---------------------------------------------------------------------------
// POST /compliance/dsar/download/:id — retrieve KV export JSON (own + ready only)
// ---------------------------------------------------------------------------
complianceRoutes.post('/dsar/download/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const requestId = c.req.param('id');

  const row = await c.env.DB.prepare(
    `SELECT status, download_key, expires_at
     FROM dsar_requests
     WHERE id = ? AND user_id = ? AND tenant_id = ?`,
  ).bind(requestId, auth.userId, auth.tenantId).first<{
    status: string; download_key: string | null; expires_at: number;
  }>();

  if (!row) return c.json({ message: 'Request not found.' }, 404);
  if (row.status !== 'ready' || !row.download_key) {
    return c.json({ message: 'Export not ready yet. Check status via GET /compliance/dsar/status/:id.' }, 425);
  }
  if (row.expires_at < Math.floor(Date.now() / 1000)) {
    return c.json({ message: 'Export link has expired. Please submit a new DSAR request.' }, 410);
  }

  const exportJson = await c.env.RATE_LIMIT_KV.get(row.download_key);
  if (!exportJson) {
    return c.json({ message: 'Export data has expired from cache. Please submit a new DSAR request.' }, 410);
  }

  return new Response(exportJson, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="waka-data-export-${requestId}.json"`,
    },
  });
});
