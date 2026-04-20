/**
 * Notification Preference Management API — N-066 (Phase 5).
 *
 * Routes (mounted at /notifications by router.ts; all require JWT auth):
 *   GET    /notifications/preferences          — list user's preference rows
 *   PUT    /notifications/preferences          — upsert a preference for a channel
 *   DELETE /notifications/preferences/:id      — remove a preference row
 *
 * Guardrails:
 *   G1  — tenantId always from JWT (never user-supplied)
 *   G9  — preference changes written to notification_audit_log by PreferenceService.update()
 *   G22 — low_data_mode validated (0 or 1; no injection)
 *   N-061 — KV cache invalidated by PreferenceService.update()
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import { PreferenceService } from '@webwaka/notifications';
import type { D1LikeFull } from '@webwaka/notifications';
import type { NotificationChannel, PreferenceScope } from '@webwaka/notifications';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Auth = { userId: string; tenantId: string; role?: string; workspaceId?: string };

interface PrefRowDB {
  id: string;
  scope_type: string;
  scope_id: string;
  tenant_id: string;
  event_key: string;
  channel: string;
  enabled: number;
  quiet_hours_start: number | null;
  quiet_hours_end: number | null;
  timezone: string;
  digest_window: string;
  low_data_mode: number;
  created_at: number;
  updated_at: number;
}

// ---------------------------------------------------------------------------
// Valid values for validation
// ---------------------------------------------------------------------------

const VALID_CHANNELS: NotificationChannel[] = [
  'email', 'sms', 'whatsapp', 'push', 'in_app', 'telegram', 'slack', 'webhook',
];
const VALID_DIGEST_WINDOWS = ['none', 'hourly', 'daily', 'weekly'];
const VALID_SCOPE_TYPES: PreferenceScope[] = ['platform', 'tenant', 'role', 'user'];

// ---------------------------------------------------------------------------
// preferenceRoutes Hono router
// ---------------------------------------------------------------------------

export const preferenceRoutes = new Hono<{ Bindings: Env }>();

// ---------------------------------------------------------------------------
// GET /notifications/preferences — list user's preferences (N-066)
//
// Returns all preference rows scoped to the calling user (scope_type='user').
// Admins may see tenant-scoped rows if role=admin|workspace_admin|super_admin.
//
// Response 200: { "preferences": PreferenceRow[] }
// ---------------------------------------------------------------------------

preferenceRoutes.get('/preferences', async (c) => {
  const auth = c.get('auth') as Auth | undefined;
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const { tenantId, userId, role } = auth;
  const isAdmin = role === 'admin' || role === 'workspace_admin' || role === 'super_admin';

  const db = c.env.DB as unknown as {
    prepare(q: string): { bind(...a: unknown[]): { all<T>(): Promise<{ results: T[] }> } };
  };

  // User sees their own 'user' scope rows.
  // Admins additionally see 'tenant' scope rows.
  const scopeFilter = isAdmin
    ? `(scope_type = 'user' AND scope_id = ?) OR (scope_type = 'tenant' AND scope_id = ?)`
    : `scope_type = 'user' AND scope_id = ?`;

  const binds: unknown[] = isAdmin ? [tenantId, userId, tenantId] : [tenantId, userId];

  try {
    const { results } = await db
      .prepare(
        `SELECT id, scope_type, scope_id, tenant_id, event_key, channel,
                enabled, quiet_hours_start, quiet_hours_end, timezone,
                digest_window, low_data_mode, created_at, updated_at
         FROM notification_preference
         WHERE tenant_id = ?
           AND (${scopeFilter})
         ORDER BY channel ASC, scope_type ASC`,
      )
      .bind(...binds)
      .all<PrefRowDB>();

    const mapped = results.map((row) => ({
      id: row.id,
      scopeType: row.scope_type,
      channel: row.channel,
      enabled: row.enabled === 1,
      quietHoursStart: row.quiet_hours_start,
      quietHoursEnd: row.quiet_hours_end,
      timezone: row.timezone,
      digestWindow: row.digest_window,
      lowDataMode: row.low_data_mode === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return c.json({ preferences: mapped });
  } catch (err) {
    console.error(`[preference-routes] GET /preferences error: ${err instanceof Error ? err.message : String(err)}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ---------------------------------------------------------------------------
// PUT /notifications/preferences — upsert a preference row (N-066)
//
// Request body:
//   {
//     "channel":         "email" | "sms" | ... (required)
//     "enabled":         true | false
//     "quietHoursStart": 0-23 | null
//     "quietHoursEnd":   0-23 | null
//     "timezone":        "Africa/Lagos" (IANA tz string)
//     "digestWindow":    "none" | "hourly" | "daily" | "weekly"
//     "lowDataMode":     true | false
//     "scope":           "user" (default) | "tenant" (admin only) | "role" (admin only)
//   }
//
// Response 200: { "ok": true }
// Response 400: validation errors
// Response 403: attempt to set non-user scope without admin role
// ---------------------------------------------------------------------------

preferenceRoutes.put('/preferences', async (c) => {
  const auth = c.get('auth') as Auth | undefined;
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const { tenantId, userId, role } = auth;
  const isAdmin = role === 'admin' || role === 'workspace_admin' || role === 'super_admin';

  let body: {
    channel: string;
    enabled?: boolean;
    quietHoursStart?: number | null;
    quietHoursEnd?: number | null;
    timezone?: string;
    digestWindow?: string;
    lowDataMode?: boolean;
    scope?: string;
  };

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  // Validate channel
  if (!body.channel || !VALID_CHANNELS.includes(body.channel as NotificationChannel)) {
    return c.json({ error: `channel must be one of: ${VALID_CHANNELS.join(', ')}` }, 400);
  }

  // Validate scope
  const scope = (body.scope ?? 'user') as PreferenceScope;
  if (!VALID_SCOPE_TYPES.includes(scope)) {
    return c.json({ error: `scope must be one of: ${VALID_SCOPE_TYPES.join(', ')}` }, 400);
  }

  // Non-user scopes require admin role
  if (scope !== 'user' && !isAdmin) {
    return c.json({ error: 'Only admins may set tenant or role-level preferences' }, 403);
  }

  // Validate digestWindow
  if (body.digestWindow && !VALID_DIGEST_WINDOWS.includes(body.digestWindow)) {
    return c.json({ error: `digestWindow must be one of: ${VALID_DIGEST_WINDOWS.join(', ')}` }, 400);
  }

  // Validate quiet hours (0-23)
  const qhStart = body.quietHoursStart;
  const qhEnd = body.quietHoursEnd;
  if (qhStart != null && (typeof qhStart !== 'number' || qhStart < 0 || qhStart > 23)) {
    return c.json({ error: 'quietHoursStart must be 0-23 or null' }, 400);
  }
  if (qhEnd != null && (typeof qhEnd !== 'number' || qhEnd < 0 || qhEnd > 23)) {
    return c.json({ error: 'quietHoursEnd must be 0-23 or null' }, 400);
  }

  const db = c.env.DB as unknown as D1LikeFull;
  const kv = c.env.NOTIFICATION_KV as {
    get(key: string): Promise<string | null>;
    put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
    delete(key: string): Promise<void>;
  } | undefined;

  if (!kv) {
    return c.json({ error: 'Preference service not available (NOTIFICATION_KV not configured)' }, 503);
  }

  const svc = new PreferenceService(db, kv);

  try {
    await svc.update(
      tenantId,
      userId,
      scope,
      body.channel as NotificationChannel,
      {
        ...(body.enabled !== undefined ? { enabled: body.enabled } : {}),
        ...(body.quietHoursStart !== undefined ? { quietHoursStart: body.quietHoursStart ?? undefined } : {}),
        ...(body.quietHoursEnd !== undefined ? { quietHoursEnd: body.quietHoursEnd ?? undefined } : {}),
        ...(body.timezone !== undefined ? { timezone: body.timezone } : {}),
        ...(body.digestWindow !== undefined ? { digestWindow: body.digestWindow as 'none' | 'hourly' | 'daily' | 'weekly' } : {}),
        ...(body.lowDataMode !== undefined ? { lowDataMode: body.lowDataMode } : {}),
      },
      userId, // actorId = the calling user
    );

    return c.json({ ok: true });
  } catch (err) {
    console.error(`[preference-routes] PUT /preferences error: ${err instanceof Error ? err.message : String(err)}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ---------------------------------------------------------------------------
// DELETE /notifications/preferences/:id — remove preference row (N-066)
//
// Only allows deletion of 'user' scope rows (users own their preferences).
// Admins may delete 'tenant' scope rows via platform admin API (not here).
//
// Response 200: { "ok": true }
// Response 404: not found or not owned by user
// ---------------------------------------------------------------------------

preferenceRoutes.delete('/preferences/:id', async (c) => {
  const auth = c.get('auth') as Auth | undefined;
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const { tenantId, userId } = auth;
  const prefId = c.req.param('id');
  const db = c.env.DB as unknown as {
    prepare(q: string): { bind(...a: unknown[]): {
      run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
      first<T>(): Promise<T | null>;
    } };
  };

  // Verify row exists and belongs to this user (G1: tenantId + userId)
  const existing = await db
    .prepare(
      `SELECT id, channel FROM notification_preference
       WHERE id = ? AND tenant_id = ? AND scope_type = 'user' AND scope_id = ?`,
    )
    .bind(prefId, tenantId, userId)
    .first<{ id: string; channel: string }>();

  if (!existing) {
    return c.json({ error: 'Preference not found' }, 404);
  }

  try {
    await db
      .prepare(
        `DELETE FROM notification_preference
         WHERE id = ? AND tenant_id = ? AND scope_type = 'user' AND scope_id = ?`,
      )
      .bind(prefId, tenantId, userId)
      .run();

    // Invalidate KV cache for this user+channel
    if (c.env.NOTIFICATION_KV) {
      const cacheKey = `${tenantId}:pref:${userId}:${existing.channel}`;
      await c.env.NOTIFICATION_KV.delete(cacheKey).catch(() => {});
    }

    return c.json({ ok: true });
  } catch (err) {
    console.error(`[preference-routes] DELETE /preferences/${prefId} error: ${err instanceof Error ? err.message : String(err)}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});
