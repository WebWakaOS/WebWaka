/**
 * Entitlement guards — throw on denial, pass on allowed.
 * (entitlement-model.md — T5: feature access gated by entitlement check)
 *
 * Use guards in route handlers and service layer functions.
 * Use evaluate* functions in UI and telemetry contexts where you need the decision without throwing.
 *
 * DB-aware overloads (T006 — Entitlement Compatibility Bridge):
 * Every plan-reading guard accepts an optional `resolvedEntitlements` parameter.
 * When provided (from EntitlementEngine.resolveForWorkspace()), DB values take
 * precedence over the static PLAN_CONFIGS fallback. Existing callers without
 * the parameter continue to work unchanged — zero breaking changes.
 */

import type { PlatformLayer, EntitlementContext } from '@webwaka/types';
import { SubscriptionStatus } from '@webwaka/types';
import { PLAN_CONFIGS } from './plan-config.js';
import type { ResolvedEntitlements } from './evaluate.js';

// ---------------------------------------------------------------------------
// Internal config resolver — mirrors evaluate.ts without circular import
// Priority: DB-resolved overrides → PLAN_CONFIGS[plan] → PLAN_CONFIGS.free
// ---------------------------------------------------------------------------

function resolveConfigFor(plan: string, resolved?: ResolvedEntitlements) {
  const base = (PLAN_CONFIGS as Record<string, typeof PLAN_CONFIGS.free>)[plan] ?? PLAN_CONFIGS.free;
  if (!resolved) return base;

  return {
    ...base,
    ...(resolved.maxUsers          !== undefined && { maxUsers:          resolved.maxUsers }),
    ...(resolved.maxPlaces         !== undefined && { maxPlaces:         resolved.maxPlaces }),
    ...(resolved.maxOfferings      !== undefined && { maxOfferings:      resolved.maxOfferings }),
    ...(resolved.layers            !== undefined && { layers:            resolved.layers }),
    ...(resolved.brandingRights    !== undefined && { brandingRights:    resolved.brandingRights }),
    ...(resolved.whiteLabelDepth   !== undefined && { whiteLabelDepth:   resolved.whiteLabelDepth }),
    ...(resolved.delegationRights  !== undefined && { delegationRights:  resolved.delegationRights }),
    ...(resolved.aiRights          !== undefined && { aiRights:          resolved.aiRights }),
    ...(resolved.sensitiveSectorRights !== undefined && { sensitiveSectorRights: resolved.sensitiveSectorRights }),
    ...(resolved.wakaPagePublicPage !== undefined && { wakaPagePublicPage: resolved.wakaPagePublicPage }),
    ...(resolved.wakaPageAnalytics  !== undefined && { wakaPageAnalytics:  resolved.wakaPageAnalytics }),
    ...(resolved.groupsEnabled      !== undefined && { groupsEnabled:      resolved.groupsEnabled }),
    ...(resolved.valueMovementEnabled !== undefined && { valueMovementEnabled: resolved.valueMovementEnabled }),
  };
}

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
 *
 * Note: this guard reads `ctx.activeLayers` (already resolved by the middleware
 * that built the EntitlementContext), so it does NOT need resolvedEntitlements.
 * For DB-first layer evaluation, pass the resolved layers into EntitlementContext
 * before calling this guard.
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
 *
 * @param ctx - Entitlement context (subscriptionPlan, subscriptionStatus, activeLayers).
 * @param resolvedEntitlements - Optional DB-resolved entitlements from EntitlementEngine.
 *   When provided, `brandingRights` from the DB takes precedence over PLAN_CONFIGS.
 */
export function requireBrandingRights(
  ctx: EntitlementContext,
  resolvedEntitlements?: ResolvedEntitlements,
): void {
  const config = resolveConfigFor(ctx.subscriptionPlan, resolvedEntitlements);
  if (!config.brandingRights) {
    throw new EntitlementError(
      `Access denied: plan '${ctx.subscriptionPlan}' does not include branding rights. Upgrade to Starter or above.`,
    );
  }
}

/**
 * Guard: workspace must have delegation rights (create partner sub-workspaces).
 *
 * @param ctx - Entitlement context.
 * @param resolvedEntitlements - Optional DB-resolved entitlements from EntitlementEngine.
 */
export function requireDelegationRights(
  ctx: EntitlementContext,
  resolvedEntitlements?: ResolvedEntitlements,
): void {
  const config = resolveConfigFor(ctx.subscriptionPlan, resolvedEntitlements);
  if (!config.delegationRights) {
    throw new EntitlementError(
      `Access denied: plan '${ctx.subscriptionPlan}' does not include delegation rights. Enterprise plan required.`,
    );
  }
}

/**
 * Guard: workspace must have AI rights.
 *
 * @param ctx - Entitlement context.
 * @param resolvedEntitlements - Optional DB-resolved entitlements from EntitlementEngine.
 */
export function requireAIAccess(
  ctx: EntitlementContext,
  resolvedEntitlements?: ResolvedEntitlements,
): void {
  const config = resolveConfigFor(ctx.subscriptionPlan, resolvedEntitlements);
  if (!config.aiRights) {
    throw new EntitlementError(
      `Access denied: plan '${ctx.subscriptionPlan}' does not include AI access. Upgrade to Growth or above.`,
    );
  }
}

