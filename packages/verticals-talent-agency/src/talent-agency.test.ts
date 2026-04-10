/**
 * talent-agency.test.ts — Minimum 15 tests
 * CRITICAL: commission_bps integer basis points; fee arithmetic invariant
 * P13: talent_ref_id / deal terms NEVER to AI; L2 cap
 */

import { describe, it, expect } from 'vitest';
import {
  isValidTalentAgencyTransition,
  guardL2AiCap, guardFractionalKobo, guardNoTalentDealDataInAi,
  guardClaimedToNmmaVerified, guardIntegerBps, guardFeeArithmetic,
} from './types.js';

describe('TalentAgency FSM', () => {
  it('seeded → claimed valid', () => {
    expect(isValidTalentAgencyTransition('seeded', 'claimed')).toBe(true);
  });
  it('claimed → nmma_verified valid', () => {
    expect(isValidTalentAgencyTransition('claimed', 'nmma_verified')).toBe(true);
  });
  it('nmma_verified → active valid', () => {
    expect(isValidTalentAgencyTransition('nmma_verified', 'active')).toBe(true);
  });
  it('seeded → active invalid', () => {
    expect(isValidTalentAgencyTransition('seeded', 'active')).toBe(false);
  });
  it('active → seeded invalid', () => {
    expect(isValidTalentAgencyTransition('active', 'seeded')).toBe(false);
  });
});

describe('NMMA guard', () => {
  it('allows with NMMA registration', () => {
    expect(guardClaimedToNmmaVerified({ nmmaRegistration: 'NMMA-2024-001' }).allowed).toBe(true);
  });
  it('blocks without registration', () => {
    expect(guardClaimedToNmmaVerified({ nmmaRegistration: null }).allowed).toBe(false);
  });
  it('blocks empty string', () => {
    expect(guardClaimedToNmmaVerified({ nmmaRegistration: '' }).allowed).toBe(false);
  });
});

describe('commission_bps integer basis points guard', () => {
  it('accepts 1500 bps (= 15%)', () => {
    expect(guardIntegerBps(1500).allowed).toBe(true);
  });
  it('accepts 0 bps', () => {
    expect(guardIntegerBps(0).allowed).toBe(true);
  });
  it('accepts 10000 bps (= 100%)', () => {
    expect(guardIntegerBps(10000).allowed).toBe(true);
  });
  it('rejects float bps', () => {
    expect(guardIntegerBps(15.5).allowed).toBe(false);
  });
  it('rejects bps > 10000', () => {
    expect(guardIntegerBps(10001).allowed).toBe(false);
  });
  it('rejects negative bps', () => {
    expect(guardIntegerBps(-1).allowed).toBe(false);
  });
});

describe('Fee arithmetic invariant (commission + payout = brand_fee)', () => {
  it('passes correct arithmetic', () => {
    expect(guardFeeArithmetic({ brandFeeKobo: 1000000, commissionKobo: 150000, talentPayoutKobo: 850000 }).allowed).toBe(true);
  });
  it('fails mismatched arithmetic', () => {
    expect(guardFeeArithmetic({ brandFeeKobo: 1000000, commissionKobo: 150001, talentPayoutKobo: 850000 }).allowed).toBe(false);
  });
});

describe('P13 AI guard (talent agency)', () => {
  it('blocks talent_ref_id in AI payload', () => {
    expect(guardNoTalentDealDataInAi({ talent_ref_id: 'uuid', category: 'model' }).allowed).toBe(false);
  });
  it('blocks commission_bps in AI payload', () => {
    expect(guardNoTalentDealDataInAi({ commission_bps: 1500, category: 'actor' }).allowed).toBe(false);
  });
  it('blocks deal_terms in AI payload', () => {
    expect(guardNoTalentDealDataInAi({ deal_terms: 'exclusive for 2 years' }).allowed).toBe(false);
  });
  it('allows aggregate booking payload', () => {
    expect(guardNoTalentDealDataInAi({ category: 'model', booking_count: 15, avg_fee_kobo: 500000 }).allowed).toBe(true);
  });
});

describe('AI L2 cap (talent agency)', () => {
  it('blocks L3_HITL', () => {
    expect(guardL2AiCap({ autonomyLevel: 'L3_HITL' }).allowed).toBe(false);
  });
  it('allows L2', () => {
    expect(guardL2AiCap({ autonomyLevel: 'L2' }).allowed).toBe(true);
  });
});

describe('P9 kobo guard (talent agency)', () => {
  it('allows integer brand fee', () => {
    expect(guardFractionalKobo(2000000).allowed).toBe(true);
  });
  it('rejects fractional fee', () => {
    expect(guardFractionalKobo(2000000.5).allowed).toBe(false);
  });
});
