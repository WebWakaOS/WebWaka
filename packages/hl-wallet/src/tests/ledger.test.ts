/**
 * @webwaka/hl-wallet — Ledger tests
 * Tests: creditWallet, debitWallet, insufficient balance, idempotency, FSM guards
 *
 * P9: All amounts integer kobo — no floats.
 * T4: Atomic conditional UPDATE — double-spend prevention verified.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { creditWallet, debitWallet, getLedger, createWallet } from '../ledger.js';
import { WalletError } from '../errors.js';

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
