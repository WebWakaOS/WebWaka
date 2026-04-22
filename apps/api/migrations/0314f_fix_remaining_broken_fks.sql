-- 0314f_fix_remaining_broken_fks.sql
-- Root cause: 0314d's `ALTER TABLE seed_sources RENAME TO seed_sources_v1_bak`
-- caused SQLite to automatically update ALL FK references from seed_sources(id)
-- → seed_sources_v1_bak(id) in tables that existed at that time.
-- 0314e fixed seed_entity_sources. This migration fixes the remaining 4 tables:
--   seed_raw_artifacts, seed_ingestion_records, seed_election_cycles, seed_enrichment
-- Also fixes seed_dedupe_decisions schema mismatch (0315+ uses different columns).
--
-- Pre-flight check (verified): all source_id values in these tables exist in
-- seed_sources (same as confirmed for seed_entity_sources in 0314e).
-- Recreate each table without disabling FK checks.

-- ============================================================
-- 1. seed_raw_artifacts: fix source_id FK
--    (must be done before seed_ingestion_records due to FK chain)
-- ============================================================
ALTER TABLE seed_raw_artifacts RENAME TO seed_raw_artifacts_fk_fix_bak;
DROP INDEX IF EXISTS idx_seed_raw_artifacts_run;
DROP INDEX IF EXISTS idx_seed_raw_artifacts_source;

CREATE TABLE IF NOT EXISTS seed_raw_artifacts (
  id                 TEXT PRIMARY KEY,
  seed_run_id        TEXT NOT NULL REFERENCES seed_runs(id),
  source_id          TEXT NOT NULL REFERENCES seed_sources(id),
  artifact_type      TEXT NOT NULL
                     CHECK (artifact_type IN ('raw','normalized','extract','report','screenshot','schema_map','manual_review')),
  file_path          TEXT NOT NULL,
  content_hash       TEXT NOT NULL,
  row_count          INTEGER CHECK (row_count IS NULL OR row_count >= 0),
  schema_json        TEXT NOT NULL DEFAULT '{}',
  extraction_script  TEXT,
  status             TEXT NOT NULL DEFAULT 'captured'
                     CHECK (status IN ('captured','parsed','failed','superseded')),
  created_at         INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at         INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (seed_run_id, source_id, artifact_type, file_path)
);

INSERT OR IGNORE INTO seed_raw_artifacts
  (id, seed_run_id, source_id, artifact_type, file_path, content_hash,
   row_count, schema_json, extraction_script, status, created_at, updated_at)
SELECT
  id, seed_run_id, source_id, artifact_type, file_path, content_hash,
  row_count, schema_json, extraction_script, status, created_at, updated_at
FROM seed_raw_artifacts_fk_fix_bak;

CREATE INDEX IF NOT EXISTS idx_seed_raw_artifacts_run    ON seed_raw_artifacts(seed_run_id);
CREATE INDEX IF NOT EXISTS idx_seed_raw_artifacts_source ON seed_raw_artifacts(source_id);

-- ============================================================
-- 2. seed_ingestion_records: fix source_id FK
--    (depends on seed_raw_artifacts being recreated first)
-- ============================================================
ALTER TABLE seed_ingestion_records RENAME TO seed_ingestion_records_fk_fix_bak;
DROP INDEX IF EXISTS idx_seed_ingestion_run;
DROP INDEX IF EXISTS idx_seed_ingestion_entity;
DROP INDEX IF EXISTS idx_seed_ingestion_status;
DROP INDEX IF EXISTS idx_seed_ingestion_source;

