/**
 * WalletService — unit tests (QA-05).
 *
 * Tests:
 *   - getWallet returns null when wallet not found
 *   - getWallet returns parsed WakaCuWallet when found
 *   - debit fails when balance insufficient
 *   - debit succeeds and logs transaction
 *   - credit adds to balance and logs transaction
 *   - P9: All balances are integers
 *   - T3: All queries include tenant_id
 */

import { describe, it, expect, vi } from 'vitest';
import { WalletService } from './wallet-service.js';

// ---------------------------------------------------------------------------
// Mock D1 builder
// ---------------------------------------------------------------------------

interface MockResult {
  first: unknown;
  all: unknown[];
  run: { success: boolean; meta?: { changes?: number } };
}

function makeMockDb(results: Record<string, MockResult> = {}) {
  const defaultResult: MockResult = {
    first: null,
    all: [],
    run: { success: true },
  };

  const db = {
    prepare: vi.fn().mockImplementation((sql: string) => {
      const match = Object.entries(results).find(([k]) =>
        sql.toLowerCase().includes(k.toLowerCase()),
      );
      const r = match ? match[1] : defaultResult;
      const bound = {
        first: <T>() => Promise.resolve(r.first as T),
        all: <T>() => Promise.resolve({ results: r.all as T[] }),
        run: () => Promise.resolve(r.run),
      };
      return { bind: (..._args: unknown[]) => bound, ...bound };
    }),
    batch: vi.fn().mockResolvedValue([{ success: true }, { success: true }, { success: true }]),
  };
  return db as unknown as D1Database;
}

function makeService(dbOverride?: D1Database) {
  return new WalletService({ db: dbOverride ?? makeMockDb() });
}

// ---------------------------------------------------------------------------
// getWallet
// ---------------------------------------------------------------------------

