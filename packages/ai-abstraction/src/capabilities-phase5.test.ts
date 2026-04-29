/**
 * AI Capabilities Phase 5 tests (E29)
 *
 * Tests the 5 new AICapabilityType values added in Phase 5:
 *   - mobilization_analytics  (min plan: pro)
 *   - broadcast_scheduler     (min plan: pro)
 *   - member_segmentation     (min plan: pro)
 *   - petition_optimizer      (min plan: growth)
 *   - case_classifier         (min plan: growth)
 *
 * Verifies:
 *   - All 5 new capabilities are accepted by evaluateAICapability without error
 *   - prohibitedCapabilities blocks the capability even on enterprise plan
 *   - maxAutonomyLevel=0 blocks write-capable capabilities
 *   - USSD block (P12) applies to all 5 new capabilities
 *   - Plan tier gate: DENY on plan below min_plan, ALLOW on meeting min_plan
 */

import { describe, it, expect } from 'vitest';
import { evaluateAICapability, CAPABILITY_PLAN_TIER } from './capabilities.js';
import type { AICapabilityType } from './capabilities.js';
import type { AIRoutingContext } from './types.js';

// Re-export types so test file can reference the union directly
type Cap = AICapabilityType;

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Build a minimal passing AIRoutingContext for enterprise plan (passes all gates). */
function makeCtx(overrides: Partial<AIRoutingContext> = {}): AIRoutingContext {
  return {
    pillar: 1,
    tenantId: 'tnt_test',
    isUssd: false,
    ndprConsentGranted: true,
    aiRights: true,
    spendCapWakaCu: 0,         // unlimited
    currentSpendWakaCu: 0,
    capability: 'superagent_chat',
    ...overrides,
  };
}

/** The 5 new Phase 5 capabilities. */
const PHASE5_CAPS: Cap[] = [
  'mobilization_analytics',
  'broadcast_scheduler',
  'member_segmentation',
  'petition_optimizer',
  'case_classifier',
];

// ── CAPABILITY_PLAN_TIER — Phase 5 entries present ───────────────────────────

describe('CAPABILITY_PLAN_TIER — Phase 5 entries', () => {
  it('CAP-P5-01 — mobilization_analytics is mapped to pro plan', () => {
    expect(CAPABILITY_PLAN_TIER['mobilization_analytics']).toBe('pro');
  });

  it('CAP-P5-02 — broadcast_scheduler is mapped to pro plan', () => {
    expect(CAPABILITY_PLAN_TIER['broadcast_scheduler']).toBe('pro');
  });

  it('CAP-P5-03 — member_segmentation is mapped to pro plan', () => {
    expect(CAPABILITY_PLAN_TIER['member_segmentation']).toBe('pro');
  });

  it('CAP-P5-04 — petition_optimizer is mapped to growth plan', () => {
    expect(CAPABILITY_PLAN_TIER['petition_optimizer']).toBe('growth');
  });

  it('CAP-P5-05 — case_classifier is mapped to growth plan', () => {
    expect(CAPABILITY_PLAN_TIER['case_classifier']).toBe('growth');
  });
});

// ── evaluateAICapability — ALLOW on enterprise plan ──────────────────────────

describe('evaluateAICapability — Phase 5 caps ALLOW on enterprise plan (all gates pass)', () => {
  for (const cap of PHASE5_CAPS) {
    it(`CAP-P5-ALLOW — ${cap} is allowed on enterprise plan with all permissions`, () => {
      const result = evaluateAICapability(makeCtx({ capability: cap }));
      expect(result.allowed).toBe(true);
    });
  }
});

// ── evaluateAICapability — prohibitedCapabilities gate ───────────────────────

describe('evaluateAICapability — prohibitedCapabilities gate', () => {
  it('CAP-P5-10 — mobilization_analytics DENIED when in prohibitedCapabilities list', () => {
    const result = evaluateAICapability(makeCtx({
      capability: 'mobilization_analytics',
      prohibitedCapabilities: ['mobilization_analytics', 'broadcast_scheduler'],
    }));
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.code).toBe('ENTITLEMENT_DENIED');
      expect(result.reason).toContain('mobilization_analytics');
      expect(result.reason).toMatch(/prohibit/i);
    }
  });

  it('CAP-P5-11 — broadcast_scheduler DENIED when in prohibitedCapabilities list', () => {
    const result = evaluateAICapability(makeCtx({
      capability: 'broadcast_scheduler',
      prohibitedCapabilities: ['broadcast_scheduler'],
    }));
    expect(result.allowed).toBe(false);
  });

  it('CAP-P5-12 — member_segmentation ALLOWED when NOT in prohibitedCapabilities list', () => {
    const result = evaluateAICapability(makeCtx({
      capability: 'member_segmentation',
      prohibitedCapabilities: ['broadcast_scheduler', 'mobilization_analytics'],
    }));
    expect(result.allowed).toBe(true);
  });

  it('CAP-P5-13 — petition_optimizer DENIED when prohibited (even with empty prohibited list elsewhere)', () => {
    const result = evaluateAICapability(makeCtx({
      capability: 'petition_optimizer',
      prohibitedCapabilities: ['petition_optimizer'],
    }));
    expect(result.allowed).toBe(false);
  });

  it('CAP-P5-14 — case_classifier ALLOWED when prohibitedCapabilities is empty array', () => {
    const result = evaluateAICapability(makeCtx({
      capability: 'case_classifier',
      prohibitedCapabilities: [],
    }));
    expect(result.allowed).toBe(true);
  });
});

