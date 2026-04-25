/**
 * COMP-001 / COMP-002 / ENH-039: NDPR Compliance Routes
 *
 * POST /compliance/dsar/request        — submit a Data Subject Access Request (auth required)
 * GET  /compliance/dsar/status/:id     — check DSAR status (auth required, own requests only)
 * POST /compliance/dsar/download/:id   — issue a 1-hour R2 pre-signed URL (auth required)
 * GET  /compliance/dsar/token/:token   — fallback: redeem single-use download token (no auth)
 *
 * Download flow (preferred — requires R2_ACCOUNT_ID + R2_DSAR_ACCESS_KEY_ID + R2_DSAR_SECRET_ACCESS_KEY):
 *   POST /download/:id  → aws4fetch signs a real R2 S3-compatible pre-signed URL (1 hour TTL)
 *   Returns { url: "https://<accountId>.r2.cloudflarestorage.com/<bucket>/<key>?X-Amz-*", expiresAt }
 *   Client downloads directly from R2 — no Worker proxy needed.
 *
 * Fallback download flow (when R2 API credentials are not configured):
 *   POST /download/:id  → issues a UUID token in RATE_LIMIT_KV (1 hour TTL)
 *   Returns { url: "https://<origin>/compliance/dsar/token/<token>", expiresAt }
 *   GET  /token/:token  → validates token, streams from DSAR_BUCKET via Worker binding
 *   The token is single-use (deleted on first redemption).
 *
 * T3 invariant: every DB query includes tenant_id from JWT, never from user input.
 * G23 invariant: no audit_log updates or deletes.
 * P13 invariant: export payload is streamed directly — never logged.
 */

import { Hono } from 'hono';
import { AwsClient } from 'aws4fetch';
import { authMiddleware } from '../middleware/auth.js';
import type { Env } from '../env.js';

export const complianceRoutes = new Hono<{ Bindings: Env }>();

const EXPORT_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days — R2 export object lifetime
const DOWNLOAD_URL_TTL   = 3600;              // 1 hour — pre-signed URL validity

// ---------------------------------------------------------------------------
// Auth-gated routes
// ---------------------------------------------------------------------------
complianceRoutes.use('/dsar/request',      authMiddleware);
complianceRoutes.use('/dsar/status/*',     authMiddleware);
complianceRoutes.use('/dsar/download/*',   authMiddleware);
// /dsar/token/* intentionally NOT behind authMiddleware — token IS the auth.

// ---------------------------------------------------------------------------
// Internal helper — generate R2 pre-signed URL via S3-compatible API
//
// Uses aws4fetch to produce a URL that is valid for `expiresInSeconds` and
// grants GET access directly to the R2 object. No Worker proxy involved.
// Requires R2_ACCOUNT_ID + R2_DSAR_ACCESS_KEY_ID + R2_DSAR_SECRET_ACCESS_KEY + DSAR_BUCKET_NAME.
// ---------------------------------------------------------------------------

async function generateR2PresignedUrl(
  accountId: string,
  accessKeyId: string,
  secretAccessKey: string,
  bucketName: string,
  objectKey: string,
  expiresInSeconds = DOWNLOAD_URL_TTL,
): Promise<string> {
  const client = new AwsClient({
    accessKeyId,
    secretAccessKey,
    service: 's3',
    region: 'auto',
  });

  // Build the R2 S3-compatible object URL.
  // The objectKey may contain '/' (e.g. "dsar/{tenantId}/{requestId}.json");
  // those slashes are path components — they must NOT be percent-encoded.
  const objectUrl = `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${objectKey}`;
  const url = new URL(objectUrl);
  url.searchParams.set('X-Amz-Expires', String(expiresInSeconds));

  const signed = await client.sign(new Request(url.toString()), {
    aws: { signQuery: true },
  });

  return signed.url;
}

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
// POST /compliance/dsar/download/:id — issue a 1-hour download URL
//
// Preferred: generates a real R2 S3 pre-signed URL (requires R2 API credentials).
// Fallback:  issues a single-use KV token and returns a Worker proxy URL.
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
    return c.json({
      message: 'Export not ready yet. Check status via GET /compliance/dsar/status/:id.',
    }, 425);
  }

  const exportExpiresAt = row.completed_at ? row.completed_at + EXPORT_TTL_SECONDS : 0;
  if (exportExpiresAt < Math.floor(Date.now() / 1000)) {
    return c.json({ message: 'Export has expired. Please submit a new DSAR request.' }, 410);
  }

  const urlExpiry = new Date(Date.now() + DOWNLOAD_URL_TTL * 1000).toISOString();

  // ── Preferred: real R2 S3-compatible pre-signed URL ─────────────────────
  if (
    c.env.R2_ACCOUNT_ID &&
    c.env.R2_DSAR_ACCESS_KEY_ID &&
    c.env.R2_DSAR_SECRET_ACCESS_KEY &&
    c.env.DSAR_BUCKET_NAME
  ) {
    const presignedUrl = await generateR2PresignedUrl(
      c.env.R2_ACCOUNT_ID,
      c.env.R2_DSAR_ACCESS_KEY_ID,
      c.env.R2_DSAR_SECRET_ACCESS_KEY,
      c.env.DSAR_BUCKET_NAME,
      row.export_key,
      DOWNLOAD_URL_TTL,
    );

    return c.json({ url: presignedUrl, expiresAt: urlExpiry });
  }

  // ── Fallback: single-use KV token + Worker proxy URL ────────────────────
  // Used when R2 API credentials are not yet configured (dev / early staging).
  const token = crypto.randomUUID();
  const tokenPayload = JSON.stringify({
    requestId,
    exportKey: row.export_key,
    userId:    auth.userId,
    tenantId:  auth.tenantId,
  });

  await c.env.RATE_LIMIT_KV.put(`dsar:token:${token}`, tokenPayload, {
    expirationTtl: DOWNLOAD_URL_TTL,
  });

  const origin = new URL(c.req.url).origin;
  const url    = `${origin}/compliance/dsar/token/${token}`;

  return c.json({ url, expiresAt: urlExpiry });
});

// ---------------------------------------------------------------------------
// GET /compliance/dsar/token/:token — fallback token-based download
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
    return c.json({
      message: 'Export data has expired from storage. Please submit a new DSAR request.',
    }, 410);
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
