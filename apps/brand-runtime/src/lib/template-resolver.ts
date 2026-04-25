/**
 * Template resolver — marketplace-driven render dispatch for Pillar 2.
 *
 * Queries template_installations + template_registry + template_render_overrides
 * to find the active website template installed for a given tenant, then returns
 * the matching built-in WebsiteTemplateContract implementation.
 *
 * Architecture (post Emergent Pillar-2 Audit 2026-04-25):
 *   1. brand-runtime route handler calls resolveTemplate(tenantId, db, pageType?)
 *   2. This module first looks for a per-page-type override in
 *      template_render_overrides (migration 0228) — these are tenant-scoped
 *      decisions to use a different template (or platform-default) for one page.
 *   3. If no per-page override exists, it falls back to the workspace-level
 *      install in template_installations (status='active', most recent first).
 *   4. The resolved slug is matched against BUILT_IN_TEMPLATES.
 *   5. If an override slug is the reserved sentinel 'platform-default',
 *      resolveTemplate returns null so the caller renders the platform fallback.
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

import { brandedHomeBody } from '../templates/branded-home.js';
import { aboutPageBody } from '../templates/about.js';
import { servicesPageBody } from '../templates/services.js';
import { contactPageBody } from '../templates/contact.js';
import { restaurantGeneralEateryTemplate } from '../templates/niches/restaurant/general-eatery.js';
import { soleTraderArtisanCatalogueTemplate } from '../templates/niches/sole-trader/artisan-catalogue.js';
import { creatorPersonalBrandTemplate } from '../templates/niches/creator/personal-brand.js';
import { professionalPracticeSiteTemplate } from '../templates/niches/professional/practice-site.js';
import { churchFaithCommunityTemplate } from '../templates/niches/church/faith-community.js';
import type { WebsiteRenderContext } from '@webwaka/verticals';

/**
 * Reserved sentinel slug meaning: ignore the workspace install and render the
 * platform fallback functions for this page. Stored in template_render_overrides.
 */
export const PLATFORM_DEFAULT_SLUG = 'platform-default';

/**
 * 'default-website' — the platform default website template.
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
  ['restaurant-general-eatery', restaurantGeneralEateryTemplate],
  ['sole-trader-artisan-catalogue', soleTraderArtisanCatalogueTemplate],
  ['creator-personal-brand', creatorPersonalBrandTemplate],
  ['professional-practice-site', professionalPracticeSiteTemplate],
  ['church-faith-community', churchFaithCommunityTemplate],
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

interface OverrideRow {
  override_template_slug: string;
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
 * Resolution order (T3 — tenant_id predicate everywhere):
 *   1. template_render_overrides (per-page-type tenant override)
 *      • If override_template_slug = 'platform-default' → return null
 *        (caller renders platform fallback functions)
 *      • Else use that slug.
 *   2. template_installations (workspace-level active install, most recent)
 *      • Joined with template_registry where status='approved' and
 *        template_type='website'.
 *   3. No active install → return null (platform fallback).
 *
 * @param tenantId  T3: always pass the resolved tenantId, never user-supplied slug
 * @param db        D1 database binding from the Worker Env
 * @param pageType  Optional page type — when provided, per-page override is consulted
 * @returns         Active template contract, or null for default fallback
 */
export async function resolveTemplate(
  tenantId: string,
  db: D1Like,
  pageType?: WebsitePageType,
): Promise<WebsiteTemplateContract | null> {
  try {
    // Step 1 — per-page override (P0 fix: 0228 was dead code before this call).
    if (pageType) {
      try {
        const override = await db
          .prepare(
            `SELECT override_template_slug
             FROM template_render_overrides
             WHERE tenant_id = ? AND page_type = ?
             LIMIT 1`,
          )
          .bind(tenantId, pageType)
          .first<OverrideRow>();

        if (override?.override_template_slug) {
          if (override.override_template_slug === PLATFORM_DEFAULT_SLUG) {
            // Tenant explicitly wants platform fallback for this page.
            return null;
          }
          const overrideContract = BUILT_IN_TEMPLATES.get(override.override_template_slug);
          if (overrideContract) return overrideContract;
          // Unknown slug in override — log and fall through to workspace install.
          console.warn(
            `[template-resolver] Unknown override slug '${override.override_template_slug}' for tenant ${tenantId} page=${pageType} — falling through to workspace install`,
          );
        }
      } catch (err) {
        // Migration 0228 might not be applied yet on this env — non-fatal.
        const msg = err instanceof Error ? err.message : '';
        if (!msg.includes('no such table')) {
          console.warn('[template-resolver] override lookup error (non-fatal):', err);
        }
      }
    }

    // Step 2 — workspace-level active install. ORDER BY installed_at DESC so a
    // tenant who reinstalls or switches templates deterministically gets the
    // most-recent decision (closes the previously-arbitrary LIMIT 1 ordering).
    const row = await db
      .prepare(
        `SELECT tr.slug AS template_slug, ti.template_version, ti.config_json
         FROM template_installations ti
         JOIN template_registry tr ON tr.id = ti.template_id
         WHERE ti.tenant_id = ?
           AND ti.status = 'active'
           AND tr.template_type = 'website'
           AND tr.status = 'approved'
         ORDER BY ti.installed_at DESC
         LIMIT 1`,
      )
      .bind(tenantId)
      .first<ActiveInstallRow>();

    if (!row) return null;

    const contract = BUILT_IN_TEMPLATES.get(row.template_slug);
    if (!contract) {
      console.warn(
        `[template-resolver] Template slug "${row.template_slug}" installed for tenant ${tenantId} ` +
        `is not in BUILT_IN_TEMPLATES — falling back to default render. ` +
        `Add it to BUILT_IN_TEMPLATES in apps/brand-runtime/src/lib/template-resolver.ts`,
      );
      return null;
    }

    return contract;
  } catch (err) {
    console.error('[template-resolver] DB error resolving template:', err);
    return null;
  }
}

/**
 * Check whether a given page type is supported by the resolved template.
 */
export function templateSupportsPage(
  contract: WebsiteTemplateContract,
  pageType: WebsitePageType,
): boolean {
  return contract.pages.includes(pageType);
}

/**
 * Public list of slugs registered as built-in templates. Exposed so admin/
 * moderation surfaces can validate that an override slug is loadable before
 * persisting it.
 */
export function listBuiltInTemplateSlugs(): string[] {
  return Array.from(BUILT_IN_TEMPLATES.keys());
}

export type { WebsiteTemplateContract, WebsiteRenderContext, WebsitePageType };
