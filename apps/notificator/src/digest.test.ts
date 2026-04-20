/**
 * N-012a (Phase 1) — Digest sweep unit tests.
 *
 * Tests resolveDigestType() and sweepPendingBatches() with mock D1 and Queue.
 *
 * Uses plain Vitest (no @cloudflare/vitest-pool-workers) because sweepPendingBatches()
 * accepts duck-typed DB and Queue arguments for testability without CF runtime.
 */

import { describe, it, expect } from 'vitest';
import {
  resolveDigestType,
  sweepPendingBatches,
  executeRetentionDeletes,
  type DigestQueueMessage,
  type D1LikeRunnable,
  type RetentionResult,
} from './digest.js';

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

function makeDb(batches: { id: string; tenant_id: string }[] = []) {
  const queries: { sql: string; args: unknown[] }[] = [];

  return {
    _queries: queries,
    prepare(sql: string) {
      return {
        bind: (...args: unknown[]) => ({
          all: async <T>() => {
            queries.push({ sql, args });
            return { results: batches as T[] };
          },
        }),
      };
    },
  };
}

function makeQueue() {
  const sent: DigestQueueMessage[] = [];
  let shouldFail = false;

  return {
    sent,
    setShouldFail(val: boolean) { shouldFail = val; },
    send: async (msg: DigestQueueMessage) => {
      if (shouldFail) throw new Error('Queue unavailable');
      sent.push(msg);
    },
  };
}

// ---------------------------------------------------------------------------
// resolveDigestType
// ---------------------------------------------------------------------------

describe('resolveDigestType', () => {
  it('maps hourly CRON expression', () => {
    expect(resolveDigestType('0 * * * *')).toBe('hourly');
  });

  it('maps daily CRON expression (23:00 UTC = 00:00 WAT)', () => {
    expect(resolveDigestType('0 23 * * *')).toBe('daily');
  });

  it('maps weekly CRON expression (Sunday at 23:00 UTC)', () => {
    expect(resolveDigestType('0 23 * * 0')).toBe('weekly');
  });

  it('returns null for non-digest CRON expressions', () => {
    expect(resolveDigestType('0 2 * * *')).toBeNull();    // retention sweep
    expect(resolveDigestType('0 */6 * * *')).toBeNull();  // domain verification
    expect(resolveDigestType('* * * * *')).toBeNull();    // arbitrary
  });
});

// ---------------------------------------------------------------------------
// sweepPendingBatches
// ---------------------------------------------------------------------------

