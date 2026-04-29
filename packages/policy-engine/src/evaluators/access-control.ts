/**
 * Access Control Evaluator — Phase 5 (E29 / T003)
 *
 * Evaluates access control policy rules for group membership, visibility,
 * broadcast channel gates, and GOTV data access.
 *
 * Covers PRD §10.1 domain 6: `access_control`
 * Mapped to DB categories: `broadcast_gate`, `gotv_access`
 *
 * Condition JSON shape:
 * {
 *   "required_kyc_tier": 1,              // minimum KYC tier to access resource
 *   "required_roles": ["coordinator"],   // roles that may access
 *   "require_workspace_member": true,    // must be a workspace member
 *   "public_access": false,              // whether resource is publicly visible
 *   "allowed_channels": ["web","mobile"],// broadcast channel allowlist
 *   "require_sensitive_sector_rights": false  // sensitiveSectorRights required
 * }
 *
 * Platform Invariants:
 *   P13 — voter_ref (gotv_access rules) must never reach AI or logs
 *   T3  — all access decisions are tenant-scoped
 */

import type { PolicyRule, PolicyContext, PolicyEvalResult } from '../types.js';

interface AccessControlCondition {
  required_kyc_tier?: number | null;
  required_roles?: string[] | null;
  require_workspace_member?: boolean | null;
  public_access?: boolean | null;
  allowed_channels?: string[] | null;
  require_sensitive_sector_rights?: boolean | null;
  strip_fields?: string[] | null;
}

export function evaluateAccessControl(rule: PolicyRule, ctx: PolicyContext): PolicyEvalResult {
  const cond = rule.conditionJson as AccessControlCondition;
  const kycTier = ctx.kycTier as number | undefined;
  const userRoles = ctx.userRoles as string[] | undefined;
  const isWorkspaceMember = ctx.isWorkspaceMember as boolean | undefined;
  const channel = ctx.channel as string | undefined;
  const hasSensitiveSectorRights = ctx.sensitiveSectorRights as boolean | undefined;

  // Sensitive sector rights gate (e.g. GOTV voter_ref access requires sensitiveSectorRights)
  if (cond.require_sensitive_sector_rights && !hasSensitiveSectorRights) {
    return deny(
      rule.ruleKey,
      'Access requires sensitiveSectorRights entitlement (P13: sensitive sector data protection)',
    );
  }

  // KYC tier gate
  if (cond.required_kyc_tier != null) {
    const tier = kycTier ?? 0;
    if (tier < cond.required_kyc_tier) {
      return hitl(
        rule.ruleKey,
        1,
        `KYC tier ${tier} does not meet required tier ${cond.required_kyc_tier} for this access (PRD §10.1 access_control)`,
      );
    }
  }

  // Role gate
  if (cond.required_roles && cond.required_roles.length > 0) {
    const roles = userRoles ?? [];
    const hasRole = cond.required_roles.some((r) => roles.includes(r));
    if (!hasRole) {
      return deny(
        rule.ruleKey,
        `User role(s) [${roles.join(',')}] not in required roles [${cond.required_roles.join(',')}]`,
      );
    }
  }

  // Workspace membership gate
  if (cond.require_workspace_member && !isWorkspaceMember) {
    return deny(
      rule.ruleKey,
      'Access requires workspace membership (PRD §10.7: constituency case visibility rules)',
    );
  }

  // Channel allowlist (broadcast_gate: only certain channels may receive broadcasts)
  if (cond.allowed_channels && cond.allowed_channels.length > 0 && channel) {
    if (!cond.allowed_channels.includes(channel)) {
      return deny(
        rule.ruleKey,
        `Channel '${channel}' is not in the broadcast allowlist [${cond.allowed_channels.join(',')}]`,
      );
    }
  }

  // Public access gate (if public_access=false, non-members cannot read)
  if (cond.public_access === false && isWorkspaceMember === false) {
    return deny(
      rule.ruleKey,
      'Resource is not publicly accessible — workspace membership required',
    );
  }

  return allow(rule.ruleKey, 'Access control check passed');
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
