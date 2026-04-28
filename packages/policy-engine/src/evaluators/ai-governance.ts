/**
 * AI Governance Evaluator — Phase 1 MVP
 *
 * Evaluates AI capability access rules. Enforces:
 *   P7  — AI fetch-only (no SDK lock-in — enforced at network layer, not here)
 *   P12 — USSD AI block
 *   Plan-tier AI entitlement gate
 *
 * Condition JSON shape:
 * {
 *   "min_plan": "growth",
 *   "block_channels": ["ussd"],
 *   "capabilities": ["member_sentiment", "broadcast_writing"]  // optional scope
 * }
 *
 * Plan order: free < starter < growth < pro < enterprise < partner < sub_partner
 */

import type { PolicyRule, PolicyContext, PolicyEvalResult } from '../types.js';

const PLAN_ORDER: Record<string, number> = {
  free: 0,
  starter: 1,
  growth: 2,
  pro: 3,
  enterprise: 4,
  partner: 5,
  sub_partner: 3, // sub_partner is between pro and enterprise for AI
};

interface AiGovernanceCondition {
  min_plan?: string | null;
  block_channels?: string[] | null;
  capabilities?: string[] | null;
}

export function evaluateAiGovernance(rule: PolicyRule, ctx: PolicyContext): PolicyEvalResult {
  const cond = rule.conditionJson as AiGovernanceCondition;
  const plan = (ctx.plan ?? 'free') as string;
  const channel = ctx.channel as string | undefined;
  const aiCapability = ctx.aiCapability as string | undefined;

  // Capability scope filter
  if (cond.capabilities && cond.capabilities.length > 0 && aiCapability) {
    if (!cond.capabilities.includes(aiCapability)) {
      return allow(rule.ruleKey, `AI capability '${aiCapability}' not in rule scope — skipped`);
    }
  }

  // P12: Block AI on USSD channel
  if (cond.block_channels && channel && cond.block_channels.includes(channel)) {
    return deny(rule.ruleKey, `AI not available on channel '${channel}' (P12: USSD AI block)`);
  }

  // Plan tier gate
  if (cond.min_plan) {
    const planLevel = PLAN_ORDER[plan] ?? 0;
    const minLevel = PLAN_ORDER[cond.min_plan] ?? 0;
    if (planLevel < minLevel) {
      return deny(
        rule.ruleKey,
        `Plan '${plan}' does not meet minimum plan '${cond.min_plan}' for AI access`,
      );
    }
  }

  return allow(rule.ruleKey, 'AI access permitted');
}

function allow(ruleKey: string, reason: string): PolicyEvalResult {
  return { ruleKey, decision: 'ALLOW', hitlLevel: null, reason, evaluatedAt: ts() };
}

function deny(ruleKey: string, reason: string): PolicyEvalResult {
  return { ruleKey, decision: 'DENY', hitlLevel: null, reason, evaluatedAt: ts() };
}

function ts(): number {
  return Math.floor(Date.now() / 1000);
}
