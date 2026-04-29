/**
 * Financial Cap Evaluator — Phase 1 MVP
 *
 * Evaluates contribution_cap rules for:
 *   - INEC political campaign cap (₦50m per contributor)
 *   - CBN single-transaction and daily limits
 *   - Platform per-transaction limits by KYC tier
 *
 * Condition JSON shape:
 * {
 *   "cap_kobo": 5000000000,           // ₦50m in kobo
 *   "per": "contributor_campaign",    // scope: 'transaction' | 'daily' | 'contributor_campaign'
 *   "campaign_types": ["political"]   // applicable campaign types (optional, null = all)
 * }
 */

import type { PolicyContext, PolicyEvalResult, PolicyDecision } from '../types.js';
import type { PolicyRule } from '../types.js';

export interface FinancialCapCondition {
  cap_kobo: number;
  per: 'transaction' | 'daily' | 'contributor_campaign';
  campaign_types?: string[] | null;
  kyc_tier_min?: number | null;
}

/**
 * Evaluate a financial cap rule.
 *
 * ctx.amountKobo   — amount being transacted (required)
 * ctx.priorTotalKobo — amount already transacted in this period (required for per=contributor_campaign)
 * ctx.campaignType — campaign type for campaign_types filter
 * ctx.kycTier      — KYC tier of the actor
 */
export function evaluateFinancialCap(
  rule: PolicyRule,
  ctx: PolicyContext,
): PolicyEvalResult {
  const cond = rule.conditionJson as unknown as FinancialCapCondition;
  const amountKobo = (ctx.amountKobo ?? 0) as number;
  const priorTotalKobo = (ctx.priorTotalKobo ?? 0) as number;
  const campaignType = ctx.campaignType as string | undefined;
  const kycTier = (ctx.kycTier ?? 0) as number;

  // Campaign type filter: skip rule if campaign type doesn't match
  if (cond.campaign_types && cond.campaign_types.length > 0) {
    if (!campaignType || !cond.campaign_types.includes(campaignType)) {
      return allow(rule.ruleKey, 'Campaign type not in rule scope — rule skipped');
    }
  }

  // KYC tier minimum: skip rule if actor doesn't meet minimum tier
  if (cond.kyc_tier_min != null && kycTier < cond.kyc_tier_min) {
    return deny(rule.ruleKey, `KYC tier ${kycTier} below required tier ${cond.kyc_tier_min}`);
  }

  // Cap check
  if (cond.per === 'transaction') {
    if (amountKobo > cond.cap_kobo) {
      return deny(
        rule.ruleKey,
        `Transaction amount ₦${formatKoboToNaira(amountKobo)} exceeds cap ₦${formatKoboToNaira(cond.cap_kobo)}`,
      );
    }
  } else if (cond.per === 'contributor_campaign') {
    const totalAfter = priorTotalKobo + amountKobo;
    if (totalAfter > cond.cap_kobo) {
      return deny(
        rule.ruleKey,
        `Cumulative contribution ₦${formatKoboToNaira(totalAfter)} would exceed cap ₦${formatKoboToNaira(cond.cap_kobo)}`,
      );
    }
  } else if (cond.per === 'daily') {
    const dailyTotalAfter = priorTotalKobo + amountKobo;
    if (dailyTotalAfter > cond.cap_kobo) {
      return deny(
        rule.ruleKey,
        `Daily total ₦${formatKoboToNaira(dailyTotalAfter)} would exceed daily cap ₦${formatKoboToNaira(cond.cap_kobo)}`,
      );
    }
  }

  return allow(rule.ruleKey, 'Within financial cap');
}

function formatKoboToNaira(kobo: number): string {
  const naira = Math.floor(kobo / 100);
  const koboStr = (kobo % 100).toString().padStart(2, '0');
  return `${naira}.${koboStr}`;
}

function allow(ruleKey: string, reason: string): PolicyEvalResult {
  return { ruleKey, decision: 'ALLOW', hitlLevel: null, reason, evaluatedAt: now() };
}

function deny(ruleKey: string, reason: string): PolicyEvalResult {
  return { ruleKey, decision: 'DENY', hitlLevel: null, reason, evaluatedAt: now() };
}

function now(): number {
  return Math.floor(Date.now() / 1000);
}
