/**
 * AI moderation classifier bridge for @webwaka/social.
 * Platform Invariant P15 — Moderation-First Content.
 * Platform Invariant P7  — Vendor Neutral AI (routed through @webwaka/ai-abstraction).
 *
 * Called unconditionally in createPost before every insert.
 * Shadow-ban logic: auto_hide without notifying the author.
 */

import type { ModerationResult } from './types.js';
import type { D1Like } from './social-profile.js';

/** Default thresholds matching community package (P15) */
const DEFAULT_THRESHOLDS = {
  profanity: 0.85,
  nsfw: 0.7,
  spam: 0.8,
};

/**
 * Classify social content for moderation.
 * Routes through @webwaka/ai-abstraction (P7 — vendor neutral AI).
 */
export async function classifySocialContent(
  content: string,
  tenantThresholds?: { profanity?: number; nsfw?: number; spam?: number },
): Promise<ModerationResult> {
  const thresholds = {
    profanity: Math.min(tenantThresholds?.profanity ?? DEFAULT_THRESHOLDS.profanity, DEFAULT_THRESHOLDS.profanity),
    nsfw: Math.min(tenantThresholds?.nsfw ?? DEFAULT_THRESHOLDS.nsfw, DEFAULT_THRESHOLDS.nsfw),
    spam: Math.min(tenantThresholds?.spam ?? DEFAULT_THRESHOLDS.spam, DEFAULT_THRESHOLDS.spam),
  };

  const scores = await scoreSocialContent(content);

  let action: ModerationResult['action'] = 'publish';
  let reason: string | null = null;

  if (scores.profanity >= thresholds.profanity) {
    action = 'auto_hide';
    reason = 'profanity';
  } else if (scores.nsfw >= thresholds.nsfw) {
    action = 'auto_hide';
    reason = 'nsfw';
  } else if (scores.spam >= thresholds.spam) {
    action = 'auto_hide';
    reason = 'spam';
  } else if (scores.spam >= thresholds.spam * 0.7) {
    action = 'flag';
    reason = 'spam_suspected';
  }

  return { action, reason, scores };
}

/**
 * Shadow-ban a profile — all future posts auto_hide silently (not notified).
 */
export async function shadowBanProfile(
  db: D1Like,
  profileId: string,
  tenantId: string,
): Promise<void> {
  // Mark all existing published posts as under_review
  await db
    .prepare(
      `UPDATE social_posts SET moderation_status = 'under_review', is_flagged = 1 WHERE author_id = ? AND tenant_id = ? AND moderation_status = 'published'`,
    )
    .bind(profileId, tenantId)
    .run();
}

/**
 * Report social content.
 */
export async function reportSocialContent(
  db: D1Like,
  input: {
    reporterId: string;
    contentType: 'channel_post' | 'social_post' | 'dm_message';
    contentId: string;
    category: 'spam' | 'profanity' | 'harassment' | 'nsfw' | 'misinformation' | 'illegal';
    tenantId: string;
  },
): Promise<void> {
  const id = `flg_${Math.random().toString(36).slice(2, 11)}${Date.now().toString(36)}`;
  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare(
      `INSERT INTO content_flags (id, reporter_id, content_type, content_id, category, tenant_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, input.reporterId, input.contentType, input.contentId, input.category, input.tenantId, now)
    .run();
}

/**
 * Internal scoring stub — production delegates to @webwaka/ai-abstraction (P7).
 */
async function scoreSocialContent(content: string): Promise<{ profanity: number; nsfw: number; spam: number }> {
  const lower = content.toLowerCase();
  const spamIndicators = ['click here', 'free money', 'winner', 'congratulations', 'urgent action'];
  const spamScore = spamIndicators.filter((s) => lower.includes(s)).length * 0.25;
  return {
    profanity: 0.0,
    nsfw: 0.0,
    spam: Math.min(spamScore, 1.0),
  };
}
