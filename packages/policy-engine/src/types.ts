/**
 * @webwaka/policy-engine — Domain types (Phase 0 skeleton)
 *
 * The Policy Engine evaluates named rules against a context object and returns
 * a decision. Phase 0 establishes the schema and type system.
 * Full rule evaluation, INEC cap migration, and NDPR audit trail are Phase 5.
 *
 * DB table: policy_rules (migration 0434)
 *
 * Design principles:
 *   - Rules are tenant-scoped (T3)
 *   - Rules are immutable once published; superseded via version bump
 *   - Decisions are ALLOW / DENY / REQUIRE_HITL
 *   - Phase 0: schema only; evaluation is a pass-through returning ALLOW
 */

export type PolicyRuleCategory =
  | 'contribution_cap'   // INEC ₦50m cap, CBN thresholds
  | 'content_moderation' // platform-level content rules
  | 'pii_access'         // NDPR data subject access rules
  | 'broadcast_gate'     // broadcast channel + audience rules
  | 'gotv_access'        // GOTV data access rules (P13)
  | 'ai_gate'            // AI capability access rules (P7, P12)
  | 'payout_gate'        // fundraising payout approval rules
  | 'compliance';        // compliance declaration rules

export type PolicyRuleScope = 'platform' | 'tenant' | 'workspace';

export type PolicyDecision = 'ALLOW' | 'DENY' | 'REQUIRE_HITL';

export type PolicyRuleStatus = 'draft' | 'published' | 'superseded' | 'archived';

export interface PolicyRule {
  id: string;
  tenantId: string | null;
  workspaceId: string | null;
  ruleKey: string;
  version: number;
  category: PolicyRuleCategory;
  scope: PolicyRuleScope;
  status: PolicyRuleStatus;
  title: string;
  description: string | null;
  conditionJson: Record<string, unknown>;
  decision: PolicyDecision;
  hitlLevel: 1 | 2 | 3 | null;
  effectiveFrom: number;
  effectiveTo: number | null;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface PolicyContext {
  tenantId: string;
  workspaceId?: string;
  userId?: string;
  plan?: string;
  amountKobo?: number;
  channel?: string;
  campaignType?: string;
  groupCategory?: string;
  aiCapability?: string;
  [key: string]: unknown;
}

export interface PolicyEvalResult {
  ruleKey: string;
  decision: PolicyDecision;
  hitlLevel: 1 | 2 | 3 | null;
  reason: string;
  evaluatedAt: number;
}
