/**
 * Dexie.js IndexedDB schema for @webwaka/offline-sync.
 * (TDR-0010, Platform Invariant P6)
 *
 * Browser/PWA only — NOT for Cloudflare Workers runtime.
 * Workers use D1 directly.
 *
 * Version history:
 *   v1 — syncQueue (M7b)
 *   v2 — feedCache + courseContent (M7c)
 *   v3 — notificationInbox (N-068)
 *   v4 — Phase 3 (E21, E23): per-module cache tables + imageVariantsCache
 *         groupMembersCache, broadcastDraftsCache, caseCache, eventCache,
 *         geographyCache, policyCache, imageVariantsCache
 */

import Dexie, { type Table } from 'dexie';

export interface OfflineQueueItem {
  id?: number;
  clientId: string;
  type: 'create' | 'update' | 'delete' | 'agent_transaction';
  entity: string;
  payload: Record<string, unknown>;
  priority: 'critical' | 'high' | 'normal' | 'low';
  status: 'pending' | 'syncing' | 'synced' | 'failed' | 'conflict';
  retryCount: number;
  nextRetryAt: number;
  createdAt: number;
  syncedAt?: number;
  error?: string;
}

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

export interface NotificationInboxItem {
  id?: number;
  remoteId: string;
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
  syncedAt: number;
}

// ── Phase 3 (E21) — Per-module cache tables ─────────────────────────────────

/**
 * AC-OFF-02, AC-OFF-03: Group member list cache.
 * Budget: 10 MB, last 200 active members per group.
 * Supports offline member list display within 2 seconds.
 */
export interface GroupMemberCacheItem {
  id?: number;
  memberId: string;       // group_member.id on server
  groupId: string;
  tenantId: string;
  memberData: Record<string, unknown>; // full group_member row JSON
  cachedAt: number;       // ms epoch — used for LRU eviction
}

/**
 * AC-OFF-01: Broadcast draft autosave cache.
 * Budget: 2 MB, all unsent drafts.
 * Supports draft save within 30 seconds of reconnecting.
 */
export interface BroadcastDraftCacheItem {
  id?: number;
  draftId: string;       // client-generated UUID
  groupId: string;
  tenantId: string;
  body: string;           // draft message body
  savedAt: number;        // ms epoch — set by DraftAutosaveManager
}

/**
 * Open cases assigned to the current user (AC-OFF-02).
 * Budget: 5 MB.
 */
export interface CaseCacheItem {
  id?: number;
  caseId: string;         // cases.id
  tenantId: string;
  assigneeId: string;
  caseData: Record<string, unknown>;
  cachedAt: number;
}

/**
 * Upcoming events (next 30 days) for offline calendar access.
 * Budget: 3 MB.
 */
export interface EventCacheItem {
  id?: number;
  eventId: string;
  tenantId: string;
  workspaceId: string;
  eventData: Record<string, unknown>;
  startsAt: number;       // unix epoch seconds — for date-based queries
  cachedAt: number;
}

/**
 * State/LGA/ward geography data (long TTL — changes rarely).
 * Budget: 5 MB.
 */
export interface GeographyCacheItem {
  id?: number;
  geoId: string;
  geoType: 'state' | 'lga' | 'ward';
  parentId: string | null;
  data: Record<string, unknown>;
  cachedAt: number;
}

/**
 * Financial caps and moderation policies.
 * Budget: 1 MB.
 */
export interface PolicyCacheItem {
  id?: number;
  policyKey: string;      // e.g. 'financial.daily_cap' | 'moderation.auto_flag_threshold'
  tenantId: string;
  ruleData: Record<string, unknown>;
  cachedAt: number;
}

// ── Phase 3 (E23) — Image variant URL cache ─────────────────────────────────

/**
 * Client-side cache for image variant URLs (thumbnail/card/full).
 * Prevents repeated API calls for variant URLs on the same session.
 */
export interface ImageVariantCacheItem {
  id?: number;
  cacheKey: string;       // `${entityType}:${entityId}`
  entityType: string;
  entityId: string;
  thumbnailUrl: string;
  cardUrl: string;
  fullUrl: string;
  originalUrl: string;
  cachedAt: number;
}

// ── Dexie DB class ───────────────────────────────────────────────────────────

export class WebWakaOfflineDB extends Dexie {
  syncQueue!: Table<OfflineQueueItem>;
  feedCache!: Table<FeedCacheItem>;
  courseContent!: Table<CourseContentItem>;
  notificationInbox!: Table<NotificationInboxItem>;

  // Phase 3 (E21) — per-module cache tables
  groupMembersCache!: Table<GroupMemberCacheItem>;
  broadcastDraftsCache!: Table<BroadcastDraftCacheItem>;
  caseCache!: Table<CaseCacheItem>;
  eventCache!: Table<EventCacheItem>;
  geographyCache!: Table<GeographyCacheItem>;
  policyCache!: Table<PolicyCacheItem>;

  // Phase 3 (E23) — image variant URL cache
  imageVariantsCache!: Table<ImageVariantCacheItem>;

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

    this.version(3).stores({
      syncQueue: '++id, clientId, status, priority, nextRetryAt, entity, createdAt',
      feedCache: '++id, postId, tenantId, authorId, postType, cachedAt, createdAt',
      courseContent: '++id, lessonId, tenantId, moduleId, cachedAt',
      notificationInbox: '++id, remoteId, tenantId, userId, isRead, severity, createdAt, syncedAt',
    });

    // Phase 3 (E21, E23) — per-module cache tables + image variant cache
    this.version(4).stores({
      syncQueue:          '++id, clientId, status, priority, nextRetryAt, entity, createdAt',
      feedCache:          '++id, postId, tenantId, authorId, postType, cachedAt, createdAt',
      courseContent:      '++id, lessonId, tenantId, moduleId, cachedAt',
      notificationInbox:  '++id, remoteId, tenantId, userId, isRead, severity, createdAt, syncedAt',
      groupMembersCache:  '++id, memberId, groupId, tenantId, cachedAt',
      broadcastDraftsCache: '++id, draftId, groupId, tenantId, savedAt',
      caseCache:          '++id, caseId, tenantId, assigneeId, cachedAt',
      eventCache:         '++id, eventId, tenantId, workspaceId, startsAt, cachedAt',
      geographyCache:     '++id, geoId, geoType, parentId, cachedAt',
      policyCache:        '++id, policyKey, tenantId, cachedAt',
      imageVariantsCache: '++id, &cacheKey, entityType, entityId, cachedAt',
    });
  }
}

export const db = new WebWakaOfflineDB();
