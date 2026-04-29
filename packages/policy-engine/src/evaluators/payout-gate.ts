/**
 * Payout Gate Evaluator — Phase 1 MVP
 *
 * Evaluates fundraising payout approval rules:
 *   - Political campaigns require HITL (CBN compliance, INEC oversight)
 *   - Payouts above a threshold may require 2-level HITL
 *   - Compliance regime must be satisfied before payout
 *
 * Condition JSON shape:
 * {
 *   "require_hitl_for_types": ["political", "election"],
 *   "hitl_level": 2,
 *   "auto_approve_below_kobo": 500000,   // ₦5,000 auto-approved
 *   "require_compliance_declaration": true
 * }
 */

import type { PolicyRule, PolicyContext, PolicyEvalResult } from '../types.js';

interface PayoutGateCondition {
  require_hitl_for_types?: string[] | null;
  hitl_level?: 1 | 2 | 3;
  auto_approve_below_kobo?: number | null;
  require_compliance_declaration?: boolean;
}

export function evaluatePayoutGate(rule: PolicyRule, ctx: PolicyContext): PolicyEvalResult {
  const cond = rule.conditionJson as PayoutGateCondition;
  const campaignType = ctx.campaignType as string | undefined;
  const amountKobo = (ctx.amountKobo ?? 0) as number;
  const complianceDeclared = ctx.complianceDeclared as boolean | undefined;

  // Compliance declaration required check
  if (cond.require_compliance_declaration && !complianceDeclared) {
    return deny(rule.ruleKey, 'Compliance declaration required before payout can be approved');
  }

  // Auto-approve small payouts
  if (cond.auto_approve_below_kobo != null && amountKobo < cond.auto_approve_below_kobo) {
    return allow(rule.ruleKey, `Payout ₦${formatKobo(amountKobo)} is below auto-approve threshold`);
  }

  // HITL required for specific campaign types
  if (cond.require_hitl_for_types && campaignType && cond.require_hitl_for_types.includes(campaignType)) {
    const hitlLevel = (cond.hitl_level ?? 2) as 1 | 2 | 3;
    return hitl(
      rule.ruleKey,
      hitlLevel,
      `Payout for '${campaignType}' campaign type requires HITL level ${hitlLevel} approval`,
    );
  }

  return allow(rule.ruleKey, 'Payout cleared for processing');
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

function formatKobo(kobo: number): string {
  const naira = Math.floor(kobo / 100);
  const k = (kobo % 100).toString().padStart(2, '0');
  return `${naira}.${k}`;
}

function ts(): number {
  return Math.floor(Date.now() / 1000);
}
