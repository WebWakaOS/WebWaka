/**
 * law-firm.test.ts — Minimum 15 tests
 * CRITICAL: L3 HITL mandatory ALL AI; legal privilege P13 ABSOLUTE; matter_ref_id opaque UUID
 */

import { describe, it, expect } from 'vitest';
import {
  isValidLawFirmTransition,
  guardL3HitlRequired, guardLegalPrivilege, guardFractionalKobo,
  guardIntegerMinutes, guardOpaqueMatterRefId, guardClaimedToNbaVerified,
} from './types.js';

describe('LawFirm FSM', () => {
  it('seeded → claimed valid', () => {
    expect(isValidLawFirmTransition('seeded', 'claimed')).toBe(true);
  });
  it('claimed → nba_verified valid', () => {
    expect(isValidLawFirmTransition('claimed', 'nba_verified')).toBe(true);
  });
  it('nba_verified → active valid', () => {
    expect(isValidLawFirmTransition('nba_verified', 'active')).toBe(true);
  });
  it('seeded → active invalid', () => {
    expect(isValidLawFirmTransition('seeded', 'active')).toBe(false);
  });
  it('active → seeded invalid', () => {
    expect(isValidLawFirmTransition('active', 'seeded')).toBe(false);
  });
});

describe('NBA verification guard', () => {
  it('allows with NBA registration', () => {
    expect(guardClaimedToNbaVerified({ nbaFirmRegistration: 'NBA-LAG-2024-001' }).allowed).toBe(true);
  });
  it('blocks without NBA registration', () => {
    expect(guardClaimedToNbaVerified({ nbaFirmRegistration: null }).allowed).toBe(false);
  });
});

describe('L3 HITL guard (law firm — ALL AI calls)', () => {
  it('allows L3_HITL autonomy', () => {
    expect(guardL3HitlRequired({ autonomyLevel: 'L3_HITL' }).allowed).toBe(true);
  });
  it('allows numeric 3 autonomy', () => {
    expect(guardL3HitlRequired({ autonomyLevel: 3 }).allowed).toBe(true);
  });
  it('blocks L2 autonomy', () => {
    expect(guardL3HitlRequired({ autonomyLevel: 'L2' }).allowed).toBe(false);
  });
  it('blocks L1 autonomy', () => {
    expect(guardL3HitlRequired({ autonomyLevel: 'L1' }).allowed).toBe(false);
  });
  it('blocks undefined autonomy', () => {
    expect(guardL3HitlRequired({ autonomyLevel: undefined }).allowed).toBe(false);
  });
});

describe('Legal privilege P13 guard (absolute)', () => {
  it('blocks matter_ref_id in AI payload', () => {
    expect(guardLegalPrivilege({ matter_ref_id: 'uuid', billing_type_stats: {} }).allowed).toBe(false);
  });
  it('blocks matterType in AI payload', () => {
    expect(guardLegalPrivilege({ matterType: 'litigation', count: 5 }).allowed).toBe(false);
  });
  it('blocks fee_earner_ref_id in AI payload', () => {
    expect(guardLegalPrivilege({ fee_earner_ref_id: 'ref-123', hours: 100 }).allowed).toBe(false);
  });
  it('allows aggregate billing payload', () => {
    expect(guardLegalPrivilege({ total_billing_hours: 200, revenue_kobo: 5000000 }).allowed).toBe(true);
  });
});

describe('Matter ref ID opaque UUID guard', () => {
  it('accepts valid UUID', () => {
    expect(guardOpaqueMatterRefId('550e8400-e29b-41d4-a716-446655440000').allowed).toBe(true);
  });
  it('rejects client name as matter ref', () => {
    expect(guardOpaqueMatterRefId('Dangote-v-NNPC').allowed).toBe(false);
  });
  it('rejects non-UUID string', () => {
    expect(guardOpaqueMatterRefId('matter-001').allowed).toBe(false);
  });
});

describe('Time billing guards', () => {
  it('allows positive integer minutes', () => {
    expect(guardIntegerMinutes(60).allowed).toBe(true);
  });
  it('rejects fractional minutes', () => {
    expect(guardIntegerMinutes(60.5).allowed).toBe(false);
  });
  it('rejects zero minutes', () => {
    expect(guardIntegerMinutes(0).allowed).toBe(false);
  });
});

describe('P9 kobo guard (law firm)', () => {
  it('allows integer fee', () => {
    expect(guardFractionalKobo(5000000).allowed).toBe(true);
  });
  it('rejects fractional fee', () => {
    expect(guardFractionalKobo(5000000.99).allowed).toBe(false);
  });
});
