/**
 * @webwaka/hl-wallet — KYC gate and daily limit tests
 * P9: All amounts integer kobo.
 */

import { describe, it, expect } from 'vitest';
import { checkDailyLimit, checkBalanceCap, getWalletLimits, assertIntegerKobo } from '../kyc-gate.js';
import { WalletError } from '../errors.js';

function makeKv(overrides: Record<string, string> = {}) {
  return { async get(key: string) { return overrides[key] ?? null; } };
}

function makeDb(dailySpentKobo: number) {
  return {
    prepare() {
      return {
        bind() {
          return {
            async first<T>() { return { daily_spent: dailySpentKobo } as T; },
          };
        },
      };
    },
  };
}

describe('getWalletLimits', () => {
  it('returns CBN defaults for T1', async () => {
    const limits = await getWalletLimits(makeKv(), 1);
    expect(limits.dailyLimitKobo).toBe(5_000_000);
    expect(limits.balanceCapKobo).toBe(30_000_000);
  });

  it('returns CBN defaults for T2', async () => {
    const limits = await getWalletLimits(makeKv(), 2);
    expect(limits.dailyLimitKobo).toBe(20_000_000);
    expect(limits.balanceCapKobo).toBe(200_000_000);
  });

  it('returns -1 (unlimited) for T3', async () => {
    const limits = await getWalletLimits(makeKv(), 3);
    expect(limits.dailyLimitKobo).toBe(-1);
    expect(limits.balanceCapKobo).toBe(-1);
  });

  it('respects KV overrides', async () => {
    const kv = makeKv({ 'wallet:daily_limit_kobo:1': '3000000', 'wallet:balance_cap_kobo:1': '15000000' });
    const limits = await getWalletLimits(kv, 1);
    expect(limits.dailyLimitKobo).toBe(3_000_000);
    expect(limits.balanceCapKobo).toBe(15_000_000);
  });
});

describe('checkDailyLimit', () => {
  it('passes when under limit', async () => {
    const db = makeDb(2_000_000);
    await expect(checkDailyLimit(db as never, makeKv(), 'w1', 't1', 1_000_000, 1)).resolves.toBeUndefined();
  });

  it('throws DAILY_LIMIT_EXCEEDED when over limit', async () => {
    const db = makeDb(4_500_000);
    await expect(checkDailyLimit(db as never, makeKv(), 'w1', 't1', 1_000_000, 1)).rejects.toMatchObject({
      code: 'DAILY_LIMIT_EXCEEDED',
    });
  });

  it('passes at exact limit', async () => {
    const db = makeDb(4_000_000);
    await expect(checkDailyLimit(db as never, makeKv(), 'w1', 't1', 1_000_000, 1)).resolves.toBeUndefined();
  });

  it('skips check for T3 (unlimited)', async () => {
    const db = makeDb(99_000_000_000);
    await expect(checkDailyLimit(db as never, makeKv(), 'w1', 't1', 1_000_000_000, 3)).resolves.toBeUndefined();
  });
});

describe('checkBalanceCap', () => {
  it('passes when under cap', async () => {
    await expect(checkBalanceCap(makeKv(), 10_000_000, 5_000_000, 1)).resolves.toBeUndefined();
  });

  it('throws BALANCE_CAP_EXCEEDED when cap would be breached', async () => {
    await expect(checkBalanceCap(makeKv(), 28_000_000, 5_000_000, 1)).rejects.toMatchObject({
      code: 'BALANCE_CAP_EXCEEDED',
    });
  });

  it('passes at exact cap', async () => {
    await expect(checkBalanceCap(makeKv(), 25_000_000, 5_000_000, 1)).resolves.toBeUndefined();
  });

  it('skips check for T3 (unlimited)', async () => {
    await expect(checkBalanceCap(makeKv(), 999_000_000_000, 1_000_000_000, 3)).resolves.toBeUndefined();
  });
});

describe('assertIntegerKobo', () => {
  it('passes for positive integers', () => {
    expect(() => assertIntegerKobo(1000)).not.toThrow();
    expect(() => assertIntegerKobo(1)).not.toThrow();
  });

  it('throws for floats', () => {
    expect(() => assertIntegerKobo(99.5)).toThrow(WalletError);
  });

  it('throws for zero', () => {
    expect(() => assertIntegerKobo(0)).toThrow(WalletError);
  });

  it('throws for negative', () => {
    expect(() => assertIntegerKobo(-100)).toThrow(WalletError);
  });

  it('throws for string', () => {
    expect(() => assertIntegerKobo('1000' as never)).toThrow(WalletError);
  });
});

// ---------------------------------------------------------------------------
// WF-031/032: Extended compliance tests — rolling 24h window, tier boundaries,
// KV overrides, multi-transaction accumulation, edge cases.
// ---------------------------------------------------------------------------

