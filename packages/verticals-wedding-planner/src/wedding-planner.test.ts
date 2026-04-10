/**
 * wedding-planner.test.ts — Minimum 15 tests
 * Covers: FSM, P9, P13 AI guard, L2 cap, T3, KYC, large event guard
 */

import { describe, it, expect } from 'vitest';
import {
  isValidWeddingPlannerTransition,
  guardL2AiCap, guardFractionalKobo, guardNoCouplePiiInAi,
  guardClaimedToCacVerified, guardKycForLargeEvent,
} from './types.js';

describe('WeddingPlanner FSM', () => {
  it('seeded → claimed valid', () => {
    expect(isValidWeddingPlannerTransition('seeded', 'claimed')).toBe(true);
  });
  it('claimed → cac_verified valid', () => {
    expect(isValidWeddingPlannerTransition('claimed', 'cac_verified')).toBe(true);
  });
  it('cac_verified → active valid', () => {
    expect(isValidWeddingPlannerTransition('cac_verified', 'active')).toBe(true);
  });
  it('seeded → active invalid', () => {
    expect(isValidWeddingPlannerTransition('seeded', 'active')).toBe(false);
  });
  it('active → claimed invalid', () => {
    expect(isValidWeddingPlannerTransition('active', 'claimed')).toBe(false);
  });
});

describe('CAC guard', () => {
  it('allows with CAC RC', () => {
    expect(guardClaimedToCacVerified({ cacRc: 'RC-123456' }).allowed).toBe(true);
  });
  it('blocks without CAC RC', () => {
    expect(guardClaimedToCacVerified({ cacRc: null }).allowed).toBe(false);
  });
  it('blocks empty CAC RC', () => {
    expect(guardClaimedToCacVerified({ cacRc: '  ' }).allowed).toBe(false);
  });
});

describe('Large event KYC guard', () => {
  it('blocks KYC Tier 2 for ₦15M event', () => {
    expect(guardKycForLargeEvent({ kycTier: 2, totalBudgetKobo: 1_500_000_000 }).allowed).toBe(false);
  });
  it('allows KYC Tier 3 for ₦15M event', () => {
    expect(guardKycForLargeEvent({ kycTier: 3, totalBudgetKobo: 1_500_000_000 }).allowed).toBe(true);
  });
  it('allows KYC Tier 2 for ₦5M event', () => {
    expect(guardKycForLargeEvent({ kycTier: 2, totalBudgetKobo: 500_000_000 }).allowed).toBe(true);
  });
});

describe('P9 kobo guard (wedding planner)', () => {
  it('allows integer total budget', () => {
    expect(guardFractionalKobo(5000000).allowed).toBe(true);
  });
  it('rejects fractional budget', () => {
    expect(guardFractionalKobo(5000000.5).allowed).toBe(false);
  });
  it('allows zero deposit', () => {
    expect(guardFractionalKobo(0).allowed).toBe(true);
  });
  it('rejects negative', () => {
    expect(guardFractionalKobo(-1).allowed).toBe(false);
  });
});

describe('P13 AI guard (wedding planner)', () => {
  it('blocks venue in AI payload', () => {
    expect(guardNoCouplePiiInAi({ venue: 'Transcorp Hilton', budget: 5000000 }).allowed).toBe(false);
  });
  it('blocks brideRef in AI payload', () => {
    expect(guardNoCouplePiiInAi({ brideRef: 'uuid', count: 1 }).allowed).toBe(false);
  });
  it('allows aggregate payload', () => {
    expect(guardNoCouplePiiInAi({ style: 'church', avg_budget_kobo: 5000000, total: 20 }).allowed).toBe(true);
  });
});

describe('AI L2 cap (wedding planner)', () => {
  it('blocks L3_HITL', () => {
    expect(guardL2AiCap({ autonomyLevel: 'L3_HITL' }).allowed).toBe(false);
  });
  it('allows L2', () => {
    expect(guardL2AiCap({ autonomyLevel: 'L2' }).allowed).toBe(true);
  });
});
