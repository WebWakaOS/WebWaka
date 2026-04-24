/**
 * Default moderation thresholds for @webwaka/community.
 * (Platform Invariant P15 — Moderation-First Content)
 *
 * Thresholds are configurable per-tenant but cannot exceed platform maximums.
 *
 * UNIT SCALE NOTE (BUG-P3-012 fix):
 * ─────────────────────────────────
 * ModerationThresholds values are FRACTIONS in the 0–1 range (e.g. 0.85 = 85%).
 *
 * @webwaka/social's `classifyContent()` stores its confidence as BASIS POINTS
 * (0–10000, where 10000 = 100.00%) to avoid floating-point precision loss in D1.
 *
 * Never compare a ModerationThresholds value directly against a basis-point
 * confidence value — this would produce a false result (0.85 vs 9000).
 * Use the conversion utilities exported below.
 *
 * Example:
 *   const result = classifyContent(text);          // { confidenceBps: 9000 }
 *   const threshold = resolveThresholds().spam;    // 0.80
 *   const exceeded = bpsToFraction(result.confidenceBps) > threshold;  // ✅ correct
 *   // const wrong = result.confidenceBps > threshold;                  // ❌ always true
 */

export interface ModerationThresholds {
  /** Fraction in 0–1 range. e.g. 0.85 = 85% */
  profanity: number;
  /** Fraction in 0–1 range. e.g. 0.70 = 70% */
  nsfw: number;
  /** Fraction in 0–1 range. e.g. 0.80 = 80% */
  spam: number;
}

/**
 * Convert basis points (0–10000) to a fraction (0–1).
 * Use when comparing @webwaka/social confidenceBps against ModerationThresholds.
 */
export function bpsToFraction(bps: number): number {
  return bps / 10000;
}

/**
 * Convert a fraction (0–1) to basis points (0–10000).
 * Use to express a ModerationThreshold in the same unit as confidenceBps.
 */
export function fractionToBps(fraction: number): number {
  return Math.round(fraction * 10000);
}

/** Platform-wide maximum thresholds — tenants cannot exceed these */
export const PLATFORM_MAX_THRESHOLDS: ModerationThresholds = {
  profanity: 0.85,
  nsfw: 0.7,
  spam: 0.8,
};

/** Default thresholds used when no per-tenant config is present */
export const DEFAULT_THRESHOLDS: ModerationThresholds = {
  profanity: 0.85,
  nsfw: 0.7,
  spam: 0.8,
};

/**
 * Resolve effective thresholds for a tenant, enforcing platform maximums.
 */
export function resolveThresholds(
  tenantOverrides?: Partial<ModerationThresholds>,
): ModerationThresholds {
  if (!tenantOverrides) return DEFAULT_THRESHOLDS;
  return {
    profanity: Math.min(tenantOverrides.profanity ?? DEFAULT_THRESHOLDS.profanity, PLATFORM_MAX_THRESHOLDS.profanity),
    nsfw: Math.min(tenantOverrides.nsfw ?? DEFAULT_THRESHOLDS.nsfw, PLATFORM_MAX_THRESHOLDS.nsfw),
    spam: Math.min(tenantOverrides.spam ?? DEFAULT_THRESHOLDS.spam, PLATFORM_MAX_THRESHOLDS.spam),
  };
}
