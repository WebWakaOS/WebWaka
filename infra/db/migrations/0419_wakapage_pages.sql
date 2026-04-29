-- Migration: 0419_wakapage_pages
-- Phase 1 — WakaPage entities: canonical page entity.
--
-- ADR-0041 D3: WakaPage slugs live here, NOT on profiles.slug.
-- ADR-0041 D5: One page per workspace (MVP). Multi-page is Phase 2+.
--
-- Platform Invariants:
--   T3 — tenant_id required; every query MUST predicate on tenant_id
--   G23 — additive only
--   P9  — no monetary fields
--
-- Dependencies: profiles (0005), workspaces (0001/early)

CREATE TABLE IF NOT EXISTS wakapage_pages (
  id                       TEXT    NOT NULL PRIMARY KEY,
  tenant_id                TEXT    NOT NULL,
  workspace_id             TEXT    NOT NULL,
  profile_id               TEXT    NOT NULL
                           REFERENCES profiles(id),
  slug                     TEXT    NOT NULL,
  slug_source              TEXT    NOT NULL DEFAULT 'derived_from_display_name'
                           CHECK (slug_source IN ('custom','derived_from_entity','derived_from_display_name')),
  publication_state        TEXT    NOT NULL DEFAULT 'draft'
                           CHECK (publication_state IN ('draft','published','unpublished','archived')),
  title                    TEXT,
  meta_description         TEXT    CHECK (meta_description IS NULL OR length(meta_description) <= 160),
  og_image_url             TEXT,
  analytics_enabled        INTEGER NOT NULL DEFAULT 1
                           CHECK (analytics_enabled IN (0,1)),
  template_installation_id TEXT,
  custom_theme_json        TEXT,
  published_at             INTEGER,
  scheduled_publish_at     INTEGER,
  created_at               INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at               INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (tenant_id, workspace_id),    -- MVP: one page per workspace
  UNIQUE (tenant_id, slug)             -- slugs unique per tenant namespace
);

CREATE INDEX IF NOT EXISTS idx_wakapage_pages_tenant_workspace
  ON wakapage_pages(tenant_id, workspace_id);

CREATE INDEX IF NOT EXISTS idx_wakapage_pages_tenant_slug
  ON wakapage_pages(tenant_id, slug);

CREATE INDEX IF NOT EXISTS idx_wakapage_pages_profile_id
  ON wakapage_pages(profile_id);

CREATE INDEX IF NOT EXISTS idx_wakapage_pages_publication_state
  ON wakapage_pages(tenant_id, publication_state);
