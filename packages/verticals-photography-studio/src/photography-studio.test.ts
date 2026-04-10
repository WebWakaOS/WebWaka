/**
 * photography-studio.test.ts — Minimum 15 tests
 * Covers: FSM, P9, P13 AI guard, L2 cap, CAC guard, equipment cost validation
 */

import { describe, it, expect } from 'vitest';
import {
  isValidPhotographyStudioTransition,
  guardL2AiCap, guardFractionalKobo, guardNoClientDataInAi,
  guardClaimedToCacVerified,
} from './types.js';

describe('PhotographyStudio FSM', () => {
  it('seeded → claimed valid', () => {
    expect(isValidPhotographyStudioTransition('seeded', 'claimed')).toBe(true);
  });
  it('claimed → cac_verified valid', () => {
    expect(isValidPhotographyStudioTransition('claimed', 'cac_verified')).toBe(true);
  });
  it('cac_verified → active valid', () => {
    expect(isValidPhotographyStudioTransition('cac_verified', 'active')).toBe(true);
  });
  it('active → suspended valid', () => {
    expect(isValidPhotographyStudioTransition('active', 'suspended')).toBe(true);
  });
  it('seeded → active invalid', () => {
    expect(isValidPhotographyStudioTransition('seeded', 'active')).toBe(false);
  });
});

describe('CAC guard (photography studio)', () => {
  it('allows with CAC RC', () => {
    expect(guardClaimedToCacVerified({ cacRc: 'RC-654321' }).allowed).toBe(true);
  });
  it('blocks without CAC RC', () => {
    expect(guardClaimedToCacVerified({ cacRc: null }).allowed).toBe(false);
  });
  it('blocks empty CAC RC', () => {
    expect(guardClaimedToCacVerified({ cacRc: '' }).allowed).toBe(false);
  });
});

describe('P9 kobo guard (photography studio)', () => {
  it('allows integer package fee', () => {
    expect(guardFractionalKobo(3000000).allowed).toBe(true);
  });
  it('rejects fractional fee', () => {
    expect(guardFractionalKobo(3000000.25).allowed).toBe(false);
  });
  it('allows zero deposit', () => {
    expect(guardFractionalKobo(0).allowed).toBe(true);
  });
  it('rejects negative amount', () => {
    expect(guardFractionalKobo(-500).allowed).toBe(false);
  });
});

describe('P13 AI guard (photography studio)', () => {
  it('blocks client_ref_id in AI payload', () => {
    expect(guardNoClientDataInAi({ client_ref_id: 'client-uuid', shoot_type: 'wedding' }).allowed).toBe(false);
  });
  it('blocks location in AI payload', () => {
    expect(guardNoClientDataInAi({ location: 'Eko Hotel', revenue: 500000 }).allowed).toBe(false);
  });
  it('blocks shoot_date in AI payload', () => {
    expect(guardNoClientDataInAi({ shoot_date: 1700000000, count: 3 }).allowed).toBe(false);
  });
  it('allows aggregate payload', () => {
    expect(guardNoClientDataInAi({ shoot_type: 'corporate', avg_package_kobo: 500000, count: 20 }).allowed).toBe(true);
  });
});

describe('AI L2 cap (photography studio)', () => {
  it('blocks L3_HITL', () => {
    expect(guardL2AiCap({ autonomyLevel: 'L3_HITL' }).allowed).toBe(false);
  });
  it('blocks numeric 3', () => {
    expect(guardL2AiCap({ autonomyLevel: 3 }).allowed).toBe(false);
  });
  it('allows L2', () => {
    expect(guardL2AiCap({ autonomyLevel: 'L2' }).allowed).toBe(true);
  });
  it('allows L1', () => {
    expect(guardL2AiCap({ autonomyLevel: 1 }).allowed).toBe(true);
  });
});
