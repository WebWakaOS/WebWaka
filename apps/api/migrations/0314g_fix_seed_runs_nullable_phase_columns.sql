-- 0314g_fix_seed_runs_nullable_phase_columns.sql
-- Problem: seed_runs has phase_id, phase_name, batch_name as NOT NULL without
--          defaults. The 0315+ INSERT OR IGNORE pattern does not provide these
--          v1 columns, causing the row to be silently ignored (OR IGNORE
--          suppresses NOT NULL violations), which in turn makes all subsequent
--          INSERT OR IGNORE INTO seed_raw_artifacts fail with a FOREIGN KEY
--          constraint error (INSERT OR IGNORE does NOT suppress FK violations).
--
-- Fix: Recreate seed_runs with phase_id, phase_name, batch_name as nullable
--      TEXT (remove NOT NULL). Use PRAGMA legacy_alter_table = ON so SQLite
--      does NOT auto-rewrite FK references in dependent tables (seed_raw_artifacts,
--      seed_ingestion_records, seed_election_cycles, seed_enrichment,
--      seed_dedupe_decisions, seed_search_rebuild_jobs, etc.).
--
-- Row count pre-fix: 16 (verified on staging).

-- Step 1: Enable legacy mode so rename does NOT cascade FK reference rewrites
PRAGMA legacy_alter_table = ON;

-- Step 2: Rename existing table to backup
ALTER TABLE seed_runs RENAME TO seed_runs_v2_bak;

-- Step 3: Restore default legacy_alter_table mode
PRAGMA legacy_alter_table = OFF;

-- Step 4: Drop indexes before recreation (they move with the rename, so need
--         to be dropped from the backup name and re-created on the new table)
DROP INDEX IF EXISTS idx_seed_runs_phase;
DROP INDEX IF EXISTS idx_seed_runs_environment;
DROP INDEX IF EXISTS idx_seed_runs_created;

-- Step 5: Create new seed_runs with v1 phase columns now nullable
CREATE TABLE IF NOT EXISTS seed_runs (
  id                  TEXT PRIMARY KEY,
  phase_id            TEXT,
  phase_name          TEXT,
  batch_name          TEXT,
  environment         TEXT NOT NULL DEFAULT 'development'
                      CHECK (environment IN ('development','staging','production')),
  status              TEXT NOT NULL DEFAULT 'planned'
                      CHECK (status IN ('planned','running','completed','failed','rolled_back','superseded')),
  actor               TEXT,
  source_manifest_uri TEXT,
  started_at          INTEGER,
  completed_at        INTEGER,
  rows_extracted      INTEGER NOT NULL DEFAULT 0 CHECK (rows_extracted >= 0),
  rows_inserted       INTEGER NOT NULL DEFAULT 0 CHECK (rows_inserted >= 0),
  rows_updated        INTEGER NOT NULL DEFAULT 0 CHECK (rows_updated >= 0),
  rows_rejected       INTEGER NOT NULL DEFAULT 0 CHECK (rows_rejected >= 0),
  notes               TEXT,
  created_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  source_id           TEXT,
  run_label           TEXT,
  run_state           TEXT NOT NULL DEFAULT 'completed',
  total_input_rows    INTEGER NOT NULL DEFAULT 0,
  total_inserted_rows INTEGER NOT NULL DEFAULT 0,
  total_rejected_rows INTEGER NOT NULL DEFAULT 0
);

-- Step 6: Migrate all existing rows from backup
INSERT OR IGNORE INTO seed_runs
  (id, phase_id, phase_name, batch_name, environment, status, actor,
   source_manifest_uri, started_at, completed_at, rows_extracted, rows_inserted,
   rows_updated, rows_rejected, notes, created_at, updated_at,
   source_id, run_label, run_state, total_input_rows, total_inserted_rows,
   total_rejected_rows)
SELECT
  id, phase_id, phase_name, batch_name, environment, status, actor,
  source_manifest_uri, started_at, completed_at, rows_extracted, rows_inserted,
  rows_updated, rows_rejected, notes, created_at, updated_at,
  source_id, run_label, run_state, total_input_rows, total_inserted_rows,
  total_rejected_rows
FROM seed_runs_v2_bak;

-- Step 7: Rebuild indexes
CREATE INDEX IF NOT EXISTS idx_seed_runs_phase       ON seed_runs(phase_id, status);
CREATE INDEX IF NOT EXISTS idx_seed_runs_environment ON seed_runs(environment, status);
CREATE INDEX IF NOT EXISTS idx_seed_runs_created     ON seed_runs(created_at);
