/**
 * tax-consultant.test.ts — Minimum 15 tests
 * CRITICAL: L3 HITL mandatory ALL AI; TIN/liability P13 tax privilege absolute
 */

import { describe, it, expect } from 'vitest';
import {
  isValidTaxConsultantTransition,
  guardL3HitlRequired, guardNoTaxPrivilegeDataInAi, guardFractionalKobo,
  guardClaimedToFirsVerified,
} from './types.js';

describe('TaxConsultant FSM', () => {
  it('seeded → claimed valid', () => {
    expect(isValidTaxConsultantTransition('seeded', 'claimed')).toBe(true);
  });
  it('claimed → firs_verified valid', () => {
    expect(isValidTaxConsultantTransition('claimed', 'firs_verified')).toBe(true);
  });
  it('firs_verified → active valid', () => {
    expect(isValidTaxConsultantTransition('firs_verified', 'active')).toBe(true);
  });
  it('active → suspended valid', () => {
    expect(isValidTaxConsultantTransition('active', 'suspended')).toBe(true);
  });
  it('seeded → active invalid', () => {
    expect(isValidTaxConsultantTransition('seeded', 'active')).toBe(false);
  });
});

describe('FIRS agent cert guard', () => {
  it('allows with FIRS cert', () => {
    expect(guardClaimedToFirsVerified({ firsTaxAgentCert: 'FIRS-TAC-2024-001' }).allowed).toBe(true);
  });
  it('blocks without FIRS cert', () => {
    expect(guardClaimedToFirsVerified({ firsTaxAgentCert: null }).allowed).toBe(false);
  });
  it('blocks empty FIRS cert', () => {
    expect(guardClaimedToFirsVerified({ firsTaxAgentCert: '' }).allowed).toBe(false);
  });
});

describe('L3 HITL guard (tax consultant — ALL AI calls)', () => {
  it('allows L3_HITL', () => {
    expect(guardL3HitlRequired({ autonomyLevel: 'L3_HITL' }).allowed).toBe(true);
  });
  it('allows numeric 3', () => {
    expect(guardL3HitlRequired({ autonomyLevel: 3 }).allowed).toBe(true);
  });
  it('blocks L2', () => {
    expect(guardL3HitlRequired({ autonomyLevel: 'L2' }).allowed).toBe(false);
  });
  it('blocks L1', () => {
    expect(guardL3HitlRequired({ autonomyLevel: 'L1' }).allowed).toBe(false);
  });
  it('blocks undefined', () => {
    expect(guardL3HitlRequired({ autonomyLevel: undefined }).allowed).toBe(false);
  });
});

describe('P13 tax privilege guard (absolute)', () => {
  it('blocks client_ref_id in AI payload', () => {
    expect(guardNoTaxPrivilegeDataInAi({ client_ref_id: 'client-123', filing_count: 5 }).allowed).toBe(false);
  });
  it('blocks firs_tin in AI payload', () => {
    expect(guardNoTaxPrivilegeDataInAi({ firs_tin: '12345678-0001', type: 'CIT' }).allowed).toBe(false);
  });
  it('blocks liability_kobo in AI payload', () => {
    expect(guardNoTaxPrivilegeDataInAi({ liability_kobo: 5000000, period: 'Q1-2024' }).allowed).toBe(false);
  });
  it('blocks firs_ref in AI payload', () => {
    expect(guardNoTaxPrivilegeDataInAi({ firs_ref: 'REF-001', amount: 1000000 }).allowed).toBe(false);
  });
  it('allows aggregate filing stats', () => {
    expect(guardNoTaxPrivilegeDataInAi({ tax_type: 'VAT', filing_count: 20, avg_fee_kobo: 100000 }).allowed).toBe(true);
  });
});

describe('P9 kobo guard (tax consultant)', () => {
  it('allows integer liability', () => {
    expect(guardFractionalKobo(10000000).allowed).toBe(true);
  });
  it('rejects fractional liability', () => {
    expect(guardFractionalKobo(10000000.50).allowed).toBe(false);
  });
  it('rejects negative', () => {
    expect(guardFractionalKobo(-1).allowed).toBe(false);
  });
});