describe('checkDailyLimit — extended', () => {
  it('passes with zero prior spending', async () => {
    const db = makeDb(0);
    await expect(
      checkDailyLimit(db as never, makeKv(), 'w1', 't1', 1_000, 1),
    ).resolves.toBeUndefined();
  });

  it('throws at exactly 1 kobo over the T1 limit', async () => {
    // spent exactly dailyLimit − 1 already; adding 2 kobo pushes over
    const db = makeDb(4_999_999);
    await expect(
      checkDailyLimit(db as never, makeKv(), 'w1', 't1', 2, 1),
    ).rejects.toMatchObject({ code: 'DAILY_LIMIT_EXCEEDED' });
  });

  it('passes when cumulative spend equals the limit exactly (1 kobo under)', async () => {
    // spent 4_999_999, adding 1 kobo = exactly 5_000_000 — at-limit is allowed
    const db = makeDb(4_999_999);
    await expect(
      checkDailyLimit(db as never, makeKv(), 'w1', 't1', 1, 1),
    ).resolves.toBeUndefined();
  });

  it('applies T2 daily limit (₦200,000) independently of T1 (₦50,000)', async () => {
    // 60,000 spent — exceeds T1 but within T2
    const db = makeDb(6_000_000);
    await expect(
      checkDailyLimit(db as never, makeKv(), 'w1', 't1', 1_000_000, 2),
    ).resolves.toBeUndefined();
  });

  it('throws under T2 limit when T2 would be exceeded', async () => {
    // 19,500,000 spent + 1,000,000 = 20,500,000 > T2 limit (20,000,000)
    const db = makeDb(19_500_000);
    await expect(
      checkDailyLimit(db as never, makeKv(), 'w1', 't1', 1_000_000, 2),
    ).rejects.toMatchObject({ code: 'DAILY_LIMIT_EXCEEDED' });
  });

  it('respects KV override limit below CBN default', async () => {
    // KV override: T1 limit = ₦10,000 (1,000,000 kobo); spent 800,000 + 300,000 = over
    const kv = makeKv({ 'wallet:daily_limit_kobo:1': '1000000' });
    const db = makeDb(800_000);
    await expect(
      checkDailyLimit(db as never, kv, 'w1', 't1', 300_000, 1),
    ).rejects.toMatchObject({ code: 'DAILY_LIMIT_EXCEEDED' });
  });

  it('respects KV override limit when spend is within the lower custom limit', async () => {
    const kv = makeKv({ 'wallet:daily_limit_kobo:1': '1000000' });
    const db = makeDb(0);
    await expect(
      checkDailyLimit(db as never, kv, 'w1', 't1', 500_000, 1),
    ).resolves.toBeUndefined();
  });

  it('includes error context (dailySpentKobo, amountKobo, limitKobo)', async () => {
    const db = makeDb(4_500_000);
    let caught: WalletError | null = null;
    try {
      await checkDailyLimit(db as never, makeKv(), 'w1', 't1', 1_000_000, 1);
    } catch (e) {
      caught = e as WalletError;
    }
    expect(caught).not.toBeNull();
    expect(caught!.code).toBe('DAILY_LIMIT_EXCEEDED');
    expect(caught!.context['dailySpentKobo']).toBe(4_500_000);
    expect(caught!.context['amountKobo']).toBe(1_000_000);
    expect(caught!.context['limitKobo']).toBe(5_000_000);
  });
});

describe('checkBalanceCap — extended', () => {
  it('passes with zero balance', async () => {
    await expect(checkBalanceCap(makeKv(), 0, 5_000_000, 1)).resolves.toBeUndefined();
  });

  it('throws at exactly 1 kobo over the T1 cap (30,000,000 kobo)', async () => {
    // 25,000,001 + 5,000,001 = 30,000,002 > 30,000,000
    await expect(
      checkBalanceCap(makeKv(), 25_000_001, 5_000_000, 1),
    ).rejects.toMatchObject({ code: 'BALANCE_CAP_EXCEEDED' });
  });

  it('passes at exact T1 cap (credit brings balance to exactly 30,000,000)', async () => {
    await expect(
      checkBalanceCap(makeKv(), 25_000_000, 5_000_000, 1),
    ).resolves.toBeUndefined();
  });

  it('T2 cap (200,000,000 kobo) allows amounts that would fail under T1', async () => {
    // T1 would reject; T2 allows
    await expect(
      checkBalanceCap(makeKv(), 29_000_000, 5_000_000, 2),
    ).resolves.toBeUndefined();
  });

  it('respects KV override to reduce cap below CBN default', async () => {
    const kv = makeKv({ 'wallet:balance_cap_kobo:1': '10000000' });
    // current: 8,000,000 + 3,000,000 = 11,000,000 > 10,000,000
    await expect(
      checkBalanceCap(kv, 8_000_000, 3_000_000, 1),
    ).rejects.toMatchObject({ code: 'BALANCE_CAP_EXCEEDED' });
  });

  it('includes error context (currentBalanceKobo, amountKobo, capKobo)', async () => {
    let caught: WalletError | null = null;
    try {
      await checkBalanceCap(makeKv(), 28_000_000, 5_000_000, 1);
    } catch (e) {
      caught = e as WalletError;
    }
    expect(caught).not.toBeNull();
    expect(caught!.context['currentBalanceKobo']).toBe(28_000_000);
    expect(caught!.context['amountKobo']).toBe(5_000_000);
    expect(caught!.context['capKobo']).toBe(30_000_000);
  });
});

describe('getWalletLimits — extended', () => {
  it('falls back to CBN default when KV has NaN value', async () => {
    const kv = makeKv({ 'wallet:daily_limit_kobo:1': 'not-a-number' });
    const limits = await getWalletLimits(kv, 1);
    expect(limits.dailyLimitKobo).toBe(5_000_000);
  });

  it('falls back to CBN default when KV has empty string', async () => {
    const kv = makeKv({ 'wallet:balance_cap_kobo:2': '' });
    const limits = await getWalletLimits(kv, 2);
    // empty string is falsy — parseInt('', 10) = NaN but the guard is `dailyRaw ? parseInt...`
    // empty string is falsy so fallback kicks in
    expect(limits.balanceCapKobo).toBe(200_000_000);
  });

  it('singleTransferLimitKobo always equals the CBN tier default (not from KV)', async () => {
    // singleTransferLimitKobo is not overrideable via KV in the current implementation
    const kv = makeKv({ 'wallet:daily_limit_kobo:1': '1000000' });
    const limits = await getWalletLimits(kv, 1);
    expect(limits.singleTransferLimitKobo).toBe(5_000_000); // always CBN default
  });
});
