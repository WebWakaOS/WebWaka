/**
 * Entitlement evaluation engine.
 * (entitlement-model.md §3 — Evaluation Factors)
 *
 * Evaluate* functions return an EntitlementDecision (allowed + reason).
 * They do NOT throw — callers decide how to handle the decision.
 * To throw on denial, use the guards in guards.ts.
 *
 * DB-aware overloads (T006 — Entitlement Compatibility Bridge):
 * Every function accepts an optional `resolvedEntitlements` parameter.
 * When provided (loaded from EntitlementEngine.resolveForWorkspace()), those
 * values take precedence over the static PLAN_CONFIGS fallback.
 * Existing call sites without the parameter continue to work unchanged.
 */

import { SubscriptionStatus, PlatformLayer } from '@webwaka/types';
import type { Subscription } from '@webwaka/types';
import { PLAN_CONFIGS } from './plan-config.js';
import type { PlanConfig } from './plan-config.js';

// ---------------------------------------------------------------------------
// Decision type
// ---------------------------------------------------------------------------

export interface EntitlementDecision {
  allowed: boolean;
  reason?: string;
}

// ---------------------------------------------------------------------------
// DB-aware resolved entitlements (T006 — Compatibility Bridge)
//
// A partial PlanConfig that can be loaded at runtime from the DB via
// EntitlementEngine.resolveForWorkspace(). Any key present here overrides
// the static PLAN_CONFIGS value for that plan. Keys absent fall back to
// PLAN_CONFIGS[plan] automatically.
// ---------------------------------------------------------------------------

export type ResolvedEntitlements = Partial<
  Omit<PlanConfig, 'supportGroupsEnabled' | 'fundraisingEnabled'>
>;

// ---------------------------------------------------------------------------
// Internal config resolver (fallback chain)
// Priority: DB-resolved overrides → PLAN_CONFIGS[plan] → PLAN_CONFIGS.free
// ---------------------------------------------------------------------------

function resolveConfig(plan: string, resolved?: ResolvedEntitlements): PlanConfig {
  // Safe fallback: if plan is unrecognised, use 'free' as the most restrictive base.
  const base: PlanConfig = (PLAN_CONFIGS as Record<string, PlanConfig>)[plan] ?? PLAN_CONFIGS.free;
  if (!resolved) return base;

  // Merge: start from static base, apply DB-provided values where explicitly set.
  const merged: PlanConfig = { ...base };

  if (resolved.maxUsers !== undefined)          merged.maxUsers          = resolved.maxUsers;
  if (resolved.maxPlaces !== undefined)         merged.maxPlaces         = resolved.maxPlaces;
  if (resolved.maxOfferings !== undefined)      merged.maxOfferings      = resolved.maxOfferings;
  if (resolved.layers !== undefined)            merged.layers            = resolved.layers;
  if (resolved.brandingRights !== undefined)    merged.brandingRights    = resolved.brandingRights;
  if (resolved.whiteLabelDepth !== undefined)   merged.whiteLabelDepth   = resolved.whiteLabelDepth;
  if (resolved.delegationRights !== undefined)  merged.delegationRights  = resolved.delegationRights;
  if (resolved.aiRights !== undefined)          merged.aiRights          = resolved.aiRights;
  if (resolved.sensitiveSectorRights !== undefined) merged.sensitiveSectorRights = resolved.sensitiveSectorRights;
  if (resolved.wakaPagePublicPage !== undefined) merged.wakaPagePublicPage = resolved.wakaPagePublicPage;
  if (resolved.wakaPageAnalytics !== undefined)  merged.wakaPageAnalytics  = resolved.wakaPageAnalytics;
  if (resolved.groupsEnabled !== undefined)      merged.groupsEnabled      = resolved.groupsEnabled;
  if (resolved.valueMovementEnabled !== undefined) merged.valueMovementEnabled = resolved.valueMovementEnabled;

  return merged;
}

// ---------------------------------------------------------------------------
// Status check helper
// ---------------------------------------------------------------------------

function isSubscriptionUsable(status: SubscriptionStatus): boolean {
  return status === SubscriptionStatus.Active || status === SubscriptionStatus.Trialing;
}

// ---------------------------------------------------------------------------
// Evaluation functions
// ---------------------------------------------------------------------------

/**
 * Check whether a workspace subscription grants access to a specific platform layer.
 *
 * @param subscription - The workspace subscription.
 * @param layer - The platform layer to check.
 * @param resolvedEntitlements - Optional DB-resolved entitlements from EntitlementEngine.
 *   When provided, `layers` from the DB takes precedence over PLAN_CONFIGS.
 */
