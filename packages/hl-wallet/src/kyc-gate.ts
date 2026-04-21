/**
 * @webwaka/hl-wallet — CBN KYC tier enforcement
 *
 * Enforces CBN KYC tier limits at the wallet operation level.
 * All limits are sourced from KV (configurable) with CBN defaults as fallbacks.
 *
 * CBN defaults (per KYC_TIER_CONFIGS in @webwaka/entitlements):
 *   T1: daily ₦50,000 (5,000,000 kobo), balance cap ₦300,000 (30,000,000 kobo)
 *   T2: daily ₦200,000 (20,000,000 kobo), balance cap ₦2,000,000 (200,000,000 kobo)
 *   T3: unlimited (-1)
 *
 * P9: all amounts integer kobo.
 * T3: all queries include tenant_id.
 */

import { WalletError } from './errors.js';
import type { WalletLimits, WalletKYCTier } from './types.js';

interface KVLike {
  get(key: string): Promise<string | null>;
}

interface D1Like {
  prepare(sql: string): {
    bind(...args: unknown[]): {
      first<T>(): Promise<T | null>;
    };
  };
}

const CBN_DEFAULTS: Record<WalletKYCTier, WalletLimits> = {
  1: { dailyLimitKobo: 5_000_000,   balanceCapKobo: 30_000_000,  singleTransferLimitKobo: 5_000_000   },
  2: { dailyLimitKobo: 20_000_000,  balanceCapKobo: 200_000_000, singleTransferLimitKobo: 20_000_000  },
  3: { dailyLimitKobo: -1,          balanceCapKobo: -1,          singleTransferLimitKobo: -1          },
};

export async function getWalletLimits(kv: KVLike, kycTier: WalletKYCTier): Promise<WalletLimits> {
  const defaults = CBN_DEFAULTS[kycTier];
  const [dailyRaw, capRaw] = await Promise.all([
    kv.get(`wallet:daily_limit_kobo:${kycTier}`),
    kv.get(`wallet:balance_cap_kobo:${kycTier}`),
  ]);
  const parseKv = (raw: string | null, def: number): number => {
    if (!raw) return def;
    const n = parseInt(raw, 10);
    return Number.isNaN(n) ? def : n;
  };
  return {
    dailyLimitKobo:          parseKv(dailyRaw, defaults.dailyLimitKobo),
    balanceCapKobo:          parseKv(capRaw,   defaults.balanceCapKobo),
    singleTransferLimitKobo: defaults.singleTransferLimitKobo,
  };
}

export function assertIntegerKobo(amount: unknown, label = 'amount_kobo'): asserts amount is number {
  if (typeof amount !== 'number' || !Number.isInteger(amount) || amount <= 0) {
    throw new WalletError('INVALID_AMOUNT', { label, received: amount });
  }
}

export async function checkDailyLimit(
  db: D1Like,
  kv: KVLike,
  walletId: string,
  tenantId: string,
  amountKobo: number,
  kycTier: WalletKYCTier,
): Promise<void> {
  const limits = await getWalletLimits(kv, kycTier);
  if (limits.dailyLimitKobo === -1) return;

  const dayStart = Math.floor(Date.now() / 1000) - 86400;
  const row = await db.prepare(`
    SELECT COALESCE(SUM(ABS(amount_kobo)), 0) as daily_spent
    FROM hl_ledger
    WHERE wallet_id = ? AND tenant_id = ? AND entry_type = 'debit' AND created_at >= ?
  `).bind(walletId, tenantId, dayStart).first<{ daily_spent: number }>();

  const dailySpent = row?.daily_spent ?? 0;
  if (dailySpent + amountKobo > limits.dailyLimitKobo) {
    throw new WalletError('DAILY_LIMIT_EXCEEDED', {
      dailySpentKobo: dailySpent,
      amountKobo,
      limitKobo: limits.dailyLimitKobo,
      kycTier,
    });
  }
}

export async function checkBalanceCap(
  kv: KVLike,
  currentBalanceKobo: number,
  amountKobo: number,
  kycTier: WalletKYCTier,
): Promise<void> {
  const limits = await getWalletLimits(kv, kycTier);
  if (limits.balanceCapKobo === -1) return;

  if (currentBalanceKobo + amountKobo > limits.balanceCapKobo) {
    throw new WalletError('BALANCE_CAP_EXCEEDED', {
      currentBalanceKobo,
      amountKobo,
      capKobo: limits.balanceCapKobo,
      kycTier,
    });
  }
}
