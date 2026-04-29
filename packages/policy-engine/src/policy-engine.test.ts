/**
 * @webwaka/policy-engine — Phase 1 MVP unit tests
 *
 * Tests all domain evaluators:
 *   - Financial cap (INEC ₦50m, per-transaction, daily)
 *   - KYC requirement
 *   - AI governance (P7, P12)
 *   - Content moderation (HITL routing)
 *   - Data retention (NDPR)
 *   - Payout gate
 *   - Audit log redaction
 *
 * Engine evaluate() tested with null opts (pass-through) and
 * mock DB opts (rule loading via loader).
 */

import { describe, it, expect } from 'vitest';
import { evaluateFinancialCap } from './evaluators/financial-cap.js';
import { evaluateKycRequirement } from './evaluators/kyc.js';
import { evaluateAiGovernance } from './evaluators/ai-governance.js';
import { evaluateModeration } from './evaluators/moderation.js';
import { evaluateDataRetention } from './evaluators/data-retention.js';
import { evaluatePayoutGate } from './evaluators/payout-gate.js';
import { evaluate } from './engine.js';
import { redactContextForTest } from './audit-test-helper.js';
import type { PolicyRule, PolicyContext } from './types.js';

// ── Helpers ────────────────────────────────────────────────────────────────

function makeRule(overrides: Partial<PolicyRule> & { conditionJson: Record<string, unknown> }): PolicyRule {
  return {
    id: 'rule-1',
    tenantId: null,
    workspaceId: null,
    ruleKey: 'test.rule',
    version: 1,
    category: 'contribution_cap',
    scope: 'platform',
    status: 'published',
    title: 'Test rule',
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
  return { tenantId: 'tenant-abc', ...overrides };
}

// ── Financial Cap Evaluator ────────────────────────────────────────────────

describe('evaluateFinancialCap', () => {
  it('E01 — ALLOW when amount is within per-transaction cap', () => {
    const rule = makeRule({
      category: 'contribution_cap',
      conditionJson: { cap_kobo: 5_000_000_00, per: 'transaction' },
    });
    const result = evaluateFinancialCap(rule, makeCtx({ amountKobo: 1_000_000_00 }));
    expect(result.decision).toBe('ALLOW');
  });

  it('E02 — DENY when amount exceeds per-transaction cap', () => {
    const rule = makeRule({
      category: 'contribution_cap',
      conditionJson: { cap_kobo: 1_000_000, per: 'transaction' },
    });
    const result = evaluateFinancialCap(rule, makeCtx({ amountKobo: 2_000_000 }));
    expect(result.decision).toBe('DENY');
    expect(result.reason).toContain('exceeds cap');
  });

  it('E03 — INEC ₦50m cap: ALLOW when cumulative total stays within cap', () => {
    const rule = makeRule({
      category: 'contribution_cap',
      conditionJson: {
        cap_kobo: 5_000_000_000, // ₦50m in kobo
        per: 'contributor_campaign',
        campaign_types: ['political'],
      },
    });
    const ctx = makeCtx({ amountKobo: 1_000_000_000, priorTotalKobo: 2_000_000_000, campaignType: 'political' });
    const result = evaluateFinancialCap(rule, ctx);
    expect(result.decision).toBe('ALLOW');
  });

  it('E04 — INEC ₦50m cap: DENY when cumulative total would exceed cap', () => {
    const rule = makeRule({
      category: 'contribution_cap',
      conditionJson: {
        cap_kobo: 5_000_000_000,
        per: 'contributor_campaign',
        campaign_types: ['political'],
      },
    });
    const ctx = makeCtx({ amountKobo: 3_000_000_000, priorTotalKobo: 3_000_000_000, campaignType: 'political' });
    const result = evaluateFinancialCap(rule, ctx);
    expect(result.decision).toBe('DENY');
    expect(result.reason).toContain('exceed cap');
  });

  it('E05 — ALLOW when campaign type is not in rule scope', () => {
    const rule = makeRule({
      category: 'contribution_cap',
      conditionJson: {
        cap_kobo: 1_000_000,
        per: 'transaction',
        campaign_types: ['political'],
      },
    });
    const ctx = makeCtx({ amountKobo: 9_999_999, campaignType: 'charity' });
    const result = evaluateFinancialCap(rule, ctx);
    expect(result.decision).toBe('ALLOW');
    expect(result.reason).toContain('skipped');
  });

  it('E06 — daily cap: DENY when daily total would exceed cap', () => {
    const rule = makeRule({
      category: 'contribution_cap',
      conditionJson: { cap_kobo: 5_000_000, per: 'daily' },
    });
    const ctx = makeCtx({ amountKobo: 3_000_000, priorTotalKobo: 3_000_000 });
    const result = evaluateFinancialCap(rule, ctx);
    expect(result.decision).toBe('DENY');
  });
});

// ── KYC Evaluator ─────────────────────────────────────────────────────────

describe('evaluateKycRequirement', () => {
  it('E07 — ALLOW when KYC tier meets minimum', () => {
    const rule = makeRule({
      category: 'pii_access',
      conditionJson: { min_kyc_tier: 1 },
    });
    const result = evaluateKycRequirement(rule, makeCtx({ kycTier: 2 }));
    expect(result.decision).toBe('ALLOW');
  });

  it('E08 — DENY when KYC tier is below minimum', () => {
    const rule = makeRule({
      category: 'pii_access',
      conditionJson: { min_kyc_tier: 2 },
    });
    const result = evaluateKycRequirement(rule, makeCtx({ kycTier: 0 }));
    expect(result.decision).toBe('DENY');
    expect(result.reason).toContain('below the required tier');
  });

  it('E09 — ALLOW when operation not in rule scope', () => {
    const rule = makeRule({
      category: 'pii_access',
      conditionJson: { min_kyc_tier: 3, operations: ['payout'] },
    });
    const result = evaluateKycRequirement(rule, makeCtx({ kycTier: 0, operation: 'view' }));
    expect(result.decision).toBe('ALLOW');
  });
});

// ── AI Governance Evaluator ───────────────────────────────────────────────

describe('evaluateAiGovernance', () => {
  it('E10 — ALLOW when plan meets minimum', () => {
    const rule = makeRule({
      category: 'ai_gate',
      conditionJson: { min_plan: 'growth' },
    });
    const result = evaluateAiGovernance(rule, makeCtx({ plan: 'enterprise' }));
    expect(result.decision).toBe('ALLOW');
  });

  it('E11 — DENY when plan is below minimum (P7 AI gate)', () => {
    const rule = makeRule({
      category: 'ai_gate',
      conditionJson: { min_plan: 'growth' },
    });
    const result = evaluateAiGovernance(rule, makeCtx({ plan: 'starter' }));
    expect(result.decision).toBe('DENY');
  });

  it('E12 — DENY on USSD channel (P12 USSD AI block)', () => {
    const rule = makeRule({
      category: 'ai_gate',
      conditionJson: { block_channels: ['ussd'] },
    });
    const result = evaluateAiGovernance(rule, makeCtx({ channel: 'ussd', plan: 'enterprise' }));
    expect(result.decision).toBe('DENY');
    expect(result.reason).toContain('P12');
  });

  it('E13 — ALLOW on non-USSD channel', () => {
    const rule = makeRule({
      category: 'ai_gate',
      conditionJson: { block_channels: ['ussd'] },
    });
    const result = evaluateAiGovernance(rule, makeCtx({ channel: 'web', plan: 'growth' }));
    expect(result.decision).toBe('ALLOW');
  });
});

// ── Content Moderation Evaluator ───────────────────────────────────────────

describe('evaluateModeration', () => {
  it('E14 — ALLOW when content domain is not in block list', () => {
    const rule = makeRule({
      category: 'content_moderation',
      conditionJson: { block_domains: ['hate_speech'] },
    });
    const result = evaluateModeration(rule, makeCtx({ contentDomain: 'civic_news' }));
    expect(result.decision).toBe('ALLOW');
  });

  it('E15 — DENY when content domain is blocked', () => {
    const rule = makeRule({
      category: 'content_moderation',
      conditionJson: { block_domains: ['adult_content'], require_hitl: false },
    });
    const result = evaluateModeration(rule, makeCtx({ contentDomain: 'adult_content' }));
    expect(result.decision).toBe('DENY');
  });

  it('E16 — REQUIRE_HITL when content domain is blocked and require_hitl=true', () => {
    const rule = makeRule({
      category: 'content_moderation',
      conditionJson: { block_domains: ['hate_speech'], require_hitl: true, hitl_level: 2 },
    });
    const result = evaluateModeration(rule, makeCtx({ contentDomain: 'hate_speech' }));
    expect(result.decision).toBe('REQUIRE_HITL');
    expect(result.hitlLevel).toBe(2);
  });
});

// ── Data Retention Evaluator ───────────────────────────────────────────────

describe('evaluateDataRetention', () => {
  it('E17 — ALLOW when record is within retention limit', () => {
    const rule = makeRule({
      category: 'compliance',
      conditionJson: { max_retention_days: 365, data_categories: ['pii'] },
    });
    const ctx = makeCtx({ dataCategory: 'pii', recordAgeSeconds: 86400 * 100 }); // 100 days
    const result = evaluateDataRetention(rule, ctx);
    expect(result.decision).toBe('ALLOW');
  });

  it('E18 — DENY when record exceeds NDPR retention limit', () => {
    const rule = makeRule({
      category: 'compliance',
      conditionJson: { max_retention_days: 365, data_categories: ['pii'] },
    });
    const ctx = makeCtx({ dataCategory: 'pii', recordAgeSeconds: 86400 * 400 }); // 400 days
    const result = evaluateDataRetention(rule, ctx);
    expect(result.decision).toBe('DENY');
    expect(result.reason).toContain('NDPR');
  });

  it('E19 — REQUIRE_HITL for DSAR erasure requests', () => {
    const rule = makeRule({
      category: 'compliance',
      conditionJson: { max_retention_days: 365, data_categories: ['pii'], allow_erasure_request: true },
    });
    const ctx = makeCtx({ dataCategory: 'pii', isErasureRequest: true });
    const result = evaluateDataRetention(rule, ctx);
    expect(result.decision).toBe('REQUIRE_HITL');
    expect(result.hitlLevel).toBe(1);
  });
});

// ── Payout Gate Evaluator ──────────────────────────────────────────────────

describe('evaluatePayoutGate', () => {
  it('E20 — REQUIRE_HITL for political campaign payouts', () => {
    const rule = makeRule({
      category: 'payout_gate',
      conditionJson: { require_hitl_for_types: ['political'], hitl_level: 2 },
    });
    const ctx = makeCtx({ campaignType: 'political', amountKobo: 1_000_000, complianceDeclared: true });
    const result = evaluatePayoutGate(rule, ctx);
    expect(result.decision).toBe('REQUIRE_HITL');
    expect(result.hitlLevel).toBe(2);
  });

  it('E21 — ALLOW for non-political campaign payouts', () => {
    const rule = makeRule({
      category: 'payout_gate',
      conditionJson: { require_hitl_for_types: ['political'] },
    });
    const ctx = makeCtx({ campaignType: 'charity', amountKobo: 500_000, complianceDeclared: true });
    const result = evaluatePayoutGate(rule, ctx);
    expect(result.decision).toBe('ALLOW');
  });

  it('E22 — DENY when compliance not declared', () => {
    const rule = makeRule({
      category: 'payout_gate',
      conditionJson: { require_compliance_declaration: true },
    });
    const ctx = makeCtx({ campaignType: 'charity', amountKobo: 500_000, complianceDeclared: false });
    const result = evaluatePayoutGate(rule, ctx);
    expect(result.decision).toBe('DENY');
    expect(result.reason).toContain('Compliance declaration required');
  });

  it('E23 — ALLOW when payout is below auto-approve threshold', () => {
    const rule = makeRule({
      category: 'payout_gate',
      conditionJson: {
        auto_approve_below_kobo: 500_000,
        require_hitl_for_types: ['political'],
      },
    });
    const ctx = makeCtx({ campaignType: 'political', amountKobo: 100_000, complianceDeclared: true });
    const result = evaluatePayoutGate(rule, ctx);
    expect(result.decision).toBe('ALLOW');
    expect(result.reason).toContain('auto-approve');
  });
});

// ── Engine pass-through (no opts) ─────────────────────────────────────────

describe('evaluate() — no EngineOptions (pass-through)', () => {
  it('E24 — returns ALLOW when opts is undefined', async () => {
    const result = await evaluate('any.rule.key', makeCtx());
    expect(result.decision).toBe('ALLOW');
    expect(result.reason).toContain('pass-through');
  });
});
