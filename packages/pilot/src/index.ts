/**
 * @webwaka/pilot — Pilot Rollout Infrastructure
 *
 * Services for Milestone 11 (Pilot Rollout):
 *   - PilotOperatorService  — operator enrolment, status FSM, cohort management
 *   - PilotFlagService      — per-tenant feature flag overrides
 *   - PilotFeedbackService  — NPS + qualitative feedback collection
 */

export { PilotOperatorService } from './pilot-operator-service.js';
export { PilotFlagService }     from './pilot-flag-service.js';
export { PilotFeedbackService } from './pilot-feedback-service.js';

export type {
  PilotOperator,
  PilotOperatorStatus,
  PilotFeatureFlag,
  PilotFeedback,
  PilotFeedbackType,
  CreatePilotOperatorInput,
  EnrollPilotFlagInput,
  SubmitFeedbackInput,
} from './types.js';

export type { FeedbackSummary } from './pilot-feedback-service.js';
