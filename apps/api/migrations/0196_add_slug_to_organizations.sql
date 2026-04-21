-- Migration: 0196_add_slug_to_organizations
-- Description: Add slug column to organizations for tenant resolution by vanity URL.
-- Required by: brand-runtime tenant-resolve, white-label-theming getBrandTokens
-- Phase 2 QA fix: organizations.slug was referenced in code but never migrated.

ALTER TABLE organizations ADD COLUMN slug TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
