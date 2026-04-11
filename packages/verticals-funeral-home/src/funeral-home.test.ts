/**
 * funeral-home.test.ts — Minimum 15 tests
 * CRITICAL: L3 HITL mandatory ALL AI; deceased data P13 absolute; case_ref_id opaque UUID
 */

import { describe, it, expect } from 'vitest';
import {
  isValidFuneralHomeTransition,
  guardL3HitlRequired, guardNoDeceasedDataInAi, guardFractionalKobo,
  guardOpaqueCaseRefId, guardClaimedToMortuaryVerified,
} from './types.js';

describe('FuneralHome FSM', () => {
  it('seeded → claimed valid', () => {
    expect(isValidFuneralHomeTransition('seeded', 'claimed')).toBe(true);
  });
  it('claimed → mortuary_verified valid', () => {
    expect(isValidFuneralHomeTransition('claimed', 'mortuary_verified')).toBe(true);
  });
  it('mortuary_verified → active valid', () => {
    expect(isValidFuneralHomeTransition('mortuary_verified', 'active')).toBe(true);
  });
  it('seeded → active invalid', () => {
    expect(isValidFuneralHomeTransition('seeded', 'active')).toBe(false);
  });
  it('active → seeded invalid', () => {
    expect(isValidFuneralHomeTransition('active', 'seeded')).toBe(false);
  });
});

describe('Mortuary permit guard', () => {
  it('allows with permit', () => {
    expect(guardClaimedToMortuaryVerified({ stateMortuaryPermit: 'LAGOS-MORT-2024' }).allowed).toBe(true);
  });
  it('blocks without permit', () => {
    expect(guardClaimedToMortuaryVerified({ stateMortuaryPermit: null }).allowed).toBe(false);
  });
  it('blocks empty permit', () => {
    expect(guardClaimedToMortuaryVerified({ stateMortuaryPermit: '' }).allowed).toBe(false);
  });
});

describe('L3 HITL guard (funeral home — ALL AI calls)', () => {
  it('allows L3_HITL', () => {
    expect(guardL3HitlRequired({ autonomyLevel: 'L3_HITL' }).allowed).toBe(true);
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

describe('P13 deceased data guard (absolute)', () => {
  it('blocks case_ref_id in AI payload', () => {
    expect(guardNoDeceasedDataInAi({ case_ref_id: 'uuid', service_count: 3 }).allowed).toBe(false);
  });
  it('blocks family_contact_phone in AI payload', () => {
    expect(guardNoDeceasedDataInAi({ family_contact_phone: '08012345678' }).allowed).toBe(false);
  });
  it('blocks burial_type in AI payload', () => {
    expect(guardNoDeceasedDataInAi({ burial_type: 'christian', count: 5 }).allowed).toBe(false);
  });
  it('blocks date_of_passing in AI payload', () => {
    expect(guardNoDeceasedDataInAi({ date_of_passing: 1700000000, service: 'embalming' }).allowed).toBe(false);
  });
  it('allows aggregate service revenue payload', () => {
    expect(guardNoDeceasedDataInAi({ service_type: 'embalming', total_revenue_kobo: 500000, count: 10 }).allowed).toBe(true);
  });
});

describe('Case ref ID opaque UUID guard', () => {
  it('accepts valid UUID', () => {
    expect(guardOpaqueCaseRefId('550e8400-e29b-41d4-a716-446655440000').allowed).toBe(true);
  });
  it('rejects deceased name', () => {
    expect(guardOpaqueCaseRefId('John-Doe-Case').allowed).toBe(false);
  });
  it('rejects numeric ID', () => {
    expect(guardOpaqueCaseRefId('CASE-001').allowed).toBe(false);
  });
});

describe('P9 kobo guard (funeral home)', () => {
  it('allows integer total', () => {
    expect(guardFractionalKobo(300000).allowed).toBe(true);
  });
  it('rejects fractional total', () => {
    expect(guardFractionalKobo(300000.5).allowed).toBe(false);
  });
});
