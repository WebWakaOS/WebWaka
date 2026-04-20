/**
 * DigestService test suite — N-063 (Phase 5).
 *
 * Covers:
 *   - getWindowBounds: hourly, daily, weekly UTC floor arithmetic
 *   - findOrCreateDigestBatch: creates new, returns existing
 *   - addToDigestBatch: inserts item, increments item_count
 *   - G1: tenant_id in all queries
 *   - G12: idempotent batch acquisition
 */

import { describe, it, expect, vi } from 'vitest';
import {
  getWindowBounds,
  findOrCreateDigestBatch,
  addToDigestBatch,
  DigestService,
} from './digest-service.js';
import type { D1LikeFull } from './db-types.js';

// ---------------------------------------------------------------------------
// getWindowBounds
// ---------------------------------------------------------------------------

describe('getWindowBounds', () => {
  const HOUR_S = 3_600;
  const DAY_S  = 86_400;

  it('hourly: floors to current hour start', () => {
    // 2025-01-15 14:35:00 UTC
    const nowMs = new Date('2025-01-15T14:35:00Z').getTime();
    const { windowStart, windowEnd } = getWindowBounds('hourly', nowMs);
    const expectedStart = Math.floor(nowMs / 1000 / HOUR_S) * HOUR_S;
    expect(windowStart).toBe(expectedStart);
    expect(windowEnd).toBe(expectedStart + HOUR_S);
  });

  it('daily: floors to midnight UTC', () => {
    const nowMs = new Date('2025-01-15T14:35:00Z').getTime();
    const { windowStart, windowEnd } = getWindowBounds('daily', nowMs);
    const expectedStart = Math.floor(nowMs / 1000 / DAY_S) * DAY_S;
    expect(windowStart).toBe(expectedStart);
    expect(windowEnd).toBe(expectedStart + DAY_S);
  });

  it('weekly: floors to Monday midnight UTC', () => {
    // 2025-01-15 is a Wednesday (day 3)
    const nowMs = new Date('2025-01-15T14:35:00Z').getTime();
    const { windowStart, windowEnd } = getWindowBounds('weekly', nowMs);
    // Monday 2025-01-13 00:00:00 UTC
    const mondayMs = new Date('2025-01-13T00:00:00Z').getTime();
    expect(windowStart).toBe(mondayMs / 1000);
    expect(windowEnd).toBe(windowStart + 7 * DAY_S);
  });

  it('weekly: Sunday → floor to previous Monday', () => {
    // 2025-01-19 is a Sunday (day 0)
    const nowMs = new Date('2025-01-19T10:00:00Z').getTime();
    const { windowStart } = getWindowBounds('weekly', nowMs);
    // Monday 2025-01-13 00:00:00 UTC
    const mondayMs = new Date('2025-01-13T00:00:00Z').getTime();
    expect(windowStart).toBe(mondayMs / 1000);
  });
});

// ---------------------------------------------------------------------------
// DB fake builder
// ---------------------------------------------------------------------------

type Row = Record<string, unknown>;

function makeDB(opts: {
  existingBatch?: { id: string } | null;
  insertSucceeds?: boolean;
  winnerBatch?: { id: string } | null;
}): D1LikeFull {
  let callCount = 0;

  return {
    prepare(sql: string) {
      return {
        bind(..._args: unknown[]) {
          return {
            async run() { return { success: opts.insertSucceeds !== false }; },
            async first<T>() {
              callCount++;
              if (sql.includes('SELECT id FROM notification_digest_batch')) {
                // First call: existing check; second call: winner re-query
                if (callCount === 1) return (opts.existingBatch ?? null) as T;
                return (opts.winnerBatch ?? opts.existingBatch ?? null) as T;
              }
              return null as T;
            },
            async all<T>() { return { results: [] as T[] }; },
          };
        },
      };
    },
  } as D1LikeFull;
}

// ---------------------------------------------------------------------------
// findOrCreateDigestBatch
// ---------------------------------------------------------------------------

