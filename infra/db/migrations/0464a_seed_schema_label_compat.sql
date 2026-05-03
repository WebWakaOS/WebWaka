-- Migration 0464a: seed_sources + seed_runs label/confidence_tier/phase compat columns
--
-- The 0465+ political-assembly and OSM seed migrations (generated 2026-05-02)
-- INSERT into seed_sources using (id, label, source_type, url, confidence_tier, notes)
-- and into seed_runs using (id, label, phase, status, started_at, completed_at).
--
-- The current staging schema has:
--   seed_sources.source_label   (not label)
--   seed_sources.confidence     (not confidence_tier)
--   seed_runs.run_label         (not label)
--   seed_runs.phase_name        (not phase)
--
-- This bridge migration adds the missing alias columns so that all 0465-0543
-- seed migrations apply without schema errors.
-- All columns are nullable (no constraints) — existing rows are unaffected.
-- INSERT OR IGNORE statements in 0465+ migrations will populate these columns.
--
-- Rollback: 0464a_seed_schema_label_compat.rollback.sql

ALTER TABLE seed_sources ADD COLUMN label TEXT;
ALTER TABLE seed_sources ADD COLUMN confidence_tier TEXT;
ALTER TABLE seed_runs ADD COLUMN label TEXT;
ALTER TABLE seed_runs ADD COLUMN phase TEXT;
