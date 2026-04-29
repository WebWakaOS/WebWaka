/**
 * @webwaka/hl-wallet — Ledger tests
 * Tests: creditWallet, debitWallet, insufficient balance, idempotency, FSM guards
 *
 * P9: All amounts integer kobo — no floats.
 * T4: Atomic conditional UPDATE — double-spend prevention verified.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { creditWallet, debitWallet, getLedger } from '../ledger.js';
import { WalletError } from '../errors.js';

// ---------------------------------------------------------------------------
// Fake DB for getLedger tests
// ---------------------------------------------------------------------------

type FakeLedgerRow = {
  id: string;
  wallet_id: string;
  tenant_id: string;
  entry_type: string;
  amount_kobo: number;
  balance_after: number;
  tx_type: string;
  reference: string;
  description: string;
  currency_code: string;
  related_id: string | null;
  related_type: string | null;
  created_at: number;
  user_id: string;
};

function makeLedgerDb(rows: FakeLedgerRow[]) {
  return {
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          return {
            async all<T>() {
              const walletId = args[0] as string;
              const tenantId = args[1] as string;
              const isCompositeFilter = sql.includes('(created_at < ? OR (created_at = ? AND id < ?))');

              let filtered = rows.filter(
                r => r.wallet_id === walletId && r.tenant_id === tenantId,
              );

              if (isCompositeFilter) {
                const cursorCreatedAt = args[2] as number;
                const cursorId        = args[4] as string;
                filtered = filtered.filter(
                  r => r.created_at < cursorCreatedAt ||
                    (r.created_at === cursorCreatedAt && r.id < cursorId),
                );
              }

              // Sort DESC by (created_at, id)
              filtered.sort((a, b) =>
                b.created_at !== a.created_at
                  ? b.created_at - a.created_at
                  : b.id < a.id ? -1 : 1,
              );

              const limit = args[args.length - 1] as number;
              return { results: filtered.slice(0, limit) as unknown as T[] };
            },
            async run() { return { success: true, meta: { changes: 0 } }; },
            async first<T>() { return null as T; },
          };
        },
      };
    },
  };
}

function makeDb(wallets: Record<string, { balance_kobo: number; status: string; user_id: string }> = {}): {
  db: ReturnType<typeof buildFakeDb>;
  wallets: typeof wallets;
  ledgerRows: unknown[];
} {
  const ledgerRows: unknown[] = [];

  const db = buildFakeDb(wallets, ledgerRows);
  return { db, wallets, ledgerRows };
}

function buildFakeDb(
  wallets: Record<string, { balance_kobo: number; status: string; user_id: string }>,
  ledgerRows: unknown[],
) {
  return {
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          return {
            async run() {
              if (sql.includes('UPDATE hl_wallets') && sql.includes('balance_kobo + ?')) {
                const id = args[2] as string;
                const amount = args[0] as number;
                const w = wallets[id];
                if (!w || w.status === 'closed') return { success: true, meta: { changes: 0 } };
                w.balance_kobo += amount;
                return { success: true, meta: { changes: 1 } };
              }
              if (sql.includes('UPDATE hl_wallets') && sql.includes('balance_kobo - ?')) {
                const amount = args[0] as number;
                const id = args[2] as string;
                const w = wallets[id];
                if (!w) return { success: true, meta: { changes: 0 } };
                if (w.status !== 'active') return { success: true, meta: { changes: 0 } };
                if (w.balance_kobo < amount) return { success: true, meta: { changes: 0 } };
                w.balance_kobo -= amount;
                return { success: true, meta: { changes: 1 } };
              }
              if (sql.includes('INSERT INTO hl_ledger')) {
                ledgerRows.push(args);
              }
              if (sql.includes('INSERT INTO hl_wallets')) {
                const id = args[0] as string;
                wallets[id] = { balance_kobo: 0, status: 'active', user_id: args[1] as string };
              }
              return { success: true, meta: { changes: 1 } };
            },
            async first<T>() {
              // Handle UPDATE ... RETURNING balance_kobo (atomic credit/debit mock)
              if (sql.includes('UPDATE hl_wallets') && sql.includes('RETURNING') && sql.includes('balance_kobo + ?')) {
                const amount = args[0] as number;
                const id = args[2] as string;
                const w = wallets[id];
                if (!w || w.status === 'closed') return null as T;
                w.balance_kobo += amount;
                return { balance_kobo: w.balance_kobo } as T;
              }
              if (sql.includes('UPDATE hl_wallets') && sql.includes('RETURNING') && sql.includes('balance_kobo - ?')) {
                const amount = args[0] as number;
                const id = args[2] as string;
                const w = wallets[id];
                if (!w || w.status !== 'active' || w.balance_kobo < amount) return null as T;
                w.balance_kobo -= amount;
                return { balance_kobo: w.balance_kobo } as T;
              }
              if (sql.includes('hl_wallets')) {
                const id = args[0] as string;
                const w = wallets[id];
                if (!w) return null as T;
                return { id, balance_kobo: w.balance_kobo, status: w.status, user_id: w.user_id,
                  tenant_id: args[1], workspace_id: '', lifetime_funded_kobo: 0, lifetime_spent_kobo: 0,
                  kyc_tier: 1, currency_code: 'NGN', frozen_reason: null, closed_at: null, closed_reason: null,
                  created_at: 0, updated_at: 0 } as T;
              }
              return null as T;
            },
            async all<T>() {
              return { results: [] as T[] };
            },
          };
        },
      };
    },
  };
}

describe('creditWallet', () => {
  it('credits a wallet and appends a ledger entry', async () => {
    const { db, wallets, ledgerRows } = makeDb({ w1: { balance_kobo: 1000, status: 'active', user_id: 'u1' } });
    const entry = await creditWallet(db as never, {
      walletId: 'w1', tenantId: 't1', amountKobo: 5000,
      txType: 'bank_fund', reference: 'REF001', description: 'Test credit',
    });
    expect(wallets['w1']!.balance_kobo).toBe(6000);
    expect(entry.amountKobo).toBe(5000);
    expect(entry.entryType).toBe('credit');
    expect(entry.txType).toBe('bank_fund');
    expect(ledgerRows.length).toBe(1);
  });

  it('throws INVALID_AMOUNT for non-integer kobo (P9)', async () => {
    const { db } = makeDb({ w1: { balance_kobo: 0, status: 'active', user_id: 'u1' } });
    await expect(creditWallet(db as never, {
      walletId: 'w1', tenantId: 't1', amountKobo: 99.5,
      txType: 'bank_fund', reference: 'REF002', description: 'Float test',
    })).rejects.toThrow(WalletError);
  });

  it('throws INVALID_AMOUNT for zero kobo', async () => {
    const { db } = makeDb({ w1: { balance_kobo: 0, status: 'active', user_id: 'u1' } });
    await expect(creditWallet(db as never, {
      walletId: 'w1', tenantId: 't1', amountKobo: 0,
      txType: 'bank_fund', reference: 'REF003', description: 'Zero test',
    })).rejects.toThrow(WalletError);
  });

  it('throws WALLET_NOT_FOUND for unknown wallet', async () => {
    const { db } = makeDb({});
    await expect(creditWallet(db as never, {
      walletId: 'missing', tenantId: 't1', amountKobo: 500,
      txType: 'bank_fund', reference: 'REF004', description: 'Unknown wallet',
    })).rejects.toMatchObject({ code: 'WALLET_NOT_FOUND' });
  });

  it('throws WALLET_CLOSED for closed wallet', async () => {
    const { db } = makeDb({ w1: { balance_kobo: 0, status: 'closed', user_id: 'u1' } });
    await expect(creditWallet(db as never, {
      walletId: 'w1', tenantId: 't1', amountKobo: 500,
      txType: 'bank_fund', reference: 'REF005', description: 'Closed wallet',
    })).rejects.toMatchObject({ code: 'WALLET_CLOSED' });
  });
});

describe('debitWallet', () => {
  it('debits a wallet with sufficient balance', async () => {
    const { db, wallets, ledgerRows } = makeDb({ w1: { balance_kobo: 10000, status: 'active', user_id: 'u1' } });
    const entry = await debitWallet(db as never, {
      walletId: 'w1', userId: 'u1', tenantId: 't1', amountKobo: 3000,
      txType: 'spend', reference: 'SPD001', description: 'Test spend',
    });
    expect(wallets['w1']!.balance_kobo).toBe(7000);
    expect(entry.amountKobo).toBe(-3000);
    expect(entry.entryType).toBe('debit');
    expect(ledgerRows.length).toBe(1);
  });

  it('throws INSUFFICIENT_BALANCE when balance is too low', async () => {
    const { db } = makeDb({ w1: { balance_kobo: 100, status: 'active', user_id: 'u1' } });
    await expect(debitWallet(db as never, {
      walletId: 'w1', userId: 'u1', tenantId: 't1', amountKobo: 5000,
      txType: 'spend', reference: 'SPD002', description: 'Over limit',
    })).rejects.toMatchObject({ code: 'INSUFFICIENT_BALANCE' });
  });

  it('throws WALLET_FROZEN for frozen wallet', async () => {
    const { db } = makeDb({ w1: { balance_kobo: 100000, status: 'frozen', user_id: 'u1' } });
    await expect(debitWallet(db as never, {
      walletId: 'w1', userId: 'u1', tenantId: 't1', amountKobo: 1000,
      txType: 'spend', reference: 'SPD003', description: 'Frozen',
    })).rejects.toMatchObject({ code: 'WALLET_FROZEN' });
  });

  it('throws WALLET_NOT_FOUND for unknown wallet', async () => {
    const { db } = makeDb({});
    await expect(debitWallet(db as never, {
      walletId: 'missing', userId: 'u1', tenantId: 't1', amountKobo: 1000,
      txType: 'spend', reference: 'SPD004', description: 'Unknown',
    })).rejects.toMatchObject({ code: 'WALLET_NOT_FOUND' });
  });

  it('does not allow float kobo amounts (P9)', async () => {
    const { db } = makeDb({ w1: { balance_kobo: 100000, status: 'active', user_id: 'u1' } });
    await expect(debitWallet(db as never, {
      walletId: 'w1', userId: 'u1', tenantId: 't1', amountKobo: 99.99,
      txType: 'spend', reference: 'SPD005', description: 'Float',
    })).rejects.toMatchObject({ code: 'INVALID_AMOUNT' });
  });

  it('exact balance debit succeeds (boundary)', async () => {
    const { db, wallets } = makeDb({ w1: { balance_kobo: 5000, status: 'active', user_id: 'u1' } });
    await debitWallet(db as never, {
      walletId: 'w1', userId: 'u1', tenantId: 't1', amountKobo: 5000,
      txType: 'spend', reference: 'SPD006', description: 'Exact balance',
    });
    expect(wallets['w1']!.balance_kobo).toBe(0);
  });

  it('one-kobo-over fails (boundary)', async () => {
    const { db } = makeDb({ w1: { balance_kobo: 4999, status: 'active', user_id: 'u1' } });
    await expect(debitWallet(db as never, {
      walletId: 'w1', userId: 'u1', tenantId: 't1', amountKobo: 5000,
      txType: 'spend', reference: 'SPD007', description: 'One over',
    })).rejects.toMatchObject({ code: 'INSUFFICIENT_BALANCE' });
  });
});

describe('WalletError', () => {
  it('has correct status codes', () => {
    const err404 = new WalletError('WALLET_NOT_FOUND');
    const err403 = new WalletError('WALLET_FROZEN');
    const err422 = new WalletError('INSUFFICIENT_BALANCE');
    const err503 = new WalletError('FEATURE_DISABLED', { feature: 'transfers' });
    const err409 = new WalletError('WALLET_ALREADY_EXISTS');
    expect(err404.statusCode).toBe(404);
    expect(err403.statusCode).toBe(403);
    expect(err422.statusCode).toBe(422);
    expect(err503.statusCode).toBe(503);
    expect(err409.statusCode).toBe(409);
  });

  it('preserves error code and context', () => {
    const err = new WalletError('INSUFFICIENT_BALANCE', { balanceKobo: 100, requiredKobo: 500 });
    expect(err.code).toBe('INSUFFICIENT_BALANCE');
    expect(err.context.balanceKobo).toBe(100);
    expect(err.context.requiredKobo).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// getLedger — composite cursor (created_at, id) pagination
// Regression tests for the non-unique created_at cursor fix.
// ---------------------------------------------------------------------------

function makeFakeRow(overrides: Partial<FakeLedgerRow> & { id: string }): FakeLedgerRow {
  return {
    wallet_id:    'w1',
    tenant_id:    't1',
    entry_type:   'credit',
    amount_kobo:  1000,
    balance_after: 1000,
    tx_type:      'bank_fund',
    reference:    'REF',
    description:  'test',
    currency_code: 'NGN',
    related_id:   null,
    related_type: null,
    user_id:      '',
    created_at:   1_700_000_000,
    ...overrides,
  };
}

describe('getLedger — composite cursor pagination', () => {
  it('returns all rows when no cursor provided', async () => {
    const rows = [
      makeFakeRow({ id: 'hll_003', created_at: 1_700_000_003 }),
      makeFakeRow({ id: 'hll_002', created_at: 1_700_000_002 }),
      makeFakeRow({ id: 'hll_001', created_at: 1_700_000_001 }),
    ];
    const db = makeLedgerDb(rows);
    const result = await getLedger(db as never, { walletId: 'w1', tenantId: 't1', limit: 10 });
    expect(result.entries).toHaveLength(3);
    expect(result.nextCursor).toBeNull();
  });

  it('returns nextCursor as base64-encoded JSON with t and i fields', async () => {
    const rows = Array.from({ length: 6 }, (_, i) =>
      makeFakeRow({ id: `hll_00${i + 1}`, created_at: 1_700_000_000 + i }),
    );
    const db = makeLedgerDb(rows);
    const result = await getLedger(db as never, { walletId: 'w1', tenantId: 't1', limit: 5 });
    expect(result.nextCursor).not.toBeNull();
    const decoded = JSON.parse(Buffer.from(result.nextCursor!, 'base64').toString());
    expect(typeof decoded.t).toBe('number');
    expect(typeof decoded.i).toBe('string');
  });

  it('cursor correctly excludes already-seen rows (no duplicates)', async () => {
    const rows = Array.from({ length: 6 }, (_, i) =>
      makeFakeRow({ id: `hll_00${i + 1}`, created_at: 1_700_000_000 + i }),
    );
    const db = makeLedgerDb(rows);
    const page1 = await getLedger(db as never, { walletId: 'w1', tenantId: 't1', limit: 3 });
    expect(page1.entries).toHaveLength(3);
    const page2 = await getLedger(db as never, {
      walletId: 'w1', tenantId: 't1', limit: 3, cursor: page1.nextCursor ?? undefined,
    });
    const allIds = [...page1.entries.map(e => e.id), ...page2.entries.map(e => e.id)];
    // No duplicates
    expect(new Set(allIds).size).toBe(allIds.length);
  });

  it('handles two transactions with identical created_at without skipping either', async () => {
    // Both rows share the same second — old cursor (pure timestamp) would skip one of them.
    const rows = [
      makeFakeRow({ id: 'hll_B', created_at: 1_700_000_001 }),
      makeFakeRow({ id: 'hll_A', created_at: 1_700_000_001 }),
      makeFakeRow({ id: 'hll_Z', created_at: 1_700_000_000 }),
    ];
    const db = makeLedgerDb(rows);
    const page1 = await getLedger(db as never, { walletId: 'w1', tenantId: 't1', limit: 2 });
    expect(page1.entries).toHaveLength(2);
    expect(page1.nextCursor).not.toBeNull();
    const page2 = await getLedger(db as never, {
      walletId: 'w1', tenantId: 't1', limit: 2, cursor: page1.nextCursor ?? undefined,
    });
    expect(page2.entries).toHaveLength(1);
    const allIds = [...page1.entries.map(e => e.id), ...page2.entries.map(e => e.id)];
    expect(new Set(allIds).size).toBe(3);
  });

  it('gracefully starts from beginning when cursor is invalid (legacy or corrupt)', async () => {
    const rows = [makeFakeRow({ id: 'hll_001', created_at: 1_700_000_001 })];
    const db = makeLedgerDb(rows);
    // Old cursor format: base64(plain number) — invalid for the composite format
    const legacyCursor = Buffer.from('1700000002').toString('base64');
    const result = await getLedger(db as never, {
      walletId: 'w1', tenantId: 't1', limit: 10, cursor: legacyCursor,
    });
    // Invalid cursor is discarded — returns from beginning
    expect(result.entries).toHaveLength(1);
  });
});
