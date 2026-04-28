/**
 * @webwaka/offline-sync — PWA offline sync runtime.
 * (TDR-0010, Platform Invariant P6 + P11)
 *
 * Browser/PWA only — NOT for Cloudflare Workers runtime.
 * Workers use D1 directly.
 *
 * M7b: Full Dexie.js + SyncEngine + Service Worker implementation.
 */

export type {
  SyncStatus,
  SyncQueueItem,
  ConflictResolution,
  SyncAdapter,
} from './types.js';

export { WebWakaOfflineDB, db } from './db.js';
export type { OfflineQueueItem, FeedCacheItem, CourseContentItem, NotificationInboxItem } from './db.js';

// N-068: Offline notification store
export type { RemoteInboxItem, GetItemsOptions } from './notification-store.js';
export {
  upsertItems,
  getUnreadCount,
  getItems,
  markRead,
  removeItem,
  clearUserData,
} from './notification-store.js';
export { WebWakaSyncAdapter } from './adapter.js';
export { SyncEngine } from './sync-engine.js';
export type { SyncResult } from './sync-engine.js';
export { observeNetworkState, getNetworkState } from './offline-indicator.js';
export type { NetworkState } from './offline-indicator.js';
export { registerSyncServiceWorker } from './service-worker.js';
export { generateId } from './utils.js';

// Phase 1 (T004): entity registry for Groups + Cases offline scope
export {
  SYNC_ENTITY_REGISTRY,
  SYNC_ENTITY_MAP,
  SYNC_ENTITY_NAMES,
  OFFLINE_WRITE_ENABLED_ENTITIES,
} from './entity-registry.js';
export type { SyncEntityConfig } from './entity-registry.js';

// Phase 3 (E21, E22, E23) — Cache budget + conflict resolution + PII + financial guard + image cache

export type {
  GroupMemberCacheItem,
  BroadcastDraftCacheItem,
  CaseCacheItem,
  EventCacheItem,
  GeographyCacheItem,
  PolicyCacheItem,
  ImageVariantCacheItem,
} from './db.js';

export {
  CacheBudgetManager,
  cacheBudgetManager,
  CACHE_BUDGETS,
} from './cache-budget.js';
export type {
  CacheModule,
  CacheBudget,
  ModulePressureEntry,
  StoragePressureReport,
} from './cache-budget.js';

export {
  ConflictStore,
  conflictStore,
} from './conflict-resolution.js';
export type { ConflictRecord } from './conflict-resolution.js';

export {
  DraftAutosaveManager,
  draftAutosaveManager,
} from './draft-autosave.js';

export {
  clearPiiOnLogout,
  PII_TABLES_TO_CLEAR,
} from './pii-clear.js';
export type { PiiTable, PiiClearResult } from './pii-clear.js';

export {
  assertFinancialBlocked,
  OfflineFinancialError,
} from './financial-guard.js';

export {
  ImageVariantCache,
  imageVariantCache,
} from './image-cache.js';
export type { ImageVariants } from './image-cache.js';
