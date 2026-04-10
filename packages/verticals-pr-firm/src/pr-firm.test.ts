/**
 * pr-firm.test.ts — Minimum 15 tests
 * Covers: FSM, P9, P13 AI guard, L2 cap, T3, KYC, NIPR guard
 */

import { describe, it, expect } from 'vitest';
import {
  isValidPrFirmTransition,
  guardL2AiCap, guardFractionalKobo, guardNoClientStrategyInAi,
  guardClaimedToNiprVerified, guardKycForRetainerBilling,
} from './types.js';

describe('PrFirm FSM', () => {
  it('seeded → claimed valid', () => {
    expect(isValidPrFirmTransition('seeded', 'claimed')).toBe(true);
  });
  it('claimed → nipr_verified valid', () => {
    expect(isValidPrFirmTransition('claimed', 'nipr_verified')).toBe(true);
  });
  it('nipr_verified → active valid', () => {
    expect(isValidPrFirmTransition('nipr_verified', 'active')).toBe(true);
  });
  it('active → suspended valid', () => {
    expect(isValidPrFirmTransition('active', 'suspended')).toBe(true);
  });
  it('seeded → active invalid', () => {
    expect(isValidPrFirmTransition('seeded', 'active')).toBe(false);
  });
});

describe('NIPR guard', () => {
  it('allows with NIPR accreditation', () => {
    expect(guardClaimedToNiprVerified({ niprAccreditation: 'NIPR-2024-LAG-001' }).allowed).toBe(true);
  });
  it('blocks without accreditation', () => {
    expect(guardClaimedToNiprVerified({ niprAccreditation: null }).allowed).toBe(false);
  });
  it('blocks empty string', () => {
    expect(guardClaimedToNiprVerified({ niprAccreditation: '' }).allowed).toBe(false);
  });
});

describe('P9 kobo guard', () => {
  it('allows integer budget', () => {
    expect(guardFractionalKobo(5000000).allowed).toBe(true);
  });
  it('rejects fractional budget', () => {
    expect(guardFractionalKobo(5000000.5).allowed).toBe(false);
  });
  it('rejects negative amount', () => {
    expect(guardFractionalKobo(-100).allowed).toBe(false);
  });
  it('allows zero', () => {
    expect(guardFractionalKobo(0).allowed).toBe(true);
  });
});

describe('P13 AI guard (PR firm)', () => {
  it('blocks client_ref_id in AI payload', () => {
    expect(guardNoClientStrategyInAi({ client_ref_id: 'abc-123', campaign_count: 3 }).allowed).toBe(false);
  });
  it('blocks campaign_name in AI payload', () => {
    expect(guardNoClientStrategyInAi({ campaign_name: 'Secret Product Launch', revenue: 1000 }).allowed).toBe(false);
  });
  it('allows aggregate campaign stats', () => {
    expect(guardNoClientStrategyInAi({ campaign_type: 'media', count: 10, avg_budget: 500000 }).allowed).toBe(true);
  });
});

describe('AI L2 cap (PR firm)', () => {
  it('blocks L3_HITL', () => {
    expect(guardL2AiCap({ autonomyLevel: 'L3_HITL' }).allowed).toBe(false);
  });
  it('blocks numeric 3', () => {
    expect(guardL2AiCap({ autonomyLevel: 3 }).allowed).toBe(false);
  });
  it('allows L2', () => {
    expect(guardL2AiCap({ autonomyLevel: 'L2' }).allowed).toBe(true);
  });
  it('allows undefined (default L1)', () => {
    expect(guardL2AiCap({ autonomyLevel: undefined }).allowed).toBe(true);
  });
});

describe('KYC guard (PR firm)', () => {
  it('allows KYC Tier 2 for retainer billing', () => {
    expect(guardKycForRetainerBilling({ kycTier: 2 }).allowed).toBe(true);
  });
  it('blocks KYC Tier 1', () => {
    expect(guardKycForRetainerBilling({ kycTier: 1 }).allowed).toBe(false);
  });
});
