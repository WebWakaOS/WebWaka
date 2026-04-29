/**
 * KYC Requirement Evaluator — Phase 1 MVP
 *
 * Evaluates whether a user's KYC tier meets the minimum required for an operation.
 *
 * Condition JSON shape:
 * {
 *   "min_kyc_tier": 2,
 *   "operations": ["contribution", "payout", "gotv"]  // optional scope filter
 * }
 *
 * WebWaka KYC tiers:
 *   0 = Unverified (phone only)
 *   1 = Basic (NIN or BVN verified)
 *   2 = Full (NIN + BVN or CAC verified)
 *   3 = Enhanced (FRSC + BVN for agent-level access)
 */

import type { PolicyRule, PolicyContext, PolicyEvalResult } from '../types.js';

interface KycCondition {
  min_kyc_tier: number;
  operations?: string[] | null;
}

export function evaluateKycRequirement(rule: PolicyRule, ctx: PolicyContext): PolicyEvalResult {
  const cond = rule.conditionJson as unknown as KycCondition;
  const kycTier = (ctx.kycTier ?? 0) as number;
  const operation = ctx.operation as string | undefined;

  // Operation scope filter: skip if operation not in rule scope
  if (cond.operations && cond.operations.length > 0 && operation) {
    if (!cond.operations.includes(operation)) {
      return allow(rule.ruleKey, `Operation '${operation}' not in KYC rule scope — skipped`);
    }
  }

  if (kycTier < cond.min_kyc_tier) {
    return deny(
      rule.ruleKey,
      `KYC tier ${kycTier} is below the required tier ${cond.min_kyc_tier} for this operation`,
    );
  }

  return allow(rule.ruleKey, `KYC tier ${kycTier} meets minimum requirement ${cond.min_kyc_tier}`);
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
