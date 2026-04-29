/**
 * Cache budget enforcement for Phase 3 (E21).
 * Per-module LRU eviction policies in Dexie.js.
 * Storage pressure alerts at 80% of budget.
 *
 * Platform Invariant P5: Offline-first — cache eviction must never remove
 * items from syncQueue with status='pending' (those are unsynced user actions).
 *
 * AC-OFF-03: Group member list must be accessible from IndexedDB within 2 seconds.
 */

import { db } from './db.js';
import type { WebWakaOfflineDB } from './db.js';

// ---------------------------------------------------------------------------
// Budget configuration
// ---------------------------------------------------------------------------

export type CacheModule =
  | 'groupMembers'
  | 'broadcastDrafts'
  | 'cases'
  | 'events'
  | 'geography'
  | 'policies'
  | 'imageVariants';

export interface CacheBudget {
  /** Maximum bytes for this module's cache */
  maxBytes: number;
  /** Maximum row count (optional — additional guard beyond byte limit) */
  maxRows?: number;
  /** Approximate average row size in bytes (used for estimateModuleSize) */
  avgRowBytes: number;
}

export const CACHE_BUDGETS: Record<CacheModule, CacheBudget> = {
  groupMembers:    { maxBytes: 10 * 1024 * 1024, maxRows: 200,  avgRowBytes: 2_000  }, // 10 MB, 200 members/group
  broadcastDrafts: { maxBytes: 2  * 1024 * 1024,               avgRowBytes: 500    }, // 2 MB
  cases:           { maxBytes: 5  * 1024 * 1024,               avgRowBytes: 3_000  }, // 5 MB
  events:          { maxBytes: 3  * 1024 * 1024,               avgRowBytes: 2_000  }, // 3 MB
  geography:       { maxBytes: 5  * 1024 * 1024,               avgRowBytes: 500    }, // 5 MB, ~10K wards
  policies:        { maxBytes: 1  * 1024 * 1024,               avgRowBytes: 200    }, // 1 MB
  imageVariants:   { maxBytes: 5  * 1024 * 1024,               avgRowBytes: 300    }, // 5 MB, URLs only
};

// ---------------------------------------------------------------------------
// Storage pressure report
// ---------------------------------------------------------------------------

export interface ModulePressureEntry {
  module: CacheModule;
  estimatedBytes: number;
  budgetBytes: number;
  utilizationPct: number;
  /** true when ≥ 80% of budget is used */
  pressureAlert: boolean;
  /** true when module exceeds budget */
  overBudget: boolean;
}

export interface StoragePressureReport {
  generatedAt: number;
  totalEstimatedBytes: number;
  modules: ModulePressureEntry[];
  /** true when any module is over budget */
  anyOverBudget: boolean;
  /** true when any module has a pressure alert */
  anyPressureAlert: boolean;
}

// ---------------------------------------------------------------------------
// Module → Dexie table mapping
// ---------------------------------------------------------------------------

type ModuleTable = keyof Pick<
  WebWakaOfflineDB,
  | 'groupMembersCache'
  | 'broadcastDraftsCache'
  | 'caseCache'
  | 'eventCache'
  | 'geographyCache'
  | 'policyCache'
  | 'imageVariantsCache'
>;

const MODULE_TABLE_MAP: Record<CacheModule, ModuleTable> = {
  groupMembers:    'groupMembersCache',
  broadcastDrafts: 'broadcastDraftsCache',
  cases:           'caseCache',
  events:          'eventCache',
  geography:       'geographyCache',
  policies:        'policyCache',
  imageVariants:   'imageVariantsCache',
};

// The column used for LRU ordering (oldest first for eviction)
const MODULE_SORT_COLUMN: Record<CacheModule, string> = {
  groupMembers:    'cachedAt',
  broadcastDrafts: 'savedAt',
  cases:           'cachedAt',
  events:          'cachedAt',
  geography:       'cachedAt',
  policies:        'cachedAt',
  imageVariants:   'cachedAt',
};

const PRESSURE_THRESHOLD = 0.80; // 80% of budget triggers pressure alert

// ---------------------------------------------------------------------------
// CacheBudgetManager
// ---------------------------------------------------------------------------

