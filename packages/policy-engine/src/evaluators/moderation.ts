/**
 * Content Moderation Evaluator — Phase 1 MVP
 *
 * Evaluates content moderation policy rules.
 *
 * Condition JSON shape:
 * {
 *   "block_domains": ["hate_speech", "adult_content"],  // content categories to block
 *   "require_hitl": true,                               // route to HITL instead of auto-deny
 *   "hitl_level": 1,                                    // 1=soft, 2=standard, 3=escalated
 *   "applies_to": ["broadcast", "petition", "group_name"] // entity types in scope
 * }
 */

import type { PolicyRule, PolicyContext, PolicyEvalResult } from '../types.js';

interface ModerationCondition {
  block_domains?: string[] | null;
  require_hitl?: boolean;
  hitl_level?: 1 | 2 | 3 | null;
  applies_to?: string[] | null;
}

export function evaluateModeration(rule: PolicyRule, ctx: PolicyContext): PolicyEvalResult {
  const cond = rule.conditionJson as ModerationCondition;
  const contentDomain = ctx.contentDomain as string | undefined;
  const entityType = ctx.entityType as string | undefined;

  // Entity type scope filter
  if (cond.applies_to && cond.applies_to.length > 0 && entityType) {
    if (!cond.applies_to.includes(entityType)) {
      return allow(rule.ruleKey, `Entity type '${entityType}' not in moderation rule scope`);
    }
  }

  // Content domain check
  if (cond.block_domains && contentDomain && cond.block_domains.includes(contentDomain)) {
    if (cond.require_hitl) {
      const hitlLevel = (cond.hitl_level ?? 1) as 1 | 2 | 3;
      return hitl(rule.ruleKey, hitlLevel, `Content domain '${contentDomain}' requires HITL review`);
    }
    return deny(rule.ruleKey, `Content domain '${contentDomain}' is blocked by moderation policy`);
  }

  return allow(rule.ruleKey, 'Content passes moderation policy');
}

function allow(ruleKey: string, reason: string): PolicyEvalResult {
  return { ruleKey, decision: 'ALLOW', hitlLevel: null, reason, evaluatedAt: ts() };
}

function deny(ruleKey: string, reason: string): PolicyEvalResult {
  return { ruleKey, decision: 'DENY', hitlLevel: null, reason, evaluatedAt: ts() };
}

function hitl(ruleKey: string, hitlLevel: 1 | 2 | 3, reason: string): PolicyEvalResult {
  return { ruleKey, decision: 'REQUIRE_HITL', hitlLevel, reason, evaluatedAt: ts() };
}

function ts(): number {
  return Math.floor(Date.now() / 1000);
}
