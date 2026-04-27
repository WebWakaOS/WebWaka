/**
 * Regulatory Verification — Compliance-Gated Template Module
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WORKSPACE-OWNER ROUTES (auth-gated, T3 tenant-scoped)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   POST /regulatory-verification/submit
 *     — Submit or update a sector licence for platform review.
 *       Idempotent via INSERT OR REPLACE on (workspace_id, vertical_slug, regulatory_body).
 *       Body: { vertical_slug, regulatory_body, license_number, license_class? }
 *
 *   GET  /regulatory-verification/status
 *     — Return all verification rows for the calling workspace.
 *       Always includes a synthetic 'not_submitted' entry for each gated
 *       vertical/body combination the workspace has NOT yet submitted.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PLATFORM-ADMIN ROUTES (super_admin, applied at router registration)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   GET  /platform-admin/sector-licenses
 *     — List all submissions (cross-workspace). Filter: status, vertical_slug, workspace_id.
 *
 *   GET  /platform-admin/sector-licenses/:id
 *     — Single submission detail.
 *
 *   POST /platform-admin/sector-licenses/:id/verify
 *     — Approve a submission. Body: { expires_at?: string (ISO date) }
 *
 *   POST /platform-admin/sector-licenses/:id/reject
 *     — Reject a submission. Body: { rejection_reason: string }
 *
 *   POST /platform-admin/sector-licenses/:id/expire
 *     — Mark a verified licence as expired.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * INVARIANTS
 * ─────────────────────────────────────────────────────────────────────────────
 *   T3: workspace_id always sourced from JWT (never user-supplied).
 *   T4: amounts not applicable — no money in this module.
 *   G23: no audit_log updates or deletes.
 *   Status FSM: pending_review → verified | rejected | expired
 *               rejected       → pending_review (via re-submit)
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';

type AuthContext = { userId: string; tenantId: string; workspaceId: string; role: string };
type AppEnv = { Bindings: Env; Variables: { auth: AuthContext } };

// ---------------------------------------------------------------------------
// Constants — compliance-gated verticals and their primary regulatory bodies
// ---------------------------------------------------------------------------

export const GATED_VERTICALS: Record<string, string[]> = {
  'hospital':           ['MDCN', 'State-MoH'],
  'university':         ['NUC'],
  'diagnostic-lab':     ['MLSCN'],
  'microfinance-bank':  ['CBN', 'NDIC'],
  'insurance-company':  ['NAICOM'],
  'pension-fund':       ['PenCom', 'SEC'],
  'stockbroker':        ['SEC', 'NSE-NASD'],
};

const ALLOWED_VERTICAL_SLUGS = new Set(Object.keys(GATED_VERTICALS));

const _ALLOWED_REGULATORY_BODIES = new Set<string>(
  Object.values(GATED_VERTICALS).flat(),
);

const VALID_STATUSES = new Set(['pending_review', 'verified', 'rejected', 'expired']);

// ---------------------------------------------------------------------------
// Workspace-owner router
// ---------------------------------------------------------------------------

export const regulatoryVerificationRoutes = new Hono<AppEnv>();

// POST /regulatory-verification/submit
regulatoryVerificationRoutes.post('/submit', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const workspaceId = auth.tenantId;

  let body: {
    vertical_slug: string;
    regulatory_body: string;
    license_number: string;
    license_class?: string;
  };

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'invalid_json', message: 'Request body must be valid JSON.' }, 400);
  }

  const { vertical_slug, regulatory_body, license_number, license_class } = body;

  if (!vertical_slug || !regulatory_body || !license_number) {
    return c.json({
      error: 'missing_fields',
      message: 'vertical_slug, regulatory_body, and license_number are required.',
    }, 400);
  }

  if (!ALLOWED_VERTICAL_SLUGS.has(vertical_slug)) {
    return c.json({
      error: 'invalid_vertical',
      message: `vertical_slug must be one of: ${[...ALLOWED_VERTICAL_SLUGS].join(', ')}.`,
    }, 422);
  }

  const allowedBodies = GATED_VERTICALS[vertical_slug] ?? [];
  if (!allowedBodies.includes(regulatory_body)) {
    return c.json({
      error: 'invalid_regulatory_body',
      message: `For ${vertical_slug}, regulatory_body must be one of: ${allowedBodies.join(', ')}.`,
    }, 422);
  }

  if (license_number.trim().length < 3 || license_number.trim().length > 100) {
    return c.json({
      error: 'invalid_license_number',
      message: 'license_number must be between 3 and 100 characters.',
    }, 422);
  }

  const newId = crypto.randomUUID().replace(/-/g, '');
  const now   = Math.floor(Date.now() / 1000);

  await c.env.DB.prepare(
    `INSERT INTO sector_license_verifications
       (id, workspace_id, vertical_slug, regulatory_body,
        license_number, license_class, status, submitted_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'pending_review', ?, ?, ?)
     ON CONFLICT(workspace_id, vertical_slug, regulatory_body) DO UPDATE SET
       license_number   = excluded.license_number,
       license_class    = excluded.license_class,
       status           = 'pending_review',
       rejection_reason = NULL,
       reviewed_at      = NULL,
       reviewed_by      = NULL,
       submitted_at     = excluded.submitted_at,
       updated_at       = excluded.updated_at`,
  ).bind(
    newId, workspaceId, vertical_slug, regulatory_body,
    license_number.trim(),
    license_class?.trim() ?? null,
    now, now, now,
  ).run();

  const row = await c.env.DB.prepare(
    `SELECT id, workspace_id, vertical_slug, regulatory_body,
            license_number, license_class, status, submitted_at
     FROM sector_license_verifications
     WHERE workspace_id = ? AND vertical_slug = ? AND regulatory_body = ?`,
  ).bind(workspaceId, vertical_slug, regulatory_body)
    .first<{
      id: string; workspace_id: string; vertical_slug: string; regulatory_body: string;
      license_number: string; license_class: string | null; status: string; submitted_at: number;
    }>();

  console.log(JSON.stringify({
    level: 'info',
    event: 'sector_license_submitted',
    workspaceId,
    verticalSlug: vertical_slug,
    regulatoryBody: regulatory_body,
    id: row?.id,
  }));

  return c.json({
    message: 'Licence submission received. A platform reviewer will verify your registration details within 2–5 business days.',
    verification: row,
  }, 201);
});

// GET /regulatory-verification/status
regulatoryVerificationRoutes.get('/status', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const workspaceId = auth.tenantId;

  const result = await c.env.DB.prepare(
    `SELECT id, workspace_id, vertical_slug, regulatory_body,
            license_number, license_class, status, rejection_reason,
            submitted_at, reviewed_at, expires_at
     FROM sector_license_verifications
     WHERE workspace_id = ?
     ORDER BY vertical_slug ASC, submitted_at DESC`,
  ).bind(workspaceId).all<{
    id: string; workspace_id: string; vertical_slug: string; regulatory_body: string;
    license_number: string; license_class: string | null; status: string;
    rejection_reason: string | null; submitted_at: number; reviewed_at: number | null;
    expires_at: number | null;
  }>();

  const submitted = result.results ?? [];

  const submittedSet = new Set(
    submitted.map((r) => `${r.vertical_slug}:${r.regulatory_body}`),
  );

  const notSubmitted: Array<{
    id: null; vertical_slug: string; regulatory_body: string;
    status: 'not_submitted'; license_number: null;
  }> = [];

  for (const [slug, bodies] of Object.entries(GATED_VERTICALS)) {
    for (const body of bodies) {
      if (!submittedSet.has(`${slug}:${body}`)) {
        notSubmitted.push({
          id: null,
          vertical_slug: slug,
          regulatory_body: body,
          status: 'not_submitted',
          license_number: null,
        });
      }
    }
  }

  return c.json({
    workspaceId,
    submitted: submitted.map((r) => ({
      ...r,
      submitted_at: new Date(r.submitted_at * 1000).toISOString(),
      reviewed_at: r.reviewed_at ? new Date(r.reviewed_at * 1000).toISOString() : null,
      expires_at:  r.expires_at  ? new Date(r.expires_at  * 1000).toISOString() : null,
    })),
    not_submitted: notSubmitted,
  });
});

// ---------------------------------------------------------------------------
// Platform-admin router
// ---------------------------------------------------------------------------

export const platformAdminSectorLicensesRoutes = new Hono<AppEnv>();

// GET /platform-admin/sector-licenses
platformAdminSectorLicensesRoutes.get('/', async (c) => {
  const status      = c.req.query('status');
  const verticalSlug = c.req.query('vertical_slug');
  const workspaceId  = c.req.query('workspace_id');
  const pageStr      = c.req.query('page') ?? '1';
  const page         = Math.max(1, parseInt(pageStr, 10) || 1);
  const limit        = 50;
  const offset       = (page - 1) * limit;

  if (status && !VALID_STATUSES.has(status)) {
    return c.json({ error: 'invalid_status', message: `status must be one of: ${[...VALID_STATUSES].join(', ')}.` }, 422);
  }

  if (verticalSlug && !ALLOWED_VERTICAL_SLUGS.has(verticalSlug)) {
    return c.json({ error: 'invalid_vertical', message: `vertical_slug must be one of: ${[...ALLOWED_VERTICAL_SLUGS].join(', ')}.` }, 422);
  }

  const conditions: string[] = [];
  const binds: (string | number)[] = [];

  if (status) {
    conditions.push('status = ?');
    binds.push(status);
  }
  if (verticalSlug) {
    conditions.push('vertical_slug = ?');
    binds.push(verticalSlug);
  }
  if (workspaceId) {
    conditions.push('workspace_id = ?');
    binds.push(workspaceId);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows, total] = await Promise.all([
    c.env.DB.prepare(
      `SELECT id, workspace_id, vertical_slug, regulatory_body,
              license_number, license_class, status, rejection_reason,
              submitted_at, reviewed_at, reviewed_by, expires_at
       FROM sector_license_verifications
       ${where}
       ORDER BY submitted_at DESC
       LIMIT ? OFFSET ?`,
    ).bind(...binds, limit, offset).all<{
      id: string; workspace_id: string; vertical_slug: string; regulatory_body: string;
      license_number: string; license_class: string | null; status: string;
      rejection_reason: string | null; submitted_at: number; reviewed_at: number | null;
      reviewed_by: string | null; expires_at: number | null;
    }>(),
    c.env.DB.prepare(
      `SELECT COUNT(*) AS total FROM sector_license_verifications ${where}`,
    ).bind(...binds).first<{ total: number }>(),
  ]);

  const list = (rows.results ?? []).map((r) => ({
    ...r,
    submitted_at: new Date(r.submitted_at * 1000).toISOString(),
    reviewed_at: r.reviewed_at ? new Date(r.reviewed_at * 1000).toISOString() : null,
    expires_at:  r.expires_at  ? new Date(r.expires_at  * 1000).toISOString() : null,
  }));

  return c.json({
    data: list,
    pagination: { page, limit, total: total?.total ?? 0 },
  });
});

// GET /platform-admin/sector-licenses/:id
platformAdminSectorLicensesRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');

  const row = await c.env.DB.prepare(
    `SELECT id, workspace_id, vertical_slug, regulatory_body,
            license_number, license_class, status, rejection_reason,
            submitted_at, reviewed_at, reviewed_by, expires_at, created_at, updated_at
     FROM sector_license_verifications WHERE id = ?`,
  ).bind(id).first<{
    id: string; workspace_id: string; vertical_slug: string; regulatory_body: string;
    license_number: string; license_class: string | null; status: string;
    rejection_reason: string | null; submitted_at: number; reviewed_at: number | null;
    reviewed_by: string | null; expires_at: number | null;
    created_at: number; updated_at: number;
  }>();

  if (!row) return c.json({ error: 'not_found', message: 'Verification record not found.' }, 404);

  return c.json({
    ...row,
    submitted_at: new Date(row.submitted_at * 1000).toISOString(),
    reviewed_at: row.reviewed_at ? new Date(row.reviewed_at * 1000).toISOString() : null,
    expires_at:  row.expires_at  ? new Date(row.expires_at  * 1000).toISOString() : null,
    created_at:  new Date(row.created_at  * 1000).toISOString(),
    updated_at:  new Date(row.updated_at  * 1000).toISOString(),
  });
});

// POST /platform-admin/sector-licenses/:id/verify
platformAdminSectorLicensesRoutes.post('/:id/verify', async (c) => {
  const id   = c.req.param('id');
  const auth = c.get('auth') as AuthContext;
  const now  = Math.floor(Date.now() / 1000);

  let body: { expires_at?: string } = {};
  try { body = await c.req.json(); } catch { /* optional body */ }

  const expiresAt = body.expires_at ? Math.floor(new Date(body.expires_at).getTime() / 1000) : null;

  const row = await c.env.DB.prepare(
    `SELECT id, status, workspace_id, vertical_slug, regulatory_body FROM sector_license_verifications WHERE id = ?`,
  ).bind(id).first<{ id: string; status: string; workspace_id: string; vertical_slug: string; regulatory_body: string }>();

  if (!row) return c.json({ error: 'not_found', message: 'Verification record not found.' }, 404);

  if (row.status === 'verified') {
    return c.json({ message: 'Already verified.', id: row.id }, 200);
  }

  await c.env.DB.prepare(
    `UPDATE sector_license_verifications
     SET status = 'verified', reviewed_at = ?, reviewed_by = ?,
         expires_at = ?, rejection_reason = NULL, updated_at = ?
     WHERE id = ?`,
  ).bind(now, auth.userId, expiresAt, now, id).run();

  console.log(JSON.stringify({
    level: 'info',
    event: 'sector_license_verified',
    id,
    workspaceId: row.workspace_id,
    verticalSlug: row.vertical_slug,
    regulatoryBody: row.regulatory_body,
    reviewedBy: auth.userId,
  }));

  return c.json({ message: 'Licence verification approved.', id, status: 'verified' });
});