describe('sweepPendingBatches', () => {
  it('queries notification_digest_batch with correct window_type and LIMIT 100', async () => {
    const db = makeDb([]);
    const queue = makeQueue();

    await sweepPendingBatches('daily', db, queue);

    expect(db._queries).toHaveLength(1);
    const query = db._queries[0];
    expect(query).toBeDefined();
    if (!query) throw new Error('query is undefined');
    expect(query.sql).toContain('notification_digest_batch');
    expect(query.sql).toContain("status = 'pending'");
    expect(query.sql).toContain('window_type = ?');
    expect(query.sql).toContain('window_end <= ?');
    expect(query.sql).toContain('LIMIT 100');
    expect(query.args[0]).toBe('daily');
    // Second arg is the current Unix timestamp — just check it is a number
    expect(typeof query.args[1]).toBe('number');
  });

  it('sends one Queue message per pending batch (G12: includes tenantId)', async () => {
    const batches = [
      { id: 'digest_aaa', tenant_id: 'tnt_1' },
      { id: 'digest_bbb', tenant_id: 'tnt_2' },
    ];
    const db = makeDb(batches);
    const queue = makeQueue();

    await sweepPendingBatches('hourly', db, queue);

    expect(queue.sent).toHaveLength(2);

    const msg1 = queue.sent[0];
    expect(msg1).toBeDefined();
    if (!msg1) throw new Error('msg1 is undefined');
    expect(msg1.type).toBe('digest_batch');
    expect(msg1.batchId).toBe('digest_aaa');
    expect(msg1.tenantId).toBe('tnt_1');  // G12: tenant_id required
    expect(msg1.digestType).toBe('hourly');

    const msg2 = queue.sent[1];
    expect(msg2).toBeDefined();
    if (!msg2) throw new Error('msg2 is undefined');
    expect(msg2.batchId).toBe('digest_bbb');
    expect(msg2.tenantId).toBe('tnt_2');
  });

  it('sends no Queue messages when no pending batches exist', async () => {
    const db = makeDb([]);
    const queue = makeQueue();

    await sweepPendingBatches('weekly', db, queue);

    expect(queue.sent).toHaveLength(0);
  });

  it('continues enqueueing remaining batches when one queue.send() fails', async () => {
    const batches = [
      { id: 'digest_fail', tenant_id: 'tnt_fail' },
      { id: 'digest_ok',   tenant_id: 'tnt_ok' },
    ];
    const db = makeDb(batches);
    const queue = makeQueue();

    let callCount = 0;
    const partialFailQueue = {
      sent: [] as DigestQueueMessage[],
      send: async (msg: DigestQueueMessage) => {
        callCount++;
        if (callCount === 1) throw new Error('Queue timeout on first batch');
        partialFailQueue.sent.push(msg);
      },
    };

    // Should NOT throw — errors are caught per-batch
    await expect(sweepPendingBatches('daily', db, partialFailQueue)).resolves.toBeUndefined();

    // Second batch should still have been enqueued
    expect(partialFailQueue.sent).toHaveLength(1);
    expect(partialFailQueue.sent[0]?.batchId).toBe('digest_ok');
  });

  it('propagates digestType to each Queue message', async () => {
    const batches = [{ id: 'digest_weekly_001', tenant_id: 'tnt_x' }];
    const db = makeDb(batches);
    const queue = makeQueue();

    await sweepPendingBatches('weekly', db, queue);

    expect(queue.sent[0]?.digestType).toBe('weekly');
  });

  it('uses window_type filter matching the digestType parameter', async () => {
    const db = makeDb([]);
    const queue = makeQueue();

    await sweepPendingBatches('weekly', db, queue);

    expect(db._queries[0]?.args[0]).toBe('weekly');
  });
});

// ---------------------------------------------------------------------------
// N-115: executeRetentionDeletes
// ---------------------------------------------------------------------------

/**
 * Mock D1LikeRunnable for retention sweep tests.
 *
 * Tracks every SQL statement and bind argument.
 * Returns configurable `changes` counts to simulate rows deleted.
 */
function makeRunnableDb(changesPerStatement: number[] = []) {
  const executed: { sql: string; args: unknown[] }[] = [];
  let callIndex = 0;

  const db: D1LikeRunnable = {
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          return {
            async all<T>() {
              executed.push({ sql, args });
              return { results: [] as T[] };
            },
            async run() {
              const idx = callIndex++;
              executed.push({ sql, args });
              const changes = changesPerStatement[idx] ?? 0;
              return { success: true, meta: { changes } };
            },
          };
        },
      };
    },
  };

  return { db, executed };
}

