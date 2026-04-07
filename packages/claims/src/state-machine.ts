/**
 * Claim state machine for WebWaka OS.
 * Governs transitions through the claim lifecycle.
 *
 * Lifecycle (claim-first-onboarding.md §4):
 *   seeded → claimable → claim_pending → verified → managed → branded → monetized → delegated
 *
 * M5 primary path: seeded → claimable → claim_pending → verified → managed
 */

import { ClaimLifecycleState } from '@webwaka/types';

export type ClaimState = (typeof ClaimLifecycleState)[keyof typeof ClaimLifecycleState];

// ---------------------------------------------------------------------------
// Valid transitions (governance-authoritative)
// ---------------------------------------------------------------------------

const VALID_TRANSITIONS: Readonly<Record<ClaimState, readonly ClaimState[]>> = {
  [ClaimLifecycleState.Seeded]:       [ClaimLifecycleState.Claimable],
  [ClaimLifecycleState.Claimable]:    [ClaimLifecycleState.ClaimPending],
  [ClaimLifecycleState.ClaimPending]: [ClaimLifecycleState.Verified, ClaimLifecycleState.Claimable],
  [ClaimLifecycleState.Verified]:     [ClaimLifecycleState.Managed],
  [ClaimLifecycleState.Managed]:      [ClaimLifecycleState.Branded, ClaimLifecycleState.Monetized],
  [ClaimLifecycleState.Branded]:      [ClaimLifecycleState.Monetized, ClaimLifecycleState.Delegated],
  [ClaimLifecycleState.Monetized]:    [ClaimLifecycleState.Delegated],
  [ClaimLifecycleState.Delegated]:    [],
};

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class InvalidClaimTransitionError extends Error {
  constructor(from: ClaimState, to: ClaimState) {
    super(`Invalid claim state transition: '${from}' → '${to}'`);
    this.name = 'InvalidClaimTransitionError';
  }
}

export class UnknownClaimStateError extends Error {
  constructor(state: string) {
    super(`Unknown claim state: '${state}'`);
    this.name = 'UnknownClaimStateError';
  }
}

// ---------------------------------------------------------------------------
// Core functions
// ---------------------------------------------------------------------------

/**
 * Validate whether a state transition is allowed.
 * Returns true if valid, false if not.
 * Throws UnknownClaimStateError if either state is not a recognised ClaimLifecycleState.
 */
export function validateTransition(currentState: string, nextState: string): boolean {
  const allStates = Object.values(ClaimLifecycleState) as ClaimState[];

  if (!allStates.includes(currentState as ClaimState)) {
    throw new UnknownClaimStateError(currentState);
  }
  if (!allStates.includes(nextState as ClaimState)) {
    throw new UnknownClaimStateError(nextState);
  }

  const allowed = VALID_TRANSITIONS[currentState as ClaimState];
  return allowed.includes(nextState as ClaimState);
}

export interface ClaimEvidence {
  method: 'email' | 'phone' | 'document';
  token?: string;
  documentUrls?: string[];
  verifiedAt?: string;
  verifiedBy?: string;
}

/**
 * Advance a claim state, returning the new state.
 * Throws InvalidClaimTransitionError when the transition is not allowed.
 *
 * @param currentState - Current ClaimLifecycleState value
 * @param nextState    - Requested next state
 * @param evidence     - Optional verification evidence for audit trail
 */
export function advanceClaimState(
  currentState: ClaimState,
  nextState: ClaimState,
  evidence?: ClaimEvidence,
): { newState: ClaimState; evidence?: ClaimEvidence } {
  if (!validateTransition(currentState, nextState)) {
    throw new InvalidClaimTransitionError(currentState, nextState);
  }

  return evidence !== undefined ? { newState: nextState, evidence } : { newState: nextState };
}

/**
 * Return the list of states that can be reached from the given state.
 */
export function allowedNextStates(currentState: ClaimState): readonly ClaimState[] {
  const allStates = Object.values(ClaimLifecycleState) as ClaimState[];
  if (!allStates.includes(currentState)) {
    throw new UnknownClaimStateError(currentState);
  }
  return VALID_TRANSITIONS[currentState];
}

/**
 * Returns true if the claim is in a terminal state (no further transitions possible).
 */
export function isTerminalState(state: ClaimState): boolean {
  return VALID_TRANSITIONS[state]?.length === 0;
}
