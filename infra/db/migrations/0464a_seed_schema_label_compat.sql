-- Migration 0464a: Comprehensive schema bridge for 0465-0543 seed migrations
--
-- The 0465+ seed migrations (political assemblies, OSM data, regulated entities)
-- were generated against a newer schema version. The current staging schema
-- is missing several columns used by these INSERT OR IGNORE statements.
--
-- This migration adds all missing nullable columns in one idempotent batch.
-- No existing data is modified; all new columns default to NULL.
-- Rollback: 0464a_seed_schema_label_compat.rollback.sql
--
-- Tables patched:
--   seed_sources         — label, confidence_tier
--   seed_runs            — label, phase
--   seed_raw_artifacts   — notes
--   seed_dedupe_decisions — notes, dedup_key, entity_type, entity_id
--   seed_entity_sources  — confidence_tier
--   seed_place_resolutions — source_name
--   seed_ingestion_records — entity_id, entity_type, status
--   seed_identity_map    — canonical_entity_id, source_entity_key
--   seed_enrichment      — enrichment_type
--   individuals          — full_name, workspace_id
--   search_entries       — vertical
--   terms                — label, election_cycle_id, level, office_type, jurisdiction_place_id
--   political_assignments — took_office_year, left_office_year, jurisdiction_place_id
--   politician_profiles  — profile_id, jurisdiction_place_id, office_title
--   party_affiliations   — start_year, is_current
-- Tables created:
--   election_cycles      — needed by terms.election_cycle_id

-- ── seed_sources ──────────────────────────────────────────────────────────────
ALTER TABLE seed_sources ADD COLUMN label TEXT;
ALTER TABLE seed_sources ADD COLUMN confidence_tier TEXT;

-- ── seed_runs ─────────────────────────────────────────────────────────────────
ALTER TABLE seed_runs ADD COLUMN label TEXT;
ALTER TABLE seed_runs ADD COLUMN phase TEXT;

-- ── seed_raw_artifacts ────────────────────────────────────────────────────────
ALTER TABLE seed_raw_artifacts ADD COLUMN notes TEXT;

-- ── seed_dedupe_decisions ─────────────────────────────────────────────────────
ALTER TABLE seed_dedupe_decisions ADD COLUMN notes TEXT;
ALTER TABLE seed_dedupe_decisions ADD COLUMN dedup_key TEXT;
ALTER TABLE seed_dedupe_decisions ADD COLUMN entity_type TEXT;
ALTER TABLE seed_dedupe_decisions ADD COLUMN entity_id TEXT;

-- ── seed_entity_sources ───────────────────────────────────────────────────────
ALTER TABLE seed_entity_sources ADD COLUMN confidence_tier TEXT;

-- ── seed_place_resolutions ────────────────────────────────────────────────────
ALTER TABLE seed_place_resolutions ADD COLUMN source_name TEXT;

-- ── seed_ingestion_records ────────────────────────────────────────────────────
ALTER TABLE seed_ingestion_records ADD COLUMN entity_id TEXT;
ALTER TABLE seed_ingestion_records ADD COLUMN entity_type TEXT;
ALTER TABLE seed_ingestion_records ADD COLUMN status TEXT;

-- ── seed_identity_map ─────────────────────────────────────────────────────────
ALTER TABLE seed_identity_map ADD COLUMN canonical_entity_id TEXT;
ALTER TABLE seed_identity_map ADD COLUMN source_entity_key TEXT;

-- ── seed_enrichment ───────────────────────────────────────────────────────────
ALTER TABLE seed_enrichment ADD COLUMN enrichment_type TEXT;

-- ── individuals ───────────────────────────────────────────────────────────────
ALTER TABLE individuals ADD COLUMN full_name TEXT;
ALTER TABLE individuals ADD COLUMN workspace_id TEXT;

-- ── search_entries ────────────────────────────────────────────────────────────
ALTER TABLE search_entries ADD COLUMN vertical TEXT;

-- ── terms ─────────────────────────────────────────────────────────────────────
-- terms table currently only has: id, start_date, end_date, confirmed_at, created_at, updated_at
ALTER TABLE terms ADD COLUMN label TEXT;
ALTER TABLE terms ADD COLUMN election_cycle_id TEXT;
ALTER TABLE terms ADD COLUMN level TEXT;
ALTER TABLE terms ADD COLUMN office_type TEXT;
ALTER TABLE terms ADD COLUMN jurisdiction_place_id TEXT;

-- ── political_assignments ─────────────────────────────────────────────────────
ALTER TABLE political_assignments ADD COLUMN took_office_year INTEGER;
ALTER TABLE political_assignments ADD COLUMN left_office_year INTEGER;
ALTER TABLE political_assignments ADD COLUMN jurisdiction_place_id TEXT;

-- ── politician_profiles ───────────────────────────────────────────────────────
ALTER TABLE politician_profiles ADD COLUMN profile_id TEXT;
ALTER TABLE politician_profiles ADD COLUMN jurisdiction_place_id TEXT;
ALTER TABLE politician_profiles ADD COLUMN office_title TEXT;

-- ── party_affiliations ────────────────────────────────────────────────────────
ALTER TABLE party_affiliations ADD COLUMN start_year INTEGER;
ALTER TABLE party_affiliations ADD COLUMN is_current INTEGER NOT NULL DEFAULT 0;

-- ── election_cycles (new table) ───────────────────────────────────────────────
-- Referenced by terms.election_cycle_id in 0465+ seed migrations.
CREATE TABLE IF NOT EXISTS election_cycles (
  id           TEXT NOT NULL PRIMARY KEY,
  label        TEXT,
  cycle_type   TEXT,
  election_year INTEGER,
  start_date   TEXT,
  end_date     TEXT,
  status       TEXT NOT NULL DEFAULT 'completed',
  notes        TEXT,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_election_cycles_year ON election_cycles(election_year, cycle_type);
