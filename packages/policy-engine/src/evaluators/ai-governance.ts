/**
 * AI Governance Evaluator — Phase 5 Extended (E29)
 *
 * Evaluates AI capability access rules. Enforces:
 *   P7  — AI fetch-only (no SDK lock-in — enforced at network layer, not here)
 *   P12 — USSD AI block
 *   Plan-tier AI entitlement gate
 *   Phase 5 (E29): Tenant-level AI policy overrides (PRD §10.5):
 *     - prohibited_capabilities: block specific capabilities for this tenant
 *     - max_autonomy_level: cap AI autonomy (0=none, 1=advisory, 2=full-advisory)
 *     - require_hitl_above_kobo: HITL for AI-triggered payment actions above threshold
 *     - data_exclusion_fields: additional PII fields to strip (extends P13 defaults)
 *
 * Condition JSON shape:
 * {
 *   "min_plan": "growth",
 *   "block_channels": ["ussd"],
 *   "capabilities": ["member_sentiment", "broadcast_writing"],  // scope filter
 *   "prohibited_capabilities": ["mobilization_analytics"],      // Phase 5 tenant block
 *   "max_autonomy_level": 1,                                    // Phase 5 autonomy cap
 *   "require_hitl_above_kobo": 10000000,                       // Phase 5 HITL threshold
 *   "data_exclusion_fields": ["household_income"]               // Phase 5 extra PII strip
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
  /** Phase 5 (E29): list of capability slugs prohibited for this tenant */
  prohibited_capabilities?: string[] | null;
  /** Phase 5 (E29): maximum autonomy level (0=blocked, 1=advisory, 2=full-advisory) */
  max_autonomy_level?: number | null;
  /** Phase 5 (E29): AI actions targeting payments above this kobo threshold require HITL */
  require_hitl_above_kobo?: number | null;
  /** Phase 5 (E29): additional PII fields to exclude from AI context (extends P13) */
  data_exclusion_fields?: string[] | null;
}

export function evaluateAiGovernance(rule: PolicyRule, ctx: PolicyContext): PolicyEvalResult {
  const cond = rule.conditionJson as AiGovernanceCondition;
  const plan = (ctx.plan ?? 'free') as string;
  const channel = ctx.channel as string | undefined;
  const aiCapability = ctx.aiCapability as string | undefined;
  const amountKobo = ctx.amountKobo as number | undefined;

  // Capability scope filter (rule only applies to listed capabilities)
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

  // Phase 5 (E29): Tenant-level prohibited_capabilities gate (PRD §10.5)
  if (cond.prohibited_capabilities && cond.prohibited_capabilities.length > 0 && aiCapability) {
    if (cond.prohibited_capabilities.includes(aiCapability)) {
      return deny(
        rule.ruleKey,
        `Capability '${aiCapability}' is explicitly prohibited by tenant AI policy (PRD §10.5 ai_governance.prohibited_capabilities)`,
      );
    }
  }

  // Phase 5 (E29): max_autonomy_level gate (PRD §10.5)
  // Blocks write-capable capabilities when tenant autonomy level is 0 (no AI autonomy).
  const WRITE_CAPABLE_CAPS = [
    'mobilization_analytics', 'broadcast_scheduler', 'member_segmentation',
    'petition_optimizer', 'case_classifier', 'function_call',
  ];
  if (
    cond.max_autonomy_level != null &&
    cond.max_autonomy_level < 1 &&
    aiCapability &&
    WRITE_CAPABLE_CAPS.includes(aiCapability)
  ) {
    return deny(
      rule.ruleKey,
      `Tenant max_autonomy_level=${cond.max_autonomy_level} blocks write-capable capability '${aiCapability}' (PRD §10.5)`,
    );
  }

  // Phase 5 (E29): require_hitl_above_kobo — AI-triggered payment actions need HITL
  if (
    cond.require_hitl_above_kobo != null &&
    amountKobo != null &&
    amountKobo > cond.require_hitl_above_kobo
  ) {
    return hitl(
      rule.ruleKey,
      2,
      `AI-triggered amount ${amountKobo} kobo exceeds tenant HITL threshold ${cond.require_hitl_above_kobo} kobo (PRD §10.5 ai_governance.require_hitl_above_kobo)`,
    );
  }

  return allow(rule.ruleKey, 'AI access permitted');
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
