/**
 * recording-label.test.ts — Minimum 15 tests
 * CRITICAL: royalty_split_bps integer basis points; kobo arithmetic invariant
 * P13: artiste_ref_id / royalty splits NEVER to AI; L2 cap
 */

import { describe, it, expect } from 'vitest';
import {
  isValidRecordingLabelTransition,
  guardL2AiCap, guardFractionalKobo, guardNoRoyaltyDataInAi,
  guardClaimedToCosonRegistered, guardIntegerBps, guardRoyaltyArithmetic,
} from './types.js';

describe('RecordingLabel FSM', () => {
  it('seeded → claimed valid', () => {
    expect(isValidRecordingLabelTransition('seeded', 'claimed')).toBe(true);
  });
  it('claimed → coson_registered valid', () => {
    expect(isValidRecordingLabelTransition('claimed', 'coson_registered')).toBe(true);
  });
  it('coson_registered → active valid', () => {
    expect(isValidRecordingLabelTransition('coson_registered', 'active')).toBe(true);
  });
  it('seeded → active invalid', () => {
    expect(isValidRecordingLabelTransition('seeded', 'active')).toBe(false);
  });
  it('active → seeded invalid', () => {
    expect(isValidRecordingLabelTransition('active', 'seeded')).toBe(false);
  });
});

describe('COSON guard (record label)', () => {
  it('allows with COSON membership', () => {
    expect(guardClaimedToCosonRegistered({ cosonMembership: 'COSON-LABEL-2024' }).allowed).toBe(true);
  });
  it('blocks without membership', () => {
    expect(guardClaimedToCosonRegistered({ cosonMembership: null }).allowed).toBe(false);
  });
});

describe('royalty_split_bps integer basis points guard', () => {
  it('accepts 7050 bps (= 70.5%)', () => {
    expect(guardIntegerBps(7050).allowed).toBe(true);
  });
  it('accepts 10000 bps (= 100%)', () => {
    expect(guardIntegerBps(10000).allowed).toBe(true);
  });
  it('accepts 0 bps', () => {
    expect(guardIntegerBps(0).allowed).toBe(true);
  });
  it('rejects float bps', () => {
    expect(guardIntegerBps(70.5).allowed).toBe(false);
  });
  it('rejects bps > 10000', () => {
    expect(guardIntegerBps(10001).allowed).toBe(false);
  });
  it('rejects negative bps', () => {
    expect(guardIntegerBps(-1).allowed).toBe(false);
  });
});

describe('Royalty kobo arithmetic invariant', () => {
  it('passes when artiste + label = gross', () => {
    expect(guardRoyaltyArithmetic({ grossKobo: 1000000, artisteShareKobo: 700000, labelShareKobo: 300000 }).allowed).toBe(true);
  });
  it('fails when shares do not sum to gross', () => {
    expect(guardRoyaltyArithmetic({ grossKobo: 1000000, artisteShareKobo: 700001, labelShareKobo: 300000 }).allowed).toBe(false);
  });
});

describe('P13 AI guard (recording label)', () => {
  it('blocks artiste_ref_id in AI payload', () => {
    expect(guardNoRoyaltyDataInAi({ artiste_ref_id: 'uuid', genre: 'Afrobeats' }).allowed).toBe(false);
  });
  it('blocks royalty_split_bps in AI payload', () => {
    expect(guardNoRoyaltyDataInAi({ royalty_split_bps: 7050, revenue: 1000000 }).allowed).toBe(false);
  });
  it('blocks artiste_share_kobo in AI payload', () => {
    expect(guardNoRoyaltyDataInAi({ artiste_share_kobo: 700000 }).allowed).toBe(false);
  });
  it('allows aggregate genre revenue', () => {
    expect(guardNoRoyaltyDataInAi({ genre: 'Afrobeats', total_streams_revenue_kobo: 5000000, release_count: 12 }).allowed).toBe(true);
  });
});

describe('AI L2 cap (recording label)', () => {
  it('blocks L3_HITL', () => {
    expect(guardL2AiCap({ autonomyLevel: 'L3_HITL' }).allowed).toBe(false);
  });
  it('allows L2', () => {
    expect(guardL2AiCap({ autonomyLevel: 'L2' }).allowed).toBe(true);
  });
});

describe('P9 kobo guard (recording label)', () => {
  it('allows integer revenue', () => {
    expect(guardFractionalKobo(5000000).allowed).toBe(true);
  });
  it('rejects fractional revenue', () => {
    expect(guardFractionalKobo(5000000.01).allowed).toBe(false);
  });
});
