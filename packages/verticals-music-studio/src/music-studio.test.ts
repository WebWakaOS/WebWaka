/**
 * music-studio.test.ts — Minimum 15 tests
 * Covers: FSM, P9, P13 AI guard, L2 cap, COSON gate, integer hours/bpm
 */

import { describe, it, expect } from 'vitest';
import {
  isValidMusicStudioTransition,
  guardL2AiCap, guardFractionalKobo, guardNoRoyaltyDataInAi,
  guardClaimedToCosonRegistered, guardIntegerHours, guardIntegerBpm,
} from './types.js';

describe('MusicStudio FSM', () => {
  it('seeded → claimed valid', () => {
    expect(isValidMusicStudioTransition('seeded', 'claimed')).toBe(true);
  });
  it('claimed → coson_registered valid', () => {
    expect(isValidMusicStudioTransition('claimed', 'coson_registered')).toBe(true);
  });
  it('coson_registered → active valid', () => {
    expect(isValidMusicStudioTransition('coson_registered', 'active')).toBe(true);
  });
  it('seeded → active invalid', () => {
    expect(isValidMusicStudioTransition('seeded', 'active')).toBe(false);
  });
  it('active → seeded invalid', () => {
    expect(isValidMusicStudioTransition('active', 'seeded')).toBe(false);
  });
});

describe('COSON guard', () => {
  it('allows with COSON membership', () => {
    expect(guardClaimedToCosonRegistered({ cosonMembership: 'COSON-2024-001' }).allowed).toBe(true);
  });
  it('blocks without membership', () => {
    expect(guardClaimedToCosonRegistered({ cosonMembership: null }).allowed).toBe(false);
  });
  it('blocks empty membership', () => {
    expect(guardClaimedToCosonRegistered({ cosonMembership: '' }).allowed).toBe(false);
  });
});

describe('Integer hours guard', () => {
  it('allows positive integer hours', () => {
    expect(guardIntegerHours(8).allowed).toBe(true);
  });
  it('rejects fractional hours', () => {
    expect(guardIntegerHours(2.5).allowed).toBe(false);
  });
  it('rejects zero hours', () => {
    expect(guardIntegerHours(0).allowed).toBe(false);
  });
  it('rejects negative hours', () => {
    expect(guardIntegerHours(-1).allowed).toBe(false);
  });
});

describe('Integer BPM guard', () => {
  it('allows valid BPM', () => {
    expect(guardIntegerBpm(120).allowed).toBe(true);
  });
  it('rejects fractional BPM', () => {
    expect(guardIntegerBpm(120.5).allowed).toBe(false);
  });
  it('rejects zero BPM', () => {
    expect(guardIntegerBpm(0).allowed).toBe(false);
  });
});

describe('P9 kobo guard (music studio)', () => {
  it('allows integer session rate', () => {
    expect(guardFractionalKobo(5000000).allowed).toBe(true);
  });
  it('rejects fractional rate', () => {
    expect(guardFractionalKobo(5000000.5).allowed).toBe(false);
  });
});

describe('P13 AI guard (music studio)', () => {
  it('blocks artiste_ref_id in AI payload', () => {
    expect(guardNoRoyaltyDataInAi({ artiste_ref_id: 'uuid', genre: 'Afrobeats' }).allowed).toBe(false);
  });
  it('blocks session_rate_kobo in AI payload', () => {
    expect(guardNoRoyaltyDataInAi({ session_rate_kobo: 500000, count: 5 }).allowed).toBe(false);
  });
  it('allows aggregate genre stats', () => {
    expect(guardNoRoyaltyDataInAi({ genre: 'Afrobeats', session_count: 50, total_hours: 200 }).allowed).toBe(true);
  });
});

describe('AI L2 cap (music studio)', () => {
  it('blocks L3_HITL', () => {
    expect(guardL2AiCap({ autonomyLevel: 'L3_HITL' }).allowed).toBe(false);
  });
  it('allows L2', () => {
    expect(guardL2AiCap({ autonomyLevel: 'L2' }).allowed).toBe(true);
  });
});