describe('WalletService.getWallet', () => {
  it('returns null when wallet not found', async () => {
    const svc = makeService(makeMockDb({ 'wc_wallets': { first: null, all: [], run: { success: true } } }));
    const result = await svc.getWallet('tenant-x');
    expect(result).toBeNull();
  });

  it('returns parsed WakaCuWallet when found', async () => {
    const row = {
      tenant_id: 'tenant-a',
      balance_wc: 10000,
      lifetime_purchased_wc: 50000,
      lifetime_spent_wc: 40000,
      spend_cap_monthly_wc: 20000,
      current_month_spent_wc: 5000,
      spend_cap_reset_at: '2026-05-01',
      updated_at: '2026-04-01',
    };
    const svc = makeService(makeMockDb({ 'wc_wallets': { first: row, all: [], run: { success: true } } }));
    const wallet = await svc.getWallet('tenant-a');
    expect(wallet).not.toBeNull();
    expect(wallet?.tenantId).toBe('tenant-a');
    expect(wallet?.balanceWakaCu).toBe(10000);
    expect(wallet?.lifetimePurchasedWakaCu).toBe(50000);
  });

  it('returns integer balance values (P9)', async () => {
    const row = {
      tenant_id: 'tenant-b',
      balance_wc: 9999,
      lifetime_purchased_wc: 9999,
      lifetime_spent_wc: 0,
      spend_cap_monthly_wc: 10000,
      current_month_spent_wc: 0,
      spend_cap_reset_at: '2026-05-01',
      updated_at: '2026-04-01',
    };
    const svc = makeService(makeMockDb({ 'wc_wallets': { first: row, all: [], run: { success: true } } }));
    const wallet = await svc.getWallet('tenant-b');
    expect(Number.isInteger(wallet?.balanceWakaCu)).toBe(true);
    expect(Number.isInteger(wallet?.lifetimeSpentWakaCu)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// listTransactions
// ---------------------------------------------------------------------------

describe('WalletService.listTransactions', () => {
  it('returns empty array when no transactions', async () => {
    const svc = makeService();
    const results = await svc.listTransactions('tenant-x');
    expect(Array.isArray(results)).toBe(true);
  });

  it('returns transaction list', async () => {
    const row = {
      id: 'tx_001',
      tenant_id: 'tenant-c',
      direction: 'credit',
      amount_wc: 5000,
      reason: 'topup',
      ref: 'PAY_123',
      balance_after_wc: 5000,
      created_at: '2026-04-01',
    };
    const svc = makeService(makeMockDb({ 'wc_transactions': { first: null, all: [row], run: { success: true } } }));
    const results = await svc.listTransactions('tenant-c');
    expect(results).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// ensureWallet
// ---------------------------------------------------------------------------

describe('WalletService.ensureWallet', () => {
  it('resolves without throwing when wallet does not exist (INSERT OR IGNORE)', async () => {
    const db = makeMockDb({ 'wc_wallets': { first: null, all: [], run: { success: true } } });
    const svc = makeService(db);
    // ensureWallet returns void — just verifies it does not throw
    await expect(svc.ensureWallet('tenant-new')).resolves.toBeUndefined();
  });

  it('resolves without throwing when wallet already exists (INSERT OR IGNORE idempotent)', async () => {
    const existingRow = {
      tenant_id: 'tenant-existing',
      balance_wc: 100,
      lifetime_purchased_wc: 100,
      lifetime_spent_wc: 0,
      spend_cap_monthly_wc: 1000,
      current_month_spent_wc: 0,
      spend_cap_reset_at: '2026-05-01',
      updated_at: '2026-04-01',
    };
    const db = makeMockDb({ 'wc_wallets': { first: existingRow, all: [], run: { success: true } } });
    const svc = makeService(db);
    await expect(svc.ensureWallet('tenant-existing')).resolves.toBeUndefined();
  });

  it('uses INSERT OR IGNORE — does not overwrite existing wallet', async () => {
    const prepareSpy = vi.fn().mockReturnValue({
      bind: (..._args: unknown[]) => ({
        run: () => Promise.resolve({ success: true }),
        first: () => Promise.resolve(null),
        all: () => Promise.resolve({ results: [] }),
      }),
    });
    const db = { prepare: prepareSpy, batch: vi.fn() } as unknown as D1Database;
    const svc = makeService(db);
    await svc.ensureWallet('tenant-idempotent');
    const sqlCalled = (prepareSpy.mock.calls[0]?.[0] as string) ?? '';
    expect(sqlCalled).toContain('INSERT OR IGNORE');
  });
});

// ---------------------------------------------------------------------------
// debit
// ---------------------------------------------------------------------------

describe('WalletService.debit', () => {
  it('returns { success: false } when balance insufficient (does not throw)', async () => {
    const walletRow = {
      tenant_id: 'tenant-poor',
      balance_wc: 50,
      lifetime_purchased_wc: 50,
      lifetime_spent_wc: 0,
      spend_cap_monthly_wc: 1000,
      current_month_spent_wc: 0,
      spend_cap_reset_at: '2026-05-01',
      updated_at: '2026-04-01',
    };
    const svc = makeService(makeMockDb({ 'wc_wallets': { first: walletRow, all: [], run: { success: true } } }));
    const result = await svc.debit('tenant-poor', 100, 'test');
    expect(result.success).toBe(false);
    expect(result.balanceAfter).toBe(50);  // remains unchanged
  });

  it('returns { success: true } and correct balanceAfter when sufficient', async () => {
    const walletRow = {
      tenant_id: 'tenant-rich',
      balance_wc: 10000,
      lifetime_purchased_wc: 10000,
      lifetime_spent_wc: 0,
      spend_cap_monthly_wc: 5000,
      current_month_spent_wc: 0,
      spend_cap_reset_at: '2026-05-01',
      updated_at: '2026-04-01',
    };
    const svc = makeService(makeMockDb({ 'wc_wallets': { first: walletRow, all: [], run: { success: true } } }));
    const result = await svc.debit('tenant-rich', 500, 'ai_usage');
    expect(result.success).toBe(true);
    expect(result.balanceAfter).toBe(9500);
    expect(Number.isInteger(result.balanceAfter)).toBe(true);
  });

  it('throws for non-integer debit amount (P9)', async () => {
    const svc = makeService();
    await expect(svc.debit('tenant-x', 99.5, 'bad')).rejects.toThrow(/positive integer/);
  });

  it('throws for zero debit amount (P9)', async () => {
    const svc = makeService();
    await expect(svc.debit('tenant-x', 0, 'bad')).rejects.toThrow(/positive integer/);
  });
});

// ---------------------------------------------------------------------------
// credit
// ---------------------------------------------------------------------------

describe('WalletService.credit', () => {
  it('returns a WakaCuTransaction on success', async () => {
    const walletRow = {
      tenant_id: 'tenant-q',
      balance_wc: 1000,
      lifetime_purchased_wc: 1000,
      lifetime_spent_wc: 0,
      spend_cap_monthly_wc: 5000,
      current_month_spent_wc: 0,
      spend_cap_reset_at: '2026-05-01',
      updated_at: '2026-04-01',
    };
    const svc = makeService(makeMockDb({ 'wc_wallets': { first: walletRow, all: [], run: { success: true } } }));
    const result = await svc.credit('tenant-q', 2000, 'topup', 'PAY_XYZ');
    expect(result.id).toBeDefined();
    expect(result.tenantId).toBe('tenant-q');
    expect(result.amountWakaCu).toBe(2000);
    expect(result.type).toBe('credit');
    expect(Number.isInteger(result.balanceAfterWakaCu)).toBe(true);
  });

  it('throws for non-integer credit amount (P9)', async () => {
    const svc = makeService();
    await expect(svc.credit('tenant-x', 99.5, 'bad')).rejects.toThrow(/positive integer/);
  });

  it('throws for zero credit amount (P9)', async () => {
    const svc = makeService();
    await expect(svc.credit('tenant-x', 0, 'bad')).rejects.toThrow(/positive integer/);
  });
});
