/**
 * Content moderation for @webwaka/community.
 * Platform Invariant P15 — classifyContent must be called unconditionally
 * before every channel post insert.
 *
 * SEC-003 / P9 fix: confidence stored as INTEGER basis points (0–10000)
 * where 10000 = 100.00% confidence. Consistent with migration 0188
 * (community_moderation_log.confidence → confidence_bps) and with
 * packages/social/src/moderation.ts.
 * Never expose raw float externally; divide by 10000 for display only.
 *
 * BUG-P3-012 (complete fix): resolveThresholds() is now wired into the
 * classifyContent() call chain. Callers may supply per-tenant threshold
 * overrides; resolveThresholds() enforces platform maximums and merges
 * defaults. The spam auto_hide decision is gated by bpsToFraction() so
 * the basis-point confidence is never compared directly against a
 * fractional threshold (the unit-mismatch that caused BUG-P3-012).
 */

import {
  type ModerationThresholds,
  bpsToFraction,
  resolveThresholds,
} from './moderation-config.js';

export type ModerationStatus = 'published' | 'auto_hide' | 'pending_review';

export interface ModerationResult {
  status: ModerationStatus;
  reason?: string;
  /** Integer basis points 0–10000 (10000 = 100.00% confidence). P9 invariant. */
  confidenceBps: number;
}

const SPAM_PATTERNS: RegExp[] = [
  /buy\s+cheap/i,
  /click\s+now/i,
  /follow\s+me/i,
  /earn\s+money\s+fast/i,
  /make\s+money/i,
  /free\s+gift/i,
  /limited\s+offer/i,
  /act\s+now/i,
  /cheap\s+watches/i,
  /100%\s+guaranteed/i,
  /wire\s+transfer/i,
  /nigerian\s+prince/i,
];

/** Basis-point confidence assigned to pattern-matched spam (= 90.00%). */
const SPAM_MATCH_CONFIDENCE_BPS = 9000;

/**
 * Classify content for moderation.
 *
 * When spam patterns are detected the raw confidence is 9000 bps (90%).
 * auto_hide is applied only when that confidence, converted to a fraction,
 * exceeds the resolved spam threshold — ensuring the threshold config is
 * always in the decision path (BUG-P3-012 full fix).
 *
 * @param content          Raw post content.
 * @param tenantThresholds Optional per-tenant threshold overrides.
 *                         Values are enforced against PLATFORM_MAX_THRESHOLDS.
 */
export function classifyContent(
  content: string,
  tenantThresholds?: Partial<ModerationThresholds>,
): ModerationResult {
  const thresholds = resolveThresholds(tenantThresholds);

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(content)) {
      const confidenceBps = SPAM_MATCH_CONFIDENCE_BPS;
      const confidence = bpsToFraction(confidenceBps);
      const status: ModerationStatus =
        confidence >= thresholds.spam ? 'auto_hide' : 'pending_review';
      return { status, reason: 'spam_detected', confidenceBps };
    }
  }

  return { status: 'published', confidenceBps: 0 };
}