/**
 * Guard: workspace must have sensitive-sector rights.
 * Required for political, medical, and other regulated verticals.
 *
 * @param ctx - Entitlement context.
 * @param resolvedEntitlements - Optional DB-resolved entitlements from EntitlementEngine.
 */
export function requireSensitiveSectorAccess(
  ctx: EntitlementContext,
  resolvedEntitlements?: ResolvedEntitlements,
): void {
  const config = resolveConfigFor(ctx.subscriptionPlan, resolvedEntitlements);
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
 *
 * @param ctx - Entitlement context.
 * @param resolvedEntitlements - Optional DB-resolved entitlements from EntitlementEngine.
 */
export function requireWakaPageAccess(
  ctx: EntitlementContext,
  resolvedEntitlements?: ResolvedEntitlements,
): void {
  const config = resolveConfigFor(ctx.subscriptionPlan, resolvedEntitlements);
  if (!config.wakaPagePublicPage) {
    throw new EntitlementError(
      `Access denied: plan '${ctx.subscriptionPlan}' does not include WakaPage. Upgrade to Starter or above.`,
    );
  }
}

/**
 * Evaluate (non-throwing) whether the workspace has WakaPage public page rights.
 * Use in UI and telemetry contexts where you need the decision without throwing.
 *
 * @param ctx - Entitlement context.
 * @param resolvedEntitlements - Optional DB-resolved entitlements from EntitlementEngine.
 */
export function evaluateWakaPageAccess(
  ctx: EntitlementContext,
  resolvedEntitlements?: ResolvedEntitlements,
): boolean {
  return resolveConfigFor(ctx.subscriptionPlan, resolvedEntitlements).wakaPagePublicPage;
}

/**
 * Guard: workspace must have WakaPage analytics rights.
 * Required to access the WakaPage analytics dashboard.
 * Available from: growth and above.
 * (ADR-0041 — WakaPage Phase 0 entitlement decision)
 *
 * @param ctx - Entitlement context.
 * @param resolvedEntitlements - Optional DB-resolved entitlements from EntitlementEngine.
 */
export function requireWakaPageAnalytics(
  ctx: EntitlementContext,
  resolvedEntitlements?: ResolvedEntitlements,
): void {
  const config = resolveConfigFor(ctx.subscriptionPlan, resolvedEntitlements);
  if (!config.wakaPageAnalytics) {
    throw new EntitlementError(
      `Access denied: plan '${ctx.subscriptionPlan}' does not include WakaPage Analytics. Upgrade to Growth or above.`,
    );
  }
}

/**
 * Evaluate (non-throwing) whether the workspace has WakaPage analytics rights.
 *
 * @param ctx - Entitlement context.
 * @param resolvedEntitlements - Optional DB-resolved entitlements from EntitlementEngine.
 */
export function evaluateWakaPageAnalytics(
  ctx: EntitlementContext,
  resolvedEntitlements?: ResolvedEntitlements,
): boolean {
  return resolveConfigFor(ctx.subscriptionPlan, resolvedEntitlements).wakaPageAnalytics;
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
 *
 * Note: wallet eligibility is tenant-allowlist-based (not plan-based), so it
 * does NOT use resolvedEntitlements.
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

/**
 * Guard: workspace must have groups enabled.
 *
 * @param ctx - Entitlement context.
 * @param resolvedEntitlements - Optional DB-resolved entitlements from EntitlementEngine.
 */
export function requireGroupsEnabled(
  ctx: EntitlementContext,
  resolvedEntitlements?: ResolvedEntitlements,
): void {
  const config = resolveConfigFor(ctx.subscriptionPlan, resolvedEntitlements);
  if (!config.groupsEnabled) {
    throw new EntitlementError(
      `Access denied: plan '${ctx.subscriptionPlan}' does not include Groups. Upgrade to Starter or above.`,
    );
  }
}

/**
 * Evaluate (non-throwing) whether the workspace has groups enabled.
 *
 * @param ctx - Entitlement context.
 * @param resolvedEntitlements - Optional DB-resolved entitlements from EntitlementEngine.
 */
export function evaluateGroupsEnabled(
  ctx: EntitlementContext,
  resolvedEntitlements?: ResolvedEntitlements,
): boolean {
  return resolveConfigFor(ctx.subscriptionPlan, resolvedEntitlements).groupsEnabled;
}

/**
 * Guard: workspace must have value movement (fundraising/campaigns) enabled.
 *
 * @param ctx - Entitlement context.
 * @param resolvedEntitlements - Optional DB-resolved entitlements from EntitlementEngine.
 */
export function requireValueMovement(
  ctx: EntitlementContext,
  resolvedEntitlements?: ResolvedEntitlements,
): void {
  const config = resolveConfigFor(ctx.subscriptionPlan, resolvedEntitlements);
  if (!config.valueMovementEnabled) {
    throw new EntitlementError(
      `Access denied: plan '${ctx.subscriptionPlan}' does not include Value Movement. Upgrade to Starter or above.`,
    );
  }
}

/**
 * Evaluate (non-throwing) whether the workspace has value movement enabled.
 *
 * @param ctx - Entitlement context.
 * @param resolvedEntitlements - Optional DB-resolved entitlements from EntitlementEngine.
 */
export function evaluateValueMovement(
  ctx: EntitlementContext,
  resolvedEntitlements?: ResolvedEntitlements,
): boolean {
  return resolveConfigFor(ctx.subscriptionPlan, resolvedEntitlements).valueMovementEnabled;
}
