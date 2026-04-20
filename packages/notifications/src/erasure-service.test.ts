/**
 * N-116: NDPR Erasure Propagation tests.
 *
 * Verifies that propagateErasure():
 *   - Zeros actor_id/recipient_id in notification_audit_log (G23: never deletes rows)
 *   - Hard-deletes notification_delivery rows for the user
 *   - Hard-deletes notification_inbox_item rows for the user
 *   - Hard-deletes notification_event rows for the user
 *   - Hard-deletes notification_preference rows (user-scope only)
 *   - Hard-deletes notification_subscription rows for the user
 *   - Does NOT touch notification_suppression_list (G23)
 *   - Enforces tenant_id scope on every operation (G1)
 *   - Returns ErasureResult with correct row counts
 */

import { describe, it, expect } from 'vitest';
import { propagateErasure, type ErasureResult } from './erasure-service.js';
import type { D1LikeFull } from './db-types.js';

// ---------------------------------------------------------------------------
// Mock D1LikeFull for erasure tests
// ---------------------------------------------------------------------------

interface SqlCall {
  sql: string;
  args: unknown[];
  type: 'run' | 'all' | 'first';
}

function makeMockDb(changesPerRun: number[] = []) {
  const calls: SqlCall[] = [];
  let runIndex = 0;

  const db = {
    _calls: calls,
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          return {
            async run() {
              const idx = runIndex++;
              calls.push({ sql, args, type: 'run' });
              const changes = changesPerRun[idx] ?? 0;
              return { success: true, meta: { changes } };
            },
            async first<T>() {
              calls.push({ sql, args, type: 'first' });
              return null as unknown as T;
            },
            async all<T>() {
              calls.push({ sql, args, type: 'all' });
              return { results: [] as T[] };
            },
          };
        },
      };
    },
  } as unknown as D1LikeFull & { _calls: SqlCall[] };

  return db;
}

// ---------------------------------------------------------------------------
// propagateErasure tests
// ---------------------------------------------------------------------------

