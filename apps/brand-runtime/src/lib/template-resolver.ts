/**
 * Template resolver — marketplace-driven render dispatch for Pillar 2.
 *
 * Queries template_installations + template_registry to find the active
 * website template installed for a given tenant, then returns the matching
 * built-in WebsiteTemplateContract implementation.
 *
 * Architecture:
 *   1. brand-runtime route handler calls resolveTemplate(tenantId, db)
 *   2. This module looks up the active installation → gets template slug
 *   3. Slug is matched against the BUILT_IN_TEMPLATES registry
 *   4. If matched → that contract is returned (marketplace-driven render)
 *   5. If no active install OR unknown slug → null returned (caller uses
 *      hardcoded fallback templates — preserves existing tenant behaviour)
 *
 * Phase 1 limitation: only built-in templates are supported. Third-party /
 * marketplace templates loaded from external code require sandboxed execution
 * (planned for Phase 2). The manifest render_entrypoint field is reserved for
 * this future capability.
 *
 * Platform Invariants:
 *   T2 — TypeScript strict
 *   T3 — tenant_id predicate on every DB query
 *   P1 — single resolver; no duplicated dispatch logic in individual routes
 */

import type { WebsiteTemplateContract, WebsitePageType } from '@webwaka/verticals';

// ---------------------------------------------------------------------------
// Built-in template implementations
// ---------------------------------------------------------------------------
// Each built-in template implements WebsiteTemplateContract and is imported
// statically. As new template variants are added to the marketplace they are
// registered here by slug.
//
// The 'default-website' template composes from the existing per-page functions
// in apps/brand-runtime/src/templates/, making them the canonical fallback.
// ---------------------------------------------------------------------------

import { brandedHomeBody } from '../templates/branded-home.js';
import { aboutPageBody } from '../templates/about.js';
import { servicesPageBody } from '../templates/services.js';
import { contactPageBody } from '../templates/contact.js';
import type { WebsiteRenderContext } from '@webwaka/verticals';

/**
 * 'default-website' — the platform default website template.
 * Composes the existing branded-home, about, services, and contact page functions.
 * This is the fallback used for any tenant with no active marketplace install.
 */
const defaultWebsiteTemplate: WebsiteTemplateContract = {
  slug: 'default-website',
  version: '1.0.0',
  pages: ['home', 'about', 'services', 'contact'],

  renderPage(ctx: WebsiteRenderContext): string {
    switch (ctx.pageType) {
      case 'home': {
        const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;
        return brandedHomeBody({
          displayName: ctx.displayName,
          tagline: (ctx.data.tagline as string | null) ?? null,
          description: (ctx.data.description as string | null) ?? null,
          primaryColor: ctx.primaryColor,
          logoUrl: ctx.logoUrl,
          ctaLabel: 'View Our Services',
          ctaUrl: '/services',
          offerings,
        });
      }
      case 'about': {
        return aboutPageBody({
          displayName: ctx.displayName,
          description: (ctx.data.description as string | null) ?? null,
          logoUrl: ctx.logoUrl,
          primaryColor: ctx.primaryColor,
          category: (ctx.data.category as string | null) ?? null,
          placeName: (ctx.data.placeName as string | null) ?? null,
          phone: (ctx.data.phone as string | null) ?? null,
          website: (ctx.data.website as string | null) ?? null,
        });
      }
      case 'services': {
        const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;
        return servicesPageBody({
          displayName: ctx.displayName,
          offerings,
        });
      }
      case 'contact': {
        return contactPageBody({
          displayName: ctx.displayName,
          phone: (ctx.data.phone as string | null) ?? null,
          email: (ctx.data.email as string | null) ?? null,
          placeName: (ctx.data.placeName as string | null) ?? null,
          tenantId: ctx.tenantId,
        });
      }
      default:
        return `<p style="text-align:center;padding:4rem 1rem;color:var(--ww-text-muted)">Page not found.</p>`;
    }
  },
};

/**
 * Registry of all built-in WebsiteTemplateContract implementations, keyed by slug.
 * Add new built-in templates here as they are developed.
 */
const BUILT_IN_TEMPLATES: Map<string, WebsiteTemplateContract> = new Map([
  ['default-website', defaultWebsiteTemplate],
]);

// ---------------------------------------------------------------------------
// DB types
// ---------------------------------------------------------------------------

interface D1Like {
  prepare(query: string): {
    bind(...args: unknown[]): {
      first<T>(): Promise<T | null>;
    };
  };
}

interface ActiveInstallRow {
  template_slug: string;
  template_version: string;
  config_json: string;
}

// ---------------------------------------------------------------------------
// resolveTemplate — main entry point for brand-runtime route handlers
// ---------------------------------------------------------------------------

/**
 * Resolve the active WebsiteTemplateContract for a tenant.
 *
 * Returns null if:
 *   - The tenant has no active template_installation
 *   - The installed template slug is not in BUILT_IN_TEMPLATES (future: dynamic load)
 *
 * Callers should fall back to the hardcoded per-page template functions when
 * null is returned, preserving backward compatibility for all existing tenants.
 *
 * @param tenantId  T3: always pass the resolved tenantId, never user-supplied slug
 * @param db        D1 database binding from the Worker Env
 * @returns         Active template contract, or null for default fallback
 */
export async function resolveTemplate(
  tenantId: string,
  db: D1Like,
): Promise<WebsiteTemplateContract | null> {
  try {
    const row = await db
      .prepare(
        `SELECT tr.slug AS template_slug, ti.template_version, ti.config_json
         FROM template_installations ti
         JOIN template_registry tr ON tr.id = ti.template_id
         WHERE ti.tenant_id = ?
           AND ti.status = 'active'
           AND tr.template_type = 'website'
           AND tr.status = 'approved'
         LIMIT 1`,
      )
      .bind(tenantId)
      .first<ActiveInstallRow>();

    if (!row) return null;

    const contract = BUILT_IN_TEMPLATES.get(row.template_slug);
    if (!contract) {
      // Template slug is in the registry but not yet built-in; log and fall back.
      console.warn(
        `[template-resolver] Template slug "${row.template_slug}" installed for tenant ${tenantId} ` +
        `is not in BUILT_IN_TEMPLATES — falling back to default render. ` +
        `Add it to BUILT_IN_TEMPLATES in apps/brand-runtime/src/lib/template-resolver.ts`,
      );
      return null;
    }

    return contract;
  } catch (err) {
    // Non-fatal: log and return null so the fallback render path is used.
    console.error('[template-resolver] DB error resolving template:', err);
    return null;
  }
}

/**
 * Check whether a given page type is supported by the resolved template.
 * Used by route handlers to decide whether to delegate to the marketplace
 * template or fall through to the per-page hardcoded render function.
 */
export function templateSupportsPage(
  contract: WebsiteTemplateContract,
  pageType: WebsitePageType,
): boolean {
  return contract.pages.includes(pageType);
}

export type { WebsiteTemplateContract, WebsiteRenderContext, WebsitePageType };
