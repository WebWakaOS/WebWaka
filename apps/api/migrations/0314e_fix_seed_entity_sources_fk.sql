-- 0314e_fix_seed_entity_sources_fk.sql
-- Correction: 0314d's `ALTER TABLE seed_sources RENAME TO seed_sources_v1_bak`
-- caused SQLite to automatically update the FK reference inside seed_entity_sources
-- from REFERENCES seed_sources(id) → REFERENCES seed_sources_v1_bak(id).
-- The 0315+ migrations insert source records into the NEW seed_sources and reference
-- them from seed_entity_sources, causing FK constraint failures.
--
-- Fix: recreate seed_entity_sources with FK pointing to seed_sources(id).
-- Safe because 0314d migrated ALL rows from seed_sources_v1_bak INTO seed_sources,
-- so every source_id value in seed_entity_sources also exists in seed_sources.
-- Verified pre-apply: orphan_in_new = 0 across all 227,936 rows.

-- Step 1: Rename current (broken FK) table to backup
ALTER TABLE seed_entity_sources RENAME TO seed_entity_sources_fk_fix_bak;

-- Step 2: Drop indexes from broken table
DROP INDEX IF EXISTS idx_seed_entity_sources_entity;
DROP INDEX IF EXISTS idx_seed_entity_sources_source;
DROP INDEX IF EXISTS idx_seed_entity_sources_type;
DROP INDEX IF EXISTS idx_seed_entity_sources_freshness;

-- Step 3: Recreate table with FK pointing to the CURRENT seed_sources
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

-- Step 4: Restore all existing rows
-- All source_id values are present in seed_sources (orphan_in_new = 0), so FK is satisfied.
INSERT OR IGNORE INTO seed_entity_sources
  (id, entity_id, entity_type, source_id, source_record_id,
   source_type, source_label, source_display_name,
   confidence_level, publication_date, retrieval_date,
   freshness_status, superseded_by_id, created_at)
SELECT
  id, entity_id, entity_type, source_id, source_record_id,
  source_type, source_label, source_display_name,
  confidence_level, publication_date, retrieval_date,
  freshness_status, superseded_by_id, created_at
FROM seed_entity_sources_fk_fix_bak;

-- Step 5: Rebuild indexes
CREATE INDEX IF NOT EXISTS idx_seed_entity_sources_entity   ON seed_entity_sources(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_seed_entity_sources_source   ON seed_entity_sources(source_id);
CREATE INDEX IF NOT EXISTS idx_seed_entity_sources_type     ON seed_entity_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_seed_entity_sources_fresh    ON seed_entity_sources(freshness_status);
