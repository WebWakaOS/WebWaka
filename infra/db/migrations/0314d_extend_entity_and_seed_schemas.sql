-- 0314d_extend_entity_and_seed_schemas.sql
-- Schema migration: extend base entity tables and seed control-plane tables to the v2
-- schema expected by all regulated/OSM seed migrations (0315+).
--
-- Background:
--   0002 (organizations), 0005 (profiles), 0008 (search_entries) created lean v1 schemas.
--   0301 (seed_runs, seed_sources) created lean v1 seed schemas.
--   0315+ migrations use extended columns that don't yet exist in the base tables.
--   This migration adds all missing columns with appropriate defaults so that:
--     - All 0315+ INSERT OR IGNORE statements succeed.
--     - All existing v1 data is preserved and queryable.
--     - D1 apply of 0314c → 0340 is unblocked.
--
-- Organizations: add organization_type, legal_name, display_name, status
-- Profiles:      add tenant_id, workspace_id, vertical_slug, display_name, visibility
-- Search entries: add profile_id, primary_place_id
-- Seed sources:  recreate with superset schema (v1 + v2 column aliases)
-- Seed runs:     add v2 columns (source_id, run_label, run_state, total_*)

-- ============================================================
-- 1. organizations: recreate with v2 extended columns + safe defaults
--    v1: name TEXT NOT NULL (no default) → INSERT OR IGNORE silently discards 0315+ rows
--    v2 fix: name has DEFAULT ''; add organization_type/legal_name/display_name/status
-- ============================================================
ALTER TABLE organizations RENAME TO organizations_v1_bak;
DROP INDEX IF EXISTS idx_organizations_tenant_id;
DROP INDEX IF EXISTS idx_organizations_name;
DROP INDEX IF EXISTS idx_organizations_slug;

