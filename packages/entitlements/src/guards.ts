/**
 * Entitlement guards — throw on denial, pass on allowed.
 * (entitlement-model.md — T5: feature access gated by entitlement check)
 *
 * Use guards in route handlers and service layer functions.
 * Use evaluate* functions in UI and telemetry contexts where you need the decision without throwing.
 */

import type { PlatformLayer, EntitlementContext, SubscriptionPlan } from '@webwaka/types';
import { SubscriptionStatus } from '@webwaka/types';
import { PLAN_CONFIGS } from './plan-config.js';

// ---------------------------------------------------------------------------
// Entitlement error
// ---------------------------------------------------------------------------

export class EntitlementError extends Error {
  readonly statusCode = 403;

  constructor(message: string) {
    super(message);
    this.name = 'EntitlementError';
  }
}

// ---------------------------------------------------------------------------
// Guards (throw EntitlementError on denial)
// ---------------------------------------------------------------------------

/**
 * Guard: workspace subscription must include the requested platform layer.
 * Platform Invariant T5.
 */
export function requireLayerAccess(
  ctx: EntitlementContext,
  layer: PlatformLayer,
): void {
  const isActive = ctx.subscriptionStatus === SubscriptionStatus.Active ||
    ctx.subscriptionStatus === SubscriptionStatus.Trialing;

  if (!isActive) {
    throw new EntitlementError(
      `Access denied: subscription is ${ctx.subscriptionStatus}. Renew to access '${layer}'.`,
    );
  }

  const hasLayer = (ctx.activeLayers as string[]).includes(layer);
  if (!hasLayer) {
    throw new EntitlementError(
      `Access denied: your plan does not include the '${layer}' platform layer.`,
    );
  }
}

/**
 * Guard: workspace subscription must include branding rights.
 */
export function requireBrandingRights(ctx: EntitlementContext): void {
  const config = PLAN_CONFIGS[ctx.subscriptionPlan as SubscriptionPlan];
  if (!config.brandingRights) {
    throw new EntitlementError(
      `Access denied: plan '${ctx.subscriptionPlan}' does not include branding rights. Upgrade to Starter or above.`,
    );
  }
}

/**
 * Guard: workspace must have delegation rights (create partner sub-workspaces).
 */
export function requireDelegationRights(ctx: EntitlementContext): void {
  const config = PLAN_CONFIGS[ctx.subscriptionPlan as SubscriptionPlan];
  if (!config.delegationRights) {
    throw new EntitlementError(
      `Access denied: plan '${ctx.subscriptionPlan}' does not include delegation rights. Enterprise plan required.`,
    );
  }
}

/**
 * Guard: workspace must have AI rights.
 */
export function requireAIAccess(ctx: EntitlementContext): void {
  const config = PLAN_CONFIGS[ctx.subscriptionPlan as SubscriptionPlan];
  if (!config.aiRights) {
    throw new EntitlementError(
      `Access denied: plan '${ctx.subscriptionPlan}' does not include AI access. Upgrade to Growth or above.`,
    );
  }
}

/**
 * Guard: workspace must have sensitive-sector rights.
 * Required for political, medical, and other regulated verticals.
 */
export function requireSensitiveSectorAccess(ctx: EntitlementContext): void {
  const config = PLAN_CONFIGS[ctx.subscriptionPlan as SubscriptionPlan];
  if (!config.sensitiveSectorRights) {
    throw new EntitlementError(
      `Access denied: plan '${ctx.subscriptionPlan}' does not include sensitive sector access. Enterprise plan required.`,
    );
  }
}
