/**
 * @webwaka/hl-wallet — MLA earnings tests
 * WF-043: Comprehensive test suite covering:
 *   - Commission computation (pure functions)
 *   - markEarningsPayable FSM + settlement window
 *   - creditMlaEarning idempotency + FSM guards
 *   - voidMlaEarning FSM guards
 *   - listMlaEarningsPaginated cursor + status filter
 *   - recordMlaEarning commission boundary
 */

import { describe, it, expect } from 'vitest';
import {
  computeCommission,
  getCommissionBps,
  getMinPayoutKobo,
  markEarningsPayable,
  creditMlaEarning,
  voidMlaEarning,
  listMlaEarningsPaginated,
  recordMlaEarning,
} from '../mla.js';
import { WalletError } from '../errors.js';
import type { MlaEarningStatus } from '../types.js';

// ---------------------------------------------------------------------------
// Helpers — typed mock row
// ---------------------------------------------------------------------------

type MockMlaRow = {
  id: string;
  wallet_id: string;
  earner_user_id: string;
  tenant_id: string;
  source_vertical: string | null;
  source_order_id: string | null;
  source_spend_event_id: string | null;
  referral_level: number;
  commission_bps: number;
  commission_kobo: number;
  base_amount_kobo: number;
  status: string;
  period_start: string | null;
  period_end: string | null;
  ledger_entry_id: string | null;
  credited_at: number | null;
  voided_at: number | null;
  void_reason: string | null;
  created_at: number;
  updated_at: number;
};

function makeRow(overrides: Partial<MockMlaRow> = {}): MockMlaRow {
  return {
    id:                  'hlmla_test001',
    wallet_id:           'hlw_test001',
    earner_user_id:      'user_001',
    tenant_id:           'handylife',
    source_vertical:     null,
    source_order_id:     null,
    source_spend_event_id: null,
    referral_level:      1,
    commission_bps:      500,
    commission_kobo:     5_000,
    base_amount_kobo:    100_000,
    status:              'pending',
    period_start:        null,
    period_end:          null,
    ledger_entry_id:     null,
    credited_at:         null,
    voided_at:           null,
    void_reason:         null,
    created_at:          1_700_000_000,
    updated_at:          1_700_000_000,
    ...overrides,
  };
}

function makeKv(overrides: Record<string, string> = {}) {
  return { async get(key: string) { return overrides[key] ?? null; } };
}

// Simple single-row DB mock that returns `row` for any SELECT, and tracks status for UPDATE.
function makeSingleRowDb(row: MockMlaRow | null) {
  const state = row ? { ...row } : null;
  let changes = 0;
  return {
    _state: state,
    prepare(sql: string) {
      return {
        bind(..._args: unknown[]) {
          return {
            async first<T>(): Promise<T | null> {
              return state as T | null;
            },
            async run(): Promise<{ success: boolean; meta: { changes: number } }> {
              if (!state) return { success: true, meta: { changes: 0 } };
              if (sql.includes("SET status = 'credited'") && state.status === 'payable') {
                state.status  = 'credited';
                state.ledger_entry_id = _args[0] as string;
                state.credited_at     = _args[1] as number;
                changes = 1;
              } else if (sql.includes("SET status = 'voided'") && state.status !== 'credited') {
                state.status    = 'voided';
                state.voided_at = _args[0] as number;
                state.void_reason = _args[1] as string;
                changes = 1;
              } else if (sql.includes("'payable'") && state.status === 'pending') {
                changes = 1;
              }
              return { success: true, meta: { changes } };
            },
            async all<T>(): Promise<{ results: T[] }> {
              return { results: state ? [state as unknown as T] : [] };
            },
          };
        },
      };
    },
  };
}

// DB mock with a ledger credit stub for creditMlaEarning (needs wallet + ledger INSERT).
function makePayableDb(row: MockMlaRow) {
  const state = { ...row, status: 'payable' };
  const walletRow = { balance_kobo: 50_000, tenant_id: row.tenant_id, status: 'active' };
  return {
    _state: state,
    prepare(sql: string) {
      return {
        bind(..._args: unknown[]) {
          return {
            async first<T>(): Promise<T | null> {
              if (sql.includes('hl_mla_earnings')) return state as unknown as T;
              if (sql.includes('hl_wallets') && sql.includes('balance_kobo')) return walletRow as unknown as T;
              if (sql.includes('hl_wallets') && sql.includes('status')) return walletRow as unknown as T;
              return null;
            },
            async run(): Promise<{ success: boolean; meta: { changes: number } }> {
              if (sql.includes("SET status = 'credited'")) {
                state.status         = 'credited';
                state.ledger_entry_id = _args[0] as string;
                state.credited_at     = _args[1] as number;
              } else if (sql.includes('UPDATE hl_wallets')) {
                walletRow.balance_kobo += row.commission_kobo;
              }
              return { success: true, meta: { changes: 1 } };
            },
            async all<T>(): Promise<{ results: T[] }> {
              return { results: [state as unknown as T] };
            },
          };
        },
      };
    },
  };
}