describe('executeRetentionDeletes — N-115', () => {
  it('executes exactly 5 DELETE statements (delivery, inbox, event, batchItems, batch)', async () => {
    const { db, executed } = makeRunnableDb([0, 0, 0, 0, 0]);

    await executeRetentionDeletes(db, 1_000_000);

    // 5 statements: delivery, inbox_item, event, digest_batch_item, digest_batch
    expect(executed).toHaveLength(5);
  });

  it('targets notification_delivery with 90-day cutoff', async () => {
    const { db, executed } = makeRunnableDb([0, 0, 0, 0, 0]);
    const now = 1_000_000;
    const expected90dCutoff = now - 90 * 86_400;

    await executeRetentionDeletes(db, now);

    const deliveryStmt = executed[0];
    expect(deliveryStmt).toBeDefined();
    expect(deliveryStmt?.sql).toContain('notification_delivery');
    expect(deliveryStmt?.sql).toContain('created_at < ?');
    expect(deliveryStmt?.sql).toContain('LIMIT 500');
    expect(deliveryStmt?.args[0]).toBe(expected90dCutoff);
  });

  it('targets notification_inbox_item with 365-day cutoff', async () => {
    const { db, executed } = makeRunnableDb([0, 0, 0, 0, 0]);
    const now = 1_000_000;
    const expected365dCutoff = now - 365 * 86_400;

    await executeRetentionDeletes(db, now);

    const inboxStmt = executed[1];
    expect(inboxStmt).toBeDefined();
    expect(inboxStmt?.sql).toContain('notification_inbox_item');
    expect(inboxStmt?.args[0]).toBe(expected365dCutoff);
  });

  it('targets notification_event with 90-day cutoff', async () => {
    const { db, executed } = makeRunnableDb([0, 0, 0, 0, 0]);
    const now = 2_000_000;
    const expected90dCutoff = now - 90 * 86_400;

    await executeRetentionDeletes(db, now);

    const eventStmt = executed[2];
    expect(eventStmt).toBeDefined();
    expect(eventStmt?.sql).toContain('notification_event');
    expect(eventStmt?.args[0]).toBe(expected90dCutoff);
  });

  it('deletes digest_batch_item rows before digest_batch (parent-child ordering)', async () => {
    const { db, executed } = makeRunnableDb([0, 0, 0, 0, 0]);

    await executeRetentionDeletes(db, 1_000_000);

    // Step 4 should be batch_item, step 5 should be batch
    const itemStmt   = executed[3];
    const batchStmt  = executed[4];

    expect(itemStmt?.sql).toContain('notification_digest_batch_item');
    expect(batchStmt?.sql).toContain('notification_digest_batch');

    // Subquery in batch_item delete must reference notification_digest_batch
    expect(itemStmt?.sql).toContain('digest_batch_id');
  });

  it('targets digest_batch with 90-day cutoff', async () => {
    const { db, executed } = makeRunnableDb([0, 0, 0, 0, 0]);
    const now = 3_000_000;
    const expected90dCutoff = now - 90 * 86_400;

    await executeRetentionDeletes(db, now);

    const batchStmt = executed[4];
    expect(batchStmt?.args[0]).toBe(expected90dCutoff);
  });

  it('returns correct deletion counts from meta.changes', async () => {
    const { db } = makeRunnableDb([12, 5, 30, 7, 3]);

    const result: RetentionResult = await executeRetentionDeletes(db, 1_000_000);

    expect(result.deliveriesDeleted).toBe(12);
    expect(result.inboxItemsDeleted).toBe(5);
    expect(result.eventsDeleted).toBe(30);
    expect(result.digestBatchItemsDeleted).toBe(7);
    expect(result.digestBatchesDeleted).toBe(3);
  });

  it('returns 0 counts when no rows match (meta.changes absent)', async () => {
    // Simulate a DB that returns { success: true } with no meta.changes
    const db: D1LikeRunnable = {
      prepare(_sql: string) {
        return {
          bind(..._args: unknown[]) {
            return {
              async all<T>() { return { results: [] as T[] }; },
              async run() { return { success: true }; }, // no meta
            };
          },
        };
      },
    };

    const result = await executeRetentionDeletes(db, 1_000_000);

    expect(result.deliveriesDeleted).toBe(0);
    expect(result.inboxItemsDeleted).toBe(0);
    expect(result.eventsDeleted).toBe(0);
    expect(result.digestBatchItemsDeleted).toBe(0);
    expect(result.digestBatchesDeleted).toBe(0);
  });

  it('uses LIMIT 500 on every delete statement', async () => {
    const { db, executed } = makeRunnableDb([0, 0, 0, 0, 0]);

    await executeRetentionDeletes(db, 1_000_000);

    for (const stmt of executed) {
      expect(stmt.sql).toContain('LIMIT 500');
    }
  });

  it('inbox cutoff is exactly 365 days, not 90 days', async () => {
    const { db, executed } = makeRunnableDb([0, 0, 0, 0, 0]);
    const now = 5_000_000;

    await executeRetentionDeletes(db, now);

    const deliveryCutoff = executed[0]?.args[0] as number;
    const inboxCutoff    = executed[1]?.args[0] as number;

    const diff90d  = now - 90  * 86_400;
    const diff365d = now - 365 * 86_400;

    expect(deliveryCutoff).toBe(diff90d);
    expect(inboxCutoff).toBe(diff365d);
    expect(inboxCutoff).not.toBe(deliveryCutoff);
  });
});
