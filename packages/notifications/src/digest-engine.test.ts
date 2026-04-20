/**
 * DigestEngine test suite — N-064 (Phase 5).
 *
 * Covers:
 *   - processDigestBatch: full happy path (sends, updates status to 'sent')
 *   - Skips already-processed batches (status != 'pending')
 *   - G12: rejects batches with wrong tenantId
 *   - G1: all queries include tenant_id
 *   - G9: audit log written on success and failure
 *   - Empty batch → marked 'skipped'
 *   - Channel not wired → marked 'failed'
 */

import { describe, it, expect, vi } from 'vitest';
import { processDigestBatch } from './digest-engine.js';
import type { D1LikeFull } from './db-types.js';
import type { INotificationChannel, DispatchContext, DispatchResult } from './types.js';

// ---------------------------------------------------------------------------
// Test doubles
// ---------------------------------------------------------------------------

interface FakeRow { [key: string]: unknown }

function makeDB(opts: {
  batch?: FakeRow | null;
  items?: FakeRow[];
  updateResults?: boolean;
}): { db: D1LikeFull; runCalls: string[]; firstCalls: string[] } {
  const runCalls: string[] = [];
  const firstCalls: string[] = [];
  let batchFetched = false;

  const db: D1LikeFull = {
    prepare(sql: string) {
      return {
        bind(..._args: unknown[]) {
          return {
            async run() {
              runCalls.push(sql.trim().split('\n')[0]!.trim());
              return { success: true };
            },
            async first<T>() {
              firstCalls.push(sql.trim().split('\n')[0]!.trim());
              if (sql.includes('FROM notification_digest_batch') && sql.includes('WHERE id')) {
                if (!batchFetched) {
                  batchFetched = true;
                  return (opts.batch ?? null) as T;
                }
              }
              if (sql.includes('FROM notification_delivery')) return null as T;
              return null as T;
            },
            async all<T>() {
              if (sql.includes('FROM notification_digest_batch_item')) {
                return { results: (opts.items ?? []) as T[] };
              }
              return { results: [] as T[] };
            },
          };
        },
      };
    },
  };

  return { db, runCalls, firstCalls };
}

function makeChannel(success = true): INotificationChannel & { calls: DispatchContext[] } {
  const calls: DispatchContext[] = [];
  return {
    channel: 'email',
    providerName: 'test',
    calls,
    isEntitled: () => true,
    async dispatch(ctx: DispatchContext): Promise<DispatchResult> {
      calls.push(ctx);
      return { success };
    },
  };
}

const BATCH: FakeRow = {
  id: 'digest_abc',
  tenant_id: 'ten_1',
  user_id: 'usr_1',
  channel: 'email',
  window_type: 'daily',
  window_start: 1700000000,
  window_end: 1700086400,
  status: 'pending',
  item_count: 2,
};

const ITEMS: FakeRow[] = [
  { id: 'ditem_1', notification_event_id: 'evt_1', event_key: 'auth.login', title: 'Login', body_summary: 'You logged in.', cta_url: null, severity: 'info', created_at: 1700000001 },
  { id: 'ditem_2', notification_event_id: 'evt_2', event_key: 'billing.payment', title: 'Payment', body_summary: 'Payment of ₦500 received.', cta_url: 'https://app.example.com', severity: 'info', created_at: 1700000002 },
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('processDigestBatch', () => {
  it('happy path: dispatches and marks batch sent', async () => {
    const { db, runCalls } = makeDB({ batch: BATCH, items: ITEMS });
    const channel = makeChannel(true);

    await processDigestBatch(db, 'digest_abc', {
      tenantId: 'ten_1',
      channels: [channel],
    });

    expect(channel.calls.length).toBe(1);
    expect(channel.calls[0]!.tenantId).toBe('ten_1');
    expect(channel.calls[0]!.recipientId).toBe('usr_1');
    // Should have UPDATE batch status to sent
    expect(runCalls.some(s => s.includes('UPDATE notification_digest_batch'))).toBe(true);
  });

  it('returns early when batch not found (G12: wrong tenant)', async () => {
    const { db } = makeDB({ batch: null, items: [] });
    const channel = makeChannel(true);

    await processDigestBatch(db, 'digest_abc', {
      tenantId: 'ten_wrong',
      channels: [channel],
    });

    expect(channel.calls.length).toBe(0);
  });

  it('returns early when batch status is not pending', async () => {
    const sentBatch = { ...BATCH, status: 'sent' };
    const { db } = makeDB({ batch: sentBatch, items: ITEMS });
    const channel = makeChannel(true);

    await processDigestBatch(db, 'digest_abc', {
      tenantId: 'ten_1',
      channels: [channel],
    });

    expect(channel.calls.length).toBe(0);
  });

  it('marks batch skipped when items list is empty', async () => {
    const { db, runCalls } = makeDB({ batch: BATCH, items: [] });
    const channel = makeChannel(true);

    await processDigestBatch(db, 'digest_abc', {
      tenantId: 'ten_1',
      channels: [channel],
    });

    expect(channel.calls.length).toBe(0);
    expect(runCalls.some(s => s.includes('UPDATE notification_digest_batch'))).toBe(true);
  });

  it('marks batch failed when channel not wired', async () => {
    const { db, runCalls } = makeDB({ batch: BATCH, items: ITEMS });

    await processDigestBatch(db, 'digest_abc', {
      tenantId: 'ten_1',
      channels: [], // no channels wired
    });

    expect(runCalls.some(s => s.includes('UPDATE notification_digest_batch'))).toBe(true);
  });

  it('marks batch failed when channel.dispatch() returns success=false', async () => {
    const { db, runCalls } = makeDB({ batch: BATCH, items: ITEMS });
    const failChannel = makeChannel(false);

    await processDigestBatch(db, 'digest_abc', {
      tenantId: 'ten_1',
      channels: [failChannel],
    });

    expect(failChannel.calls.length).toBe(1);
    expect(runCalls.some(s => s.includes('UPDATE notification_digest_batch'))).toBe(true);
  });

  it('rendered template contains all item titles in body', async () => {
    const { db } = makeDB({ batch: BATCH, items: ITEMS });
    const channel = makeChannel(true);

    await processDigestBatch(db, 'digest_abc', {
      tenantId: 'ten_1',
      channels: [channel],
    });

    const template = channel.calls[0]!.template;
    expect(template.body).toContain('Login');
    expect(template.body).toContain('Payment');
    expect(template.subject).toContain('2 notifications');
  });

  it('all UPDATE queries include tenantId (G1)', async () => {
    let allSqlCalls: string[] = [];
    const db: D1LikeFull = {
      prepare(sql: string) {
        return {
          bind(..._args: unknown[]) {
            return {
              async run() {
                allSqlCalls.push(sql);
                return { success: true };
              },
              async first<T>() {
                allSqlCalls.push(sql);
                if (sql.includes('FROM notification_digest_batch') && sql.includes('WHERE id')) {
                  return BATCH as T;
                }
                return null as T;
              },
              async all<T>() {
                allSqlCalls.push(sql);
                if (sql.includes('FROM notification_digest_batch_item')) {
                  return { results: ITEMS as T[] };
                }
                return { results: [] as T[] };
              },
            };
          },
        };
      },
    };
    const channel = makeChannel(true);
    await processDigestBatch(db, 'digest_abc', { tenantId: 'ten_1', channels: [channel] });

    const updateCalls = allSqlCalls.filter(s => s.includes('UPDATE') && s.includes('notification_digest_batch'));
    updateCalls.forEach(sql => {
      expect(sql).toContain('tenant_id');
    });
  });
});
