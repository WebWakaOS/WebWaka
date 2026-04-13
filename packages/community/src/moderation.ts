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
 */

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

/**
 * Classify content for moderation.
 * Returns 'auto_hide' if spam patterns are detected, 'published' otherwise.
 */
export function classifyContent(content: string): ModerationResult {
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(content)) {
      return { status: 'auto_hide', reason: 'spam_detected', confidenceBps: 9000 };
    }
  }
  return { status: 'published', confidenceBps: 0 };
}
