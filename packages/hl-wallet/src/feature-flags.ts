/**
 * @webwaka/hl-wallet — Feature flag management
 *
 * All wallet feature flags live in WALLET_KV (Cloudflare KV namespace).
 * Flags take effect instantly — no deployment needed to enable/disable.
 *
 * KV key format: wallet:flag:{feature}_enabled
 * Value: '1' (enabled) | '0' (disabled)
 *
 * Super admin toggles flags via PATCH /platform-admin/wallets/feature-flags.
 */

import { WalletError } from './errors.js';
import type { WalletFeatureFlag } from './types.js';

interface KVLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

export async function isFeatureEnabled(
  flag: WalletFeatureFlag,
  kv: KVLike,
): Promise<boolean> {
  const value = await kv.get(`wallet:flag:${flag}_enabled`);
  return value === '1';
}

export async function assertFeatureEnabled(
  flag: WalletFeatureFlag,
  kv: KVLike,
): Promise<void> {
  const enabled = await isFeatureEnabled(flag, kv);
  if (!enabled) {
    throw new WalletError('FEATURE_DISABLED', { feature: flag });
  }
}

export async function setFeatureFlag(
  flag: WalletFeatureFlag,
  enabled: boolean,
  kv: KVLike,
): Promise<void> {
  await kv.put(`wallet:flag:${flag}_enabled`, enabled ? '1' : '0');
}

export async function getAllFeatureFlags(
  kv: KVLike,
): Promise<Record<WalletFeatureFlag, boolean>> {
  const flags: WalletFeatureFlag[] = ['transfers', 'withdrawals', 'online_funding', 'mla_payout'];
  const results = await Promise.all(flags.map((f) => isFeatureEnabled(f, kv)));
  return Object.fromEntries(flags.map((f, i) => [f, results[i]])) as Record<WalletFeatureFlag, boolean>;
}