export class CacheBudgetManager {
  /**
   * Estimate the current size of a module's cache in bytes.
   * Uses row count × average row size (avgRowBytes from CACHE_BUDGETS).
   * This is a fast estimate — no JSON serialization of all rows needed.
   */
  async estimateModuleSize(module: CacheModule): Promise<number> {
    const tableName = MODULE_TABLE_MAP[module];
    const budget = CACHE_BUDGETS[module];
    const table = db[tableName] as { count(): Promise<number> };
    const rowCount = await table.count();
    return rowCount * budget.avgRowBytes;
  }

  /**
   * Check storage pressure for all modules.
   * Returns a report comparing estimated usage against configured budgets.
   */
  async checkStoragePressure(): Promise<StoragePressureReport> {
    const modules = Object.keys(CACHE_BUDGETS) as CacheModule[];
    const entries: ModulePressureEntry[] = [];
    let totalEstimatedBytes = 0;

    for (const module of modules) {
      const budget = CACHE_BUDGETS[module];
      const estimatedBytes = await this.estimateModuleSize(module);
      const utilizationPct = estimatedBytes / budget.maxBytes;
      totalEstimatedBytes += estimatedBytes;

      entries.push({
        module,
        estimatedBytes,
        budgetBytes: budget.maxBytes,
        utilizationPct: Math.round(utilizationPct * 10000) / 100,
        pressureAlert: utilizationPct >= PRESSURE_THRESHOLD,
        overBudget: estimatedBytes > budget.maxBytes,
      });
    }

    return {
      generatedAt: Date.now(),
      totalEstimatedBytes,
      modules: entries,
      anyOverBudget: entries.some(e => e.overBudget),
      anyPressureAlert: entries.some(e => e.pressureAlert),
    };
  }

  /**
   * Evict oldest rows (LRU) from a module's cache until the module is within targetBytes.
   * Returns the number of rows evicted.
   *
   * P5 invariant: NEVER evicts rows from syncQueue with status='pending'.
   * This method only touches module cache tables (not syncQueue), so P5 is
   * automatically honoured.
   *
   * For broadcastDraftsCache: also skips any drafts that have a pending syncQueue
   * entry (identified by matching draftId in syncQueue.payload.draftId).
   */
  async evictLRU(module: CacheModule, targetBytes: number): Promise<number> {
    const tableName = MODULE_TABLE_MAP[module];
    const budget = CACHE_BUDGETS[module];
    const sortCol = MODULE_SORT_COLUMN[module];
    let evicted = 0;

    let estimatedBytes = await this.estimateModuleSize(module);

    while (estimatedBytes > targetBytes) {
      const table = db[tableName] as unknown as {
        orderBy(col: string): { first(): Promise<{ id?: number; draftId?: string } | undefined> };
        delete(id: number): Promise<void>;
      };

      const oldest = await table.orderBy(sortCol).first();
      if (!oldest || oldest.id === undefined) break;

      // For broadcastDraftsCache: skip rows that have a pending syncQueue entry
      if (module === 'broadcastDrafts' && oldest.draftId) {
        const pendingCount = await db.syncQueue
          .where('status').equals('pending')
          .filter(item => {
            const payload = item.payload;
            return payload['draftId'] === oldest.draftId;
          })
          .count();

        if (pendingCount > 0) {
          // Cannot evict this draft — it's queued for sync
          break;
        }
      }

      await (db[tableName] as unknown as { delete(id: number): Promise<void> }).delete(oldest.id);
      evicted++;
      estimatedBytes -= budget.avgRowBytes;
    }

    return evicted;
  }

  /**
   * Enforce all budgets by evicting LRU rows from every over-budget module.
   * Called during background sync and on storage pressure events.
   */
  async enforceAllBudgets(): Promise<void> {
    const modules = Object.keys(CACHE_BUDGETS) as CacheModule[];
    for (const module of modules) {
      const budget = CACHE_BUDGETS[module];
      const estimated = await this.estimateModuleSize(module);
      if (estimated > budget.maxBytes) {
        await this.evictLRU(module, budget.maxBytes * 0.75); // evict to 75% of budget
      }
    }
  }
}

export const cacheBudgetManager = new CacheBudgetManager();
