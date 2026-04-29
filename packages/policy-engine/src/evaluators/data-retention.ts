/**
 * Data Retention Evaluator — Phase 1 MVP (NDPR compliance)
 *
 * Evaluates whether a data access or retention operation complies with
 * NDPR retention limits. Enforces Nigeria Data Protection Regulation
 * retention periods and right-to-erasure gates.
 *
 * Condition JSON shape:
 * {
 *   "max_retention_days": 365,          // NDPR maximum retention in days
 *   "data_categories": ["pii", "voter_ref", "donor_phone"],
 *   "allow_erasure_request": true       // allows DSAR erasure for this category
 * }
 *
 * P10: All data retention decisions require prior NDPR consent.
 * P13: voter_ref has its own specialized retention rule (gotv_access category).
 */

import type { PolicyRule, PolicyContext, PolicyEvalResult } from '../types.js';

interface DataRetentionCondition {
  max_retention_days: number;
  data_categories?: string[] | null;
  allow_erasure_request?: boolean;
}

const SECONDS_PER_DAY = 86400;

export function evaluateDataRetention(rule: PolicyRule, ctx: PolicyContext): PolicyEvalResult {
  const cond = rule.conditionJson as unknown as DataRetentionCondition;
  const dataCategory = ctx.dataCategory as string | undefined;
  const recordAgeSeconds = ctx.recordAgeSeconds as number | undefined;
  const isErasureRequest = ctx.isErasureRequest as boolean | undefined;

  // Data category scope filter
  if (cond.data_categories && cond.data_categories.length > 0 && dataCategory) {
    if (!cond.data_categories.includes(dataCategory)) {
      return allow(rule.ruleKey, `Data category '${dataCategory}' not in retention rule scope`);
    }
  }

  // DSAR erasure request
  if (isErasureRequest) {
    if (cond.allow_erasure_request) {
      return hitl(rule.ruleKey, 1, 'DSAR erasure request routes to HITL for manual erasure');
    }
    return deny(rule.ruleKey, 'Erasure requests are not permitted for this data category');
  }

  // Retention period check
  if (recordAgeSeconds != null) {
    const retentionLimitSeconds = cond.max_retention_days * SECONDS_PER_DAY;
    if (recordAgeSeconds > retentionLimitSeconds) {
      return deny(
        rule.ruleKey,
        `Record age ${Math.floor(recordAgeSeconds / SECONDS_PER_DAY)} days exceeds NDPR retention limit of ${cond.max_retention_days} days`,
      );
    }
  }

  return allow(rule.ruleKey, 'Data retention within NDPR limits');
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
