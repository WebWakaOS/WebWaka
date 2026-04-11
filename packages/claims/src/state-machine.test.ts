/**
 * @webwaka/claims — state-machine tests
 * Milestone 5 — 10 tests
 */

import { describe, it, expect } from 'vitest';
import { ClaimLifecycleState } from '@webwaka/types';
import {
  validateTransition,
  advanceClaimState,
  allowedNextStates,
  isTerminalState,
  InvalidClaimTransitionError,
  UnknownClaimStateError,
} from './state-machine.js';

describe('validateTransition', () => {
  it('allows seeded → claimable', () => {
    expect(validateTransition('seeded', 'claimable')).toBe(true);
  });

  it('allows claimable → claim_pending', () => {
    expect(validateTransition('claimable', 'claim_pending')).toBe(true);
  });

  it('allows claim_pending → verified', () => {
    expect(validateTransition('claim_pending', 'verified')).toBe(true);
  });

  it('allows claim_pending → claimable (rejection/reset)', () => {
    expect(validateTransition('claim_pending', 'claimable')).toBe(true);
  });

  it('allows verified → managed', () => {
    expect(validateTransition('verified', 'managed')).toBe(true);
  });

  it('rejects seeded → managed (skips steps)', () => {
    expect(validateTransition('seeded', 'managed')).toBe(false);
  });

  it('rejects verified → seeded (backwards)', () => {
    expect(validateTransition('verified', 'seeded')).toBe(false);
  });

  it('throws UnknownClaimStateError for unknown state', () => {
    expect(() => validateTransition('unknown_state', 'claimable')).toThrow(UnknownClaimStateError);
  });
});

describe('advanceClaimState', () => {
  it('returns new state on valid transition', () => {
    const result = advanceClaimState(
      ClaimLifecycleState.Claimable,
      ClaimLifecycleState.ClaimPending,
    );
    expect(result.newState).toBe('claim_pending');
  });

  it('propagates evidence in result', () => {
    const evidence = { method: 'email' as const, token: 'abc123', verifiedAt: '2026-04-07' };
    const result = advanceClaimState(
      ClaimLifecycleState.ClaimPending,
      ClaimLifecycleState.Verified,
      evidence,
    );
    expect(result.newState).toBe('verified');
    expect(result.evidence).toEqual(evidence);
  });

  it('throws InvalidClaimTransitionError on invalid transition', () => {
    expect(() =>
      advanceClaimState(ClaimLifecycleState.Seeded, ClaimLifecycleState.Verified),
    ).toThrow(InvalidClaimTransitionError);
  });
});

describe('allowedNextStates', () => {
  it('returns [claimable] from seeded', () => {
    expect(allowedNextStates('seeded')).toEqual(['claimable']);
  });

  it('returns empty array for delegated (terminal)', () => {
    expect(allowedNextStates('delegated')).toEqual([]);
  });
});

describe('isTerminalState', () => {
  it('delegated is terminal', () => {
    expect(isTerminalState('delegated')).toBe(true);
  });

  it('seeded is not terminal', () => {
    expect(isTerminalState('seeded')).toBe(false);
  });
});
