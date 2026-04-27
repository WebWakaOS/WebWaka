/**
 * Entitlement guards — throw on denial, pass on allowed.
 * (entitlement-model.md — T5: feature access gated by entitlement check)
 *
 * Use guards in route handlers and service layer functions.
 * Use evaluate* functions in UI and telemetry contexts where you need the decision without throwing.
 */

import type { PlatformLayer, EntitlementContext } from '@webwaka/types';
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
  const config = PLAN_CONFIGS[ctx.subscriptionPlan];
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
  const config = PLAN_CONFIGS[ctx.subscriptionPlan];
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
  const config = PLAN_CONFIGS[ctx.subscriptionPlan];
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
  const config = PLAN_CONFIGS[ctx.subscriptionPlan];
  if (!config.sensitiveSectorRights) {
    throw new EntitlementError(
      `Access denied: plan '${ctx.subscriptionPlan}' does not include sensitive sector access. Enterprise plan required.`,
    );
  }
}

/**
 * Guard: workspace must have WakaPage public page rights.
 * Required to activate a WakaPage smart profile page.
 * Available from: starter and above.
 * (ADR-0041 — WakaPage Phase 0 entitlement decision)
 */
export function requireWakaPageAccess(ctx: EntitlementContext): void {
  const config = PLAN_CONFIGS[ctx.subscriptionPlan];
  if (!config.wakaPagePublicPage) {
    throw new EntitlementError(
      `Access denied: plan '${ctx.subscriptionPlan}' does not include WakaPage. Upgrade to Starter or above.`,
    );
  }
}

/**
 * Evaluate (non-throwing) whether the workspace has WakaPage public page rights.
 * Use in UI and telemetry contexts where you need the decision without throwing.
 */
export function evaluateWakaPageAccess(ctx: EntitlementContext): boolean {
  return PLAN_CONFIGS[ctx.subscriptionPlan].wakaPagePublicPage;
}

/**
 * Guard: workspace must have WakaPage analytics rights.
 * Required to access the WakaPage analytics dashboard.
 * Available from: growth and above.
 * (ADR-0041 — WakaPage Phase 0 entitlement decision)
 */
export function requireWakaPageAnalytics(ctx: EntitlementContext): void {
  const config = PLAN_CONFIGS[ctx.subscriptionPlan];
  if (!config.wakaPageAnalytics) {
    throw new EntitlementError(
      `Access denied: plan '${ctx.subscriptionPlan}' does not include WakaPage Analytics. Upgrade to Growth or above.`,
    );
  }
}

/**
 * Evaluate (non-throwing) whether the workspace has WakaPage analytics rights.
 */
export function evaluateWakaPageAnalytics(ctx: EntitlementContext): boolean {
  return PLAN_CONFIGS[ctx.subscriptionPlan].wakaPageAnalytics;
}

/**
 * Guard: user must be in an eligible tenant to use HandyLife Wallet.
 * Eligibility is governed by the WALLET_KV allowlist (wallet:eligible_tenants).
 * This is a lightweight entitlement check — the full KV-based check happens
 * inside the wallet route handlers via assertTenantEligible().
 *
 * Use this guard in non-wallet routes that need to check wallet access status
 * without loading the WALLET_KV binding (e.g., dashboard permission checks).
 *
 * Phase 1: HandyLife-only (tenant_id = 'handylife').
 * Phase 2+: Additional tenants added via PATCH /platform-admin/wallets/feature-flags.
 */
export function requireWalletEntitlement(
  ctx: EntitlementContext,
  eligibleTenantIds: string[],
): void {
  const isActive =
    ctx.subscriptionStatus === SubscriptionStatus.Active ||
    ctx.subscriptionStatus === SubscriptionStatus.Trialing;

  if (!isActive) {
    throw new EntitlementError(
      `Wallet access denied: subscription is ${ctx.subscriptionStatus}.`,
    );
  }

  const tenantId = (ctx as EntitlementContext & { tenantId?: string }).tenantId;
  if (tenantId && !eligibleTenantIds.includes(tenantId)) {
    throw new EntitlementError(
      'Wallet access denied: your account is not yet eligible for HandyLife Wallet.',
    );
  }
}