CREATE TABLE IF NOT EXISTS seed_ingestion_records (
  id                    TEXT PRIMARY KEY,
  seed_run_id           TEXT NOT NULL REFERENCES seed_runs(id),
  source_id             TEXT NOT NULL REFERENCES seed_sources(id),
  artifact_id           TEXT REFERENCES seed_raw_artifacts(id),
  row_number            INTEGER CHECK (row_number IS NULL OR row_number >= 0),
  source_record_id      TEXT NOT NULL,
  source_record_hash    TEXT NOT NULL,
  target_entity_type    TEXT NOT NULL CHECK (target_entity_type IN ('individual','organization','place','profile','vertical_profile','jurisdiction','other')),
  target_entity_id      TEXT,
  target_profile_id     TEXT,
  vertical_slug         TEXT,
  primary_place_id      TEXT REFERENCES places(id),
  raw_json              TEXT NOT NULL DEFAULT '{}',
  normalized_json       TEXT NOT NULL DEFAULT '{}',
  record_status         TEXT NOT NULL DEFAULT 'staged' CHECK (record_status IN ('staged','validated','inserted','rejected','duplicate','superseded')),
  error_json            TEXT NOT NULL DEFAULT '{}',
  created_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (seed_run_id, source_id, source_record_id, target_entity_type)
);

INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, source_id, artifact_id, row_number, source_record_id,
   source_record_hash, target_entity_type, target_entity_id, target_profile_id,
   vertical_slug, primary_place_id, raw_json, normalized_json,
   record_status, error_json, created_at, updated_at)
SELECT
  id, seed_run_id, source_id, artifact_id, row_number, source_record_id,
  source_record_hash, target_entity_type, target_entity_id, target_profile_id,
  vertical_slug, primary_place_id, raw_json, normalized_json,
  record_status, error_json, created_at, updated_at
FROM seed_ingestion_records_fk_fix_bak;

CREATE INDEX IF NOT EXISTS idx_seed_ingestion_run    ON seed_ingestion_records(seed_run_id);
CREATE INDEX IF NOT EXISTS idx_seed_ingestion_entity ON seed_ingestion_records(target_entity_type, target_entity_id);
CREATE INDEX IF NOT EXISTS idx_seed_ingestion_status ON seed_ingestion_records(record_status);
CREATE INDEX IF NOT EXISTS idx_seed_ingestion_source ON seed_ingestion_records(source_id);

-- ============================================================
-- 3. seed_election_cycles: fix source_id FK
-- ============================================================
ALTER TABLE seed_election_cycles RENAME TO seed_election_cycles_fk_fix_bak;
DROP INDEX IF EXISTS idx_seed_election_cycles_run;

CREATE TABLE IF NOT EXISTS seed_election_cycles (
  id                    TEXT PRIMARY KEY,
  seed_run_id           TEXT NOT NULL REFERENCES seed_runs(id),
  source_id             TEXT NOT NULL REFERENCES seed_sources(id),
  name                  TEXT NOT NULL,
  election_date         TEXT NOT NULL,
  cycle_type            TEXT NOT NULL CHECK (cycle_type IN ('general','off_cycle','bye_election','rerun','internal_party')),
  scope                 TEXT NOT NULL CHECK (scope IN ('national','state','lga','ward','constituency')),
  offices_json          TEXT NOT NULL DEFAULT '[]',
  candidate_list_url    TEXT,
  result_source_url     TEXT,
  status                TEXT NOT NULL DEFAULT 'source_located' CHECK (status IN ('source_located','extracted','validated','seeded','superseded')),
  notes                 TEXT,
  created_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (name, election_date, scope)
);

INSERT OR IGNORE INTO seed_election_cycles
  (id, seed_run_id, source_id, name, election_date, cycle_type, scope,
   offices_json, candidate_list_url, result_source_url, status, notes,
   created_at, updated_at)
SELECT
  id, seed_run_id, source_id, name, election_date, cycle_type, scope,
  offices_json, candidate_list_url, result_source_url, status, notes,
  created_at, updated_at
FROM seed_election_cycles_fk_fix_bak;

CREATE INDEX IF NOT EXISTS idx_seed_election_cycles_run ON seed_election_cycles(seed_run_id);

