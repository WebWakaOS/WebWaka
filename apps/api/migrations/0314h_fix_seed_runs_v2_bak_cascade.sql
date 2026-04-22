-- 0314h_fix_seed_runs_v2_bak_cascade.sql
-- Root cause: 0314g's ALTER TABLE seed_runs RENAME TO seed_runs_v2_bak caused
-- SQLite to auto-rewrite ALL FK references from seed_runs(id) →
-- seed_runs_v2_bak(id) in 8 dependent tables, despite PRAGMA legacy_alter_table.
-- D1 does not honour that pragma for FK cascade prevention.
--
-- Fix strategy: For each broken table, use CREATE NEW + INSERT + DROP OLD +
-- RENAME NEW to avoid the rename-cascade cycle.
--   - DROP TABLE is allowed by SQLite even with foreign_keys=ON (FK checks only
--     trigger on row INSERT/UPDATE/DELETE, not on DROP TABLE).
--   - RENAME of seed_xxx_new → seed_xxx is safe because nothing references the
--     new intermediate table name.
-- After each rename, pre-existing FK references in OTHER tables that still say
-- "seed_xxx(id)" automatically point to the newly recreated table.
--
-- Pre-flight row counts (verified on staging):
--   seed_coverage_snapshots:  1
--   seed_dedupe_decisions:     0  (new v2 schema, no data to migrate)
--   seed_election_cycles:      2
--   seed_enrichment:       27192
--   seed_ingestion_records: 210346
--   seed_place_resolutions: 207681
--   seed_raw_artifacts:       31
--   seed_search_rebuild_jobs:  0  (no data)
--
-- Order: independent tables first, then seed_raw_artifacts, then
-- seed_ingestion_records (which FKs to seed_raw_artifacts).