describe('propagateErasure — N-116 NDPR erasure', () => {
  it('executes exactly 6 database statements (one per affected table)', async () => {
    const db = makeMockDb([0, 0, 0, 0, 0, 0]);
    await propagateErasure(db, 'user_abc', 'tnt_xyz');

    const runCalls = db._calls.filter((c) => c.type === 'run');
    expect(runCalls).toHaveLength(6);
  });

  it('issues UPDATE (not DELETE) for notification_audit_log (G23: rows must not be deleted)', async () => {
    const db = makeMockDb([0, 0, 0, 0, 0, 0]);
    await propagateErasure(db, 'user_erased', 'tnt_test');

    const auditCall = db._calls.find(
      (c) => c.sql.includes('notification_audit_log') && c.type === 'run',
    );
    expect(auditCall).toBeDefined();
    expect(auditCall?.sql.trim().toUpperCase()).toMatch(/^UPDATE/);
    expect(auditCall?.sql).not.toMatch(/DELETE/i);
  });

  it("sets actor_id and recipient_id to 'ERASED' in notification_audit_log", async () => {
    const db = makeMockDb([0, 0, 0, 0, 0, 0]);
    await propagateErasure(db, 'user_erased', 'tnt_test');

    const auditCall = db._calls.find(
      (c) => c.sql.includes('notification_audit_log') && c.type === 'run',
    );
    expect(auditCall?.sql).toMatch(/'ERASED'/i);
    expect(auditCall?.sql).toContain('actor_id');
    expect(auditCall?.sql).toContain('recipient_id');
  });

  it('scopes notification_audit_log update to tenant_id (G1)', async () => {
    const db = makeMockDb([0, 0, 0, 0, 0, 0]);
    await propagateErasure(db, 'user_u', 'tnt_isolated');

    const auditCall = db._calls.find(
      (c) => c.sql.includes('notification_audit_log') && c.type === 'run',
    );
    expect(auditCall?.sql).toContain('tenant_id');
    // tenantId must appear as a bind argument
    expect(auditCall?.args).toContain('tnt_isolated');
  });

  it('hard-deletes notification_delivery rows for the user', async () => {
    const db = makeMockDb([0, 0, 0, 0, 0, 0]);
    await propagateErasure(db, 'user_del', 'tnt_1');

    const deliveryCall = db._calls.find(
      (c) => c.sql.includes('notification_delivery') && c.type === 'run',
    );
    expect(deliveryCall).toBeDefined();
    expect(deliveryCall?.sql.trim().toUpperCase()).toMatch(/^DELETE/);
    expect(deliveryCall?.args).toContain('tnt_1');
    expect(deliveryCall?.args).toContain('user_del');
  });

  it('hard-deletes notification_inbox_item rows for the user', async () => {
    const db = makeMockDb([0, 0, 0, 0, 0, 0]);
    await propagateErasure(db, 'user_inbox', 'tnt_2');

    const inboxCall = db._calls.find(
      (c) => c.sql.includes('notification_inbox_item') && c.type === 'run',
    );
    expect(inboxCall).toBeDefined();
    expect(inboxCall?.sql.trim().toUpperCase()).toMatch(/^DELETE/);
    expect(inboxCall?.args).toContain('tnt_2');
    expect(inboxCall?.args).toContain('user_inbox');
  });

  it('hard-deletes notification_event rows where actor_id = userId', async () => {
    const db = makeMockDb([0, 0, 0, 0, 0, 0]);
    await propagateErasure(db, 'user_event', 'tnt_3');

    const eventCall = db._calls.find(
      (c) => c.sql.includes('notification_event') && c.type === 'run',
    );
    expect(eventCall).toBeDefined();
    expect(eventCall?.sql.trim().toUpperCase()).toMatch(/^DELETE/);
    expect(eventCall?.sql).toContain('actor_id');
    expect(eventCall?.args).toContain('tnt_3');
    expect(eventCall?.args).toContain('user_event');
  });

  it('hard-deletes notification_preference rows only for user scope (scope_type = user)', async () => {
    const db = makeMockDb([0, 0, 0, 0, 0, 0]);
    await propagateErasure(db, 'user_pref', 'tnt_4');

    const prefCall = db._calls.find(
      (c) => c.sql.includes('notification_preference') && c.type === 'run',
    );
    expect(prefCall).toBeDefined();
    expect(prefCall?.sql.trim().toUpperCase()).toMatch(/^DELETE/);
    expect(prefCall?.sql).toContain("scope_type = 'user'");
    expect(prefCall?.sql).toContain('scope_id');
    expect(prefCall?.args).toContain('tnt_4');
    expect(prefCall?.args).toContain('user_pref');
  });

  it('hard-deletes notification_subscription rows for the user', async () => {
    const db = makeMockDb([0, 0, 0, 0, 0, 0]);
    await propagateErasure(db, 'user_sub', 'tnt_5');

    const subCall = db._calls.find(
      (c) => c.sql.includes('notification_subscription') && c.type === 'run',
    );
    expect(subCall).toBeDefined();
    expect(subCall?.sql.trim().toUpperCase()).toMatch(/^DELETE/);
    expect(subCall?.args).toContain('tnt_5');
    expect(subCall?.args).toContain('user_sub');
  });

  it('does NOT issue any statement touching notification_suppression_list (G23)', async () => {
    const db = makeMockDb([0, 0, 0, 0, 0, 0]);
    await propagateErasure(db, 'user_suppress', 'tnt_6');

    const suppressionCall = db._calls.find(
      (c) => c.sql.includes('notification_suppression_list'),
    );
    expect(suppressionCall).toBeUndefined();
  });

  it('returns ErasureResult with correct row counts', async () => {
    const db = makeMockDb([3, 5, 2, 7, 1, 4]); // audit=3, delivery=5, inbox=2, event=7, pref=1, sub=4

    const result: ErasureResult = await propagateErasure(db, 'user_count', 'tnt_count');

    expect(result.auditLogRowsZeroed).toBe(3);
    expect(result.deliveriesDeleted).toBe(5);
    expect(result.inboxItemsDeleted).toBe(2);
    expect(result.eventsDeleted).toBe(7);
    expect(result.preferencesDeleted).toBe(1);
    expect(result.subscriptionsDeleted).toBe(4);
  });

  it('returns all-zero ErasureResult when no rows match (user not found or already erased)', async () => {
    const db = makeMockDb([0, 0, 0, 0, 0, 0]);

    const result = await propagateErasure(db, 'user_ghost', 'tnt_xyz');

    expect(result.auditLogRowsZeroed).toBe(0);
    expect(result.deliveriesDeleted).toBe(0);
    expect(result.inboxItemsDeleted).toBe(0);
    expect(result.eventsDeleted).toBe(0);
    expect(result.preferencesDeleted).toBe(0);
    expect(result.subscriptionsDeleted).toBe(0);
  });

  it('scopes every single delete statement to the tenantId (G1 — no cross-tenant deletion)', async () => {
    const db = makeMockDb([0, 0, 0, 0, 0, 0]);
    await propagateErasure(db, 'user_scope', 'tnt_correct');

    // Every run() call must include 'tnt_correct' in its bind args
    const runCalls = db._calls.filter((c) => c.type === 'run');
    expect(runCalls.length).toBeGreaterThan(0);
    for (const call of runCalls) {
      expect(call.args).toContain('tnt_correct');
    }
  });

  it('includes userId in bind args for every operation', async () => {
    const db = makeMockDb([0, 0, 0, 0, 0, 0]);
    await propagateErasure(db, 'user_tracked', 'tnt_tracked');

    const runCalls = db._calls.filter((c) => c.type === 'run');
    for (const call of runCalls) {
      expect(call.args).toContain('user_tracked');
    }
  });

  it('handles zero meta.changes gracefully (returns 0 for each count)', async () => {
    const db = {
      prepare(_sql: string) {
        return {
          bind(..._args: unknown[]) {
            return {
              async run() { return { success: true }; }, // no meta at all
              async first<T>() { return null as unknown as T; },
              async all<T>() { return { results: [] as T[] }; },
            };
          },
        };
      },
    } as unknown as D1LikeFull;

    const result = await propagateErasure(db, 'user_no_meta', 'tnt_no_meta');

    expect(result.auditLogRowsZeroed).toBe(0);
    expect(result.deliveriesDeleted).toBe(0);
  });
});
