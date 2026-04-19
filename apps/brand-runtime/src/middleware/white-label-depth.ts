/**
 * ENT-004: White-label depth enforcement middleware for brand-runtime.
 *
 * After tenant resolution, checks if the tenant is a sub-tenant of a partner
 * and enforces the partner's max white_label_depth entitlement grant.
 *
 * Depth semantics (white-label-policy.md):
 *   0 — No white-labelling (partner has not enabled it)
 *   1 — Basic: custom logo + brand colours only
 *   2 — Full: custom domain, email branding, all visual elements
 *
 * Enforcement is a soft cap — the depth is stored on context and downstream
 * handlers use it to restrict which theme fields are applied.  Non-fatal:
 * if the DB lookup fails the middleware logs a warning and continues at
 * maximum depth (fail-open, avoids service disruption).
 *
 * Platform Invariants: T3 (tenant scoping), T5 (subscription-gated)
 * M11 — Partner & White-Label Phase 3 (P5)
 */

import type { Context, Next } from 'hono';
import type { Env, Variables } from '../env.js';

/**
 * Maximum depth to apply when no partner constraint exists.
 * Tenants without a partner relationship get full white-label depth.
 */
const UNCONSTRAINED_DEPTH = 2;

export async function whiteLabelDepthMiddleware(
  c: Context<{ Bindings: Env; Variables: Variables }>,
  next: Next,
): Promise<Response | void> {
  const tenantId = c.get('tenantId');

  if (!tenantId) {
    // Tenant not resolved yet — skip enforcement
    return next();
  }

  try {
    const db = c.env.DB;

    // Find the partner (if any) for this tenant via sub_partners
    const subPartner = await db
      .prepare(
        `SELECT partner_id FROM sub_partners
         WHERE tenant_id = ? AND status = 'active'
         LIMIT 1`,
      )
      .bind(tenantId)
      .first<{ partner_id: string }>();

    if (!subPartner) {
      // Not a sub-tenant — no partner constraint, full depth
      c.set('whiteLabelDepth', UNCONSTRAINED_DEPTH);
      return next();
    }

    // Get the partner's white_label_depth entitlement
    const entitlement = await db
      .prepare(
        `SELECT value FROM partner_entitlements
         WHERE partner_id = ? AND dimension = 'white_label_depth'`,
      )
      .bind(subPartner.partner_id)
      .first<{ value: string }>();

    if (!entitlement) {
      // Partner has no depth grant — default to depth 1 (basic)
      c.set('whiteLabelDepth', 1);
      return next();
    }

    const allowedDepth = parseInt(entitlement.value, 10);

    if (isNaN(allowedDepth) || allowedDepth < 0 || allowedDepth > 2) {
      console.warn(
        `[white-label-depth] Invalid depth value "${String(entitlement.value)}" for partner ${String(subPartner.partner_id)} — defaulting to 1`,
      );
      c.set('whiteLabelDepth', 1);
      return next();
    }

    c.set('whiteLabelDepth', allowedDepth);
  } catch (err) {
    // Fail-open: log and continue at maximum depth to avoid service disruption
    console.warn('[white-label-depth] DB lookup failed, defaulting to full depth:', err);
    c.set('whiteLabelDepth', UNCONSTRAINED_DEPTH);
  }

  return next();
}
