/**
 * COMP-001 / COMP-002 / ENH-039: NDPR Compliance Routes
 *
 * POST /compliance/dsar/request        — submit a Data Subject Access Request (auth required)
 * GET  /compliance/dsar/status/:id     — check DSAR status (auth required, own requests only)
 * POST /compliance/dsar/download/:id   — issue a 1-hour signed download URL (auth required)
 * GET  /compliance/dsar/token/:token   — redeem signed download token, stream export (no auth)
 *
 * T3 invariant: every DB query includes tenant_id from JWT, never from user input.
 * G23 invariant: no audit_log updates or deletes.
 * P13 invariant: export payload is streamed directly — never logged.
 *
 * Download flow:
 *   1. POST /download/:id  (with JWT)  → returns { url, expires_at } where url contains token
 *   2. GET  /token/:token  (no auth)   → validates token from KV, streams R2 object
 *   The token is single-use (deleted from KV on first redemption) and valid for 1 hour.
 */

import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import type { Env } from '../env.js';

export const complianceRoutes = new Hono<{ Bindings: Env }>();

const EXPORT_TTL_SECONDS  = 7 * 24 * 60 * 60; // 7 days — how long R2 export lives
const DOWNLOAD_TOKEN_TTL  = 3600;              // 1 hour — signed URL validity

// ---------------------------------------------------------------------------
// Auth-gated routes
// ---------------------------------------------------------------------------
complianceRoutes.use('/dsar/request',      authMiddleware);
complianceRoutes.use('/dsar/status/*',     authMiddleware);
complianceRoutes.use('/dsar/download/*',   authMiddleware);
// /dsar/token/* is intentionally NOT behind authMiddleware — the token IS the auth.

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
// POST /compliance/dsar/download/:id — issue a 1-hour signed download URL
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

  // Generate a single-use download token (UUID) stored in KV with 1-hour TTL.
  // The token encodes the export_key so the /token/:token handler can stream from R2.
  const token = crypto.randomUUID();
  const tokenPayload = JSON.stringify({
    requestId,
    exportKey: row.export_key,
    userId: auth.userId,
    tenantId: auth.tenantId,
  });

  await c.env.RATE_LIMIT_KV.put(`dsar:token:${token}`, tokenPayload, {
    expirationTtl: DOWNLOAD_TOKEN_TTL,
  });

  const origin   = new URL(c.req.url).origin;
  const url      = `${origin}/compliance/dsar/token/${token}`;
  const expiresAt = new Date(Date.now() + DOWNLOAD_TOKEN_TTL * 1000).toISOString();

  return c.json({ url, expiresAt });
});

// ---------------------------------------------------------------------------
// GET /compliance/dsar/token/:token — redeem download token, stream export
// (No auth middleware — the token IS the auth. Single-use; deleted on redemption.)
// ---------------------------------------------------------------------------
complianceRoutes.get('/dsar/token/:token', async (c) => {
  const token = c.req.param('token');
  const kvKey = `dsar:token:${token}`;

  const raw = await c.env.RATE_LIMIT_KV.get(kvKey);
  if (!raw) {
    return c.json({ message: 'Download link is invalid or has expired.' }, 410);
  }

  // Delete token immediately — single-use
  await c.env.RATE_LIMIT_KV.delete(kvKey);

  let payload: { requestId: string; exportKey: string; userId: string; tenantId: string };
  try {
    payload = JSON.parse(raw);
  } catch {
    return c.json({ message: 'Download link is malformed.' }, 400);
  }

  if (!c.env.DSAR_BUCKET) {
    return c.json({ message: 'Export storage not available. Please try again later.' }, 503);
  }

  const object = await c.env.DSAR_BUCKET.get(payload.exportKey);
  if (!object) {
    return c.json({ message: 'Export data has expired from storage. Please submit a new DSAR request.' }, 410);
  }

  const body = await object.arrayBuffer();
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="waka-data-export-${payload.requestId}.json"`,
      'Cache-Control': 'no-store',
    },
  });
});
