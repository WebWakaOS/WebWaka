/**
 * Platform Admin — Claims Dashboard
 * Hono routes for super-admin claim management.
 *
 * GET  /admin/claims          — list pending claim requests (super_admin)
 * GET  /admin/claims/:id      — claim request detail + evidence (super_admin)
 * POST /admin/claims/:id/approve — approve a claim (super_admin)
 * POST /admin/claims/:id/reject  — reject a claim (super_admin)
 * POST /admin/claims/expire-stale — expire claims older than 30 days (super_admin)
 *
 * Milestone 5 — Platform Admin Claims Dashboard (Hono stub)
 * SEC-002: JWT auth + super_admin role replaces X-Admin-Id header trust (2026-04-11)
 */

import { Hono } from 'hono';
import {
  resolveAuthContext,
  requireSuperAdmin,
} from '@webwaka/auth';
import type { AuthContext } from '@webwaka/types';

interface PlatformAdminEnv {
  DB?: D1Like;
  JWT_SECRET: string;
}

declare module 'hono' {
  interface ContextVariableMap {
    auth: AuthContext;
  }
}

const claimsAdminRoutes = new Hono<{ Bindings: PlatformAdminEnv }>();

// ---------------------------------------------------------------------------
// JWT Authentication middleware — all claims routes require super_admin
// SEC-002: Replaces untrusted X-Admin-Id header with JWT-verified identity
// ---------------------------------------------------------------------------

claimsAdminRoutes.use('*', async (c, next) => {
  const authHeader = c.req.header('Authorization') ?? null;
  const jwtSecret = c.env.JWT_SECRET;

  if (!jwtSecret) {
    return c.json({ error: 'Server misconfigured: JWT_SECRET not set' }, 500);
  }

  const result = await resolveAuthContext(authHeader, jwtSecret);

  if (!result.success) {
    return c.json({ error: result.message }, result.status);
  }

  try {
    requireSuperAdmin(result.context);
  } catch {
    return c.json({ error: 'Access denied. Super admin role required.' }, 403);
  }

  c.set('auth', result.context);
  await next();
});

// ---------------------------------------------------------------------------
// Shared D1Like type (local — see platform invariants)
// ---------------------------------------------------------------------------

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

interface ClaimRequestRow {
  id: string;
  profile_id: string;
  requester_email: string;
  requester_name: string | null;
  status: string;
  verification_method: string | null;
  verification_data: string | null;
  approved_by: string | null;
  rejection_reason: string | null;
  expires_at: number | null;
  created_at: number;
  updated_at: number;
}

// ---------------------------------------------------------------------------
// GET /admin/claims — list pending claim requests (paginated)
// ---------------------------------------------------------------------------

claimsAdminRoutes.get('/', async (c) => {
  const db = c.env.DB;
  if (!db) return c.json({ error: 'Database not available' }, 503);

  const status = c.req.query('status') ?? 'pending';
  const limit = Math.min(Number(c.req.query('limit') ?? 50), 100);
  const offset = Number(c.req.query('offset') ?? 0);

  const validStatuses = ['pending', 'approved', 'rejected', 'expired', 'all'];
  if (!validStatuses.includes(status)) {
    return c.json({ error: `status must be one of: ${validStatuses.join('|')}` }, 400);
  }

  const isAll = status === 'all';

  const rows = isAll
    ? await db
        .prepare(
          `SELECT cr.*, p.subject_type, p.subject_id, p.claim_state
           FROM claim_requests cr
           JOIN profiles p ON p.id = cr.profile_id
           ORDER BY cr.created_at DESC
           LIMIT ? OFFSET ?`,
        )
        .bind(limit, offset)
        .all<ClaimRequestRow & { subject_type: string; subject_id: string; claim_state: string }>()
    : await db
        .prepare(
          `SELECT cr.*, p.subject_type, p.subject_id, p.claim_state
           FROM claim_requests cr
           JOIN profiles p ON p.id = cr.profile_id
           WHERE cr.status = ?
           ORDER BY cr.created_at DESC
           LIMIT ? OFFSET ?`,
        )
        .bind(status, limit, offset)
        .all<ClaimRequestRow & { subject_type: string; subject_id: string; claim_state: string }>();

  const total = isAll
    ? await db
        .prepare('SELECT COUNT(*) AS cnt FROM claim_requests')
        .bind()
        .first<{ cnt: number }>()
    : await db
        .prepare('SELECT COUNT(*) AS cnt FROM claim_requests WHERE status = ?')
        .bind(status)
        .first<{ cnt: number }>();

  return c.json({
    claims: rows.results.map((r) => ({
      id: r.id,
      profileId: r.profile_id,
      subjectType: r.subject_type,
      subjectId: r.subject_id,
      claimState: r.claim_state,
      requesterEmail: r.requester_email,
      requesterName: r.requester_name,
      status: r.status,
      verificationMethod: r.verification_method,
      rejectionReason: r.rejection_reason,
      expiresAt: r.expires_at,
      createdAt: r.created_at,
    })),
    total: total?.cnt ?? 0,
    limit,
    offset,
  });
});

