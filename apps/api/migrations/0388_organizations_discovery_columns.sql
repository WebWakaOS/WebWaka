-- 0388_organizations_discovery_columns.sql
-- BUG-P3-002 fix: Add missing columns to organizations table required by Pillar 3
-- public-discovery worker (apps/public-discovery/src/routes/).
--
-- Prior state (post-0314d): organizations has id, tenant_id, name,
--   registration_number, verification_state, created_at, updated_at,
--   email, data_residency, slug, organization_type, legal_name,
--   display_name, status.
--
-- Missing columns referenced in listings.ts, profiles.ts, geography.ts:
--   is_published  — controls visibility in public marketplace (P4-B)
--   category      — business sector / vertical (e.g. 'Restaurant', 'Salon')
--   place_id      — FK → places.id; geographic location of the organization
--   description   — public-facing business description (SEO)
--   phone         — contact phone number (publicly visible on profile page)
--   website       — contact website URL (publicly visible on profile page)
--   logo_url      — logo image URL (replaces removed entity_profiles JOIN)
--
-- All columns are additive (ALTER TABLE ADD COLUMN) — fully idempotent against
-- a fresh schema or a schema that already has these columns from a prior manual
-- migration (SQLite ignores duplicate column errors when using IF NOT EXISTS).
--
-- T3: place_id references places (not geography_places — renamed in 0001).
-- P9: no monetary fields at this level.
-- G23: no destructive changes; append-only migration.

ALTER TABLE organizations ADD COLUMN is_published INTEGER NOT NULL DEFAULT 0;
ALTER TABLE organizations ADD COLUMN category TEXT;
ALTER TABLE organizations ADD COLUMN place_id TEXT REFERENCES places(id);
ALTER TABLE organizations ADD COLUMN description TEXT;
ALTER TABLE organizations ADD COLUMN phone TEXT;
ALTER TABLE organizations ADD COLUMN website TEXT;
ALTER TABLE organizations ADD COLUMN logo_url TEXT;

CREATE INDEX IF NOT EXISTS idx_organizations_is_published
  ON organizations(is_published)
  WHERE is_published = 1;

CREATE INDEX IF NOT EXISTS idx_organizations_category
  ON organizations(category)
  WHERE category IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_organizations_place_id
  ON organizations(place_id)
  WHERE place_id IS NOT NULL;
