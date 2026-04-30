/**
 * Tier-Based Rate Limiting Configuration (L-2)
 *
 * Defines per-subscription-tier rate limits that align with billing plans.
 * Used by the rate-limit middleware to enforce different limits per plan.
 *
 * Usage:
 *   import { getTierRateLimit } from './rate-limit-tiers.js';
 *   const config = getTierRateLimit(workspace.subscription_plan);
 */

export interface TierRateLimitConfig {
  /** Plan name */
  plan: string;
  /** Maximum requests per minute */
  requestsPerMinute: number;
  /** Maximum AI requests per hour */
  aiRequestsPerHour: number;
  /** Maximum file uploads per day */
  uploadsPerDay: number;
  /** Warning threshold (percentage of limit) */
  warningThreshold: number;
}

export const TIER_RATE_LIMITS: Record<string, TierRateLimitConfig> = {
  free: {
    plan: 'free',
    requestsPerMinute: 30,
    aiRequestsPerHour: 10,
    uploadsPerDay: 20,
    warningThreshold: 0.8,
  },
  starter: {
    plan: 'starter',
    requestsPerMinute: 60,
    aiRequestsPerHour: 50,
    uploadsPerDay: 100,
    warningThreshold: 0.8,
  },
  growth: {
    plan: 'growth',
    requestsPerMinute: 120,
    aiRequestsPerHour: 200,
    uploadsPerDay: 500,
    warningThreshold: 0.85,
  },
  pro: {
    plan: 'pro',
    requestsPerMinute: 200,
    aiRequestsPerHour: 500,
    uploadsPerDay: 2000,
    warningThreshold: 0.9,
  },
  enterprise: {
    plan: 'enterprise',
    requestsPerMinute: 1000,
    aiRequestsPerHour: 2000,
    uploadsPerDay: 10000,
    warningThreshold: 0.95,
  },
};

/**
 * Get rate limit configuration for a subscription plan.
 * Falls back to 'free' tier if plan not recognized.
 */
export function getTierRateLimit(plan: string | undefined): TierRateLimitConfig {
  return TIER_RATE_LIMITS[plan || 'free'] || TIER_RATE_LIMITS.free!;
}

/**
 * Check if a usage count is approaching the warning threshold.
 * Used to add X-RateLimit-Warning header before hard rejection.
 */
export function isApproachingLimit(
  currentCount: number,
  config: TierRateLimitConfig,
  limitType: 'requestsPerMinute' | 'aiRequestsPerHour' | 'uploadsPerDay' = 'requestsPerMinute',
): boolean {
  const limit = config[limitType];
  return currentCount >= Math.floor(limit * config.warningThreshold);
}
