/**
 * Claim state machine for WebWaka OS.
 * Governs transitions through the claim lifecycle.
 *
 * Lifecycle (claim-first-onboarding.md §4):
 *   seeded → claimable → claim_pending → verified → managed → branded → monetized → delegated
 *
 * M5 primary path: seeded → claimable → claim_pending → verified → managed
 *
 * Phase 3 additions (GAP-006):
 *   - Transition guards for business maturity stages (branded, monetized, delegated)
 *   - Guards validate prerequisites without gating access — they track business maturity
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
// Transition guards (GAP-006 — business maturity prerequisites)
// ---------------------------------------------------------------------------

export interface TransitionContext {
  hasBrandingSubscription?: boolean;
  hasPaymentMethod?: boolean;
  hasDelegationAgreement?: boolean;
}

export interface TransitionGuardResult {
  allowed: boolean;
  reason?: string;
}

type TransitionGuardFn = (ctx: TransitionContext) => TransitionGuardResult;

const TRANSITION_GUARDS: Partial<Record<string, TransitionGuardFn>> = {
  'managed→branded': (ctx) => {
    if (!ctx.hasBrandingSubscription) {
      return { allowed: false, reason: 'Active Pillar 2 (branding) subscription required to enter branded state' };
    }
    return { allowed: true };
  },
  'managed→monetized': (ctx) => {
    if (!ctx.hasBrandingSubscription) {
      return { allowed: false, reason: 'Active Pillar 2 (branding) subscription required before monetization' };
    }
    if (!ctx.hasPaymentMethod) {
      return { allowed: false, reason: 'At least one payment method must be configured to enter monetized state' };
    }
    return { allowed: true };
  },
  'branded→monetized': (ctx) => {
    if (!ctx.hasPaymentMethod) {
      return { allowed: false, reason: 'At least one payment method must be configured to enter monetized state' };
    }
    return { allowed: true };
  },
  'branded→delegated': (ctx) => {
    if (!ctx.hasDelegationAgreement) {
      return { allowed: false, reason: 'Partner delegation agreement required to enter delegated state' };
    }
    return { allowed: true };
  },
  'monetized→delegated': (ctx) => {
    if (!ctx.hasDelegationAgreement) {
      return { allowed: false, reason: 'Partner delegation agreement required to enter delegated state' };
    }
    return { allowed: true };
  },
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

export class TransitionGuardError extends Error {
  constructor(from: ClaimState, to: ClaimState, reason: string) {
    super(`Transition guard failed (${from} → ${to}): ${reason}`);
    this.name = 'TransitionGuardError';
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

/**
 * Check transition guards for business maturity stages.
 * Returns the guard result. If no guard is defined for the transition, it is allowed.
 */
export function checkTransitionGuard(
  currentState: ClaimState,
  nextState: ClaimState,
  ctx: TransitionContext,
): TransitionGuardResult {
  const key = `${currentState}→${nextState}`;
  const guard = TRANSITION_GUARDS[key];
  if (!guard) return { allowed: true };
  return guard(ctx);
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
 * Advance a claim state with transition guard validation.
 * Validates both the structural transition and business prerequisite guards.
 * Throws InvalidClaimTransitionError for invalid transitions.
 * Throws TransitionGuardError when prerequisites are not met.
 */
export function guardedAdvanceClaimState(
  currentState: ClaimState,
  nextState: ClaimState,
  ctx: TransitionContext,
  evidence?: ClaimEvidence,
): { newState: ClaimState; evidence?: ClaimEvidence } {
  if (!validateTransition(currentState, nextState)) {
    throw new InvalidClaimTransitionError(currentState, nextState);
  }

  const guardResult = checkTransitionGuard(currentState, nextState, ctx);
  if (!guardResult.allowed) {
    throw new TransitionGuardError(currentState, nextState, guardResult.reason ?? 'Guard check failed');
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
