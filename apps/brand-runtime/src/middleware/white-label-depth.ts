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
 * handlers use it to restrict which theme fields are applied.
 *
 * P1 audit fix (Emergent Pillar-2 audit 2026-04-25):
 *   sub_partners lookup failures must NOT silently fail-open at depth=2 — that
 *   would leak full custom branding for restricted sub-partner tenants.
 *
 *   New policy:
 *     • If the sub_partners check itself errors → fail-closed at depth=1
 *       (preserves identity but strips custom domain/email branding).
 *     • If a sub-partner row IS found and the entitlement lookup errors →
 *       fail-closed at depth=1 too (we know they are restricted; we just lost
 *       the exact value).
 *     • If no sub-partner row is found → unconstrained depth=2 (genuine fully-
 *       independent tenant).
 *
 * Platform Invariants: T3 (tenant scoping), T5 (subscription-gated)
 * M11 — Partner & White-Label Phase 3 (P5)
 */

import type { Context, Next } from 'hono';
import type { Env, Variables } from '../env.js';

/** Maximum depth when no partner constraint exists. */
const UNCONSTRAINED_DEPTH = 2;
/** Fail-closed depth when DB lookup fails for a tenant we already know is restricted. */
const FAIL_CLOSED_DEPTH = 1;

export async function whiteLabelDepthMiddleware(
  c: Context<{ Bindings: Env; Variables: Variables }>,
  next: Next,
): Promise<Response | void> {
  const tenantId = c.get('tenantId');

  if (!tenantId) {
    // Tenant not resolved yet — skip enforcement
    return next();
  }

  const db = c.env.DB;

  // Step 1: Find the sub-partner row (if any).
  let subPartner: { partner_id: string } | null = null;
  let subPartnerLookupFailed = false;
  try {
    subPartner = await db
      .prepare(
        `SELECT partner_id FROM sub_partners
         WHERE tenant_id = ? AND status = 'active'
         LIMIT 1`,
      )
      .bind(tenantId)
      .first<{ partner_id: string }>();
  } catch (err) {
    subPartnerLookupFailed = true;
    console.warn('[white-label-depth] sub_partners lookup failed — failing closed:', err);
  }

  if (subPartnerLookupFailed) {
    // P1 fix: cannot determine if tenant is restricted → fail-closed.
    c.set('whiteLabelDepth', FAIL_CLOSED_DEPTH);
    return next();
  }

  if (!subPartner) {
    // Genuinely unconstrained tenant (no partner relationship).
    c.set('whiteLabelDepth', UNCONSTRAINED_DEPTH);
    return next();
  }

  // Step 2: Look up the partner's entitlement.
  try {
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
    // P1 fix: we know this tenant IS a sub-partner tenant; failing open at depth=2
    // would leak custom branding the partner may not have granted. Fail closed.
    console.warn('[white-label-depth] partner_entitlements lookup failed — failing closed:', err);
    c.set('whiteLabelDepth', FAIL_CLOSED_DEPTH);
  }

  return next();
}

