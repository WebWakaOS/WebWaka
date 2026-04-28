/**
 * Cache budget enforcement tests — Phase 3 (E21).
 * CB01–CB10: covers CACHE_BUDGETS config, estimateModuleSize,
 * checkStoragePressure, evictLRU (P5 safety), enforceAllBudgets.
 *
 * Uses fake-indexeddb for Dexie.
 */

import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from './db.js';
import {
  CacheBudgetManager,
  CACHE_BUDGETS,
} from './cache-budget.js';
import type { CacheModule } from './cache-budget.js';

async function seedGroupMembers(count: number): Promise<void> {
  const rows = Array.from({ length: count }, (_, i) => ({
    memberId: `mem_${i}`,
    groupId: 'grp_001',
    tenantId: 'tenant_001',
    memberData: { name: `Member ${i}` },
    cachedAt: Date.now() - (count - i) * 1000,
  }));
  await db.groupMembersCache.bulkAdd(rows);
}

async function seedBroadcastDrafts(count: number, { pending = false } = {}): Promise<void> {
  for (let i = 0; i < count; i++) {
    const draftId = `draft_${i}`;
    await db.broadcastDraftsCache.add({
      draftId,
      groupId: 'grp_001',
      tenantId: 'tenant_001',
      body: `Draft body ${i}`,
      savedAt: Date.now() - (count - i) * 1000,
    });
    if (pending) {
      await db.syncQueue.add({
        clientId: draftId,
        type: 'create',
        entity: 'group_broadcast',
        payload: { draftId },
        priority: 'high',
        status: 'pending',
        retryCount: 0,
        nextRetryAt: 0,
        createdAt: Date.now(),
      });
    }
  }
}

beforeEach(async () => {
  await db.groupMembersCache.clear();
  await db.broadcastDraftsCache.clear();
  await db.caseCache.clear();
  await db.eventCache.clear();
  await db.geographyCache.clear();
  await db.policyCache.clear();
  await db.imageVariantsCache.clear();
  await db.syncQueue.clear();
});

// CB01 — CACHE_BUDGETS covers all 7 modules
describe('CB01: CACHE_BUDGETS completeness', () => {
  it('contains all 7 expected modules', () => {
    const expected: CacheModule[] = [
      'groupMembers', 'broadcastDrafts', 'cases',
      'events', 'geography', 'policies', 'imageVariants',
    ];
    for (const mod of expected) {
      expect(CACHE_BUDGETS).toHaveProperty(mod);
      expect(CACHE_BUDGETS[mod].maxBytes).toBeGreaterThan(0);
      expect(CACHE_BUDGETS[mod].avgRowBytes).toBeGreaterThan(0);
    }
  });
});

// CB02 — groupMembers has maxRows = 200
describe('CB02: groupMembers has maxRows constraint', () => {
  it('has maxRows of 200', () => {
    expect(CACHE_BUDGETS.groupMembers.maxRows).toBe(200);
  });
});

// CB03 — estimateModuleSize returns 0 for empty table
describe('CB03: estimateModuleSize zero for empty table', () => {
  it('returns 0 bytes when table is empty', async () => {
    const mgr = new CacheBudgetManager();
    const size = await mgr.estimateModuleSize('groupMembers');
    expect(size).toBe(0);
  });
});

// CB04 — estimateModuleSize returns row count × avgRowBytes
describe('CB04: estimateModuleSize is proportional to row count', () => {
  it('returns count × avgRowBytes estimate', async () => {
    await seedGroupMembers(5);
    const mgr = new CacheBudgetManager();
    const size = await mgr.estimateModuleSize('groupMembers');
    expect(size).toBe(5 * CACHE_BUDGETS.groupMembers.avgRowBytes);
  });
});

// CB05 — checkStoragePressure returns report for all modules
describe('CB05: checkStoragePressure covers all modules', () => {
  it('returns entries for all 7 modules', async () => {
    const mgr = new CacheBudgetManager();
    const report = await mgr.checkStoragePressure();
    expect(report.modules).toHaveLength(7);
    expect(typeof report.totalEstimatedBytes).toBe('number');
    expect(typeof report.generatedAt).toBe('number');
    expect(typeof report.anyOverBudget).toBe('boolean');
    expect(typeof report.anyPressureAlert).toBe('boolean');
  });
});

// CB06 — checkStoragePressure shows no pressure when tables empty
describe('CB06: no pressure when all tables empty', () => {
  it('anyPressureAlert is false for empty tables', async () => {
    const mgr = new CacheBudgetManager();
    const report = await mgr.checkStoragePressure();
    expect(report.anyPressureAlert).toBe(false);
    expect(report.anyOverBudget).toBe(false);
    expect(report.totalEstimatedBytes).toBe(0);
  });
});

// CB07 — evictLRU removes oldest rows first
describe('CB07: evictLRU removes oldest rows first', () => {
  it('deletes the oldest cachedAt entry when over budget', async () => {
    // Seed 3 members with staggered cachedAt timestamps
    await db.groupMembersCache.bulkAdd([
      { memberId: 'old_001', groupId: 'g', tenantId: 't', memberData: {}, cachedAt: 1_000 },
      { memberId: 'mid_002', groupId: 'g', tenantId: 't', memberData: {}, cachedAt: 2_000 },
      { memberId: 'new_003', groupId: 'g', tenantId: 't', memberData: {}, cachedAt: 3_000 },
    ]);

    const mgr = new CacheBudgetManager();
    // Target 2 rows worth of bytes
    const targetBytes = 2 * CACHE_BUDGETS.groupMembers.avgRowBytes;
    await mgr.evictLRU('groupMembers', targetBytes);

    const remaining = await db.groupMembersCache.toArray();
    expect(remaining).toHaveLength(2);
    const memberIds = remaining.map(r => r.memberId);
    expect(memberIds).not.toContain('old_001');
    expect(memberIds).toContain('mid_002');
    expect(memberIds).toContain('new_003');
  });
});

// CB08 — evictLRU returns number of evicted rows
describe('CB08: evictLRU returns evicted row count', () => {
  it('returns the count of rows deleted', async () => {
    await seedGroupMembers(4);
    const mgr = new CacheBudgetManager();
    const targetBytes = 2 * CACHE_BUDGETS.groupMembers.avgRowBytes;
    const evicted = await mgr.evictLRU('groupMembers', targetBytes);
    expect(evicted).toBe(2);
  });
});

// CB09 — P5: evictLRU never evicts broadcastDrafts with pending syncQueue
describe('CB09: P5 — evictLRU preserves pending syncQueue drafts', () => {
  it('does not delete a draft that has a pending sync queue entry', async () => {
    await seedBroadcastDrafts(2, { pending: true });
    const mgr = new CacheBudgetManager();
    // Target 0 bytes — would delete everything if not for P5 guard
    const evicted = await mgr.evictLRU('broadcastDrafts', 0);
    // Both drafts have pending syncQueue entries; neither should be evicted
    const remaining = await db.broadcastDraftsCache.count();
    expect(remaining).toBe(2);
    expect(evicted).toBe(0);
  });
});

// CB10 — enforceAllBudgets runs without throwing
describe('CB10: enforceAllBudgets runs cleanly', () => {
  it('completes without throwing when all tables are empty', async () => {
    const mgr = new CacheBudgetManager();
    await expect(mgr.enforceAllBudgets()).resolves.toBeUndefined();
  });
});
