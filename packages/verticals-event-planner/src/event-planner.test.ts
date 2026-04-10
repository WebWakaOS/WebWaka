/**
 * event-planner.test.ts — Minimum 15 tests
 * Covers: FSM, P9, P13 AI guard, L2 cap, T3, KYC, licence guard
 */

import { describe, it, expect } from 'vitest';
import {
  isValidEventPlannerTransition,
  guardL2AiCap, guardFractionalKobo, guardNoClientDataInAi,
  guardClaimedToLicenceVerified, guardKycForDeposit,
} from './types.js';

describe('EventPlanner FSM', () => {
  it('seeded → claimed valid', () => {
    expect(isValidEventPlannerTransition('seeded', 'claimed')).toBe(true);
  });
  it('claimed → licence_verified valid', () => {
    expect(isValidEventPlannerTransition('claimed', 'licence_verified')).toBe(true);
  });
  it('licence_verified → active valid', () => {
    expect(isValidEventPlannerTransition('licence_verified', 'active')).toBe(true);
  });
  it('active → suspended valid', () => {
    expect(isValidEventPlannerTransition('active', 'suspended')).toBe(true);
  });
  it('seeded → active invalid', () => {
    expect(isValidEventPlannerTransition('seeded', 'active')).toBe(false);
  });
});

describe('Licence guard', () => {
  it('allows with licence', () => {
    expect(guardClaimedToLicenceVerified({ stateEventLicence: 'LAGOS-EVT-2024' }).allowed).toBe(true);
  });
  it('blocks without licence', () => {
    expect(guardClaimedToLicenceVerified({ stateEventLicence: null }).allowed).toBe(false);
  });
  it('blocks empty licence string', () => {
    expect(guardClaimedToLicenceVerified({ stateEventLicence: '' }).allowed).toBe(false);
  });
});

describe('P9 kobo guard', () => {
  it('allows integer kobo', () => {
    expect(guardFractionalKobo(1000000).allowed).toBe(true);
  });
  it('rejects fractional kobo', () => {
    expect(guardFractionalKobo(999.5).allowed).toBe(false);
  });
  it('rejects negative kobo', () => {
    expect(guardFractionalKobo(-100).allowed).toBe(false);
  });
  it('allows zero kobo (deposit)', () => {
    expect(guardFractionalKobo(0).allowed).toBe(true);
  });
});

describe('P13 AI guard (event planner)', () => {
  it('blocks client_phone in AI payload', () => {
    expect(guardNoClientDataInAi({ client_phone: '08012345678', event_count: 5 }).allowed).toBe(false);
  });
  it('blocks venue in AI payload', () => {
    expect(guardNoClientDataInAi({ venue: 'Eko Hotel', revenue: 500000 }).allowed).toBe(false);
  });
  it('allows aggregate payload', () => {
    expect(guardNoClientDataInAi({ event_type: 'wedding', total_events: 12, avg_budget: 5000000 }).allowed).toBe(true);
  });
});

describe('AI L2 cap (event planner)', () => {
  it('blocks L3_HITL', () => {
    expect(guardL2AiCap({ autonomyLevel: 'L3_HITL' }).allowed).toBe(false);
  });
  it('blocks numeric 3', () => {
    expect(guardL2AiCap({ autonomyLevel: 3 }).allowed).toBe(false);
  });
  it('allows L2', () => {
    expect(guardL2AiCap({ autonomyLevel: 2 }).allowed).toBe(true);
  });
});

describe('KYC guard (event planner)', () => {
  it('allows KYC Tier 2', () => {
    expect(guardKycForDeposit({ kycTier: 2 }).allowed).toBe(true);
  });
  it('blocks KYC Tier 1', () => {
    expect(guardKycForDeposit({ kycTier: 1 }).allowed).toBe(false);
  });
});
