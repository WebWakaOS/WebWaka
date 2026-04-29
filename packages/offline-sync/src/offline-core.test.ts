/**
 * Phase 3 (E22) — Conflict resolution, draft autosave, PII clear, financial guard.
 * CR01–CR12.
 *
 * Uses fake-indexeddb for Dexie; no real network calls.
 */

import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from './db.js';
import { ConflictStore } from './conflict-resolution.js';
import { DraftAutosaveManager } from './draft-autosave.js';
import { clearPiiOnLogout } from './pii-clear.js';
import { assertFinancialBlocked, OfflineFinancialError } from './financial-guard.js';
import type { NetworkState } from './offline-indicator.js';

beforeEach(async () => {
  await db.broadcastDraftsCache.clear();
  await db.notificationInbox.clear();
  await db.groupMembersCache.clear();
  await db.broadcastDraftsCache.clear();
  await db.caseCache.clear();
  await db.eventCache.clear();
  await db.geographyCache.clear();
  await db.policyCache.clear();
  await db.imageVariantsCache.clear();
  await db.syncQueue.clear();
});

// ── ConflictStore (CR01–CR05) ────────────────────────────────────────────────

describe('ConflictStore — CR01–CR05', () => {
  it('CR01: recordConflict returns a ConflictRecord with correct shape', () => {
    const store = new ConflictStore();
    const local = { name: 'Local Name', updated_at: 1000 };
    const server = { name: 'Server Name', updated_at: 2000 };
    const record = store.recordConflict('individual', 'ind_001', local, server);

    expect(typeof record.id).toBe('string');
    expect(record.entityType).toBe('individual');
    expect(record.entityId).toBe('ind_001');
    expect(record.localVersion).toEqual(local);
    expect(record.serverVersion).toEqual(server);
    expect(record.resolvedStrategy).toBe('pending');
    expect(record.resolvedAt).toBeNull();
    expect(record.notificationText).toContain('ind_001'.slice(0, 8));
  });

  it('CR02: getActiveConflicts returns only unresolved records', () => {
    const store = new ConflictStore();
    store.recordConflict('individual', 'ind_001', {}, {});
    const r2 = store.recordConflict('individual', 'ind_002', {}, {});

    // Resolve second
    store.resolveServerWins(r2.id);

    const active = store.getActiveConflicts();
    expect(active).toHaveLength(1);
    expect(active[0]!.entityId).toBe('ind_001');
  });

  it('CR03: resolveServerWins sets strategy to server_wins and resolvedAt', () => {
    const store = new ConflictStore();
    const record = store.recordConflict('group', 'grp_001', {}, {});
    const resolved = store.resolveServerWins(record.id);

    expect(resolved.resolvedStrategy).toBe('server_wins');
    expect(typeof resolved.resolvedAt).toBe('number');
    expect(resolved.resolvedAt).toBeGreaterThan(0);
  });

  it('CR04: resolveServerWins throws for unknown conflictId', () => {
    const store = new ConflictStore();
    expect(() => store.resolveServerWins('nonexistent_id')).toThrowError('not found');
  });

  it('CR05: clear() empties all records', () => {
    const store = new ConflictStore();
    store.recordConflict('individual', 'ind_001', {}, {});
    store.clear();
    expect(store.getAllConflicts()).toHaveLength(0);
    expect(store.getActiveConflicts()).toHaveLength(0);
  });
});

// ── DraftAutosaveManager (CR06–CR08) ─────────────────────────────────────────

describe('DraftAutosaveManager — CR06–CR08', () => {
  it('CR06: startAutosave saves draft to IndexedDB immediately', async () => {
    const mgr = new DraftAutosaveManager(60_000); // Very long interval — only initial save
    const cleanup = mgr.startAutosave('draft_001', 'grp_001', 'tenant_001', () => 'Hello world');

    // Wait for the initial async save
    await new Promise(resolve => setTimeout(resolve, 50));
    cleanup();

    const row = await db.broadcastDraftsCache.where('draftId').equals('draft_001').first();
    expect(row).toBeDefined();
    expect(row!.body).toBe('Hello world');
  });

  it('CR07: restoreDraft returns the last saved body', async () => {
    await db.broadcastDraftsCache.add({
      draftId: 'draft_002',
      groupId: 'grp_001',
      tenantId: 'tenant_001',
      body: 'Restored body',
      savedAt: Date.now(),
    });

    const mgr = new DraftAutosaveManager();
    const body = await mgr.restoreDraft('draft_002');
    expect(body).toBe('Restored body');
  });

  it('CR08: restoreDraft returns null when draft does not exist', async () => {
    const mgr = new DraftAutosaveManager();
    const result = await mgr.restoreDraft('nonexistent_draft');
    expect(result).toBeNull();
  });
});

// ── clearPiiOnLogout (CR09–CR10) ─────────────────────────────────────────────

describe('clearPiiOnLogout — CR09–CR10 (AC-OFF-06)', () => {
  it('CR09: completes within 500ms (AC-OFF-06)', async () => {
    // Seed some rows to ensure real work is done
    await db.groupMembersCache.bulkAdd([
      { memberId: 'm1', groupId: 'g', tenantId: 'tenant_001', memberData: { voter_ref: 'VR001' }, cachedAt: Date.now() },
      { memberId: 'm2', groupId: 'g', tenantId: 'tenant_001', memberData: { nin: '123456789' }, cachedAt: Date.now() },
    ]);
    await db.caseCache.add({
      caseId: 'case_001',
      tenantId: 'tenant_001',
      assigneeId: 'usr_001',
      caseData: { donor_phone: '08012345678', bank_account_number: '1234567890' },
      cachedAt: Date.now(),
    });

    const result = await clearPiiOnLogout('tenant_001', 'usr_001');
    expect(result.clearedMs).toBeLessThan(500);
    expect(Array.isArray(result.tablesCleared)).toBe(true);
  });

  it('CR10: clears groupMembersCache and caseCache for the tenant', async () => {
    await db.groupMembersCache.add({
      memberId: 'm1', groupId: 'g', tenantId: 'tenant_001',
      memberData: { voter_ref: 'VR001' }, cachedAt: Date.now(),
    });
    await db.caseCache.add({
      caseId: 'case_001', tenantId: 'tenant_001', assigneeId: 'usr_001',
      caseData: { bvn: '22222222222' }, cachedAt: Date.now(),
    });

    await clearPiiOnLogout('tenant_001', 'usr_001');

    const members = await db.groupMembersCache.where('tenantId').equals('tenant_001').count();
    const cases = await db.caseCache.where('tenantId').equals('tenant_001').count();
    expect(members).toBe(0);
    expect(cases).toBe(0);
  });
});

// ── assertFinancialBlocked (CR11–CR12) ───────────────────────────────────────

describe('assertFinancialBlocked — CR11–CR12 (AC-OFF-05)', () => {
  it('CR11: throws OfflineFinancialError when networkState is offline', () => {
    const networkState: NetworkState = 'offline';
    expect(() => assertFinancialBlocked(networkState, 'pledge_create')).toThrowError(OfflineFinancialError);
    expect(() => assertFinancialBlocked(networkState, 'pledge_create')).toThrowError("pledge_create");
  });

  it('CR12: is a no-op when networkState is online', () => {
    const networkState: NetworkState = 'online';
    expect(() => assertFinancialBlocked(networkState)).not.toThrow();
  });
});