-- ============================================================
-- 4. seed_enrichment: fix source_id FK (nullable column)
-- ============================================================
ALTER TABLE seed_enrichment RENAME TO seed_enrichment_fk_fix_bak;
DROP INDEX IF EXISTS idx_seed_enrichment_run;
DROP INDEX IF EXISTS idx_seed_enrichment_entity;

CREATE TABLE IF NOT EXISTS seed_enrichment (
  id                 TEXT PRIMARY KEY,
  seed_run_id        TEXT NOT NULL REFERENCES seed_runs(id),
  entity_type        TEXT NOT NULL
                     CHECK (entity_type IN ('individual','organization','place','profile','vertical_profile','jurisdiction','other')),
  entity_id          TEXT NOT NULL,
  profile_id         TEXT,
  vertical_slug      TEXT,
  source_id          TEXT REFERENCES seed_sources(id),
  enrichment_json    TEXT NOT NULL,
  pii_classification TEXT NOT NULL DEFAULT 'public'
                     CHECK (pii_classification IN ('public','non_sensitive','sensitive','restricted')),
  lawful_basis       TEXT,
  last_reviewed_at   INTEGER,
  created_at         INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at         INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (entity_type, entity_id, vertical_slug)
);

INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, profile_id, vertical_slug,
   source_id, enrichment_json, pii_classification, lawful_basis,
   last_reviewed_at, created_at, updated_at)
SELECT
  id, seed_run_id, entity_type, entity_id, profile_id, vertical_slug,
  source_id, enrichment_json, pii_classification, lawful_basis,
  last_reviewed_at, created_at, updated_at
FROM seed_enrichment_fk_fix_bak;

CREATE INDEX IF NOT EXISTS idx_seed_enrichment_run    ON seed_enrichment(seed_run_id);
CREATE INDEX IF NOT EXISTS idx_seed_enrichment_entity ON seed_enrichment(entity_type, entity_id);

-- ============================================================
-- 5. seed_dedupe_decisions: schema mismatch fix
--    v1 (0301/0304): uses entity_type, canonical_key, candidate_keys, confidence, reason
--    v2 (0315+):     uses source_id, source_record_id, merged_into_id, decision_reason,
--                         target_entity_id, target_entity_type
--    Strategy: rename v1 to backup, create v2 schema, no data migration
--              (v1 deduplication data is not compatible with v2 pattern)
-- ============================================================
ALTER TABLE seed_dedupe_decisions RENAME TO seed_dedupe_decisions_v1_bak;
DROP INDEX IF EXISTS idx_seed_dedupe_run;
DROP INDEX IF EXISTS idx_seed_dedupe_entity;

CREATE TABLE IF NOT EXISTS seed_dedupe_decisions (
  id                 TEXT PRIMARY KEY,
  seed_run_id        TEXT NOT NULL REFERENCES seed_runs(id),
  source_id          TEXT NOT NULL REFERENCES seed_sources(id),
  source_record_id   TEXT NOT NULL,
  decision           TEXT NOT NULL
                     CHECK (decision IN ('canonical','merge','reject','manual_review','split','new')),
  merged_into_id     TEXT,
  decision_reason    TEXT,
  target_entity_id   TEXT,
  target_entity_type TEXT CHECK (target_entity_type IN ('individual','organization','place','profile','vertical_profile','jurisdiction','other')),
  decided_at         INTEGER NOT NULL DEFAULT (unixepoch()),
  created_at         INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (source_id, source_record_id, target_entity_type)
);

CREATE INDEX IF NOT EXISTS idx_seed_dedupe_run    ON seed_dedupe_decisions(seed_run_id);
CREATE INDEX IF NOT EXISTS idx_seed_dedupe_entity ON seed_dedupe_decisions(target_entity_type, target_entity_id);
CREATE INDEX IF NOT EXISTS idx_seed_dedupe_source ON seed_dedupe_decisions(source_id);
