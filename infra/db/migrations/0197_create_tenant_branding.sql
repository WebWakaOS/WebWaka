-- Migration: 0197_create_tenant_branding
-- Description: Create tenant_branding table for white-label theming.
-- Required by: brand-runtime tenant-resolve, white-label-theming getBrandTokens
-- Phase 2 QA fix: tenant_branding was referenced in code but never migrated.
-- Platform Invariants: T3 (tenant isolation), P2 (Nigeria First)

CREATE TABLE IF NOT EXISTS tenant_branding (
  id                TEXT NOT NULL PRIMARY KEY,
  tenant_id         TEXT NOT NULL UNIQUE,
  primary_color     TEXT,
  secondary_color   TEXT,
  accent_color      TEXT,
  font_family       TEXT,
  logo_url          TEXT,
  favicon_url       TEXT,
  border_radius_px  INTEGER DEFAULT 8,
  custom_domain     TEXT UNIQUE,
  display_name      TEXT,
  created_at        INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_tenant_branding_tenant_id ON tenant_branding(tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenant_branding_custom_domain ON tenant_branding(custom_domain) WHERE custom_domain IS NOT NULL;
