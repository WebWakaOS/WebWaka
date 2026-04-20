/**
 * Notification Inbox API — N-065, N-067 (Phase 5).
 *
 * Routes (mounted at /notifications by router.ts; all require JWT auth):
 *   GET    /notifications/inbox               — paginated inbox (cursor by created_at)
 *   GET    /notifications/inbox/unread-count  — KV-cached 10s TTL (N-067)
 *   PATCH  /notifications/inbox/:id           — state transitions (read/archive/snooze/pin/dismiss)
 *   DELETE /notifications/inbox/:id           — hard delete (G23 NDPR compliance)
 *
 * Guardrails:
 *   G1  — tenantId always from JWT (never user-supplied)
 *   G23 — hard-delete on user request (NDPR: soft-delete NOT used for inbox items)
 *   N-067 — unread-count KV cache key: `{tenant_id}:inbox:unread:{user_id}` TTL=10s
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Auth = { userId: string; tenantId: string; role?: string; workspaceId?: string };

// Inbox item shape returned to the client
interface InboxItemRow {
  id: string;
  tenant_id: string;
  user_id: string;
  notification_event_id: string | null;
  delivery_id: string | null;
  title: string;
  body: string;
  cta_label: string | null;
  cta_url: string | null;
  icon_url: string | null;
  image_url: string | null;
  metadata: string | null;
  is_read: number;
  read_at: number | null;
  text_only_mode: number;
  severity: string;
  category: string | null;
  icon_type: string;
  archived_at: number | null;
  pinned_at: number | null;
  dismissed_at: number | null;
  snoozed_until: number | null;
  created_at: number;
  expires_at: number | null;
}

// ---------------------------------------------------------------------------
// KV cache TTL for unread-count (N-067)
// ---------------------------------------------------------------------------

const UNREAD_COUNT_KV_TTL = 10; // seconds

function unreadCacheKey(tenantId: string, userId: string): string {
  return `${tenantId}:inbox:unread:${userId}`;
}

// ---------------------------------------------------------------------------
// inboxRoutes Hono router
// ---------------------------------------------------------------------------

export const inboxRoutes = new Hono<{ Bindings: Env }>();

// ---------------------------------------------------------------------------
// GET /notifications/inbox/unread-count — N-067 (KV-cached 10s TTL)
//
// IMPORTANT: This route MUST be registered BEFORE /notifications/inbox/:id
// to prevent 'unread-count' being captured as the :id param.
//
// Response 200:
//   { "count": 3 }
// ---------------------------------------------------------------------------

inboxRoutes.get('/inbox/unread-count', async (c) => {
  const auth = c.get('auth') as Auth | undefined;
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const { tenantId, userId } = auth;
  const kv = c.env.NOTIFICATION_KV;
  const cacheKey = unreadCacheKey(tenantId, userId);

  // KV cache hit
  if (kv) {
    const cached = await kv.get(cacheKey);
    if (cached !== null) {
      const count = parseInt(cached, 10);
      return c.json({ count: Number.isNaN(count) ? 0 : count, cached: true });
    }
  }

  // D1 count query
  try {
    const now = Math.floor(Date.now() / 1000);
    const db = c.env.DB as unknown as {
      prepare(q: string): { bind(...a: unknown[]): { first<T>(): Promise<T | null> } };
    };
    const row = await db
      .prepare(
        `SELECT COUNT(*) as cnt
         FROM notification_inbox_item
         WHERE tenant_id = ?
           AND user_id   = ?
           AND is_read   = 0
           AND (expires_at IS NULL OR expires_at > ?)
           AND archived_at IS NULL
           AND dismissed_at IS NULL`,
      )
      .bind(tenantId, userId, now)
      .first<{ cnt: number }>();

    const count = row?.cnt ?? 0;

    // Populate KV cache if available
    if (kv) {
      await kv.put(cacheKey, String(count), { expirationTtl: UNREAD_COUNT_KV_TTL }).catch(() => {});
    }

    return c.json({ count, cached: false });
  } catch (err) {
    console.error(`[inbox-routes] unread-count DB error: ${err instanceof Error ? err.message : String(err)}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ---------------------------------------------------------------------------
// GET /notifications/inbox — paginated list (N-065)
//
// Query params:
//   limit    — default 20, max 50
//   cursor   — ISO string of created_at for keyset pagination (exclusive)
//   category — filter by category (e.g. 'billing', 'partner')
//   unread   — '1' to return only unread items
//
// Response 200:
//   {
//     items: InboxItem[],
//     nextCursor: string | null,
//     total: number
//   }
// ---------------------------------------------------------------------------

inboxRoutes.get('/inbox', async (c) => {
  const auth = c.get('auth') as Auth | undefined;
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const { tenantId, userId } = auth;
  const db = c.env.DB as unknown as {
    prepare(q: string): { bind(...a: unknown[]): { all<T>(): Promise<{ results: T[] }>; first<T>(): Promise<T | null> } };
  };

  // Parse query params
  const limitRaw = parseInt(c.req.query('limit') ?? '20', 10);
  const limit = Math.min(Math.max(1, Number.isNaN(limitRaw) ? 20 : limitRaw), 50);
  const cursor = c.req.query('cursor') ?? null;
  const category = c.req.query('category') ?? null;
  const unreadOnly = c.req.query('unread') === '1';

  const now = Math.floor(Date.now() / 1000);

  // Build WHERE clauses
  const conditions: string[] = [
    'tenant_id = ?',
    'user_id = ?',
    '(expires_at IS NULL OR expires_at > ?)',
    'archived_at IS NULL',
    'dismissed_at IS NULL',
  ];
  const binds: unknown[] = [tenantId, userId, now];

  if (cursor) {
    const cursorTs = parseInt(cursor, 10);
    if (!Number.isNaN(cursorTs)) {
      conditions.push('created_at < ?');
      binds.push(cursorTs);
    }
  }

  if (category) {
    conditions.push('category = ?');
    binds.push(category);
  }

  if (unreadOnly) {
    conditions.push('is_read = 0');
  }

  const where = conditions.join(' AND ');

  try {
    const { results } = await db
      .prepare(
        `SELECT id, tenant_id, user_id, notification_event_id, delivery_id,
                title, body, cta_label, cta_url, icon_url, image_url, metadata,
                is_read, read_at, text_only_mode, severity, category, icon_type,
                archived_at, pinned_at, dismissed_at, snoozed_until, created_at, expires_at
         FROM notification_inbox_item
         WHERE ${where}
         ORDER BY created_at DESC
         LIMIT ?`,
      )
      .bind(...binds, limit + 1) // fetch N+1 to detect next page
      .all<InboxItemRow>();

    const hasMore = results.length > limit;
    const items = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? String(items[items.length - 1]!.created_at) : null;

    // Parse metadata JSON for each item
    const mappedItems = items.map((row) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      ctaLabel: row.cta_label,
      ctaUrl: row.cta_url,
      iconUrl: row.icon_url,
      iconType: row.icon_type,
      imageUrl: row.text_only_mode === 1 ? null : row.image_url, // G22: suppress in low_data_mode
      isRead: row.is_read === 1,
      readAt: row.read_at,
      severity: row.severity,
      category: row.category,
      textOnlyMode: row.text_only_mode === 1,
      archivedAt: row.archived_at,
      pinnedAt: row.pinned_at,
      dismissedAt: row.dismissed_at,
      snoozedUntil: row.snoozed_until,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      metadata: row.metadata ? (() => {
        try { return JSON.parse(row.metadata!); } catch { return null; }
      })() : null,
    }));

    return c.json({ items: mappedItems, nextCursor });
  } catch (err) {
    console.error(`[inbox-routes] GET /inbox error: ${err instanceof Error ? err.message : String(err)}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ---------------------------------------------------------------------------
// PATCH /notifications/inbox/:id — state transitions (N-065)
//
// Request body:
//   { "action": "read" | "archive" | "pin" | "dismiss" | "snooze", "snoozeUntil"?: number }
//
// Response 200: { "ok": true }
// Response 404: if item not found or belongs to different user
// ---------------------------------------------------------------------------

inboxRoutes.patch('/inbox/:id', async (c) => {
  const auth = c.get('auth') as Auth | undefined;
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const { tenantId, userId } = auth;
  const itemId = c.req.param('id');
  const db = c.env.DB as unknown as {
    prepare(q: string): { bind(...a: unknown[]): { run(): Promise<{ success: boolean; meta?: { changes?: number } }>; first<T>(): Promise<T | null> } };
  };

  let body: { action: string; snoozeUntil?: number };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const { action, snoozeUntil } = body;
  const validActions = ['read', 'archive', 'pin', 'dismiss', 'snooze', 'unarchive', 'unpin'];
  if (!validActions.includes(action)) {
    return c.json({ error: `Invalid action. Must be one of: ${validActions.join(', ')}` }, 400);
  }

  const now = Math.floor(Date.now() / 1000);

  // Verify the item belongs to this user (G1: both tenantId and userId)
  const existing = await db
    .prepare(
      `SELECT id FROM notification_inbox_item
       WHERE id = ? AND tenant_id = ? AND user_id = ?`,
    )
    .bind(itemId, tenantId, userId)
    .first<{ id: string }>();

  if (!existing) {
    return c.json({ error: 'Notification not found' }, 404);
  }

  // Build the UPDATE based on action
  let updateSql: string;
  let updateBinds: unknown[];

  switch (action) {
    case 'read':
      updateSql = `UPDATE notification_inbox_item
                   SET is_read = 1, read_at = ?
                   WHERE id = ? AND tenant_id = ? AND user_id = ?`;
      updateBinds = [now, itemId, tenantId, userId];
      break;
    case 'archive':
      updateSql = `UPDATE notification_inbox_item
                   SET archived_at = ?
                   WHERE id = ? AND tenant_id = ? AND user_id = ?`;
      updateBinds = [now, itemId, tenantId, userId];
      break;
    case 'unarchive':
      updateSql = `UPDATE notification_inbox_item
                   SET archived_at = NULL
                   WHERE id = ? AND tenant_id = ? AND user_id = ?`;
      updateBinds = [itemId, tenantId, userId];
      break;
    case 'pin':
      updateSql = `UPDATE notification_inbox_item
                   SET pinned_at = ?
                   WHERE id = ? AND tenant_id = ? AND user_id = ?`;
      updateBinds = [now, itemId, tenantId, userId];
      break;
    case 'unpin':
      updateSql = `UPDATE notification_inbox_item
                   SET pinned_at = NULL
                   WHERE id = ? AND tenant_id = ? AND user_id = ?`;
      updateBinds = [itemId, tenantId, userId];
      break;
    case 'dismiss':
      updateSql = `UPDATE notification_inbox_item
                   SET dismissed_at = ?
                   WHERE id = ? AND tenant_id = ? AND user_id = ?`;
      updateBinds = [now, itemId, tenantId, userId];
      break;
    case 'snooze': {
      if (!snoozeUntil || typeof snoozeUntil !== 'number' || snoozeUntil <= now) {
        return c.json({ error: 'snoozeUntil must be a future Unix epoch timestamp' }, 400);
      }
      updateSql = `UPDATE notification_inbox_item
                   SET snoozed_until = ?
                   WHERE id = ? AND tenant_id = ? AND user_id = ?`;
      updateBinds = [snoozeUntil, itemId, tenantId, userId];
      break;
    }
    default:
      return c.json({ error: 'Unsupported action' }, 400);
  }

  try {
    await db.prepare(updateSql).bind(...updateBinds).run();

    // Invalidate unread-count KV cache (action 'read' changes the count)
    if (action === 'read' && c.env.NOTIFICATION_KV) {
      const cacheKey = unreadCacheKey(tenantId, userId);
      await c.env.NOTIFICATION_KV.delete(cacheKey).catch(() => {});
    }

    return c.json({ ok: true });
  } catch (err) {
    console.error(`[inbox-routes] PATCH /inbox/${itemId} error: ${err instanceof Error ? err.message : String(err)}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ---------------------------------------------------------------------------
// DELETE /notifications/inbox/:id — hard delete (G23 NDPR)
//
// Response 200: { "ok": true }
// Response 404: not found or belongs to different user
// ---------------------------------------------------------------------------

inboxRoutes.delete('/inbox/:id', async (c) => {
  const auth = c.get('auth') as Auth | undefined;
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const { tenantId, userId } = auth;
  const itemId = c.req.param('id');
  const db = c.env.DB as unknown as {
    prepare(q: string): { bind(...a: unknown[]): { run(): Promise<{ success: boolean; meta?: { changes?: number } }>; first<T>(): Promise<T | null> } };
  };

  // G23: verify item belongs to user before hard-deleting
  const existing = await db
    .prepare(
      `SELECT id FROM notification_inbox_item
       WHERE id = ? AND tenant_id = ? AND user_id = ?`,
    )
    .bind(itemId, tenantId, userId)
    .first<{ id: string }>();

  if (!existing) {
    return c.json({ error: 'Notification not found' }, 404);
  }

  try {
    await db
      .prepare(
        `DELETE FROM notification_inbox_item
         WHERE id = ? AND tenant_id = ? AND user_id = ?`,
      )
      .bind(itemId, tenantId, userId)
      .run();

    // Invalidate unread-count KV cache
    if (c.env.NOTIFICATION_KV) {
      const cacheKey = unreadCacheKey(tenantId, userId);
      await c.env.NOTIFICATION_KV.delete(cacheKey).catch(() => {});
    }

    return c.json({ ok: true });
  } catch (err) {
    console.error(`[inbox-routes] DELETE /inbox/${itemId} error: ${err instanceof Error ? err.message : String(err)}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});
