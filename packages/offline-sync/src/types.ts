/**
 * Offline-sync type contracts for WebWaka OS PWA layer.
 * (TDR-0010, Platform Invariant P6)
 *
 * Milestone 3: interfaces only — no runtime implementation yet.
 * Full Dexie.js + Service Worker implementation: Milestone 4+.
 *
 * P6 requirement: writes queue offline → sync on reconnect → deterministic conflict resolution.
 */

import type { EntityType } from '@webwaka/types';

// ---------------------------------------------------------------------------
// Sync status lifecycle
// ---------------------------------------------------------------------------

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'conflict' | 'failed';

// ---------------------------------------------------------------------------
// Queue item
// ---------------------------------------------------------------------------

export interface SyncQueueItem {
  /** Unique queue item ID (local UUID) */
  id: string;
  /** Which entity type is being synced */
  entityType: EntityType;
  /** The remote entity ID */
  entityId: string;
  /** Operation being queued */
  operation: 'create' | 'update' | 'delete';
  /** Full entity payload (create/update) or null (delete) */
  payload: unknown;
  /** Number of sync attempts made */
  attemptCount: number;
  /** Current sync status */
  status: SyncStatus;
  /** Unix ms timestamp when queued */
  createdAt: number;
  /** Unix ms timestamp of last attempt, or null if not yet attempted */
  lastAttemptAt: number | null;
  /** Last error message, or null if no error */
  error: string | null;
}

// ---------------------------------------------------------------------------
// Conflict resolution
// ---------------------------------------------------------------------------

export interface ConflictResolution {
  /** Strategy for resolving this conflict */
  strategy: 'client-wins' | 'server-wins' | 'last-write-wins' | 'manual';
  /** Unix ms timestamp when conflict was resolved */
  resolvedAt: number;
  /** User or system that resolved the conflict */
  resolvedBy?: string;
}

// ---------------------------------------------------------------------------
// Sync adapter interface contract
// ---------------------------------------------------------------------------

/**
 * Contract that any sync adapter (Dexie, SQLite, etc.) must implement.
 * The adapter is responsible for persisting queue items and tracking state.
 *
 * Implementations: IndexedDB (Dexie.js) for PWA, SQLite (Wasm) for desktop.
 */
export interface SyncAdapter {
  /**
   * Enqueue a new sync operation.
   * Returns the generated queue item ID.
   */
  enqueue(
    item: Omit<SyncQueueItem, 'id' | 'attemptCount' | 'status' | 'createdAt' | 'lastAttemptAt' | 'error'>,
  ): Promise<string>;

  /**
   * Dequeue all items with the given status.
   * Used by the sync worker to pick up pending items.
   */
  dequeue(status: SyncStatus): Promise<SyncQueueItem[]>;

  /**
   * Update the status of a queue item (and optionally set its error).
   */
  updateStatus(id: string, status: SyncStatus, error?: string): Promise<void>;

  /**
   * Record the resolution of a conflict for a specific queue item.
   */
  resolveConflict(id: string, resolution: ConflictResolution): Promise<void>;
}