// ---------------------------------------------------------------------------
// GET /admin/claims/:id — detail + evidence viewer
// ---------------------------------------------------------------------------

claimsAdminRoutes.get('/:id', async (c) => {
  const db = c.env.DB;
  if (!db) return c.json({ error: 'Database not available' }, 503);

  const claimId = c.req.param('id');

  const row = await db
    .prepare(
      `SELECT cr.*, p.subject_type, p.subject_id, p.claim_state
       FROM claim_requests cr
       JOIN profiles p ON p.id = cr.profile_id
       WHERE cr.id = ?`,
    )
    .bind(claimId)
    .first<ClaimRequestRow & { subject_type: string; subject_id: string; claim_state: string }>();

  if (!row) {
    return c.json({ error: 'Claim request not found' }, 404);
  }

  let evidence: unknown = null;
  if (row.verification_data) {
    try {
      evidence = JSON.parse(row.verification_data) as unknown;
    } catch {
      evidence = row.verification_data;
    }
  }

  return c.json({
    id: row.id,
    profileId: row.profile_id,
    subjectType: row.subject_type,
    subjectId: row.subject_id,
    claimState: row.claim_state,
    requesterEmail: row.requester_email,
    requesterName: row.requester_name,
    status: row.status,
    verificationMethod: row.verification_method,
    evidence,
    approvedBy: row.approved_by,
    rejectionReason: row.rejection_reason,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
});

// ---------------------------------------------------------------------------
// POST /admin/claims/:id/approve
// ---------------------------------------------------------------------------

claimsAdminRoutes.post('/:id/approve', async (c) => {
  const db = c.env.DB;
  if (!db) return c.json({ error: 'Database not available' }, 503);

  const auth = c.get('auth');
  const claimId = c.req.param('id');

  const row = await db
    .prepare('SELECT id, status, profile_id FROM claim_requests WHERE id = ?')
    .bind(claimId)
    .first<{ id: string; status: string; profile_id: string }>();

  if (!row) {
    return c.json({ error: 'Claim request not found' }, 404);
  }
  if (row.status !== 'pending') {
    return c.json({ error: `Claim is already ${row.status}` }, 409);
  }

  await db
    .prepare(
      `UPDATE claim_requests
       SET status = 'approved', approved_by = ?, updated_at = unixepoch()
       WHERE id = ?`,
    )
    .bind(auth.userId, claimId)
    .run();

  // Advance profile state to verified
  await db
    .prepare(
      `UPDATE profiles SET claim_state = 'verified', updated_at = unixepoch() WHERE id = ?`,
    )
    .bind(row.profile_id)
    .run();

  return c.json({ id: claimId, status: 'approved', profileState: 'verified' });
});

// ---------------------------------------------------------------------------
// POST /admin/claims/:id/reject
// ---------------------------------------------------------------------------

claimsAdminRoutes.post('/:id/reject', async (c) => {
  const db = c.env.DB;
  if (!db) return c.json({ error: 'Database not available' }, 503);

  const claimId = c.req.param('id');

  let body: { reason?: string } = {};
  try {
    body = await c.req.json<typeof body>();
  } catch {
    // optional body
  }

  const row = await db
    .prepare('SELECT id, status, profile_id FROM claim_requests WHERE id = ?')
    .bind(claimId)
    .first<{ id: string; status: string; profile_id: string }>();

  if (!row) {
    return c.json({ error: 'Claim request not found' }, 404);
  }
  if (row.status !== 'pending') {
    return c.json({ error: `Claim is already ${row.status}` }, 409);
  }

  await db
    .prepare(
      `UPDATE claim_requests
       SET status = 'rejected', rejection_reason = ?, updated_at = unixepoch()
       WHERE id = ?`,
    )
    .bind(body.reason ?? null, claimId)
    .run();

  // Reset profile state to claimable
  await db
    .prepare(
      `UPDATE profiles SET claim_state = 'claimable', updated_at = unixepoch() WHERE id = ?`,
    )
    .bind(row.profile_id)
    .run();

  return c.json({ id: claimId, status: 'rejected', profileState: 'claimable' });
});

// ---------------------------------------------------------------------------
// POST /admin/claims/expire-stale — expire pending claims > 30 days
// ---------------------------------------------------------------------------

claimsAdminRoutes.post('/expire-stale', async (c) => {
  const db = c.env.DB;
  if (!db) return c.json({ error: 'Database not available' }, 503);

  const result = await db
    .prepare(
      `UPDATE claim_requests
       SET status = 'expired', updated_at = unixepoch()
       WHERE status = 'pending'
         AND expires_at IS NOT NULL
         AND expires_at < unixepoch()`,
    )
    .bind()
    .run();

  return c.json({ expired: result.success, message: 'Stale claims expired' });
});

export { claimsAdminRoutes };
