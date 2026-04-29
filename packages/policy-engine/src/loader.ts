/**
 * @webwaka/policy-engine — Rule loader with KV cache (Phase 1 MVP)
 *
 * Loads PolicyRule rows from D1 and caches them in Cloudflare KV
 * with a 5-minute TTL. Cache miss falls back to D1.
 *
 * T3 invariant: all queries include tenant_id filter.
 * Platform rules (tenant_id IS NULL) are shared across all tenants.
 */

import type { PolicyRule, PolicyRuleCategory } from './types.js';

const KV_TTL_SECONDS = 300; // 5 minutes

interface D1Like {
  prepare(sql: string): {
    bind(...args: unknown[]): {
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

type PolicyRuleRow = {
  id: string;
  tenant_id: string | null;
  workspace_id: string | null;
  rule_key: string;
  version: number;
  category: string;
  scope: string;
  status: string;
  title: string;
  description: string | null;
  condition_json: string;
  decision: string;
  hitl_level: number | null;
  effective_from: number;
  effective_to: number | null;
  created_by: string;
  created_at: number;
  updated_at: number;
};

function rowToRule(row: PolicyRuleRow): PolicyRule {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    ruleKey: row.rule_key,
    version: row.version,
    category: row.category as PolicyRule['category'],
    scope: row.scope as PolicyRule['scope'],
    status: row.status as PolicyRule['status'],
    title: row.title,
    description: row.description,
    conditionJson: JSON.parse(row.condition_json) as Record<string, unknown>,
    decision: row.decision as PolicyRule['decision'],
    hitlLevel: row.hitl_level as PolicyRule['hitlLevel'],
    effectiveFrom: row.effective_from,
    effectiveTo: row.effective_to,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Load all active rules for a category and tenant.
 * Returns platform rules (tenant_id IS NULL) + tenant-specific rules.
 *
 * Cache key: `policy:rules:{category}:{tenantId}`
 */
export async function loadRules(
  db: D1Like,
  kv: KVNamespace | null,
  category: PolicyRuleCategory,
  tenantId: string,
): Promise<PolicyRule[]> {
  const cacheKey = `policy:rules:${category}:${tenantId}`;
  const now = Math.floor(Date.now() / 1000);

  // KV cache hit
  if (kv) {
    const cached = await kv.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached) as PolicyRule[];
      } catch {
        // cache corrupt — fall through to D1
      }
    }
  }

  // D1 query
  const { results } = await db
    .prepare(`
      SELECT * FROM policy_rules
      WHERE category = ?
        AND status = 'published'
        AND effective_from <= ?
        AND (effective_to IS NULL OR effective_to > ?)
        AND (tenant_id IS NULL OR tenant_id = ?)
      ORDER BY scope DESC, version DESC
    `)
    .bind(category, now, now, tenantId)
    .all<PolicyRuleRow>();

  const rules = results.map(rowToRule);

  // Write to KV cache
  if (kv) {
    await kv.put(cacheKey, JSON.stringify(rules), { expirationTtl: KV_TTL_SECONDS });
  }

  return rules;
}

/**
 * Load a single rule by ruleKey and tenantId.
 * Tenant-specific rule takes precedence over platform rule.
 */
export async function loadRule(
  db: D1Like,
  kv: KVNamespace | null,
  ruleKey: string,
  tenantId: string,
): Promise<PolicyRule | null> {
  const cacheKey = `policy:rule:${ruleKey}:${tenantId}`;

  if (kv) {
    const cached = await kv.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached) as PolicyRule;
      } catch { /* fall through */ }
    }
  }

  // Prefer tenant-specific rule, fall back to platform rule
  const now = Math.floor(Date.now() / 1000);
  const row = await db
    .prepare(`
      SELECT * FROM policy_rules
      WHERE rule_key = ?
        AND status = 'published'
        AND effective_from <= ?
        AND (effective_to IS NULL OR effective_to > ?)
        AND (tenant_id IS NULL OR tenant_id = ?)
      ORDER BY
        CASE WHEN tenant_id = ? THEN 0 ELSE 1 END,
        version DESC
      LIMIT 1
    `)
    .bind(ruleKey, now, now, tenantId, tenantId)
    .all<PolicyRuleRow>();

  const rule = row.results[0] ? rowToRule(row.results[0]) : null;

  if (kv && rule) {
    await kv.put(cacheKey, JSON.stringify(rule), { expirationTtl: KV_TTL_SECONDS });
  }

  return rule;
}