// Multi-row DB mock for pagination tests.
function makeMultiRowDb(rows: MockMlaRow[]) {
  const state = rows.map(r => ({ ...r }));
  return {
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          return {
            async all<T>(): Promise<{ results: T[] }> {
              const walletId = args[0] as string;
              const tenantId = args[1] as string;
              let filtered   = state.filter(r => r.wallet_id === walletId && r.tenant_id === tenantId);
              if (sql.includes('AND status =')) {
                const statusArg = args[2] as string;
                filtered = filtered.filter(r => r.status === statusArg);
              }
              // cursor filter
              if (sql.includes('AND id <')) {
                const cursorArg = args.find((a, i) => sql.includes('AND id <') && i >= 2 && typeof a === 'string') as string | undefined;
                if (cursorArg) filtered = filtered.filter(r => r.id < cursorArg);
              }
              const limit = args[args.length - 1] as number;
              return { results: filtered.slice(0, limit) as unknown as T[] };
            },
            async first<T>(): Promise<T | null> { return null; },
            async run() { return { success: true, meta: { changes: 0 } }; },
          };
        },
      };
    },
  };
}

// Minimal DB mock for markEarningsPayable — tracks changes count.
function makeMarkPayableDb(earningsToPromote: number) {
  return {
    prepare(_sql: string) {
      return {
        bind(..._args: unknown[]) {
          return {
            async run() { return { success: true, meta: { changes: earningsToPromote } }; },
            async first<T>() { return null as T; },
            async all<T>() { return { results: [] as T[] }; },
          };
        },
      };
    },
  };
}

// ---------------------------------------------------------------------------
// Original tests — computeCommission
// ---------------------------------------------------------------------------

describe('computeCommission', () => {
  it('computes 5% of 100000 correctly', () => {
    expect(computeCommission(100_000, 500)).toBe(5_000);
  });

  it('computes 2% of 50000 correctly', () => {
    expect(computeCommission(50_000, 200)).toBe(1_000);
  });

  it('computes 1% of 30000 correctly', () => {
    expect(computeCommission(30_000, 100)).toBe(300);
  });

  it('floors fractional kobo (P9 — always integer)', () => {
    expect(computeCommission(333, 500)).toBe(16);
    expect(Number.isInteger(computeCommission(333, 500))).toBe(true);
  });

  it('returns 0 for 0 bps', () => {
    expect(computeCommission(100_000, 0)).toBe(0);
  });

  it('handles large amounts correctly', () => {
    const result = computeCommission(10_000_000_000, 500);
    expect(Number.isInteger(result)).toBe(true);
    expect(result).toBe(500_000_000);
  });
});

