-- Migration: 0253_workspace_branding_columns
-- Description: Add frontend-composition columns to workspaces table.
--   tenant_slug   — URL-safe slug used by public manifest endpoint (/public/:slug)
--   display_name  — human-readable workspace name shown in public pages
--   branding      — JSON blob for white-label theme overrides (colors, logo, etc.)
--   features      — JSON blob for feature flags (e.g. discoveryEnabled)
--   status        — workspace lifecycle state ('active' | 'suspended' | 'deprovisioned')
--
-- These columns are queried by getTenantManifestBySlug / getTenantManifestById
-- in @webwaka/frontend. Without them the /public/:tenantSlug route returns 500
-- on every request (D1 schema mismatch error).
--
-- BUG: BUG-PUB-01 — /public/:tenantSlug always returns 500 in staging
-- Root cause: workspaces table created by migration 0003 predates the frontend
--             composition package; columns were never added via ALTER TABLE.
-- Fix: Add columns with safe defaults; existing rows default to status='active'.
-- Platform Invariants: T3 (tenant_slug is globally unique), P12 (public discovery)

ALTER TABLE workspaces ADD COLUMN tenant_slug   TEXT;
ALTER TABLE workspaces ADD COLUMN display_name  TEXT;
ALTER TABLE workspaces ADD COLUMN branding      TEXT;   -- JSON
ALTER TABLE workspaces ADD COLUMN features      TEXT DEFAULT '{"discoveryEnabled":true}';
ALTER TABLE workspaces ADD COLUMN status        TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'suspended', 'deprovisioned'));

-- Backfill tenant_slug from name (URL-safe lowercase) for existing rows.
-- Real slugs will be set by the application on next update.
UPDATE workspaces
SET tenant_slug = lower(replace(replace(replace(name, ' ', '-'), '_', '-'), '.', ''))
WHERE tenant_slug IS NULL;

-- Enforce uniqueness now that the column exists.
CREATE UNIQUE INDEX IF NOT EXISTS idx_workspaces_tenant_slug
  ON workspaces(tenant_slug)
  WHERE tenant_slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_workspaces_status
  ON workspaces(status);
