-- Migration: 0228_template_render_overrides
-- Pillar 2 Architectural Rewrite — marketplace-driven rendering foundation.
--
-- Adds per-page template override capability: a tenant can install a template
-- at the workspace level AND override specific page types with a different
-- built-in template (or the platform default). This completes the marketplace-
-- driven rendering model where template_installations drives brand-runtime.
--
-- Platform Invariants:
--   T3 — tenant_id on every row and every query
--   T2 — referenced by template-resolver.ts (TypeScript strict)
--
-- Depends on:
--   0207_create_template_installations.sql (template_installations table)
--   0206_create_template_registry.sql (template_registry table)

-- template_render_overrides
-- Allows per-page-type template override for a tenant installation.
-- Example: use 'minimal-contact' for the contact page but keep the workspace's
-- installed 'premium-website' for all other pages.
--
-- Null override_template_id = use the workspace default installation.
-- 'platform-default' override_slug = force the platform built-in fallback
--   (i.e. the hardcoded branded-home/about/services/contact functions)
--   regardless of what template is installed at the workspace level.

CREATE TABLE IF NOT EXISTS template_render_overrides (
  id                    TEXT    NOT NULL PRIMARY KEY,
  tenant_id             TEXT    NOT NULL,
  -- The installation this override belongs to (the tenant's workspace-level install)
  installation_id       TEXT    NOT NULL REFERENCES template_installations(id) ON DELETE CASCADE,
  -- Page type being overridden ('home', 'about', 'services', 'contact', 'blog', 'blog-post', 'custom')
  page_type             TEXT    NOT NULL,
  -- Slug of the template to use for this page type (must exist in template_registry)
  -- 'platform-default' is a reserved slug meaning: use the hardcoded fallback
  override_template_slug TEXT   NOT NULL,
  created_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (tenant_id, page_type)
);

-- T3: all queries must predicate on tenant_id
CREATE INDEX IF NOT EXISTS idx_tro_tenant_page
  ON template_render_overrides(tenant_id, page_type);

CREATE INDEX IF NOT EXISTS idx_tro_installation
  ON template_render_overrides(installation_id);
