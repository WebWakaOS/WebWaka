/**
 * @webwaka/claims — state-machine tests
 * Milestone 5 + Phase 3 GAP-006 — transition guards
 */

import { describe, it, expect } from 'vitest';
import { ClaimLifecycleState } from '@webwaka/types';
import {
  validateTransition,
  advanceClaimState,
  guardedAdvanceClaimState,
  checkTransitionGuard,
  allowedNextStates,
  isTerminalState,
  InvalidClaimTransitionError,
  UnknownClaimStateError,
  TransitionGuardError,
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

  it('allows managed → branded', () => {
    expect(validateTransition('managed', 'branded')).toBe(true);
  });

  it('allows branded → monetized', () => {
    expect(validateTransition('branded', 'monetized')).toBe(true);
  });

  it('allows monetized → delegated', () => {
    expect(validateTransition('monetized', 'delegated')).toBe(true);
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

describe('checkTransitionGuard', () => {
  it('allows managed → branded with branding subscription', () => {
    const result = checkTransitionGuard('managed', 'branded', { hasBrandingSubscription: true });
    expect(result.allowed).toBe(true);
  });

  it('rejects managed → branded without branding subscription', () => {
    const result = checkTransitionGuard('managed', 'branded', {});
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Pillar 2');
  });

  it('allows branded → monetized with payment method', () => {
    const result = checkTransitionGuard('branded', 'monetized', { hasPaymentMethod: true });
    expect(result.allowed).toBe(true);
  });

  it('rejects branded → monetized without payment method', () => {
    const result = checkTransitionGuard('branded', 'monetized', {});
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('payment method');
  });

  it('allows monetized → delegated with delegation agreement', () => {
    const result = checkTransitionGuard('monetized', 'delegated', { hasDelegationAgreement: true });
    expect(result.allowed).toBe(true);
  });

  it('rejects monetized → delegated without delegation agreement', () => {
    const result = checkTransitionGuard('monetized', 'delegated', {});
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('delegation agreement');
  });

  it('rejects managed → monetized without both subscription and payment', () => {
    const result = checkTransitionGuard('managed', 'monetized', {});
    expect(result.allowed).toBe(false);
  });

  it('allows managed → monetized with both subscription and payment', () => {
    const result = checkTransitionGuard('managed', 'monetized', {
      hasBrandingSubscription: true,
      hasPaymentMethod: true,
    });
    expect(result.allowed).toBe(true);
  });

  it('allows transitions without guards (e.g. seeded → claimable)', () => {
    const result = checkTransitionGuard('seeded', 'claimable', {});
    expect(result.allowed).toBe(true);
  });
});

describe('guardedAdvanceClaimState', () => {
  it('advances managed → branded with guard met', () => {
    const result = guardedAdvanceClaimState(
      ClaimLifecycleState.Managed,
      ClaimLifecycleState.Branded,
      { hasBrandingSubscription: true },
    );
    expect(result.newState).toBe('branded');
  });

  it('throws TransitionGuardError when guard not met', () => {
    expect(() =>
      guardedAdvanceClaimState(
        ClaimLifecycleState.Managed,
        ClaimLifecycleState.Branded,
        {},
      ),
    ).toThrow(TransitionGuardError);
  });

  it('throws InvalidClaimTransitionError for structurally invalid transition', () => {
    expect(() =>
      guardedAdvanceClaimState(
        ClaimLifecycleState.Seeded,
        ClaimLifecycleState.Managed,
        { hasBrandingSubscription: true },
      ),
    ).toThrow(InvalidClaimTransitionError);
  });

  it('passes through un-guarded transitions', () => {
    const result = guardedAdvanceClaimState(
      ClaimLifecycleState.Verified,
      ClaimLifecycleState.Managed,
      {},
    );
    expect(result.newState).toBe('managed');
  });

  it('propagates evidence through guarded advance', () => {
    const evidence = { method: 'document' as const, documentUrls: ['https://example.com/doc.pdf'] };
    const result = guardedAdvanceClaimState(
      ClaimLifecycleState.Branded,
      ClaimLifecycleState.Monetized,
      { hasPaymentMethod: true },
      evidence,
    );
    expect(result.newState).toBe('monetized');
    expect(result.evidence).toEqual(evidence);
  });
});

describe('allowedNextStates', () => {
  it('returns [claimable] from seeded', () => {
    expect(allowedNextStates('seeded')).toEqual(['claimable']);
  });

  it('returns [branded, monetized] from managed', () => {
    expect(allowedNextStates('managed')).toEqual(['branded', 'monetized']);
  });

  it('returns [monetized, delegated] from branded', () => {
    expect(allowedNextStates('branded')).toEqual(['monetized', 'delegated']);
  });

  it('returns [delegated] from monetized', () => {
    expect(allowedNextStates('monetized')).toEqual(['delegated']);
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

  it('managed is not terminal', () => {
    expect(isTerminalState('managed')).toBe(false);
  });
});
