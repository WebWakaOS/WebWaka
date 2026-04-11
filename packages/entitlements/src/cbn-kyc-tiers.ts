/**
 * CBN KYC Tier definitions for @webwaka/entitlements (M7a)
 * (docs/governance/entitlement-model.md#cbn-kyc-tiers, docs/identity/bvn-nin-guide.md)
 *
 * Source: CBN Tier-based KYC Framework (NRBVR 2013, Circular BSD/DIR/GEN/LAB/08/039)
 *
 * Tier 0 — Unverified. Phone + name only. Zero limits.
 * Tier 1 — Phone + BVN verified. Daily ₦50k limit.
 * Tier 2 — BVN + ID verified (NIN/FRSC). Daily ₦200k limit.
 * Tier 3 — Full KYC (BVN + NIN + utility bill/CAC). No daily limit.
 */

export type KYCTier = 'T0' | 'T1' | 'T2' | 'T3';

export interface KYCTierConfig {
  /** Human-readable tier name */
  readonly name: string;
  /** Daily transaction limit in Kobo (× 100 = naira). -1 = unlimited */
  readonly daily_limit_kobo: number;
  /** Single transfer limit in Kobo. -1 = unlimited */
  readonly single_transfer_limit_kobo: number;
  /** Balance cap in Kobo. -1 = unlimited */
  readonly balance_cap_kobo: number;
  /** Mandatory verification documents for this tier */
  readonly required_verifications: ReadonlyArray<'phone' | 'bvn' | 'nin' | 'frsc' | 'cac' | 'utility_bill'>;
  /** Whether this tier allows wallet creation */
  readonly wallet_allowed: boolean;
  /** Whether this tier allows USSD channel access */
  readonly ussd_allowed: boolean;
  /** Whether this tier allows bulk/batch payments */
  readonly bulk_payments_allowed: boolean;
}

export const KYC_TIER_CONFIGS: Readonly<Record<KYCTier, KYCTierConfig>> = {
  T0: {
    name: 'Unverified',
    daily_limit_kobo: 0,
    single_transfer_limit_kobo: 0,
    balance_cap_kobo: 0,
    required_verifications: ['phone'],
    wallet_allowed: false,
    ussd_allowed: false,
    bulk_payments_allowed: false,
  },
  T1: {
    name: 'Basic (BVN Verified)',
    daily_limit_kobo: 5_000_000,          // ₦50,000
    single_transfer_limit_kobo: 5_000_000, // ₦50,000
    balance_cap_kobo: 30_000_000,          // ₦300,000
    required_verifications: ['phone', 'bvn'],
    wallet_allowed: true,
    ussd_allowed: true,
    bulk_payments_allowed: false,
  },
  T2: {
    name: 'Standard (BVN + ID)',
    daily_limit_kobo: 20_000_000,           // ₦200,000
    single_transfer_limit_kobo: 20_000_000, // ₦200,000
    balance_cap_kobo: 200_000_000,          // ₦2,000,000
    required_verifications: ['phone', 'bvn', 'nin'],
    wallet_allowed: true,
    ussd_allowed: true,
    bulk_payments_allowed: false,
  },
  T3: {
    name: 'Enhanced (Full KYC)',
    daily_limit_kobo: -1,
    single_transfer_limit_kobo: -1,
    balance_cap_kobo: -1,
    required_verifications: ['phone', 'bvn', 'nin', 'utility_bill'],
    wallet_allowed: true,
    ussd_allowed: true,
    bulk_payments_allowed: true,
  },
} as const;

export class KYCTierError extends Error {
  constructor(
    readonly code: 'insufficient_kyc_tier' | 'kyc_required' | 'limit_exceeded',
    message: string,
    readonly requiredTier?: KYCTier,
    readonly currentTier?: KYCTier,
  ) {
    super(message);
    this.name = 'KYCTierError';
  }
}

/**
 * Check if a user's KYC tier meets or exceeds the minimum required tier.
 * Tier order: T0 < T1 < T2 < T3
 */
export function meetsTierRequirement(userTier: KYCTier, requiredTier: KYCTier): boolean {
  const order: KYCTier[] = ['T0', 'T1', 'T2', 'T3'];
  return order.indexOf(userTier) >= order.indexOf(requiredTier);
}

/**
 * Assert that a user's KYC tier meets the minimum required tier.
 * Throws KYCTierError if insufficient.
 */
export function requireKYCTier(userTier: KYCTier, requiredTier: KYCTier, feature: string): void {
  if (!meetsTierRequirement(userTier, requiredTier)) {
    throw new KYCTierError(
      'insufficient_kyc_tier',
      `${feature} requires KYC Tier ${requiredTier}. Current tier: ${userTier}.`,
      requiredTier,
      userTier,
    );
  }
}

/**
 * Validate that a proposed transaction amount in Kobo is within tier limits.
 */
export function assertWithinTierLimits(
  tier: KYCTier,
  amountKobo: number,
  type: 'single' | 'daily',
): void {
  const config = KYC_TIER_CONFIGS[tier];

  if (type === 'single') {
    const limit = config.single_transfer_limit_kobo;
    if (limit !== -1 && amountKobo > limit) {
      throw new KYCTierError(
        'limit_exceeded',
        `Single transfer of ₦${amountKobo / 100} exceeds KYC Tier ${tier} limit of ₦${limit / 100}.`,
        tier,
        tier,
      );
    }
  } else {
    const limit = config.daily_limit_kobo;
    if (limit !== -1 && amountKobo > limit) {
      throw new KYCTierError(
        'limit_exceeded',
        `Daily transfer of ₦${amountKobo / 100} exceeds KYC Tier ${tier} limit of ₦${limit / 100}.`,
        tier,
        tier,
      );
    }
  }
}