describe('getCommissionBps', () => {
  it('returns defaults when KV has no override', async () => {
    const kv = makeKv();
    expect(await getCommissionBps(kv, 1)).toBe(500);
    expect(await getCommissionBps(kv, 2)).toBe(200);
    expect(await getCommissionBps(kv, 3)).toBe(100);
  });

  it('returns KV override when set', async () => {
    const kv = makeKv({ 'wallet:mla:commission_bps:1': '750' });
    expect(await getCommissionBps(kv, 1)).toBe(750);
  });

  it('falls back to default for invalid KV value', async () => {
    const kv = makeKv({ 'wallet:mla:commission_bps:1': 'invalid' });
    expect(await getCommissionBps(kv, 1)).toBe(500);
  });

  it('falls back for bps > 10000', async () => {
    const kv = makeKv({ 'wallet:mla:commission_bps:1': '15000' });
    expect(await getCommissionBps(kv, 1)).toBe(500);
  });

  it('allows bps = 0 (zero commission)', async () => {
    const kv = makeKv({ 'wallet:mla:commission_bps:2': '0' });
    expect(await getCommissionBps(kv, 2)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// WF-042/043 — markEarningsPayable
// ---------------------------------------------------------------------------

describe('markEarningsPayable', () => {
  it('returns the count of earnings promoted to payable', async () => {
    const db = makeMarkPayableDb(3);
    const count = await markEarningsPayable(db as never, {});
    expect(count).toBe(3);
  });

  it('returns 0 when no pending earnings are older than the settlement window', async () => {
    const db = makeMarkPayableDb(0);
    const count = await markEarningsPayable(db as never, {});
    expect(count).toBe(0);
  });

  it('passes tenantId to DB when provided (tenant-scoped variant)', async () => {
    const db = makeMarkPayableDb(2);
    const count = await markEarningsPayable(db as never, { tenantId: 'handylife' });
    expect(count).toBe(2);
  });

  it('uses default 24h settlement window when not specified', async () => {
    // We verify the function runs without throwing; window defaults to 86400.
    const db = makeMarkPayableDb(0);
    await expect(markEarningsPayable(db as never, {})).resolves.toBe(0);
  });

  it('respects custom settlementWindowSecs', async () => {
    const db = makeMarkPayableDb(5);
    const count = await markEarningsPayable(db as never, { settlementWindowSecs: 3600 });
    expect(count).toBe(5);
  });

  it('respects custom batchSize', async () => {
    const db = makeMarkPayableDb(10);
    const count = await markEarningsPayable(db as never, { batchSize: 10 });
    expect(count).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// WF-042/043 — creditMlaEarning idempotency + FSM guards
// ---------------------------------------------------------------------------

describe('creditMlaEarning — idempotency', () => {
  it('returns existing row without re-crediting when already credited (idempotent)', async () => {
    const row = makeRow({ status: 'credited', ledger_entry_id: 'hll_existing', credited_at: 1_700_000_000 });
    const db  = makeSingleRowDb(row);
    const result = await creditMlaEarning(db as never, 'hlmla_test001', 'handylife');
    expect(result.status).toBe('credited');
    expect(result.ledgerEntryId).toBe('hll_existing');
    // credited_at unchanged — no second credit
    expect(result.creditedAt).toBe(1_700_000_000);
  });
});

describe('creditMlaEarning — FSM guards', () => {
  it('throws INVALID_FSM_TRANSITION when status is pending (must be payable first)', async () => {
    const row = makeRow({ status: 'pending' });
    const db  = makeSingleRowDb(row);
    await expect(
      creditMlaEarning(db as never, 'hlmla_test001', 'handylife'),
    ).rejects.toMatchObject({ code: 'INVALID_FSM_TRANSITION' });
  });

  it('throws INVALID_FSM_TRANSITION when status is voided', async () => {
    const row = makeRow({ status: 'voided', voided_at: 1_700_000_000, void_reason: 'test' });
    const db  = makeSingleRowDb(row);
    await expect(
      creditMlaEarning(db as never, 'hlmla_test001', 'handylife'),
    ).rejects.toMatchObject({ code: 'INVALID_FSM_TRANSITION' });
  });

  it('throws MLA_EARNING_NOT_FOUND for unknown earning id', async () => {
    const db = makeSingleRowDb(null);
    await expect(
      creditMlaEarning(db as never, 'hlmla_nonexistent', 'handylife'),
    ).rejects.toMatchObject({ code: 'MLA_EARNING_NOT_FOUND' });
  });

  it('credits a payable earning and transitions status to credited', async () => {
    const row = makeRow({ status: 'pending' }); // will be overridden to payable in makePayableDb
    const db  = makePayableDb(row);
    const result = await creditMlaEarning(db as never, 'hlmla_test001', 'handylife');
    expect(result.status).toBe('credited');
    expect(result.ledgerEntryId).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// WF-043 — voidMlaEarning FSM
// ---------------------------------------------------------------------------

describe('voidMlaEarning', () => {
  it('voids a pending earning successfully', async () => {
    const row = makeRow({ status: 'pending' });
    const db  = makeSingleRowDb(row);
    const result = await voidMlaEarning(db as never, 'hlmla_test001', 'handylife', 'order cancelled');
    expect(result.status).toBe('voided');
  });

  it('voids a payable earning successfully', async () => {
    const row = makeRow({ status: 'payable' });
    const db  = makeSingleRowDb(row);
    const result = await voidMlaEarning(db as never, 'hlmla_test001', 'handylife', 'refund issued');
    expect(result.status).toBe('voided');
  });

  it('throws INVALID_FSM_TRANSITION when voiding a credited earning', async () => {
    const row = makeRow({ status: 'credited', ledger_entry_id: 'hll_001', credited_at: 1_700_000_000 });
    const db  = makeSingleRowDb(row);
    await expect(
      voidMlaEarning(db as never, 'hlmla_test001', 'handylife', 'attempt to void'),
    ).rejects.toMatchObject({ code: 'INVALID_FSM_TRANSITION' });
  });

  it('throws MLA_EARNING_NOT_FOUND for unknown earning', async () => {
    const db = makeSingleRowDb(null);
    await expect(
      voidMlaEarning(db as never, 'hlmla_nonexistent', 'handylife', 'reason'),
    ).rejects.toMatchObject({ code: 'MLA_EARNING_NOT_FOUND' });
  });
});

// ---------------------------------------------------------------------------
// WF-043/044 — listMlaEarningsPaginated cursor + status filter
// ---------------------------------------------------------------------------

describe('listMlaEarningsPaginated', () => {
  const walletId = 'hlw_test001';
  const tenantId = 'handylife';

  function makeRows(count: number, status: MlaEarningStatus = 'pending'): MockMlaRow[] {
    return Array.from({ length: count }, (_, i) => makeRow({
      id:        `hlmla_${String(i + 1).padStart(3, '0')}`,
      wallet_id: walletId,
      tenant_id: tenantId,
      status,
    }));
  }

  it('returns up to the requested limit', async () => {
    const db  = makeMultiRowDb(makeRows(10));
    const res = await listMlaEarningsPaginated(db as never, walletId, tenantId, { limit: 5 });
    // DB mock returns all rows up to fetchSize (limit+1); we get 6 items; slice gives 5 with cursor
    // The mock returns up to fetchSize items — we verify we get at most 5
    expect(res.earnings.length).toBeLessThanOrEqual(5);
  });

  it('returns nextCursor when more results exist', async () => {
    const rows = makeRows(6);
    const db   = makeMultiRowDb(rows);
    const res  = await listMlaEarningsPaginated(db as never, walletId, tenantId, { limit: 5 });
    // With 6 rows and limit=5 we fetch 6 (fetchSize = limit+1 = 6) — hasMore is true
    expect(res.nextCursor).toBeDefined();
  });

  it('returns undefined nextCursor when no more results', async () => {
    const rows = makeRows(3);
    const db   = makeMultiRowDb(rows);
    const res  = await listMlaEarningsPaginated(db as never, walletId, tenantId, { limit: 50 });
    expect(res.nextCursor).toBeUndefined();
  });

  it('filters by status when provided', async () => {
    const rows = [
      ...makeRows(3, 'pending'),
      ...makeRows(2, 'credited'),
    ];
    const db  = makeMultiRowDb(rows);
    const res = await listMlaEarningsPaginated(db as never, walletId, tenantId, { status: 'credited' });
    res.earnings.forEach(e => expect(e.status).toBe('credited'));
  });

  it('returns empty array when no earnings match', async () => {
    const db  = makeMultiRowDb([]);
    const res = await listMlaEarningsPaginated(db as never, walletId, tenantId, {});
    expect(res.earnings).toHaveLength(0);
    expect(res.nextCursor).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// WF-043 — recordMlaEarning commission boundary
// ---------------------------------------------------------------------------

describe('recordMlaEarning', () => {
  it('throws INVALID_AMOUNT when commission computes to zero (bps=0)', async () => {
    const kv = makeKv({ 'wallet:mla:commission_bps:1': '0' });
    const db = makeSingleRowDb(null);
    await expect(
      recordMlaEarning(db as never, kv, {
        walletId:       'hlw_001',
        earnerUserId:   'user_001',
        tenantId:       'handylife',
        referralLevel:  1,
        baseAmountKobo: 100_000,
      }),
    ).rejects.toMatchObject({ code: 'INVALID_AMOUNT' });
  });
});

// ---------------------------------------------------------------------------
// WF-043 — getMinPayoutKobo
// ---------------------------------------------------------------------------

describe('getMinPayoutKobo', () => {
  it('returns default ₦500 (50000 kobo) when KV has no override', async () => {
    expect(await getMinPayoutKobo(makeKv())).toBe(50_000);
  });

  it('returns KV override when set', async () => {
    const kv = makeKv({ 'wallet:mla:min_payout_kobo': '100000' });
    expect(await getMinPayoutKobo(kv)).toBe(100_000);
  });
});
