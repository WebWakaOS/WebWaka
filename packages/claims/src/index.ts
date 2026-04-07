/**
 * @webwaka/claims — Claim state machine + tenant verification helpers.
 * (claim-first-onboarding.md, Milestone 5)
 */

export type { ClaimState, ClaimEvidence } from './state-machine.js';
export {
  advanceClaimState,
  validateTransition,
  allowedNextStates,
  isTerminalState,
  InvalidClaimTransitionError,
  UnknownClaimStateError,
} from './state-machine.js';

export type {
  EmailVerificationToken,
  PhoneVerificationToken,
  DocumentChecklistItem,
  DocumentVerificationChecklist,
} from './verification.js';
export {
  emailVerificationToken,
  phoneVerificationToken,
  documentVerificationChecklist,
  isTokenValid,
} from './verification.js';
