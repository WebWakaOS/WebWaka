/**
 * N-068 — Offline notification store for @webwaka/offline-sync.
 *
 * Wraps Dexie `notificationInbox` table with helpers for:
 * - Upserting items fetched from GET /notifications/inbox
 * - Applying local state transitions (read, archive, pin) optimistically
 * - Querying unread count from IndexedDB while offline
 * - Pruning stale items (keep last MAX_ITEMS per userId)
 * - Clearing all items for a user (NDPR on sign-out)
 *
 * Browser/PWA only — NOT for Cloudflare Workers runtime.
 */

import { db, type NotificationInboxItem } from './db.js';

const MAX_ITEMS_PER_USER = 200;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Shape returned by GET /notifications/inbox items array */
export interface RemoteInboxItem {
  id: string;
  title: string;
  body: string;
  severity: string;
  category: string | null;
  iconType: string;
  ctaLabel: string | null;
  ctaUrl: string | null;
  isRead: boolean;
  readAt: number | null;
  archivedAt: number | null;
  pinnedAt: number | null;
  snoozedUntil: number | null;
  createdAt: number;
  expiresAt: number | null;
}

// ---------------------------------------------------------------------------
// upsertItems — sync remote items into local Dexie table
//
// Uses remoteId as the deduplication key.  Existing rows are replaced with
// the latest server state; new rows are inserted.
// ---------------------------------------------------------------------------

export async function upsertItems(
  tenantId: string,
  userId: string,
  items: RemoteInboxItem[],
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);

  const rows: Omit<NotificationInboxItem, 'id'>[] = items.map((item) => ({
    remoteId: item.id,
    tenantId,
    userId,
    title: item.title,
    body: item.body,
    severity: item.severity,
    category: item.category,
    iconType: item.iconType,
    ctaLabel: item.ctaLabel,
    ctaUrl: item.ctaUrl,
    isRead: item.isRead,
    readAt: item.readAt,
    archivedAt: item.archivedAt,
    pinnedAt: item.pinnedAt,
    snoozedUntil: item.snoozedUntil,
    createdAt: item.createdAt,
    expiresAt: item.expiresAt,
    syncedAt: now,
  }));

  // Dexie bulkPut: insert or replace by primary key.
  // We need to match by remoteId, so we first fetch existing Dexie PKs.
  await db.transaction('rw', db.notificationInbox, async () => {
    for (const row of rows) {
      const existing = await db.notificationInbox
        .where('remoteId').equals(row.remoteId)
        .and((r) => r.userId === userId)
        .first();

      if (existing?.id !== undefined) {
        await db.notificationInbox.update(existing.id, row);
      } else {
        await db.notificationInbox.add(row as NotificationInboxItem);
      }
    }
  });

  // Prune to MAX_ITEMS_PER_USER (keep newest)
  await pruneOldItems(userId);
}

// ---------------------------------------------------------------------------
// getUnreadCount — offline unread badge count
// ---------------------------------------------------------------------------

export async function getUnreadCount(userId: string): Promise<number> {
  const now = Math.floor(Date.now() / 1000);
  return db.notificationInbox
    .where('userId').equals(userId)
    .and((r) =>
      !r.isRead &&
      r.archivedAt == null &&
      (r.expiresAt == null || r.expiresAt > now),
    )
    .count();
}

// ---------------------------------------------------------------------------
// getItems — paginated local query (newest first)
// ---------------------------------------------------------------------------

export interface GetItemsOptions {
  userId: string;
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
  category?: string | null;
}

export async function getItems(opts: GetItemsOptions): Promise<NotificationInboxItem[]> {
  const { userId, limit = 20, offset = 0, unreadOnly = false, category = null } = opts;
  const now = Math.floor(Date.now() / 1000);

  const collection = db.notificationInbox
    .where('userId').equals(userId)
    .and((r) =>
      r.archivedAt == null &&
      (r.expiresAt == null || r.expiresAt > now) &&
      (unreadOnly ? !r.isRead : true) &&
      (category ? r.category === category : true),
    );

  const all = await collection.reverse().sortBy('createdAt');
  return all.slice(offset, offset + limit);
}

// ---------------------------------------------------------------------------
// markRead — optimistic local read state
// ---------------------------------------------------------------------------

export async function markRead(userId: string, remoteId: string): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const row = await db.notificationInbox
    .where('remoteId').equals(remoteId)
    .and((r) => r.userId === userId)
    .first();

  if (row?.id !== undefined) {
    await db.notificationInbox.update(row.id, { isRead: true, readAt: now });
  }
}

// ---------------------------------------------------------------------------
// removeItem — local hard delete (NDPR — mirrors server DELETE)
// ---------------------------------------------------------------------------

export async function removeItem(userId: string, remoteId: string): Promise<void> {
  await db.notificationInbox
    .where('remoteId').equals(remoteId)
    .and((r) => r.userId === userId)
    .delete();
}

// ---------------------------------------------------------------------------
// clearUserData — NDPR compliance: wipe all local notification data on sign-out
// ---------------------------------------------------------------------------

export async function clearUserData(userId: string): Promise<void> {
  await db.notificationInbox
    .where('userId').equals(userId)
    .delete();
}

// ---------------------------------------------------------------------------
// pruneOldItems — keep only the newest MAX_ITEMS_PER_USER rows
// ---------------------------------------------------------------------------

async function pruneOldItems(userId: string): Promise<void> {
  const all = await db.notificationInbox
    .where('userId').equals(userId)
    .sortBy('createdAt');

  if (all.length <= MAX_ITEMS_PER_USER) return;

  const toDelete = all.slice(0, all.length - MAX_ITEMS_PER_USER);
  const ids = toDelete.map((r) => r.id).filter((id): id is number => id !== undefined);
  await db.notificationInbox.bulkDelete(ids);
}
