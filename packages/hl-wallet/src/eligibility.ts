/**
 * @webwaka/hl-wallet — Tenant and user eligibility gates
 *
 * Phase 1: Wallet access is limited to an explicit KV allowlist of tenant IDs.
 * Super admin manages the list via PATCH /platform-admin/wallets/feature-flags.
 *
 * KV keys:
 *   wallet:eligible_tenants   — JSON array of eligible tenant_id strings
 *   wallet:kyc_tier_minimum   — '1' | '2' | '3' (minimum KYC tier for wallet)
 *
 * T3: tenant_id is always checked — never skipped.
 */

import { WalletError } from './errors.js';

interface KVLike {
  get(key: string): Promise<string | null>;
}

export async function assertTenantEligible(
  kv: KVLike,
  tenantId: string,
): Promise<void> {
  const raw = await kv.get('wallet:eligible_tenants');
  if (!raw) {
    throw new WalletError('TENANT_NOT_ELIGIBLE', { tenantId, reason: 'No eligible tenants configured' });
  }
  let eligible: string[];
  try {
    eligible = JSON.parse(raw) as string[];
  } catch {
    throw new WalletError('TENANT_NOT_ELIGIBLE', { tenantId, reason: 'Invalid eligible_tenants config' });
  }
  if (!eligible.includes(tenantId)) {
    throw new WalletError('TENANT_NOT_ELIGIBLE', { tenantId });
  }
}

export async function getMinimumKYCTier(kv: KVLike): Promise<1 | 2 | 3> {
  const raw = await kv.get('wallet:kyc_tier_minimum');
  const n = parseInt(raw ?? '1', 10);
  if (n === 2) return 2;
  if (n === 3) return 3;
  return 1;
}
