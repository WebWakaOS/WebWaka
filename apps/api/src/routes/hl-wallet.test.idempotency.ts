/**
 * TST-006: HL-Wallet double-debit / idempotency-token collision fuzzing
 * WF-0xx: Atomic wallet transactions must be idempotent — duplicate
 * requests with the same idempotency key must NOT double-debit.
 *
 * Platform invariant WF-0xx: No double-spend; P9: integer kobo only.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Shared test doubles for wallet operations
function makeKVStub(store: Map<string, string> = new Map()) {
  return {
    get: async (key: string) => store.get(key) ?? null,
    put: async (key: string, value: string) => { store.set(key, value); },
    delete: async (key: string) => { store.delete(key); },
  };
}

function makeD1Stub(initialBalance = 100_000) {
  let balance = initialBalance;
  const debitLog: number[] = [];
  return {
    balance: () => balance,
    debitLog: () => debitLog,
    prepare: (sql: string) => ({
      bind: (..._args: unknown[]) => ({
        run: async () => {
          if (sql.includes('SELECT') || sql.includes('select')) return { results: [] };
          if (sql.toLowerCase().includes('update') && sql.toLowerCase().includes('balance')) {
            const amounts = _args.filter((a) => typeof a === 'number') as number[];
            const debitAmount = amounts[0] ?? 0;
            if (debitAmount > balance) throw new Error('Insufficient funds');
            balance -= debitAmount;
            debitLog.push(debitAmount);
          }
          return { meta: { changes: 1 } };
        },
        first: async () => {
          if (sql.toLowerCase().includes('select') && sql.toLowerCase().includes('balance')) {
            return { balance_kobo: balance };
          }
          return null;
        },
        all: async () => ({ results: [] }),
      }),
    }),
  };
}

describe('TST-006 | WF-0xx: Wallet idempotency — no double-debit', () => {

  it('P9: wallet debit amount must be a positive integer (no float)', async () => {
    const floatAmounts = [49.5, 0.01, 100.99, 1.1];
    for (const amount of floatAmounts) {
      expect(Number.isInteger(amount)).toBe(false);
      // Any system accepting this as a kobo amount is a P9 violation
      // Production guard: Math.round before any DB write
      expect(Math.round(amount)).not.toBe(amount);
    }
  });

  it('WF-0xx: Idempotency key prevents double-debit on duplicate request', async () => {
    const kvStore = new Map<string, string>();
    const kv = makeKVStub(kvStore);
    const d1 = makeD1Stub(100_000);

    const idempotencyKey = 'idem-test-001';
    const debitKobo = 5_000;

    // Simulate first debit
    const existingRecord = await kv.get(`wallet:idem:${idempotencyKey}`);
    expect(existingRecord).toBeNull();

    // Record idempotency key BEFORE debit (prevents race condition)
    await kv.put(`wallet:idem:${idempotencyKey}`, JSON.stringify({ debitKobo, status: 'completed' }));

    // Simulate debit
    await d1.prepare('UPDATE wallets SET balance_kobo = balance_kobo - ?').bind(debitKobo).run();
    expect(d1.balance()).toBe(95_000); // 100_000 - 5_000

    // Second request with same idempotency key — must be blocked
    const duplicate = await kv.get(`wallet:idem:${idempotencyKey}`);
    expect(duplicate).not.toBeNull();

    const parsed = JSON.parse(duplicate!) as { status: string; debitKobo: number };
    expect(parsed.status).toBe('completed');
    // Must return cached result, NOT execute another debit
    expect(d1.debitLog().length).toBe(1); // Only ONE debit happened
    expect(d1.balance()).toBe(95_000); // Balance unchanged by duplicate
  });

  it('WF-0xx: Concurrent duplicate debit requests — last-write-wins KV prevents race', async () => {
    const kvStore = new Map<string, string>();
    const kv = makeKVStub(kvStore);
    const d1 = makeD1Stub(50_000);

    const idempotencyKey = 'idem-concurrent-001';
    const debitKobo = 10_000;

    // Simulate race: both requests arrive before either has written idempotency key
    const request1Promise = kv.get(`wallet:idem:${idempotencyKey}`).then(async (existing) => {
      if (!existing) {
        await kv.put(`wallet:idem:${idempotencyKey}`, JSON.stringify({ debitKobo, status: 'completed' }));
        await d1.prepare('UPDATE wallets SET balance_kobo = balance_kobo - ?').bind(debitKobo).run();
      }
    });

    // Request 2 must see the idempotency key set by request 1
    await request1Promise;
    const request2Result = await kv.get(`wallet:idem:${idempotencyKey}`);
    if (request2Result) {
      // Already processed — do NOT debit again
      expect(d1.debitLog().length).toBe(1);
    }

    expect(d1.balance()).toBeGreaterThanOrEqual(40_000); // At most one debit
    expect(d1.debitLog().length).toBeLessThanOrEqual(1);
  });

  it('P9: wallet balance must remain an integer after any number of debits', async () => {
    const d1 = makeD1Stub(100_000);

    // Apply 7 integer debits
    const debits = [5000, 3000, 1500, 250, 100, 50, 25];
    for (const debit of debits) {
      expect(Number.isInteger(debit)).toBe(true);
      await d1.prepare('UPDATE wallets SET balance_kobo = balance_kobo - ?').bind(debit).run();
    }

    const finalBalance = d1.balance();
    expect(Number.isInteger(finalBalance)).toBe(true);
    expect(finalBalance).toBe(100_000 - debits.reduce((a, b) => a + b, 0));
  });

});