export function evaluateLayerAccess(
  subscription: Subscription,
  layer: PlatformLayer,
  resolvedEntitlements?: ResolvedEntitlements,
): EntitlementDecision {
  if (!isSubscriptionUsable(subscription.status)) {
    return {
      allowed: false,
      reason: `Subscription is ${subscription.status} — access denied.`,
    };
  }

  const config = resolveConfig(subscription.plan, resolvedEntitlements);
  const hasLayer = (config.layers as string[]).includes(layer);

  return hasLayer
    ? { allowed: true }
    : {
        allowed: false,
        reason: `Plan '${subscription.plan}' does not include the '${layer}' layer.`,
      };
}

/**
 * Check whether the workspace is within its user limit.
 *
 * @param subscription - The workspace subscription.
 * @param currentMemberCount - Current number of members in the workspace.
 * @param resolvedEntitlements - Optional DB-resolved entitlements from EntitlementEngine.
 *   When provided, `maxUsers` from the DB takes precedence over PLAN_CONFIGS.
 */
export function evaluateUserLimit(
  subscription: Subscription,
  currentMemberCount: number,
  resolvedEntitlements?: ResolvedEntitlements,
): EntitlementDecision {
  if (!isSubscriptionUsable(subscription.status)) {
    return { allowed: false, reason: `Subscription is ${subscription.status}.` };
  }

  const config = resolveConfig(subscription.plan, resolvedEntitlements);
  if (config.maxUsers === -1) return { allowed: true };

  if (currentMemberCount >= config.maxUsers) {
    return {
      allowed: false,
      reason: `User limit reached (${currentMemberCount}/${config.maxUsers}) for plan '${subscription.plan}'.`,
    };
  }

  return { allowed: true };
}

/**
 * Check whether the workspace is within its Place (branch/location) limit.
 *
 * @param subscription - The workspace subscription.
 * @param currentPlaceCount - Current number of managed Places.
 * @param resolvedEntitlements - Optional DB-resolved entitlements from EntitlementEngine.
 *   When provided, `maxPlaces` from the DB takes precedence over PLAN_CONFIGS.
 */
export function evaluatePlaceLimit(
  subscription: Subscription,
  currentPlaceCount: number,
  resolvedEntitlements?: ResolvedEntitlements,
): EntitlementDecision {
  if (!isSubscriptionUsable(subscription.status)) {
    return { allowed: false, reason: `Subscription is ${subscription.status}.` };
  }

  const config = resolveConfig(subscription.plan, resolvedEntitlements);
  if (config.maxPlaces === -1) return { allowed: true };

  if (currentPlaceCount >= config.maxPlaces) {
    return {
      allowed: false,
      reason: `Place limit reached (${currentPlaceCount}/${config.maxPlaces}) for plan '${subscription.plan}'.`,
    };
  }

  return { allowed: true };
}

/**
 * Check whether the workspace is within its Offering limit.
 *
 * @param subscription - The workspace subscription.
 * @param currentOfferingCount - Current number of active Offerings.
 * @param resolvedEntitlements - Optional DB-resolved entitlements from EntitlementEngine.
 *   When provided, `maxOfferings` from the DB takes precedence over PLAN_CONFIGS.
 */
export function evaluateOfferingLimit(
  subscription: Subscription,
  currentOfferingCount: number,
  resolvedEntitlements?: ResolvedEntitlements,
): EntitlementDecision {
  if (!isSubscriptionUsable(subscription.status)) {
    return { allowed: false, reason: `Subscription is ${subscription.status}.` };
  }

  const config = resolveConfig(subscription.plan, resolvedEntitlements);
  if (config.maxOfferings === -1) return { allowed: true };

  if (currentOfferingCount >= config.maxOfferings) {
    return {
      allowed: false,
      reason: `Offering limit reached (${currentOfferingCount}/${config.maxOfferings}) for plan '${subscription.plan}'.`,
    };
  }

  return { allowed: true };
}

/**
 * Check branding rights.
 *
 * @param subscription - The workspace subscription.
 * @param resolvedEntitlements - Optional DB-resolved entitlements from EntitlementEngine.
 */
export function evaluateBrandingRights(
  subscription: Subscription,
  resolvedEntitlements?: ResolvedEntitlements,
): EntitlementDecision {
  if (!isSubscriptionUsable(subscription.status)) {
    return { allowed: false, reason: `Subscription is ${subscription.status}.` };
  }
  const config = resolveConfig(subscription.plan, resolvedEntitlements);
  return config.brandingRights
    ? { allowed: true }
    : { allowed: false, reason: `Plan '${subscription.plan}' does not include branding rights.` };
}
