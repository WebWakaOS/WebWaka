/**
 * @webwaka/entitlements — Subscription plan matrix and entitlement evaluation.
 * (entitlement-model.md, TDR-0005, Platform Invariant T5)
 */

export type { PlanConfig } from './plan-config.js';
export { PLAN_CONFIGS } from './plan-config.js';

export type { EntitlementDecision } from './evaluate.js';
export {
  evaluateLayerAccess,
  evaluateUserLimit,
  evaluatePlaceLimit,
  evaluateOfferingLimit,
  evaluateBrandingRights,
} from './evaluate.js';

export {
  EntitlementError,
  requireLayerAccess,
  requireBrandingRights,
  requireDelegationRights,
  requireAIAccess,
  requireSensitiveSectorAccess,
} from './guards.js';