describe('findOrCreateDigestBatch', () => {
  const params = {
    tenantId: 'ten_1',
    userId:   'usr_1',
    channel:  'email' as const,
    windowType: 'daily' as const,
    nowMs: new Date('2025-01-15T14:00:00Z').getTime(),
  };

  it('returns existing batchId when pending batch already exists', async () => {
    const db = makeDB({ existingBatch: { id: 'digest_existing' } });
    const id = await findOrCreateDigestBatch(db, params);
    expect(id).toBe('digest_existing');
  });

  it('creates new batch and returns winner batchId', async () => {
    const db = makeDB({ existingBatch: null, winnerBatch: { id: 'digest_new' } });
    const id = await findOrCreateDigestBatch(db, params);
    expect(id).toBe('digest_new');
  });

  it('includes tenantId in every prepare call (G1)', async () => {
    const prepareSpy = vi.fn().mockReturnValue({
      bind: vi.fn().mockReturnValue({
        run: vi.fn().mockResolvedValue({ success: true }),
        first: vi.fn().mockResolvedValue(null),
        all: vi.fn().mockResolvedValue({ results: [] }),
      }),
    });
    const db = { prepare: prepareSpy } as unknown as D1LikeFull;
    await findOrCreateDigestBatch(db, params);
    // All SQL calls should bind tenantId
    const calls = prepareSpy.mock.calls.map(c => c[0] as string);
    calls.forEach(sql => {
      if (sql.includes('notification_digest_batch')) {
        expect(sql.toLowerCase()).toContain('tenant_id');
      }
    });
  });
});

// ---------------------------------------------------------------------------
// addToDigestBatch
// ---------------------------------------------------------------------------

describe('addToDigestBatch', () => {
  it('runs INSERT OR IGNORE + UPDATE (no throws)', async () => {
    const runSpy = vi.fn().mockResolvedValue({ success: true });
    const db: D1LikeFull = {
      prepare(_sql: string) {
        return {
          bind(..._args: unknown[]) {
            return {
              async run() { runSpy(); return { success: true }; },
              async first<T>() { return null as T; },
              async all<T>() { return { results: [] as T[] }; },
            };
          },
        };
      },
    };
    await addToDigestBatch(db, {
      batchId: 'digest_abc',
      tenantId: 'ten_1',
      notificationEventId: 'notif_evt_1',
      userId: 'usr_1',
      eventKey: 'auth.login',
      title: 'You logged in',
      bodySummary: 'A new login was detected on your account.',
    });
    // Should have called run() twice (INSERT item + UPDATE count)
    expect(runSpy).toHaveBeenCalledTimes(2);
  });

  it('truncates bodySummary to 140 chars + ellipsis', async () => {
    const bindCaptures: unknown[][] = [];
    const db: D1LikeFull = {
      prepare(_sql: string) {
        return {
          bind(...args: unknown[]) {
            bindCaptures.push(args);
            return {
              async run() { return { success: true }; },
              async first<T>() { return null as T; },
              async all<T>() { return { results: [] as T[] }; },
            };
          },
        };
      },
    };
    const longSummary = 'x'.repeat(200);
    await addToDigestBatch(db, {
      batchId: 'digest_abc',
      tenantId: 'ten_1',
      notificationEventId: 'notif_evt_1',
      userId: 'usr_1',
      eventKey: 'auth.login',
      title: 'Test',
      bodySummary: longSummary,
    });
    // First bind is INSERT item — bodySummary is arg index 6
    const insertArgs = bindCaptures[0];
    const capturedSummary = insertArgs?.[6] as string;
    expect(capturedSummary?.length).toBeLessThanOrEqual(143); // 140 + '…'
    expect(capturedSummary?.endsWith('…')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// DigestService class
// ---------------------------------------------------------------------------

describe('DigestService', () => {
  it('wraps findOrCreateBatch and addItem', async () => {
    const db = makeDB({ existingBatch: { id: 'digest_svc_test' } });
    const svc = new DigestService(db);
    const batchId = await svc.findOrCreateBatch({
      tenantId: 'ten_1',
      userId: 'usr_1',
      channel: 'in_app',
      windowType: 'hourly',
    });
    expect(batchId).toBe('digest_svc_test');
  });
});
