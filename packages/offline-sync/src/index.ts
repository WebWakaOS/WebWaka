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
