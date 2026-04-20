/**
 * @webwaka/notifications — Attribution enforcement (N-117, Phase 8).
 *
 * Per docs/governance/white-label-policy.md Rule 5:
 *   "WebWaka attribution rules are defined per plan tier and may not be removed
 *    below the minimum required attribution level."
 *
 * Enforcement matrix:
 *   free       → ALWAYS requires attribution (hardcoded — cannot be removed)
 *   starter    → ALWAYS requires attribution (hardcoded — cannot be removed)
 *   growth     → ALWAYS requires attribution (hardcoded — cannot be removed)
 *   business   → ALWAYS requires attribution (hardcoded — cannot be removed)
 *   enterprise → Respects the DB flag (TenantTheme.requiresWebwakaAttribution)
 *   unknown    → Defaults to requiring attribution (safe fallback)
 *
 * The 'enterprise' tier is the ONLY tier where the "Powered by WebWaka"
 * attribution may be suppressed, and only when the tenant has explicitly
 * set requires_attribution=0 in their branding configuration.
 *
 * This function is the single enforcement gate between the DB flag and the
 * rendered email footer. Every email render path must call this function rather
 * than reading TenantTheme.requiresWebwakaAttribution directly.
 *
 * Guardrails:
 *   G17 — Attribution injected only when requiresWebwakaAttribution=true.
 *           This function enforces WHEN that flag may be false.
 */

// ---------------------------------------------------------------------------
// Plan tier constant — plans that may suppress attribution
// ---------------------------------------------------------------------------

/**
 * Only enterprise-tier tenants are permitted to suppress WebWaka attribution.
 * All other plan tiers must show the "Powered by WebWaka" footer.
 */
const ATTRIBUTION_SUPPRESSION_ELIGIBLE_PLANS = new Set<string>(['enterprise']);

// ---------------------------------------------------------------------------
// resolveEffectiveAttribution — N-117 enforcement gate
// ---------------------------------------------------------------------------

/**
 * Resolve whether the "Powered by WebWaka" attribution must appear in this email.
 *
 * @param planTier  - The tenant's current plan tier ('free'|'starter'|'growth'|'business'|'enterprise')
 *                    If null or undefined, defaults to requiring attribution.
 * @param dbFlag    - The TenantTheme.requiresWebwakaAttribution value from the DB.
 *                    Only consulted for enterprise-tier tenants; ignored otherwise.
 * @returns true if the "Powered by WebWaka" footer MUST be shown; false if it may be omitted.
 *
 * @example
 *   resolveEffectiveAttribution('free', false)       // → true  (forced on)
 *   resolveEffectiveAttribution('starter', false)    // → true  (forced on)
 *   resolveEffectiveAttribution('growth', false)     // → true  (forced on)
 *   resolveEffectiveAttribution('business', false)   // → true  (forced on)
 *   resolveEffectiveAttribution('enterprise', false) // → false (DB flag respected)
 *   resolveEffectiveAttribution('enterprise', true)  // → true  (DB says show it)
 *   resolveEffectiveAttribution(undefined, false)    // → true  (unknown → safe default)
 */
export function resolveEffectiveAttribution(
  planTier: string | null | undefined,
  dbFlag: boolean,
): boolean {
  if (!planTier || !ATTRIBUTION_SUPPRESSION_ELIGIBLE_PLANS.has(planTier)) {
    // Non-enterprise plans: attribution is mandatory regardless of DB flag.
    return true;
  }

  // Enterprise: respect the DB flag (operator may have purchased white-label rights).
  return dbFlag;
}

// ---------------------------------------------------------------------------
// isAttributionSuppressible — helper for entitlement checks
// ---------------------------------------------------------------------------

/**
 * Returns true if the plan tier is permitted to suppress WebWaka attribution.
 * Used by UI entitlement checks and brand-runtime settings pages.
 */
export function isAttributionSuppressible(planTier: string | null | undefined): boolean {
  return !!planTier && ATTRIBUTION_SUPPRESSION_ELIGIBLE_PLANS.has(planTier);
}
