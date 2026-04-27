/**
 * WakaPage public renderer — shared type contracts.
 * (Phase 2 — ADR-0041 D2)
 *
 * These types mirror the D1 schema columns from Phase 1 migrations
 * (0419 wakapage_pages, 0420 wakapage_blocks) and shape the render context
 * passed to every block renderer.
 *
 * Platform Invariants:
 *   T3 — tenant_id present on all DB row types; never sourced from URL params
 *   P9 — price_kobo is the only monetary field; rendered as NGN at template layer
 */

// ---------------------------------------------------------------------------
// D1 row types — match column names from migrations exactly (snake_case)
// ---------------------------------------------------------------------------

export interface WakaPageDbRow {
  id: string;
  tenant_id: string;
  workspace_id: string;
  profile_id: string;
  slug: string;
  slug_source: string;
  publication_state: string;
  title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  analytics_enabled: number;
  custom_theme_json: string | null;
  template_installation_id: string | null;
  published_at: number | null;
  created_at: number;
  updated_at: number;
}

export interface WakaBlockDbRow {
  id: string;
  tenant_id: string;
  page_id: string;
  block_type: string;
  sort_order: number;
  is_visible: number;
  config_json: string;
  created_at: number;
  updated_at: number;
}

export interface WakaProfileDbRow {
  id: string;
  display_name: string;
  avatar_url: string | null;
  headline: string | null;
  content: string | null;
  verification_state: string | null;
  claim_status: string | null;
}

export interface OfferingDbRow {
  id: string;
  name: string;
  description: string | null;
  price_kobo: number | null;
}

export interface BlogPostDbRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: number;
  author_name: string | null;
}

// ---------------------------------------------------------------------------
// Render context — passed to every block renderer function
// ---------------------------------------------------------------------------

/**
 * Context passed to all block renderer functions.
 * Bundles resolved tenant + theme data alongside pre-fetched
 * page-level data that multiple blocks may share (profile, offerings, posts).
 */
export interface RenderContext {
  tenantId: string;
  tenantSlug: string;
  displayName: string;
  primaryColor: string;
  cssVars: string;
  /** The WakaPage DB row being rendered. */
  page: WakaPageDbRow;
  /** Profile anchor for this page — may be null if profile was deleted. */
  profile: WakaProfileDbRow | null;
  /** social_links_json from tenant_branding (0423 migration). */
  socialLinksJson: string | null;
  /** Published offerings for the offerings block. */
  offerings: OfferingDbRow[];
  /** Recent published blog posts for the blog_post block. */
  blogPosts: BlogPostDbRow[];
}
