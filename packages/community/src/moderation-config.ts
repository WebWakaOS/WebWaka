/**
 * Default moderation thresholds for @webwaka/community.
 * (Platform Invariant P15 — Moderation-First Content)
 *
 * Thresholds are configurable per-tenant but cannot exceed platform maximums.
 */

export interface ModerationThresholds {
  profanity: number;
  nsfw: number;
  spam: number;
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
