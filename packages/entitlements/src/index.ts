/**
 * @webwaka/entitlements — Subscription plan matrix and entitlement evaluation.
 * (entitlement-model.md, TDR-0005, Platform Invariant T5)
 *
 * T006 — Entitlement Compatibility Bridge:
 * All evaluate* and guard functions now accept an optional `resolvedEntitlements`
 * parameter (type: ResolvedEntitlements) loaded from EntitlementEngine.resolveForWorkspace().
 * When provided, DB values take precedence over PLAN_CONFIGS. Existing callers
 * without the parameter continue to work unchanged — zero breaking changes.
 */

export type { PlanConfig } from './plan-config.js';
export { PLAN_CONFIGS } from './plan-config.js';

export type { EntitlementDecision, ResolvedEntitlements } from './evaluate.js';
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
  requireWakaPageAccess,
  evaluateWakaPageAccess,
  requireWakaPageAnalytics,
  evaluateWakaPageAnalytics,
  requireGroupsEnabled,
  evaluateGroupsEnabled,
  requireValueMovement,
  evaluateValueMovement,
  requireWalletEntitlement,
} from './guards.js';

export type { KYCTier, KYCTierConfig } from './cbn-kyc-tiers.js';
export { KYC_TIER_CONFIGS, KYCTierError, meetsTierRequirement, requireKYCTier, assertWithinTierLimits } from './cbn-kyc-tiers.js';
