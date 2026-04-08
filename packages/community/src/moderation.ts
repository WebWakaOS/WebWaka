/**
 * AI moderation classifier bridge for @webwaka/community.
 * Platform Invariant P15 — Moderation-First Content.
 * Platform Invariant P7  — Vendor Neutral AI (routed through @webwaka/ai-abstraction).
 *
 * Called unconditionally in createChannelPost before every insert.
 */

import type { ModerationResult } from './types.js';
import { resolveThresholds } from './moderation-config.js';
import type { ModerationThresholds } from './moderation-config.js';

/**
 * Classify content through the AI abstraction layer.
 * In production the @webwaka/ai-abstraction package is called;
 * this module provides the integration point without rebuilding it (per M7c non-deliverables).
 */
export async function classifyContent(
  content: string,
  tenantThresholds?: Partial<ModerationThresholds>,
): Promise<ModerationResult> {
  const thresholds = resolveThresholds(tenantThresholds);

  // Route through @webwaka/ai-abstraction (P7 — vendor neutral)
  // The abstraction layer determines which provider to call.
  // For now we call the scoring stub — real implementation delegates to ai-abstraction.
  const scores = await scoreContent(content);

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
  } else if (scores.profanity >= thresholds.profanity * 0.7 || scores.spam >= thresholds.spam * 0.7) {
    action = 'flag';
    reason = scores.profanity >= scores.spam ? 'profanity_suspected' : 'spam_suspected';
  }

  return { action, reason, scores };
}

/**
 * Submit a moderation action from a moderator.
 */
export interface D1Like {
  prepare(sql: string): { bind(...values: unknown[]): { run(): Promise<{ success: boolean }> } };
}

export async function submitModerationAction(
  db: D1Like,
  input: {
    moderatorId: string;
    contentType: 'channel_post' | 'social_post' | 'dm_message' | 'comment';
    contentId: string;
    action: 'hide' | 'restore' | 'warn' | 'mute' | 'ban_temp' | 'ban_perm' | 'dismiss';
    reason: string;
    flagCategory?: 'spam' | 'profanity' | 'harassment' | 'nsfw' | 'misinformation' | 'illegal';
    durationHours?: number;
    tenantId: string;
  },
): Promise<void> {
  const id = `mod_${Math.random().toString(36).slice(2, 11)}${Date.now().toString(36)}`;
  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare(
      `INSERT INTO moderation_log (id, moderator_id, content_type, content_id, action, reason, flag_category, duration_hours, tenant_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      input.moderatorId,
      input.contentType,
      input.contentId,
      input.action,
      input.reason,
      input.flagCategory ?? null,
      input.durationHours ?? null,
      input.tenantId,
      now,
    )
    .run();
}

/**
 * Report content (user-submitted flag).
 */
export async function reportContent(
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
 * Internal scoring function — delegates to @webwaka/ai-abstraction in production.
 * Returns normalized scores in [0, 1].
 */
async function scoreContent(content: string): Promise<{ profanity: number; nsfw: number; spam: number }> {
  // Heuristic stub — production routes through ai-abstraction (P7)
  const lower = content.toLowerCase();
  const spamIndicators = ['click here', 'free money', 'winner', 'congratulations', 'urgent', 'limited offer'];
  const spamScore = spamIndicators.filter((s) => lower.includes(s)).length * 0.2;

  return {
    profanity: 0.0,
    nsfw: 0.0,
    spam: Math.min(spamScore, 1.0),
  };
}
