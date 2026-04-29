/**
 * @webwaka/policy-engine — Phase 5 Unit Tests (E29 / T003)
 *
 * Tests the 2 new evaluators and Phase 5 extensions:
 *   - evaluateAccessControl (PRD §10.1 domain 6)
 *   - evaluateComplianceRegime (PRD §10.1 domain 7)
 *   - evaluateAiGovernance Phase 5 extensions:
 *       prohibited_capabilities, max_autonomy_level, require_hitl_above_kobo
 *
 * Naming: P5-E01, P5-E02, ... to distinguish from Phase 1 tests (E01-E24).
 */

import { describe, it, expect } from 'vitest';
import { evaluateAccessControl } from './evaluators/access-control.js';
import { evaluateComplianceRegime } from './evaluators/compliance-regime.js';
import { evaluateAiGovernance } from './evaluators/ai-governance.js';
import type { PolicyRule, PolicyContext } from './types.js';

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeRule(overrides: Partial<PolicyRule> & { conditionJson: Record<string, unknown> }): PolicyRule {
  return {
    id: 'rule-p5',
    tenantId: null,
    workspaceId: null,
    ruleKey: 'test.p5.rule',
    version: 1,
    category: 'access_control',
    scope: 'platform',
    status: 'published',
    title: 'Phase 5 Test rule',
    description: null,
    decision: 'ALLOW',
    hitlLevel: null,
    effectiveFrom: 0,
    effectiveTo: null,
    createdBy: 'system',
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

function makeCtx(overrides: Partial<PolicyContext> = {}): PolicyContext {
  return { tenantId: 'tenant-p5', ...overrides };
}

// ── evaluateAccessControl ────────────────────────────────────────────────────

describe('evaluateAccessControl — PRD §10.1 domain 6', () => {
  it('P5-E01 — ALLOW when no conditions are set (open access)', () => {
    const rule = makeRule({ category: 'access_control', conditionJson: {} });
    const result = evaluateAccessControl(rule, makeCtx());
    expect(result.decision).toBe('ALLOW');
  });

  it('P5-E02 — DENY when require_sensitive_sector_rights=true and context lacks the right', () => {
    const rule = makeRule({
      category: 'access_control',
      conditionJson: { require_sensitive_sector_rights: true },
    });
    const result = evaluateAccessControl(rule, makeCtx({ sensitiveSectorRights: false }));
    expect(result.decision).toBe('DENY');
    expect(result.reason).toContain('sensitiveSectorRights');
  });

  it('P5-E03 — ALLOW when require_sensitive_sector_rights=true and right is present', () => {
    const rule = makeRule({
      category: 'access_control',
      conditionJson: { require_sensitive_sector_rights: true },
    });
    const result = evaluateAccessControl(rule, makeCtx({ sensitiveSectorRights: true }));
    expect(result.decision).toBe('ALLOW');
  });

  it('P5-E04 — REQUIRE_HITL (L1) when KYC tier is below required tier', () => {
    const rule = makeRule({
      category: 'access_control',
      conditionJson: { required_kyc_tier: 2 },
    });
    const result = evaluateAccessControl(rule, makeCtx({ kycTier: 1 }));
    expect(result.decision).toBe('REQUIRE_HITL');
    expect(result.hitlLevel).toBe(1);
    expect(result.reason).toContain('KYC tier');
  });

  it('P5-E05 — ALLOW when KYC tier meets or exceeds required tier', () => {
    const rule = makeRule({
      category: 'access_control',
      conditionJson: { required_kyc_tier: 2 },
    });
    const result = evaluateAccessControl(rule, makeCtx({ kycTier: 3 }));
    expect(result.decision).toBe('ALLOW');
  });

  it('P5-E06 — DENY when user role is not in required_roles', () => {
    const rule = makeRule({
      category: 'access_control',
      conditionJson: { required_roles: ['coordinator', 'admin'] },
    });
    const result = evaluateAccessControl(rule, makeCtx({ userRoles: ['member'] }));
    expect(result.decision).toBe('DENY');
    expect(result.reason).toContain('not in required roles');
  });

  it('P5-E07 — ALLOW when user has one of the required roles', () => {
    const rule = makeRule({
      category: 'access_control',
      conditionJson: { required_roles: ['coordinator', 'admin'] },
    });
    const result = evaluateAccessControl(rule, makeCtx({ userRoles: ['admin'] }));
    expect(result.decision).toBe('ALLOW');
  });

  it('P5-E08 — DENY when require_workspace_member=true and user is not a member', () => {
    const rule = makeRule({
      category: 'access_control',
      conditionJson: { require_workspace_member: true },
    });
    const result = evaluateAccessControl(rule, makeCtx({ isWorkspaceMember: false }));
    expect(result.decision).toBe('DENY');
    expect(result.reason).toContain('workspace membership');
  });

  it('P5-E09 — DENY when channel is not in broadcast allowlist', () => {
    const rule = makeRule({
      category: 'access_control',
      conditionJson: { allowed_channels: ['web', 'mobile', 'whatsapp'] },
    });
    const result = evaluateAccessControl(rule, makeCtx({ channel: 'ussd' }));
    expect(result.decision).toBe('DENY');
    expect(result.reason).toContain('ussd');
  });

  it('P5-E10 — ALLOW when channel is in broadcast allowlist', () => {
    const rule = makeRule({
      category: 'access_control',
      conditionJson: { allowed_channels: ['web', 'mobile', 'whatsapp'] },
    });
    const result = evaluateAccessControl(rule, makeCtx({ channel: 'whatsapp' }));
    expect(result.decision).toBe('ALLOW');
  });

  it('P5-E11 — DENY when public_access=false and isWorkspaceMember=false', () => {
    const rule = makeRule({
      category: 'access_control',
      conditionJson: { public_access: false },
    });
    const result = evaluateAccessControl(rule, makeCtx({ isWorkspaceMember: false }));
    expect(result.decision).toBe('DENY');
  });
});

// ── evaluateComplianceRegime ─────────────────────────────────────────────────

describe('evaluateComplianceRegime — PRD §10.1 domain 7', () => {
  it('P5-E12 — ALLOW when regime is inactive (active=false)', () => {
    const rule = makeRule({
      category: 'compliance_regime',
      conditionJson: { regime: 'inec', active: false },
    });
    const result = evaluateComplianceRegime(rule, makeCtx());
    expect(result.decision).toBe('ALLOW');
    expect(result.reason).toContain('not active');
  });

  it('P5-E13 — ALLOW when campaign type is not covered by regime', () => {
    const rule = makeRule({
      category: 'compliance_regime',
      conditionJson: { regime: 'inec', active: true, campaign_types: ['political', 'election'] },
    });
    const result = evaluateComplianceRegime(rule, makeCtx({ campaignType: 'charity' }));
    expect(result.decision).toBe('ALLOW');
    expect(result.reason).toContain('not covered');
  });

  it('P5-E14 — REQUIRE_HITL (L3) when amount exceeds INEC disclosure threshold', () => {
    const rule = makeRule({
      category: 'compliance_regime',
      conditionJson: {
        regime: 'inec',
        active: true,
        campaign_types: ['political'],
        requires_disclosure_above_kobo: 100_000_000,   // ₦1m
        requires_regulatory_hold_hours: 72,
      },
    });
    const result = evaluateComplianceRegime(rule, makeCtx({
      campaignType: 'political',
      amountKobo: 150_000_000,    // ₦1.5m — above threshold
    }));
    expect(result.decision).toBe('REQUIRE_HITL');
    expect(result.hitlLevel).toBe(3);
    expect(result.reason).toContain('mandatory disclosure threshold');
    expect(result.reason).toContain('72');
  });

  it('P5-E15 — ALLOW when amount is below INEC disclosure threshold', () => {
    const rule = makeRule({
      category: 'compliance_regime',
      conditionJson: {
        regime: 'inec',
        active: true,
        campaign_types: ['political'],
        requires_disclosure_above_kobo: 100_000_000,
      },
    });
    const result = evaluateComplianceRegime(rule, makeCtx({
      campaignType: 'political',
      amountKobo: 50_000_000,     // ₦500k — below threshold
    }));
    expect(result.decision).toBe('ALLOW');
  });

  it('P5-E16 — REQUIRE_HITL (L2) when regime requires CAC filing but cacFiled=false', () => {
    const rule = makeRule({
      category: 'compliance_regime',
      conditionJson: { regime: 'cbn', active: true, requires_cac_filing: true },
    });
    const result = evaluateComplianceRegime(rule, makeCtx({ cacFiled: false }));
    expect(result.decision).toBe('REQUIRE_HITL');
    expect(result.hitlLevel).toBe(2);
    expect(result.reason).toContain('CAC');
  });

  it('P5-E17 — ALLOW when CAC filing required and cacFiled=true', () => {
    const rule = makeRule({
      category: 'compliance_regime',
      conditionJson: { regime: 'cbn', active: true, requires_cac_filing: true },
    });
    const result = evaluateComplianceRegime(rule, makeCtx({ cacFiled: true }));
    expect(result.decision).toBe('ALLOW');
  });
});

// ── evaluateAiGovernance — Phase 5 extensions ───────────────────────────────

describe('evaluateAiGovernance — Phase 5 E29 extensions', () => {
  it('P5-E18 — DENY when capability is in prohibited_capabilities list', () => {
    const rule = makeRule({
      category: 'ai_gate',
      conditionJson: { prohibited_capabilities: ['mobilization_analytics', 'broadcast_scheduler'] },
    });
    const result = evaluateAiGovernance(rule, makeCtx({
      plan: 'growth',
      aiCapability: 'mobilization_analytics',
    }));
    expect(result.decision).toBe('DENY');
    expect(result.reason).toContain('prohibited');
    expect(result.reason).toContain('mobilization_analytics');
  });

  it('P5-E19 — ALLOW when capability is NOT in prohibited_capabilities list', () => {
    const rule = makeRule({
      category: 'ai_gate',
      conditionJson: { prohibited_capabilities: ['broadcast_scheduler'] },
    });
    const result = evaluateAiGovernance(rule, makeCtx({
      plan: 'growth',
      aiCapability: 'member_segmentation',
    }));
    expect(result.decision).toBe('ALLOW');
  });

  it('P5-E20 — DENY write-capable capability when max_autonomy_level=0', () => {
    const rule = makeRule({
      category: 'ai_gate',
      conditionJson: { max_autonomy_level: 0 },
    });
    const result = evaluateAiGovernance(rule, makeCtx({
      plan: 'pro',
      aiCapability: 'broadcast_scheduler',
    }));
    expect(result.decision).toBe('DENY');
    expect(result.reason).toContain('max_autonomy_level=0');
  });

  it('P5-E21 — ALLOW write-capable capability when max_autonomy_level=1', () => {
    const rule = makeRule({
      category: 'ai_gate',
      conditionJson: { max_autonomy_level: 1 },
    });
    const result = evaluateAiGovernance(rule, makeCtx({
      plan: 'pro',
      aiCapability: 'broadcast_scheduler',
    }));
    expect(result.decision).toBe('ALLOW');
  });

  it('P5-E22 — REQUIRE_HITL (L2) when AI-triggered amount exceeds require_hitl_above_kobo', () => {
    const rule = makeRule({
      category: 'ai_gate',
      conditionJson: { require_hitl_above_kobo: 10_000_000 },
    });
    const result = evaluateAiGovernance(rule, makeCtx({
      plan: 'enterprise',
      amountKobo: 15_000_000,   // above threshold
    }));
    expect(result.decision).toBe('REQUIRE_HITL');
    expect(result.hitlLevel).toBe(2);
    expect(result.reason).toContain('HITL threshold');
  });

  it('P5-E23 — ALLOW when AI-triggered amount is below require_hitl_above_kobo', () => {
    const rule = makeRule({
      category: 'ai_gate',
      conditionJson: { require_hitl_above_kobo: 10_000_000 },
    });
    const result = evaluateAiGovernance(rule, makeCtx({
      plan: 'enterprise',
      amountKobo: 5_000_000,    // below threshold
    }));
    expect(result.decision).toBe('ALLOW');
  });

  it('P5-E24 — DENY new capability member_segmentation on free plan (plan gate)', () => {
    const rule = makeRule({
      category: 'ai_gate',
      conditionJson: { min_plan: 'growth', capabilities: ['member_segmentation'] },
    });
    const result = evaluateAiGovernance(rule, makeCtx({
      plan: 'free',
      aiCapability: 'member_segmentation',
    }));
    expect(result.decision).toBe('DENY');
    expect(result.reason).toContain('free');
  });

  it('P5-E25 — ALLOW new capability petition_optimizer on pro plan', () => {
    const rule = makeRule({
      category: 'ai_gate',
      conditionJson: { min_plan: 'growth', capabilities: ['petition_optimizer'] },
    });
    const result = evaluateAiGovernance(rule, makeCtx({
      plan: 'pro',
      aiCapability: 'petition_optimizer',
    }));
    expect(result.decision).toBe('ALLOW');
  });

  it('P5-E26 — DENY case_classifier on USSD channel (P12)', () => {
    const rule = makeRule({
      category: 'ai_gate',
      conditionJson: { block_channels: ['ussd'] },
    });
    const result = evaluateAiGovernance(rule, makeCtx({
      plan: 'enterprise',
      aiCapability: 'case_classifier',
      channel: 'ussd',
    }));
    expect(result.decision).toBe('DENY');
    expect(result.reason).toContain('USSD');
  });
});
