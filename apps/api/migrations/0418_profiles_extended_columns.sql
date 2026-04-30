-- Migration: 0418_profiles_extended_columns
-- Phase 0 finding (DRIFT-P3-001): apps/api/src/routes/profiles.ts and
-- apps/tenant-public/src/index.ts query columns on the profiles table that
-- have no confirmed prior migration:
--   entity_type, entity_id, place_id, profile_type, claim_status, avatar_url,
--   headline, content
--
-- This migration adds those missing columns so the existing routes work
-- against an explicit schema rather than undefined/missing columns.
-- All are additive (ALTER TABLE ADD COLUMN) — safe against fresh or evolved schemas.
-- SQLite silently ignores 'duplicate column' on ALTER TABLE ADD COLUMN.
--
-- Platform Invariants:
--   T3 — all existing queries already scope by tenant_id
--   G23 — additive only; no existing data modified
--
-- Background:
--   The profiles table was created in 0005, extended in 0014 (KYC fields)
--   and 0314d (tenant_id, workspace_id, vertical_slug, display_name, visibility).
--   The API route code referenced additional columns without a migration.
--   This migration closes that gap and establishes these as confirmed columns.

ALTER TABLE profiles ADD COLUMN entity_type    TEXT;
ALTER TABLE profiles ADD COLUMN entity_id      TEXT;
ALTER TABLE profiles ADD COLUMN place_id       TEXT REFERENCES places(id);
ALTER TABLE profiles ADD COLUMN profile_type   TEXT;
ALTER TABLE profiles ADD COLUMN claim_status   TEXT;
ALTER TABLE profiles ADD COLUMN avatar_url     TEXT;
ALTER TABLE profiles ADD COLUMN headline       TEXT;
ALTER TABLE profiles ADD COLUMN content        TEXT;

-- Indexes for the new columns used in common queries
CREATE INDEX IF NOT EXISTS idx_profiles_entity
  ON profiles(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_profiles_place_id
  ON profiles(place_id)
  WHERE place_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_tenant_visibility
  ON profiles(tenant_id, visibility);
