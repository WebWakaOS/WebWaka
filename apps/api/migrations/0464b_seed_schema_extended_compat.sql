-- Migration 0464b: Extended schema bridge for 0465-0543 seed migrations (part 2)
--
-- Continuation of 0464a. Adds all remaining missing columns needed by the
-- political/OSM/regulated entity seed migrations (0465-0543).
-- 0464a already added: seed_sources.label, seed_sources.confidence_tier,
--                       seed_runs.label, seed_runs.phase
-- This migration adds everything else.
--
-- All columns are nullable; no existing data is affected.
-- Rollback: 0464b_seed_schema_extended_compat.rollback.sql

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
-- terms currently: id, start_date, end_date, confirmed_at, created_at, updated_at
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
CREATE TABLE IF NOT EXISTS election_cycles (
  id            TEXT NOT NULL PRIMARY KEY,
  label         TEXT,
  cycle_type    TEXT,
  election_year INTEGER,
  start_date    TEXT,
  end_date      TEXT,
  status        TEXT NOT NULL DEFAULT 'completed',
  notes         TEXT,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_election_cycles_year ON election_cycles(election_year, cycle_type);