CREATE TABLE IF NOT EXISTS organizations (
  id                  TEXT NOT NULL PRIMARY KEY,
  tenant_id           TEXT NOT NULL,
  name                TEXT NOT NULL DEFAULT '',              -- v1: no default; fixed
  registration_number TEXT,
  verification_state  TEXT NOT NULL DEFAULT 'unverified',
  created_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  -- v2 extended columns
  email               TEXT,
  data_residency      TEXT NOT NULL DEFAULT 'NG',
  slug                TEXT UNIQUE,
  organization_type   TEXT NOT NULL DEFAULT 'unclassified',
  legal_name          TEXT,
  display_name        TEXT,
  status              TEXT NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_organizations_tenant_id ON organizations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_organizations_type      ON organizations(organization_type);
CREATE INDEX IF NOT EXISTS idx_organizations_status    ON organizations(status);

-- Migrate existing v1 rows
-- Note: organization_type/legal_name/display_name/status did NOT exist in v1 bak;
--       use NULL/defaults so the new table's DEFAULT values fill them in.
INSERT OR IGNORE INTO organizations
  (id, tenant_id, name, registration_number, verification_state, created_at, updated_at)
SELECT
  id, tenant_id, name, registration_number, verification_state, created_at, updated_at
FROM organizations_v1_bak;

-- ============================================================
-- 2. profiles: add extended columns
-- ============================================================
ALTER TABLE profiles ADD COLUMN tenant_id      TEXT;
ALTER TABLE profiles ADD COLUMN workspace_id   TEXT;
ALTER TABLE profiles ADD COLUMN vertical_slug  TEXT;
ALTER TABLE profiles ADD COLUMN display_name   TEXT;
ALTER TABLE profiles ADD COLUMN visibility     TEXT NOT NULL DEFAULT 'public';

-- ============================================================
-- 3. search_entries: add profile_id and primary_place_id
--    (primary_place_id mirrors place_id for the v2 pattern)
-- ============================================================
ALTER TABLE search_entries ADD COLUMN profile_id       TEXT;
ALTER TABLE search_entries ADD COLUMN primary_place_id TEXT;

-- Backfill primary_place_id from place_id for existing rows
UPDATE search_entries SET primary_place_id = place_id WHERE primary_place_id IS NULL AND place_id IS NOT NULL;

-- ============================================================
-- 4. seed_sources: recreate as superset (v1 + v2 column aliases)
-- ============================================================
ALTER TABLE seed_sources RENAME TO seed_sources_v1_bak;

DROP INDEX IF EXISTS idx_seed_sources_type;
DROP INDEX IF EXISTS idx_seed_sources_owner;
DROP INDEX IF EXISTS idx_seed_sources_retrieved;

CREATE TABLE IF NOT EXISTS seed_sources (
  id                 TEXT    PRIMARY KEY,
  -- v1 columns (kept for backward compatibility)
  source_key         TEXT    UNIQUE,
  name               TEXT,
  owner              TEXT,
  confidence         TEXT    DEFAULT 'public_high_confidence',
  url                TEXT,
  access_method      TEXT,
  license            TEXT,
  retrieved_at       INTEGER,
  source_hash        TEXT,
  -- v2 alias columns (used by 0315+)
  source_label       TEXT,   -- v2 equivalent of 'name'
  owner_organisation TEXT,   -- v2 equivalent of 'owner'
  canonical_url      TEXT,   -- v2 equivalent of 'url'
  retrieval_date     TEXT,   -- v2 equivalent of retrieved_at (as TEXT date)
  license_notes      TEXT,   -- v2 equivalent of 'license'
  row_count          INTEGER,
  -- shared columns
  source_type        TEXT    NOT NULL DEFAULT 'public_data'
                     CHECK (source_type IN (
                       'official_register','official_regulator','official_government',
                       'official_association','public_directory','map_directory',
                       'field_collection','partner_submission','market_estimate',
                       'internal','public_data'
                     )),
  publication_date   TEXT,
  freshness_status   TEXT    NOT NULL DEFAULT 'current'
                     CHECK (freshness_status IN ('current','stale','superseded','unknown','snapshot')),
  notes              TEXT,
  created_at         INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at         INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_seed_sources_type      ON seed_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_seed_sources_owner     ON seed_sources(owner_organisation);
CREATE INDEX IF NOT EXISTS idx_seed_sources_retrieved ON seed_sources(retrieval_date);
CREATE INDEX IF NOT EXISTS idx_seed_sources_label     ON seed_sources(source_label);

INSERT OR IGNORE INTO seed_sources (
  id, source_key, name, owner, confidence, url, access_method, license,
  retrieved_at, source_hash, source_type, publication_date, freshness_status,
  notes, created_at, updated_at
)
SELECT
  id, source_key, name, owner, confidence, url, access_method, license,
  retrieved_at, source_hash,
  CASE source_type
    WHEN 'official_regulator'   THEN 'official_register'
    WHEN 'official_government'  THEN 'official_register'
    WHEN 'official_association' THEN 'official_register'
    WHEN 'public_directory'     THEN 'public_data'
    WHEN 'map_directory'        THEN 'public_data'
    ELSE source_type
  END,
  publication_date, freshness_status, notes, created_at, updated_at
FROM seed_sources_v1_bak;

-- ============================================================
-- 5. seed_runs: add v2 columns (additive only; v1 columns preserved)
-- ============================================================
ALTER TABLE seed_runs ADD COLUMN source_id          TEXT;
ALTER TABLE seed_runs ADD COLUMN run_label          TEXT;
ALTER TABLE seed_runs ADD COLUMN run_state          TEXT NOT NULL DEFAULT 'completed';
ALTER TABLE seed_runs ADD COLUMN total_input_rows   INTEGER NOT NULL DEFAULT 0;
ALTER TABLE seed_runs ADD COLUMN total_inserted_rows INTEGER NOT NULL DEFAULT 0;
ALTER TABLE seed_runs ADD COLUMN total_rejected_rows INTEGER NOT NULL DEFAULT 0;

-- Backfill v2 aliases from v1 columns for existing rows
UPDATE seed_runs SET run_label   = batch_name      WHERE run_label IS NULL;
UPDATE seed_runs SET run_state   = status          WHERE run_state IS NULL OR run_state = 'completed';
UPDATE seed_runs SET total_input_rows    = rows_extracted   WHERE total_input_rows = 0;
UPDATE seed_runs SET total_inserted_rows = rows_inserted    WHERE total_inserted_rows = 0;
UPDATE seed_runs SET total_rejected_rows = rows_rejected    WHERE total_rejected_rows = 0;

-- ============================================================
-- 6. seed_identity_map: recreate as v2 superset
--    v1: seed_run_id NOT NULL (no default), stable_key NOT NULL (no default)
--        → INSERT OR IGNORE silently discards all 0315+ rows
--    v2 fix: seed_run_id nullable; stable_key/generation_method have defaults;
--            add mapping_state column used by 0315+ INSERT pattern
-- ============================================================
ALTER TABLE seed_identity_map RENAME TO seed_identity_map_v1_bak;
DROP INDEX IF EXISTS idx_seed_identity_map_entity;
DROP INDEX IF EXISTS idx_seed_identity_map_run;
DROP INDEX IF EXISTS idx_seed_identity_map_stable_key;

CREATE TABLE IF NOT EXISTS seed_identity_map (
  id                TEXT PRIMARY KEY,
  seed_run_id       TEXT,                                      -- v1: NOT NULL; relaxed for v2
  source_id         TEXT NOT NULL REFERENCES seed_sources(id),
  source_record_id  TEXT NOT NULL,
  source_record_hash TEXT,
  entity_type       TEXT NOT NULL CHECK (entity_type IN (
                      'individual','organization','place','profile',
                      'vertical_profile','jurisdiction','other')),
  entity_id         TEXT NOT NULL,
  profile_id        TEXT,
  vertical_slug     TEXT,
  stable_key        TEXT NOT NULL DEFAULT 'source_record_id',  -- v1: no default; fixed
  generation_method TEXT NOT NULL DEFAULT 'source_record_id_hash', -- v1: DEFAULT 'sha256_v1'
  mapping_state     TEXT NOT NULL DEFAULT 'stable',            -- v2 new column
  created_at        INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (source_id, source_record_id, entity_type)
);

CREATE INDEX IF NOT EXISTS idx_seed_identity_map_entity    ON seed_identity_map(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_seed_identity_map_run       ON seed_identity_map(seed_run_id);
CREATE INDEX IF NOT EXISTS idx_seed_identity_map_stable    ON seed_identity_map(stable_key);
CREATE INDEX IF NOT EXISTS idx_seed_identity_map_mapping   ON seed_identity_map(mapping_state);

-- Migrate existing v1 rows
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_record_id, source_record_hash,
   entity_type, entity_id, profile_id, vertical_slug,
   stable_key, generation_method, created_at, updated_at)
SELECT
  id, seed_run_id, source_id, source_record_id, source_record_hash,
  entity_type, entity_id, profile_id, vertical_slug,
  stable_key, generation_method, created_at, updated_at
FROM seed_identity_map_v1_bak;

-- ============================================================
-- 7. seed_place_resolutions: recreate as v2 superset
--    v1: source_id NOT NULL (no default), confidence NOT NULL (no default)
--        → INSERT OR IGNORE silently discards all 0315+ rows
--    v2 fix: source_id nullable; confidence has default;
--            add entity_type/entity_id/ward_id/lga_id/resolution_method/resolution_notes
-- ============================================================
ALTER TABLE seed_place_resolutions RENAME TO seed_place_resolutions_v1_bak;
DROP INDEX IF EXISTS idx_seed_place_resolutions_run;
DROP INDEX IF EXISTS idx_seed_place_resolutions_place;
DROP INDEX IF EXISTS idx_seed_place_resolutions_level;

CREATE TABLE IF NOT EXISTS seed_place_resolutions (
  id                  TEXT PRIMARY KEY,
  seed_run_id         TEXT NOT NULL REFERENCES seed_runs(id),
  source_id           TEXT,                                       -- v1: NOT NULL; relaxed for v2
  source_record_id    TEXT NOT NULL,
  -- v1 geo input columns (kept for backward compat)
  input_state         TEXT,
  input_lga           TEXT,
  input_ward          TEXT,
  explicit_place_id   TEXT,
  -- v2 entity reference columns (used by 0315+)
  entity_type         TEXT,
  entity_id           TEXT,
  ward_id             TEXT,
  lga_id              TEXT,
  resolution_method   TEXT,
  resolution_notes    TEXT,
  -- shared columns
  resolved_place_id   TEXT REFERENCES places(id),
  resolution_level    TEXT NOT NULL CHECK (resolution_level IN (
                        'explicit','ward','local_government_area','state','country','none')),
  confidence          TEXT NOT NULL DEFAULT 'public_high_confidence'  -- v1: no default; fixed
                      CHECK (confidence IN (
                        'official_verified','official_stale','public_high_confidence',
                        'field_partner_collected','market_estimate_placeholder')),
  status              TEXT NOT NULL DEFAULT 'resolved'
                      CHECK (status IN ('resolved','ambiguous','unresolved','rejected')),
  candidate_place_ids TEXT NOT NULL DEFAULT '[]',
  notes               TEXT,
  created_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (seed_run_id, source_record_id)
);

CREATE INDEX IF NOT EXISTS idx_seed_place_resolutions_run   ON seed_place_resolutions(seed_run_id);
CREATE INDEX IF NOT EXISTS idx_seed_place_resolutions_place ON seed_place_resolutions(resolved_place_id);
CREATE INDEX IF NOT EXISTS idx_seed_place_resolutions_level ON seed_place_resolutions(resolution_level);
CREATE INDEX IF NOT EXISTS idx_seed_place_resolutions_etype ON seed_place_resolutions(entity_type);

-- Migrate existing v1 rows
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_id, source_record_id,
   input_state, input_lga, input_ward, explicit_place_id,
   resolved_place_id, resolution_level, confidence, status,
   candidate_place_ids, notes, created_at, updated_at)
SELECT
  id, seed_run_id, source_id, source_record_id,
  input_state, input_lga, input_ward, explicit_place_id,
  resolved_place_id, resolution_level, confidence, status,
  candidate_place_ids, notes, created_at, updated_at
FROM seed_place_resolutions_v1_bak;

-- Backfill v2 aliases from v1 for migrated rows
UPDATE seed_place_resolutions SET ward_id          = input_ward WHERE ward_id IS NULL;
UPDATE seed_place_resolutions SET lga_id           = input_lga  WHERE lga_id  IS NULL;
UPDATE seed_place_resolutions SET resolution_notes = notes      WHERE resolution_notes IS NULL;

-- ============================================================
-- 8. beauty_salon_profiles: add DEFAULT '' to state NOT NULL (from 0059)
--    v1: state TEXT NOT NULL (no default) → OSM rows with NULL state silently discarded
-- ============================================================
ALTER TABLE beauty_salon_profiles RENAME TO beauty_salon_profiles_v1_bak;
DROP INDEX IF EXISTS idx_salon_tenant;
DROP INDEX IF EXISTS idx_salon_status;

CREATE TABLE IF NOT EXISTS beauty_salon_profiles (
  id                  TEXT    PRIMARY KEY,
  workspace_id        TEXT    REFERENCES workspaces(id),
  tenant_id           TEXT    NOT NULL,
  salon_name          TEXT    NOT NULL,
  salon_type          TEXT    NOT NULL DEFAULT 'salon',
  nasc_number         TEXT,
  state_permit_number TEXT,
  state               TEXT,                                  -- v1: NOT NULL no default; made nullable for OSM seed
  status              TEXT    NOT NULL DEFAULT 'seeded',
  created_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at          INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_salon_tenant ON beauty_salon_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_salon_status ON beauty_salon_profiles(status);
CREATE INDEX IF NOT EXISTS idx_salon_state  ON beauty_salon_profiles(state);

INSERT OR IGNORE INTO beauty_salon_profiles
  (id, workspace_id, tenant_id, salon_name, salon_type,
   nasc_number, state_permit_number, state, status, created_at, updated_at)
SELECT
  id, workspace_id, tenant_id, salon_name, salon_type,
  nasc_number, state_permit_number, COALESCE(state, ''), status, created_at, updated_at
FROM beauty_salon_profiles_v1_bak;

-- ============================================================
-- 9. seed_ingestion_records: no changes needed (already correct in 0304)
-- ============================================================

-- Record this schema extension
INSERT OR IGNORE INTO seed_runs (
  id, phase_id, phase_name, batch_name, environment, status, actor,
  rows_inserted, notes, created_at, updated_at
) VALUES (
  'seed_run_s00d_schema_extension_20260422',
  'S00D',
  'Entity and Seed Schema Extension (v1 → v2 bridge)',
  'schema-extension-0314d',
  'production',
  'completed',
  'replit-agent',
  0,
  'Ext: org+profile+search_entries+seed_runs+seed_sources for v2 seeding schema (0315-0340 prereq).',
  unixepoch(),
  unixepoch()
);