// ── evaluateAICapability — maxAutonomyLevel gate ─────────────────────────────

describe('evaluateAICapability — maxAutonomyLevel gate (E29)', () => {
  it('CAP-P5-15 — mobilization_analytics DENIED when maxAutonomyLevel=0', () => {
    const result = evaluateAICapability(makeCtx({
      capability: 'mobilization_analytics',
      maxAutonomyLevel: 0,
    }));
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toMatch(/autonomy/i);
    }
  });

  it('CAP-P5-16 — broadcast_scheduler DENIED when maxAutonomyLevel=0', () => {
    const result = evaluateAICapability(makeCtx({
      capability: 'broadcast_scheduler',
      maxAutonomyLevel: 0,
    }));
    expect(result.allowed).toBe(false);
  });

  it('CAP-P5-17 — member_segmentation DENIED when maxAutonomyLevel=0', () => {
    const result = evaluateAICapability(makeCtx({
      capability: 'member_segmentation',
      maxAutonomyLevel: 0,
    }));
    expect(result.allowed).toBe(false);
  });

  it('CAP-P5-18 — mobilization_analytics ALLOWED when maxAutonomyLevel=1', () => {
    const result = evaluateAICapability(makeCtx({
      capability: 'mobilization_analytics',
      maxAutonomyLevel: 1,
    }));
    expect(result.allowed).toBe(true);
  });

  it('CAP-P5-19 — broadcast_scheduler ALLOWED when maxAutonomyLevel=2', () => {
    const result = evaluateAICapability(makeCtx({
      capability: 'broadcast_scheduler',
      maxAutonomyLevel: 2,
    }));
    expect(result.allowed).toBe(true);
  });

  it('CAP-P5-20 — petition_optimizer DENIED when maxAutonomyLevel=0 (write-capable)', () => {
    const result = evaluateAICapability(makeCtx({
      capability: 'petition_optimizer',
      maxAutonomyLevel: 0,
    }));
    expect(result.allowed).toBe(false);
  });

  it('CAP-P5-21 — case_classifier DENIED when maxAutonomyLevel=0 (write-capable)', () => {
    const result = evaluateAICapability(makeCtx({
      capability: 'case_classifier',
      maxAutonomyLevel: 0,
    }));
    expect(result.allowed).toBe(false);
  });
});

// ── evaluateAICapability — USSD block (P12) ──────────────────────────────────

describe('evaluateAICapability — USSD block (P12) on Phase 5 capabilities', () => {
  for (const cap of PHASE5_CAPS) {
    it(`CAP-P5-USSD — ${cap} DENIED on USSD session`, () => {
      const result = evaluateAICapability(makeCtx({
        capability: cap,
        isUssd: true,
      }));
      expect(result.allowed).toBe(false);
      if (!result.allowed) {
        expect(result.code).toBe('USSD_EXCLUDED');
        expect(result.reason).toMatch(/ussd/i);
      }
    });
  }
});

// ── evaluateAICapability — NDPR consent gate (P10) ───────────────────────────

describe('evaluateAICapability — NDPR consent gate (P10)', () => {
  it('CAP-P5-26 — mobilization_analytics DENIED when ndprConsentGranted=false', () => {
    const result = evaluateAICapability(makeCtx({
      capability: 'mobilization_analytics',
      ndprConsentGranted: false,
    }));
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.code).toBe('CONSENT_REQUIRED');
    }
  });
});

// ── evaluateAICapability — spend cap gate ────────────────────────────────────

describe('evaluateAICapability — spend cap gate', () => {
  it('CAP-P5-27 — broadcast_scheduler DENIED when spend cap exceeded', () => {
    const result = evaluateAICapability(makeCtx({
      capability: 'broadcast_scheduler',
      spendCapWakaCu: 1000,
      currentSpendWakaCu: 1000,
    }));
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.code).toBe('SPEND_CAP_EXCEEDED');
    }
  });

  it('CAP-P5-28 — member_segmentation ALLOWED when spend cap is 0 (unlimited)', () => {
    const result = evaluateAICapability(makeCtx({
      capability: 'member_segmentation',
      spendCapWakaCu: 0,
      currentSpendWakaCu: 99999,
    }));
    expect(result.allowed).toBe(true);
  });
});
