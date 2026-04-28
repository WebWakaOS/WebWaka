/**
 * @webwaka/policy-engine — Rule evaluation engine (Phase 1 MVP)
 *
 * Phase 1: Real rule evaluation dispatching to domain evaluators.
 * Falls back to ALLOW if no rules are found for a rule key (open-by-default).
 *
 * Platform Invariants enforced by this engine:
 *   P9  — INEC ₦50m cap via contribution_cap rules
 *   P13 — GOTV access via gotv_access rules
 *   P7  — AI fetch-only via ai_gate rules
 *   P12 — USSD AI exclusion via ai_gate rules
 */

import type { PolicyContext, PolicyEvalResult, PolicyRule, PolicyRuleCategory } from './types.js';
import { loadRules, loadRule } from './loader.js';
import { writeAuditLog } from './audit.js';
import { evaluateFinancialCap } from './evaluators/financial-cap.js';
import { evaluateKycRequirement } from './evaluators/kyc.js';
import { evaluateAiGovernance } from './evaluators/ai-governance.js';
import { evaluateModeration } from './evaluators/moderation.js';
import { evaluateDataRetention } from './evaluators/data-retention.js';
import { evaluatePayoutGate } from './evaluators/payout-gate.js';

interface D1Like {
  prepare(sql: string): {
    bind(...args: unknown[]): {
      all<T>(): Promise<{ results: T[] }>;
      run(): Promise<{ success: boolean }>;
    };
  };
}

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export interface EngineOptions {
  db: D1Like;
  kv?: KVNamespace | null;
  auditEnabled?: boolean;
}

/**
 * Dispatch a single rule to its domain evaluator.
 */
function dispatchEvaluator(rule: PolicyRule, ctx: PolicyContext): PolicyEvalResult {
  switch (rule.category) {
    case 'contribution_cap':
      return evaluateFinancialCap(rule, ctx);
    case 'pii_access':
      return evaluateKycRequirement(rule, ctx);
    case 'ai_gate':
      return evaluateAiGovernance(rule, ctx);
    case 'content_moderation':
      return evaluateModeration(rule, ctx);
    case 'compliance':
      return evaluateDataRetention(rule, ctx);
    case 'payout_gate':
      return evaluatePayoutGate(rule, ctx);
    case 'broadcast_gate':
    case 'gotv_access':
      return evaluateKycRequirement(rule, ctx);
    default:
      return {
        ruleKey: rule.ruleKey,
        decision: 'ALLOW',
        hitlLevel: null,
        reason: `No evaluator for category '${rule.category}' — ALLOW`,
        evaluatedAt: Math.floor(Date.now() / 1000),
      };
  }
}

/**
 * Evaluate a named policy rule against a context.
 *
 * Loads the active rule from D1 (KV-cached). Dispatches to the appropriate
 * domain evaluator. Writes an audit log entry.
 *
 * If no rule is found for the given ruleKey, returns ALLOW (open-by-default).
 */
export async function evaluate(
  ruleKey: string,
  ctx: PolicyContext,
  opts?: EngineOptions,
): Promise<PolicyEvalResult> {
  if (!opts) {
    return {
      ruleKey,
      decision: 'ALLOW',
      hitlLevel: null,
      reason: 'No engine options provided — pass-through ALLOW',
      evaluatedAt: Math.floor(Date.now() / 1000),
    };
  }

  const rule = await loadRule(opts.db as Parameters<typeof loadRule>[0], opts.kv ?? null, ruleKey, ctx.tenantId);

  let result: PolicyEvalResult;
  if (!rule) {
    result = {
      ruleKey,
      decision: 'ALLOW',
      hitlLevel: null,
      reason: `No active rule found for '${ruleKey}' — open-by-default ALLOW`,
      evaluatedAt: Math.floor(Date.now() / 1000),
    };
  } else {
    result = dispatchEvaluator(rule, ctx);
  }

  if (opts.auditEnabled !== false) {
    void writeAuditLog(opts.db as Parameters<typeof writeAuditLog>[0], ctx, result);
  }

  return result;
}

/**
 * Assert that a policy rule returns ALLOW.
 * Throws a POLICY_DENIED error if the decision is DENY.
 * Returns hitlLevel (null or 1-3) if REQUIRE_HITL.
 */
export async function assertAllow(
  ruleKey: string,
  ctx: PolicyContext,
  opts?: EngineOptions,
): Promise<{ hitlLevel: 1 | 2 | 3 | null }> {
  const result = await evaluate(ruleKey, ctx, opts);
  if (result.decision === 'DENY') {
    const err = new Error(`POLICY_DENIED: Rule '${ruleKey}' returned DENY. Reason: ${result.reason}`);
    (err as Error & { code: string }).code = 'POLICY_DENIED';
    throw err;
  }
  return { hitlLevel: result.hitlLevel };
}

/**
 * Evaluate all published rules in a category in one batch.
 * Loads via KV-cached D1 query. Throws on first DENY unless failFast=false.
 */
export async function evaluateCategory(
  category: PolicyRuleCategory,
  ctx: PolicyContext,
  opts: EngineOptions,
  options: { failFast?: boolean } = {},
): Promise<PolicyEvalResult[]> {
  const rules = await loadRules(opts.db as Parameters<typeof loadRules>[0], opts.kv ?? null, category, ctx.tenantId);

  const results: PolicyEvalResult[] = [];
  for (const rule of rules) {
    const result = dispatchEvaluator(rule, ctx);
    results.push(result);

    if (opts.auditEnabled !== false) {
      void writeAuditLog(opts.db as Parameters<typeof writeAuditLog>[0], ctx, result);
    }

    if (options.failFast !== false && result.decision === 'DENY') {
      const err = new Error(`POLICY_DENIED: Rule '${rule.ruleKey}' returned DENY. Reason: ${result.reason}`);
      (err as Error & { code: string }).code = 'POLICY_DENIED';
      throw err;
    }
  }

  if (results.length === 0) {
    results.push({
      ruleKey: `${category}:*`,
      decision: 'ALLOW',
      hitlLevel: null,
      reason: `No active rules in category '${category}' — open-by-default ALLOW`,
      evaluatedAt: Math.floor(Date.now() / 1000),
    });
  }

  return results;
}

/**
 * Check multiple named rules at once. Returns all results.
 * Fails fast on first DENY unless failFast=false.
 */
export async function evaluateAll(
  ruleKeys: string[],
  ctx: PolicyContext,
  opts?: EngineOptions,
  options: { failFast?: boolean } = {},
): Promise<PolicyEvalResult[]> {
  const results: PolicyEvalResult[] = [];
  for (const key of ruleKeys) {
    const result = await evaluate(key, ctx, opts);
    results.push(result);
    if (options.failFast !== false && result.decision === 'DENY') {
      const err = new Error(`POLICY_DENIED: Rule '${key}' returned DENY. Reason: ${result.reason}`);
      (err as Error & { code: string }).code = 'POLICY_DENIED';
      throw err;
    }
  }
  return results;
}
