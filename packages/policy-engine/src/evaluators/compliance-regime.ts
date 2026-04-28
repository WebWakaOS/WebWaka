/**
 * Compliance Regime Evaluator — Phase 5 (E29 / T003)
 *
 * Evaluates regulatory compliance regime rules. Enforces country-level,
 * sector-level, and campaign-type-level regulatory requirements that govern
 * whether a regulated activity is permitted to proceed.
 *
 * Covers PRD §10.1 domain 7: `compliance_regime`
 * Mapped to DB category: `compliance_regime`
 *
 * Distinct from `financial_cap` (which checks transaction amounts) —
 * this evaluator checks whether the regulatory regime itself is active and
 * what compliance obligations attach to the operation.
 *
 * Condition JSON shape:
 * {
 *   "regime": "inec",                           // regulatory body/regime slug
 *   "active": true,                             // is this regime currently active
 *   "campaign_types": ["political","election"], // campaign types this regime covers
 *   "requires_disclosure_above_kobo": 100000000, // mandatory disclosure threshold
 *   "requires_regulatory_hold_hours": 72,       // INEC Level 3: mandatory 72h hold
 *   "requires_cac_filing": false,               // CAC/regulatory filing required
 *   "requires_audit_trail": true                // enhanced audit trail required
 * }
 *
 * Platform Invariants:
 *   P9 — all kobo values are integers, never floating-point
 *   T3 — tenant_id scoping enforced by loader before evaluation
 */

import type { PolicyRule, PolicyContext, PolicyEvalResult } from '../types.js';

interface ComplianceRegimeCondition {
  regime?: string | null;
  active?: boolean | null;
  campaign_types?: string[] | null;
  requires_disclosure_above_kobo?: number | null;
  requires_regulatory_hold_hours?: number | null;
  requires_cac_filing?: boolean | null;
  requires_audit_trail?: boolean | null;
}

export function evaluateComplianceRegime(rule: PolicyRule, ctx: PolicyContext): PolicyEvalResult {
  const cond = rule.conditionJson as ComplianceRegimeCondition;
  const campaignType = ctx.campaignType as string | undefined;
  const amountKobo = ctx.amountKobo as number | undefined;

  // If regime is defined but inactive, pass through — no compliance obligations
  if (cond.active === false) {
    return allow(rule.ruleKey, `Compliance regime '${cond.regime ?? 'unknown'}' is not active — no restrictions`);
  }

  // Campaign type scope filter — rule only applies to listed campaign types
  if (cond.campaign_types && cond.campaign_types.length > 0 && campaignType) {
    if (!cond.campaign_types.includes(campaignType)) {
      return allow(
        rule.ruleKey,
        `Campaign type '${campaignType}' not covered by regime '${cond.regime ?? 'unknown'}' — skipped`,
      );
    }
  }

  // Mandatory disclosure threshold (e.g. INEC requires disclosure above ₦1m)
  // If the operation amount exceeds the threshold, require HITL L3 (regulatory window)
  if (
    cond.requires_disclosure_above_kobo != null &&
    amountKobo != null &&
    amountKobo > cond.requires_disclosure_above_kobo
  ) {
    return hitl(
      rule.ruleKey,
      3,
      `Amount ${amountKobo} kobo exceeds regime '${cond.regime ?? 'unknown'}' mandatory disclosure threshold ${cond.requires_disclosure_above_kobo} kobo. ` +
      `Regulatory hold of ${cond.requires_regulatory_hold_hours ?? 72}h required before transfer (PRD §10.4 Level 3).`,
    );
  }

  // CAC filing requirement — if not filed, require HITL L2
  if (cond.requires_cac_filing) {
    const cacFiled = ctx.cacFiled as boolean | undefined;
    if (!cacFiled) {
      return hitl(
        rule.ruleKey,
        2,
        `Compliance regime '${cond.regime ?? 'unknown'}' requires CAC registration filing before proceeding`,
      );
    }
  }

  return allow(rule.ruleKey, `Compliance regime '${cond.regime ?? 'unknown'}' requirements satisfied`);
}

function allow(ruleKey: string, reason: string): PolicyEvalResult {
  return { ruleKey, decision: 'ALLOW', hitlLevel: null, reason, evaluatedAt: ts() };
}

function hitl(ruleKey: string, hitlLevel: 1 | 2 | 3, reason: string): PolicyEvalResult {
  return { ruleKey, decision: 'REQUIRE_HITL', hitlLevel, reason, evaluatedAt: ts() };
}

function ts(): number {
  return Math.floor(Date.now() / 1000);
}
