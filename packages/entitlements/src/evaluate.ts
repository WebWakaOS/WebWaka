/**
 * Entitlement evaluation engine.
 * (entitlement-model.md §3 — Evaluation Factors)
 *
 * Evaluate* functions return an EntitlementDecision (allowed + reason).
 * They do NOT throw — callers decide how to handle the decision.
 * To throw on denial, use the guards in guards.ts.
 */

import { SubscriptionStatus, PlatformLayer } from '@webwaka/types';
import type { Subscription } from '@webwaka/types';
import { PLAN_CONFIGS } from './plan-config.js';

// ---------------------------------------------------------------------------
// Decision type
// ---------------------------------------------------------------------------

export interface EntitlementDecision {
  allowed: boolean;
  reason?: string;
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
 */
export function evaluateLayerAccess(
  subscription: Subscription,
  layer: PlatformLayer,
): EntitlementDecision {
  if (!isSubscriptionUsable(subscription.status)) {
    return {
      allowed: false,
      reason: `Subscription is ${subscription.status} — access denied.`,
    };
  }

  const config = PLAN_CONFIGS[subscription.plan];
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
 */
export function evaluateUserLimit(
  subscription: Subscription,
  currentMemberCount: number,
): EntitlementDecision {
  if (!isSubscriptionUsable(subscription.status)) {
    return { allowed: false, reason: `Subscription is ${subscription.status}.` };
  }

  const config = PLAN_CONFIGS[subscription.plan];
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
 */
export function evaluatePlaceLimit(
  subscription: Subscription,
  currentPlaceCount: number,
): EntitlementDecision {
  if (!isSubscriptionUsable(subscription.status)) {
    return { allowed: false, reason: `Subscription is ${subscription.status}.` };
  }

  const config = PLAN_CONFIGS[subscription.plan];
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
 */
export function evaluateOfferingLimit(
  subscription: Subscription,
  currentOfferingCount: number,
): EntitlementDecision {
  if (!isSubscriptionUsable(subscription.status)) {
    return { allowed: false, reason: `Subscription is ${subscription.status}.` };
  }

  const config = PLAN_CONFIGS[subscription.plan];
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
 */
export function evaluateBrandingRights(subscription: Subscription): EntitlementDecision {
  if (!isSubscriptionUsable(subscription.status)) {
    return { allowed: false, reason: `Subscription is ${subscription.status}.` };
  }
  const config = PLAN_CONFIGS[subscription.plan];
  return config.brandingRights
    ? { allowed: true }
    : { allowed: false, reason: `Plan '${subscription.plan}' does not include branding rights.` };
}
