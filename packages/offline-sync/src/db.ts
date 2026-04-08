/**
 * Dexie.js IndexedDB schema for @webwaka/offline-sync.
 * (TDR-0010, Platform Invariant P6)
 *
 * Browser/PWA only — NOT for Cloudflare Workers runtime.
 * Workers use D1 directly.
 *
 * Version history:
 *   v1 — syncQueue (M7b)
 *   v2 — feedCache + courseContent tables (M7c, P5/P6 offline support)
 */

import Dexie, { type Table } from 'dexie';

export interface OfflineQueueItem {
  id?: number;                        // Auto-increment (Dexie internal)
  clientId: string;                   // UUID — sent to server for idempotency
  type: 'create' | 'update' | 'delete' | 'agent_transaction' | 'community_post';
  entity: string;                     // 'profiles' | 'agent_transactions' | 'channel_posts' | etc.
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
 * Cached social feed post (P5/P6 — last 50 posts in IndexedDB for offline reading).
 */
export interface FeedCacheItem {
  id?: number;
  postId: string;                     // social_posts.id
  authorId: string;
  content: string;
  mediaUrls: string;                  // JSON array string
  createdAt: number;
  tenantId: string;
  cachedAt: number;                   // When cached locally
}

/**
 * Cached course lesson content (P5/P6 — course content readable offline).
 */
export interface CourseContentItem {
  id?: number;
  lessonId: string;                   // course_lessons.id
  title: string;
  body: string | null;                // Markdown content
  contentType: string;
  tenantId: string;
  cachedAt: number;                   // When cached locally
}

export class WebWakaOfflineDB extends Dexie {
  syncQueue!: Table<OfflineQueueItem>;
  feedCache!: Table<FeedCacheItem>;
  courseContent!: Table<CourseContentItem>;

  constructor() {
    super('webwaka_offline_v1');

    // v1 — existing schema (unchanged — no migration needed)
    this.version(1).stores({
      syncQueue: '++id, clientId, status, priority, nextRetryAt, entity, createdAt',
    });

    // v2 — M7c: feedCache + courseContent tables (P5/P6 — offline read support)
    this.version(2).stores({
      syncQueue: '++id, clientId, status, priority, nextRetryAt, entity, createdAt',
      feedCache: '++id, postId, authorId, created_at, tenant_id',
      courseContent: '++id, lessonId, tenant_id',
    });
  }
}

export const db = new WebWakaOfflineDB();

/**
 * Cache up to 50 feed posts for offline reading (P5/P6).
 * Evicts oldest entries beyond the limit.
 */
export async function cacheFeedPosts(posts: FeedCacheItem[]): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const items = posts.map((p) => ({ ...p, cachedAt: now }));
  await db.feedCache.bulkPut(items);

  // Keep only the last 50 posts
  const count = await db.feedCache.count();
  if (count > 50) {
    const toDelete = await db.feedCache
      .orderBy('cachedAt')
      .limit(count - 50)
      .primaryKeys();
    await db.feedCache.bulkDelete(toDelete);
  }
}

/**
 * Cache course lesson content for offline access (P6).
 */
export async function cacheCourseLesson(lesson: CourseContentItem): Promise<void> {
  await db.courseContent.put({ ...lesson, cachedAt: Math.floor(Date.now() / 1000) });
}

/**
 * Get cached feed posts (offline fallback).
 */
export async function getCachedFeed(limit = 50): Promise<FeedCacheItem[]> {
  return db.feedCache.orderBy('createdAt').reverse().limit(limit).toArray();
}

/**
 * Get cached course lesson (offline fallback).
 */
export async function getCachedLesson(lessonId: string): Promise<CourseContentItem | undefined> {
  return db.courseContent.where('lessonId').equals(lessonId).first();
}
