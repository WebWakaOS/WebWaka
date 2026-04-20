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
  type DigestQueueMessage,
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