// POST /platform-admin/sector-licenses/:id/reject
platformAdminSectorLicensesRoutes.post('/:id/reject', async (c) => {
  const id   = c.req.param('id');
  const auth = c.get('auth') as AuthContext;
  const now  = Math.floor(Date.now() / 1000);

  let body: { rejection_reason?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'invalid_json', message: 'Request body must be valid JSON.' }, 400);
  }

  if (!body.rejection_reason?.trim()) {
    return c.json({ error: 'missing_reason', message: 'rejection_reason is required.' }, 400);
  }

  const row = await c.env.DB.prepare(
    `SELECT id, status, workspace_id, vertical_slug, regulatory_body FROM sector_license_verifications WHERE id = ?`,
  ).bind(id).first<{ id: string; status: string; workspace_id: string; vertical_slug: string; regulatory_body: string }>();

  if (!row) return c.json({ error: 'not_found', message: 'Verification record not found.' }, 404);

  if (row.status === 'rejected') {
    return c.json({ message: 'Already rejected.', id: row.id }, 200);
  }

  await c.env.DB.prepare(
    `UPDATE sector_license_verifications
     SET status = 'rejected', reviewed_at = ?, reviewed_by = ?,
         rejection_reason = ?, updated_at = ?
     WHERE id = ?`,
  ).bind(now, auth.userId, body.rejection_reason.trim(), now, id).run();

  console.log(JSON.stringify({
    level: 'info',
    event: 'sector_license_rejected',
    id,
    workspaceId: row.workspace_id,
    verticalSlug: row.vertical_slug,
    regulatoryBody: row.regulatory_body,
    reviewedBy: auth.userId,
    reason: body.rejection_reason.trim(),
  }));

  return c.json({ message: 'Licence verification rejected.', id, status: 'rejected' });
});

// POST /platform-admin/sector-licenses/:id/expire
platformAdminSectorLicensesRoutes.post('/:id/expire', async (c) => {
  const id   = c.req.param('id');
  const auth = c.get('auth') as AuthContext;
  const now  = Math.floor(Date.now() / 1000);

  const row = await c.env.DB.prepare(
    `SELECT id, status, workspace_id FROM sector_license_verifications WHERE id = ?`,
  ).bind(id).first<{ id: string; status: string; workspace_id: string }>();

  if (!row) return c.json({ error: 'not_found', message: 'Verification record not found.' }, 404);

  if (row.status !== 'verified') {
    return c.json({ error: 'invalid_transition', message: 'Only verified licences can be expired.' }, 422);
  }

  await c.env.DB.prepare(
    `UPDATE sector_license_verifications
     SET status = 'expired', reviewed_at = ?, reviewed_by = ?, updated_at = ?
     WHERE id = ?`,
  ).bind(now, auth.userId, now, id).run();

  console.log(JSON.stringify({
    level: 'info',
    event: 'sector_license_expired',
    id,
    workspaceId: row.workspace_id,
    reviewedBy: auth.userId,
  }));

  return c.json({ message: 'Licence marked as expired.', id, status: 'expired' });
});
