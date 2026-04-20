/**
 * Dexie.js IndexedDB schema for @webwaka/offline-sync.
 * (TDR-0010, Platform Invariant P6)
 *
 * Browser/PWA only — NOT for Cloudflare Workers runtime.
 * Workers use D1 directly.
 *
 * M7c: version(2) — feedCache + courseContent for offline social + lessons.
 */

import Dexie, { type Table } from 'dexie';

export interface OfflineQueueItem {
  id?: number;                        // Auto-increment (Dexie internal)
  clientId: string;                   // UUID — sent to server for idempotency
  type: 'create' | 'update' | 'delete' | 'agent_transaction';
  entity: string;                     // 'profiles' | 'agent_transactions' | etc.
  payload: Record<string, unknown>;
  priority: 'critical' | 'high' | 'normal' | 'low';
  status: 'pending' | 'syncing' | 'synced' | 'failed' | 'conflict';
  retryCount: number;
  nextRetryAt: number;                // Ms since epoch
  createdAt: number;
  syncedAt?: number;
  error?: string;
}

/**
 * M7c — Cached social feed posts for offline reading.
 * Stores the last 50 posts per tenant (P6 offline-cacheable).
 */
export interface FeedCacheItem {
  id?: number;
  postId: string;
  tenantId: string;
  authorId: string;
  authorHandle: string;
  content: string;
  postType: string;
  mediaUrls: string[];
  likeCount: number;
  createdAt: number;
  cachedAt: number;
}

/**
 * M7c — Cached lesson content for offline course access.
 * Supports P6 (offline-accessible lesson URLs: GET /community/lessons/:id).
 */
export interface CourseContentItem {
  id?: number;
  lessonId: string;
  tenantId: string;
  moduleId: string;
  title: string;
  body: string | null;
  contentType: string;
  sortOrder: number;
  lessonCreatedAt: number;
  cachedAt: number;
}

/**
 * N-068 — Offline notification inbox cache.
 * Mirrors notification_inbox_item rows for offline access.
 * TTL enforced by notification-store.ts cleanup (keep last 200 per tenant).
 */
export interface NotificationInboxItem {
  id?: number;              // Dexie auto-increment (internal)
  remoteId: string;         // server-side UUID from notification_inbox_item.id
  tenantId: string;
  userId: string;
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
  syncedAt: number;         // when this row was written to IndexedDB
}

export class WebWakaOfflineDB extends Dexie {
  syncQueue!: Table<OfflineQueueItem>;
  feedCache!: Table<FeedCacheItem>;
  courseContent!: Table<CourseContentItem>;
  notificationInbox!: Table<NotificationInboxItem>;

  constructor() {
    super('webwaka_offline_v1');

    this.version(1).stores({
      syncQueue: '++id, clientId, status, priority, nextRetryAt, entity, createdAt',
    });

    this.version(2).stores({
      syncQueue: '++id, clientId, status, priority, nextRetryAt, entity, createdAt',
      feedCache: '++id, postId, tenantId, authorId, postType, cachedAt, createdAt',
      courseContent: '++id, lessonId, tenantId, moduleId, cachedAt',
    });

    // N-068: notification inbox offline cache
    this.version(3).stores({
      syncQueue: '++id, clientId, status, priority, nextRetryAt, entity, createdAt',
      feedCache: '++id, postId, tenantId, authorId, postType, cachedAt, createdAt',
      courseContent: '++id, lessonId, tenantId, moduleId, cachedAt',
      notificationInbox: '++id, remoteId, tenantId, userId, isRead, severity, createdAt, syncedAt',
    });
  }
}

export const db = new WebWakaOfflineDB();