-- ============================================================
-- 1. seed_coverage_snapshots
-- ============================================================
CREATE TABLE IF NOT EXISTS seed_coverage_snapshots_new (
  id                              TEXT PRIMARY KEY,
  seed_run_id                     TEXT NOT NULL REFERENCES seed_runs(id),
  vertical_slug                   TEXT,
  category                        TEXT,
  state_place_id                  TEXT REFERENCES places(id),
  lga_place_id                    TEXT REFERENCES places(id),
  ward_place_id                   TEXT REFERENCES places(id),
  confidence                      TEXT NOT NULL
                                  CHECK (confidence IN ('official_verified','official_stale','public_high_confidence','field_partner_collected','market_estimate_placeholder')),
  total_entities                  INTEGER NOT NULL DEFAULT 0 CHECK (total_entities >= 0),
  official_verified_count         INTEGER NOT NULL DEFAULT 0 CHECK (official_verified_count >= 0),
  official_stale_count            INTEGER NOT NULL DEFAULT 0 CHECK (official_stale_count >= 0),
  public_high_confidence_count    INTEGER NOT NULL DEFAULT 0 CHECK (public_high_confidence_count >= 0),
  field_partner_count             INTEGER NOT NULL DEFAULT 0 CHECK (field_partner_count >= 0),
  market_estimate_count           INTEGER NOT NULL DEFAULT 0 CHECK (market_estimate_count >= 0),
  gaps_json                       TEXT NOT NULL DEFAULT '{}',
  snapshot_at                     INTEGER NOT NULL DEFAULT (unixepoch()),
  created_at                      INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT OR IGNORE INTO seed_coverage_snapshots_new
  (id, seed_run_id, vertical_slug, category, state_place_id, lga_place_id,
   ward_place_id, confidence, total_entities, official_verified_count,
   official_stale_count, public_high_confidence_count, field_partner_count,
   market_estimate_count, gaps_json, snapshot_at, created_at)
SELECT
  id, seed_run_id, vertical_slug, category, state_place_id, lga_place_id,
  ward_place_id, confidence, total_entities, official_verified_count,
  official_stale_count, public_high_confidence_count, field_partner_count,
  market_estimate_count, gaps_json, snapshot_at, created_at
FROM seed_coverage_snapshots;

DROP TABLE seed_coverage_snapshots;
ALTER TABLE seed_coverage_snapshots_new RENAME TO seed_coverage_snapshots;

CREATE INDEX IF NOT EXISTS idx_seed_coverage_run      ON seed_coverage_snapshots(seed_run_id);
CREATE INDEX IF NOT EXISTS idx_seed_coverage_vertical ON seed_coverage_snapshots(vertical_slug, confidence);
CREATE INDEX IF NOT EXISTS idx_seed_coverage_state    ON seed_coverage_snapshots(state_place_id, vertical_slug);
CREATE INDEX IF NOT EXISTS idx_seed_coverage_lga      ON seed_coverage_snapshots(lga_place_id, vertical_slug);
CREATE INDEX IF NOT EXISTS idx_seed_coverage_snapshot ON seed_coverage_snapshots(snapshot_at);

-- ============================================================
-- 2. seed_dedupe_decisions  (0 rows — new v2 schema, no data)
-- ============================================================
CREATE TABLE IF NOT EXISTS seed_dedupe_decisions_new (
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

DROP TABLE seed_dedupe_decisions;
ALTER TABLE seed_dedupe_decisions_new RENAME TO seed_dedupe_decisions;

CREATE INDEX IF NOT EXISTS idx_seed_dedupe_run    ON seed_dedupe_decisions(seed_run_id);
CREATE INDEX IF NOT EXISTS idx_seed_dedupe_entity ON seed_dedupe_decisions(target_entity_type, target_entity_id);
CREATE INDEX IF NOT EXISTS idx_seed_dedupe_source ON seed_dedupe_decisions(source_id);

-- ============================================================
-- 3. seed_election_cycles
-- ============================================================
CREATE TABLE IF NOT EXISTS seed_election_cycles_new (
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

INSERT OR IGNORE INTO seed_election_cycles_new
  (id, seed_run_id, source_id, name, election_date, cycle_type, scope,
   offices_json, candidate_list_url, result_source_url, status, notes,
   created_at, updated_at)
SELECT
  id, seed_run_id, source_id, name, election_date, cycle_type, scope,
  offices_json, candidate_list_url, result_source_url, status, notes,
  created_at, updated_at
FROM seed_election_cycles;

DROP TABLE seed_election_cycles;
ALTER TABLE seed_election_cycles_new RENAME TO seed_election_cycles;

CREATE INDEX IF NOT EXISTS idx_seed_election_cycles_run ON seed_election_cycles(seed_run_id);

-- ============================================================
-- 4. seed_enrichment
-- ============================================================
CREATE TABLE IF NOT EXISTS seed_enrichment_new (
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

INSERT OR IGNORE INTO seed_enrichment_new
  (id, seed_run_id, entity_type, entity_id, profile_id, vertical_slug,
   source_id, enrichment_json, pii_classification, lawful_basis,
   last_reviewed_at, created_at, updated_at)
SELECT
  id, seed_run_id, entity_type, entity_id, profile_id, vertical_slug,
  source_id, enrichment_json, pii_classification, lawful_basis,
  last_reviewed_at, created_at, updated_at
FROM seed_enrichment;

DROP TABLE seed_enrichment;
ALTER TABLE seed_enrichment_new RENAME TO seed_enrichment;

CREATE INDEX IF NOT EXISTS idx_seed_enrichment_run    ON seed_enrichment(seed_run_id);
CREATE INDEX IF NOT EXISTS idx_seed_enrichment_entity ON seed_enrichment(entity_type, entity_id);

-- ============================================================
-- 5. seed_search_rebuild_jobs  (0 rows — no data)
-- ============================================================
CREATE TABLE IF NOT EXISTS seed_search_rebuild_jobs_new (
  id                    TEXT PRIMARY KEY,
  seed_run_id           TEXT NOT NULL REFERENCES seed_runs(id),
  batch_name            TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','completed','failed','superseded')),
  entity_type           TEXT,
  entity_count          INTEGER NOT NULL DEFAULT 0 CHECK (entity_count >= 0),
  search_entries_count  INTEGER NOT NULL DEFAULT 0 CHECK (search_entries_count >= 0),
  queued_at             INTEGER NOT NULL DEFAULT (unixepoch()),
  started_at            INTEGER,
  completed_at          INTEGER,
  fts_rebuilt_at        INTEGER,
  notes                 TEXT,
  created_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (seed_run_id, batch_name)
);

DROP TABLE seed_search_rebuild_jobs;
ALTER TABLE seed_search_rebuild_jobs_new RENAME TO seed_search_rebuild_jobs;

CREATE INDEX IF NOT EXISTS idx_seed_search_rebuild_jobs_run    ON seed_search_rebuild_jobs(seed_run_id);
CREATE INDEX IF NOT EXISTS idx_seed_search_rebuild_jobs_status ON seed_search_rebuild_jobs(status, queued_at);

-- ============================================================
-- 6. seed_place_resolutions  (207681 rows)
-- ============================================================
CREATE TABLE IF NOT EXISTS seed_place_resolutions_new (
  id                  TEXT PRIMARY KEY,
  seed_run_id         TEXT NOT NULL REFERENCES seed_runs(id),
  source_id           TEXT,
  source_record_id    TEXT NOT NULL,
  input_state         TEXT,
  input_lga           TEXT,
  input_ward          TEXT,
  explicit_place_id   TEXT,
  entity_type         TEXT,
  entity_id           TEXT,
  ward_id             TEXT,
  lga_id              TEXT,
  resolution_method   TEXT,
  resolution_notes    TEXT,
  resolved_place_id   TEXT REFERENCES places(id),
  resolution_level    TEXT NOT NULL CHECK (resolution_level IN (
                        'explicit','ward','local_government_area','state','country','none')),
  confidence          TEXT NOT NULL DEFAULT 'public_high_confidence'
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

INSERT OR IGNORE INTO seed_place_resolutions_new
  (id, seed_run_id, source_id, source_record_id, input_state, input_lga,
   input_ward, explicit_place_id, entity_type, entity_id, ward_id, lga_id,
   resolution_method, resolution_notes, resolved_place_id, resolution_level,
   confidence, status, candidate_place_ids, notes, created_at, updated_at)
SELECT
  id, seed_run_id, source_id, source_record_id, input_state, input_lga,
  input_ward, explicit_place_id, entity_type, entity_id, ward_id, lga_id,
  resolution_method, resolution_notes, resolved_place_id, resolution_level,
  confidence, status, candidate_place_ids, notes, created_at, updated_at
FROM seed_place_resolutions;

DROP TABLE seed_place_resolutions;
ALTER TABLE seed_place_resolutions_new RENAME TO seed_place_resolutions;

CREATE INDEX IF NOT EXISTS idx_seed_place_resolutions_run   ON seed_place_resolutions(seed_run_id);
CREATE INDEX IF NOT EXISTS idx_seed_place_resolutions_etype ON seed_place_resolutions(entity_type);
CREATE INDEX IF NOT EXISTS idx_seed_place_resolutions_level ON seed_place_resolutions(resolution_level);
CREATE INDEX IF NOT EXISTS idx_seed_place_resolutions_place ON seed_place_resolutions(resolved_place_id);

-- ============================================================
-- 7. seed_raw_artifacts  (31 rows)
--    NOTE: seed_ingestion_records.artifact_id REFERENCES seed_raw_artifacts(id)
--    After DROP + RENAME, that FK still says seed_raw_artifacts(id) and
--    correctly points to the recreated table.
-- ============================================================
CREATE TABLE IF NOT EXISTS seed_raw_artifacts_new (
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

INSERT OR IGNORE INTO seed_raw_artifacts_new
  (id, seed_run_id, source_id, artifact_type, file_path, content_hash,
   row_count, schema_json, extraction_script, status, created_at, updated_at)
SELECT
  id, seed_run_id, source_id, artifact_type, file_path, content_hash,
  row_count, schema_json, extraction_script, status, created_at, updated_at
FROM seed_raw_artifacts;

DROP TABLE seed_raw_artifacts;
ALTER TABLE seed_raw_artifacts_new RENAME TO seed_raw_artifacts;

CREATE INDEX IF NOT EXISTS idx_seed_raw_artifacts_run    ON seed_raw_artifacts(seed_run_id);
CREATE INDEX IF NOT EXISTS idx_seed_raw_artifacts_source ON seed_raw_artifacts(source_id);

-- ============================================================
-- 8. seed_ingestion_records  (210346 rows)
--    artifact_id REFERENCES seed_raw_artifacts(id) — seed_raw_artifacts
--    was recreated in step 7 above so FK is valid.
-- ============================================================
CREATE TABLE IF NOT EXISTS seed_ingestion_records_new (
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

INSERT OR IGNORE INTO seed_ingestion_records_new
  (id, seed_run_id, source_id, artifact_id, row_number, source_record_id,
   source_record_hash, target_entity_type, target_entity_id, target_profile_id,
   vertical_slug, primary_place_id, raw_json, normalized_json,
   record_status, error_json, created_at, updated_at)
SELECT
  id, seed_run_id, source_id, artifact_id, row_number, source_record_id,
  source_record_hash, target_entity_type, target_entity_id, target_profile_id,
  vertical_slug, primary_place_id, raw_json, normalized_json,
  record_status, error_json, created_at, updated_at
FROM seed_ingestion_records;

DROP TABLE seed_ingestion_records;
ALTER TABLE seed_ingestion_records_new RENAME TO seed_ingestion_records;

CREATE INDEX IF NOT EXISTS idx_seed_ingestion_run    ON seed_ingestion_records(seed_run_id);
CREATE INDEX IF NOT EXISTS idx_seed_ingestion_entity ON seed_ingestion_records(target_entity_type, target_entity_id);
CREATE INDEX IF NOT EXISTS idx_seed_ingestion_status ON seed_ingestion_records(record_status);
CREATE INDEX IF NOT EXISTS idx_seed_ingestion_source ON seed_ingestion_records(source_id);
