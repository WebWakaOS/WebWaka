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
