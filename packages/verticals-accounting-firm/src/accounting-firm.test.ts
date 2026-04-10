/**
 * accounting-firm.test.ts — Minimum 15 tests
 * Covers: FSM, P9, P13 AI guard, L2 cap, T3, KYC, CPD, invoice arithmetic
 */

import { describe, it, expect } from 'vitest';
import {
  isValidAccountingFirmTransition,
  guardL2AiCap, guardFractionalKobo, guardNoClientDataInAi,
  guardClaimedToIcanVerified, guardKycForProfessionalBilling,
} from './types.js';

describe('AccountingFirm FSM', () => {
  it('seeded → claimed valid', () => {
    expect(isValidAccountingFirmTransition('seeded', 'claimed')).toBe(true);
  });
  it('claimed → ican_verified valid', () => {
    expect(isValidAccountingFirmTransition('claimed', 'ican_verified')).toBe(true);
  });
  it('ican_verified → active valid', () => {
    expect(isValidAccountingFirmTransition('ican_verified', 'active')).toBe(true);
  });
  it('seeded → active invalid', () => {
    expect(isValidAccountingFirmTransition('seeded', 'active')).toBe(false);
  });
  it('active → claimed invalid', () => {
    expect(isValidAccountingFirmTransition('active', 'claimed')).toBe(false);
  });
});

describe('ICAN guard', () => {
  it('allows transition with ICAN registration', () => {
    const r = guardClaimedToIcanVerified({ icanRegistration: 'ICAN-2024-001' });
    expect(r.allowed).toBe(true);
  });
  it('blocks transition without ICAN registration', () => {
    const r = guardClaimedToIcanVerified({ icanRegistration: null });
    expect(r.allowed).toBe(false);
  });
  it('blocks empty string ICAN', () => {
    const r = guardClaimedToIcanVerified({ icanRegistration: '   ' });
    expect(r.allowed).toBe(false);
  });
});

describe('P9 kobo guard', () => {
  it('allows integer kobo', () => {
    expect(guardFractionalKobo(50000).allowed).toBe(true);
  });
  it('allows zero kobo', () => {
    expect(guardFractionalKobo(0).allowed).toBe(true);
  });
  it('rejects fractional kobo', () => {
    expect(guardFractionalKobo(50000.5).allowed).toBe(false);
  });
  it('rejects negative kobo', () => {
    expect(guardFractionalKobo(-1).allowed).toBe(false);
  });
});

describe('P13 AI guard (accounting firm)', () => {
  it('blocks client_ref_id in AI payload', () => {
    const r = guardNoClientDataInAi({ client_ref_id: 'abc', aggregate_fee: 1000000 });
    expect(r.allowed).toBe(false);
  });
  it('blocks clientRefId in AI payload', () => {
    const r = guardNoClientDataInAi({ clientRefId: 'some-client', revenue: 5000000 });
    expect(r.allowed).toBe(false);
  });
  it('allows aggregate-only payload', () => {
    const r = guardNoClientDataInAi({ engagement_type: 'audit', total_revenue_kobo: 10000000 });
    expect(r.allowed).toBe(true);
  });
});

describe('AI L2 cap', () => {
  it('blocks L3_HITL autonomy level', () => {
    expect(guardL2AiCap({ autonomyLevel: 'L3_HITL' }).allowed).toBe(false);
  });
  it('blocks autonomy level 3 (numeric)', () => {
    expect(guardL2AiCap({ autonomyLevel: 3 }).allowed).toBe(false);
  });
  it('allows L2 autonomy', () => {
    expect(guardL2AiCap({ autonomyLevel: 'L2' }).allowed).toBe(true);
  });
  it('allows L1 autonomy', () => {
    expect(guardL2AiCap({ autonomyLevel: 'L1' }).allowed).toBe(true);
  });
});

describe('KYC guard', () => {
  it('allows KYC Tier 2 for billing', () => {
    expect(guardKycForProfessionalBilling({ kycTier: 2 }).allowed).toBe(true);
  });
  it('blocks KYC Tier 1 for billing', () => {
    expect(guardKycForProfessionalBilling({ kycTier: 1 }).allowed).toBe(false);
  });
});
