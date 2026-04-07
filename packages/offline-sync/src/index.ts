/**
 * @webwaka/offline-sync — PWA offline sync type contracts.
 * (TDR-0010, Platform Invariant P6)
 *
 * Milestone 3: interfaces and type contracts only.
 * Full runtime implementation (Dexie.js, Service Workers): Milestone 4+.
 */

export type {
  SyncStatus,
  SyncQueueItem,
  ConflictResolution,
  SyncAdapter,
} from './types.js';
