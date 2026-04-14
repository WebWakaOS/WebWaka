/**
 * Admin Metrics — P20-E
 *
 * GET /admin/metrics — operational observability dashboard for workspace admins.
 *
 * Returns:
 *   - activeSessionCount:  number of non-revoked, non-expired sessions for the tenant
 *   - pendingInvitations:  number of pending workspace invitations
 *   - recentErrors:        last 20 audit log entries with non-2xx status (hourly window)
 *   - authFailures24h:     count of audit_log rows in the last 24h with auth-related actions + status 4xx
 *   - totalAuditLogs24h:   total audit log entries in the last 24h for the tenant
 *
 * Auth: requires 'admin' or 'super_admin' role.
 * T3 invariant: all queries are tenant-scoped.
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import { errorResponse, ErrorCode } from '@webwaka/shared-config';

interface AuthShape {
  userId?: string;
  tenantId?: string;
  workspaceId?: string;
  role?: string;
}

const adminMetricsRoutes = new Hono<{ Bindings: Env }>();

// ---------------------------------------------------------------------------
// GET /admin/metrics
// ---------------------------------------------------------------------------
adminMetricsRoutes.get('/metrics', async (c) => {
  const auth = c.get('auth') as AuthShape | undefined;
  if (!auth?.tenantId) {
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Not authenticated.'), 401);
  }
  if (auth.role !== 'admin' && auth.role !== 'super_admin') {
    return c.json(errorResponse(ErrorCode.Forbidden, 'Admin role required to view metrics.'), 403);
  }

  const tenantId = auth.tenantId;
  const workspaceId = auth.workspaceId ?? '';
  const now = Math.floor(Date.now() / 1000);

  // audit_logs.created_at is stored as ISO-8601 with 'T' separator and trailing 'Z'
  // (DEFAULT strftime('%Y-%m-%dT%H:%M:%fZ', 'now')).
  // SQLite's datetime() produces space-separated format ('2026-04-14 12:00:00') which
  // lexicographically compares incorrectly against ISO strings because 'T' > ' '.
  // Fix: use strftime with the same ISO-8601 format for all time-window comparisons.
  const oneHourAgoIso = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const oneDayAgoIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Run all metric queries in parallel
  const [
    sessionResult,
    invitationResult,
    recentErrorResult,
    authFailResult,
    totalLogResult,
  ] = await Promise.allSettled([
    // 1. Active session count for this tenant
    c.env.DB.prepare(
      `SELECT COUNT(*) AS cnt FROM sessions
       WHERE tenant_id = ? AND revoked_at IS NULL AND expires_at > ?`,
    ).bind(tenantId, now).first<{ cnt: number }>(),

    // 2. Pending invitations
    c.env.DB.prepare(
      `SELECT COUNT(*) AS cnt FROM invitations
       WHERE workspace_id = ? AND tenant_id = ? AND accepted_at IS NULL AND expires_at > ?`,
    ).bind(workspaceId, tenantId, now).first<{ cnt: number }>(),

    // 3. Recent error audit entries (last 1 hour, status >= 400, max 20 rows)
    // BUG-A fix: compare ISO-8601 string against ISO-8601 string — not against SQLite datetime() output.
    c.env.DB.prepare(
      `SELECT action, path, status_code, duration_ms, created_at
       FROM audit_logs
       WHERE tenant_id = ? AND status_code >= 400 AND created_at >= ?
       ORDER BY created_at DESC LIMIT 20`,
    ).bind(tenantId, oneHourAgoIso).all<{
      action: string; path: string; status_code: number;
      duration_ms: number; created_at: string;
    }>(),

    // 4. Auth failures in the last 24h (audit entries for /auth/* paths with 4xx status)
    // BUG-A fix: use ISO-8601 string for the 24h window comparison.
    c.env.DB.prepare(
      `SELECT COUNT(*) AS cnt FROM audit_logs
       WHERE tenant_id = ? AND path LIKE '/auth/%' AND status_code >= 400 AND status_code < 500
         AND created_at >= ?`,
    ).bind(tenantId, oneDayAgoIso).first<{ cnt: number }>(),

    // 5. Total audit log entries in the last 24h
    // BUG-A fix: use ISO-8601 string for the 24h window comparison.
    c.env.DB.prepare(
      `SELECT COUNT(*) AS cnt FROM audit_logs
       WHERE tenant_id = ? AND created_at >= ?`,
    ).bind(tenantId, oneDayAgoIso).first<{ cnt: number }>(),
  ]);

  return c.json({
    generatedAt: new Date().toISOString(),
    tenantId,
    activeSessionCount: sessionResult.status === 'fulfilled' ? (sessionResult.value?.cnt ?? 0) : 0,
    pendingInvitations: invitationResult.status === 'fulfilled' ? (invitationResult.value?.cnt ?? 0) : 0,
    recentErrors: recentErrorResult.status === 'fulfilled' ? recentErrorResult.value.results : [],
    authFailures24h: authFailResult.status === 'fulfilled' ? (authFailResult.value?.cnt ?? 0) : 0,
    totalAuditLogs24h: totalLogResult.status === 'fulfilled' ? (totalLogResult.value?.cnt ?? 0) : 0,
  });
});

export { adminMetricsRoutes };
