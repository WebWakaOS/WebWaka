-- 0314c_seed_entity_sources_v2_schema.sql
-- Schema migration: seed_entity_sources v1 → v2
-- Reason: S07 regulated-entity seeding (0315+) requires a richer provenance schema.
-- The v1 schema (created in 0301) was optimised for internal seed-run tracking.
-- The v2 schema is oriented toward external source provenance and display.
--
-- v1 columns: id, seed_run_id, source_id, artifact_id, dedupe_decision_id, entity_type,
--             entity_id, profile_id, vertical_slug, source_record_id, source_record_hash,
--             confidence, source_url, extracted_at, last_verified_at, verification_state,
--             notes, created_at, updated_at
--
-- v2 columns: id, entity_id, entity_type, source_id, source_record_id, source_type,
--             source_label, source_display_name, confidence_level, publication_date,
--             retrieval_date, freshness_status, superseded_by_id, created_at
--
-- Strategy:
--   1. Rename existing table to seed_entity_sources_v1_bak
--   2. Create new table with v2 schema
--   3. Migrate compatible data from backup
--   4. Drop backup (or leave for rollback; D1 can tolerate the extra table)
--
-- Confidence mapping (v1 → v2):
--   official_verified        → source_verified
--   official_stale           → source_stale
--   public_high_confidence   → public_high_confidence  (unchanged)
--   field_partner_collected  → field_partner_collected (unchanged)
--   market_estimate_placeholder → market_estimate_placeholder (unchanged)

-- Step 1: Rename v1 table
ALTER TABLE seed_entity_sources RENAME TO seed_entity_sources_v1_bak;

-- Step 2: Drop indexes that reference the old table
DROP INDEX IF EXISTS idx_seed_entity_sources_run;
DROP INDEX IF EXISTS idx_seed_entity_sources_source;
DROP INDEX IF EXISTS idx_seed_entity_sources_entity;
DROP INDEX IF EXISTS idx_seed_entity_sources_profile;
DROP INDEX IF EXISTS idx_seed_entity_sources_vertical;

-- Step 3: Create v2 table
CREATE TABLE IF NOT EXISTS seed_entity_sources (
  id                  TEXT PRIMARY KEY,
  entity_id           TEXT NOT NULL,
  entity_type         TEXT NOT NULL
                      CHECK (entity_type IN ('individual','organization','place','profile',
                             'vertical_profile','jurisdiction','search_entry','other')),
  source_id           TEXT NOT NULL REFERENCES seed_sources(id),
  source_record_id    TEXT,
  source_type         TEXT NOT NULL
                      CHECK (source_type IN ('official_register','public_data','field_collected',
                             'partner_supplied','market_estimate','inferred')),
  source_label        TEXT,
  source_display_name TEXT,
  confidence_level    TEXT NOT NULL DEFAULT 'source_verified'
                      CHECK (confidence_level IN ('source_verified','source_stale',
                             'public_high_confidence','public_low_confidence',
                             'field_partner_collected','market_estimate_placeholder')),
  publication_date    TEXT,
  retrieval_date      TEXT,
  freshness_status    TEXT NOT NULL DEFAULT 'current'
                      CHECK (freshness_status IN ('current','stale','superseded','unknown','snapshot')),
  superseded_by_id    TEXT REFERENCES seed_entity_sources(id),
  created_at          INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Step 4: Migrate existing v1 data to v2
-- Maps: confidence (official_verified → source_verified; others kept or mapped below)
-- source_type inferred as 'official_register' for all existing seed data
-- source_label uses source_id as fallback
-- source_display_name uses entity_id as fallback
-- publication_date NULL (unknown for older seeds)
-- retrieval_date from extracted_at (unix epoch → date string not available in SQLite without strftime)
-- freshness_status: 'current' for all (they were just seeded)

INSERT OR IGNORE INTO seed_entity_sources
  (id, entity_id, entity_type, source_id, source_record_id,
   source_type, source_label, source_display_name,
   confidence_level, publication_date, retrieval_date,
   freshness_status, superseded_by_id, created_at)
SELECT
  id,
  entity_id,
  entity_type,
  source_id,
  source_record_id,
  'official_register'   AS source_type,
  source_id             AS source_label,
  entity_id             AS source_display_name,
  CASE confidence
    WHEN 'official_verified'          THEN 'source_verified'
    WHEN 'official_stale'             THEN 'source_stale'
    WHEN 'public_high_confidence'     THEN 'public_high_confidence'
    WHEN 'field_partner_collected'    THEN 'field_partner_collected'
    WHEN 'market_estimate_placeholder' THEN 'market_estimate_placeholder'
    ELSE 'source_verified'
  END                   AS confidence_level,
  NULL                  AS publication_date,
  CASE WHEN extracted_at IS NOT NULL
       THEN strftime('%Y-%m-%d', extracted_at, 'unixepoch')
       ELSE NULL
  END                   AS retrieval_date,
  'current'             AS freshness_status,
  NULL                  AS superseded_by_id,
  COALESCE(created_at, unixepoch()) AS created_at
FROM seed_entity_sources_v1_bak;

-- Step 5: Rebuild indexes on v2
CREATE INDEX IF NOT EXISTS idx_seed_entity_sources_entity   ON seed_entity_sources(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_seed_entity_sources_source   ON seed_entity_sources(source_id);
CREATE INDEX IF NOT EXISTS idx_seed_entity_sources_type     ON seed_entity_sources(source_type, confidence_level);
CREATE INDEX IF NOT EXISTS idx_seed_entity_sources_freshness ON seed_entity_sources(freshness_status);

-- Note: seed_entity_sources_v1_bak is retained for reference. Drop manually after validation.
-- DROP TABLE IF EXISTS seed_entity_sources_v1_bak;
