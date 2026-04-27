/**
 * @webwaka/wakapage-blocks — WakaPage page-level types.
 *
 * Phase 0 foundation (ADR-0041).
 * The wakapage_pages table (Phase 1 migration) stores these fields.
 */

export type PagePublicationState = 'draft' | 'published' | 'unpublished' | 'archived';

export type PageSlugSource = 'custom' | 'derived_from_entity' | 'derived_from_display_name';

/**
 * WakaPage — a tenant's smart profile public page.
 * One page per workspace (MVP). Multi-page support is Phase 2+.
 *
 * IMPORTANT: slug does NOT come from profiles.slug (that column does not exist).
 * Phase 1 must add a slug column to wakapage_pages (new table, Phase 1 migration).
 */
export interface WakaPage {
  id: string;
  tenantId: string;
  workspaceId: string;
  /** FK to profiles.id — the identity anchor for this page */
  profileId: string;
  slug: string;
  slugSource: PageSlugSource;
  publicationState: PagePublicationState;
  /** FK to template_installations.id — optional; falls back to template_render_overrides then niche template */
  templateInstallationId: string | null;
  /** Custom page title (SEO). Defaults to profiles.display_name if null. */
  title: string | null;
  /** Meta description (SEO). Max 160 chars. */
  metaDescription: string | null;
  /** OG image URL */
  ogImageUrl: string | null;
  /** Whether analytics tracking is enabled on this page */
  analyticsEnabled: boolean;
  /** Custom CSS variables (JSON). Applied after theme tokens. */
  customThemeJson: string | null;
  createdAt: number;
  updatedAt: number;
}

/**
 * Lightweight page summary for listing endpoints.
 */
export interface WakaPageSummary {
  id: string;
  workspaceId: string;
  slug: string;
  title: string | null;
  publicationState: PagePublicationState;
  profileId: string;
  updatedAt: number;
}
