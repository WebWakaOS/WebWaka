-- Migration 0464c: Final schema bridge patch for 0465-0543 seeds (3 remaining columns)
--
-- After 0464a and 0464b, three more column gaps remain:
--   politician_profiles.updated_at
--   seed_dedupe_decisions.canonical_id
--   seed_entity_sources.seed_run_id
--
-- Rollback: 0464c_seed_schema_final_patch.rollback.sql

ALTER TABLE politician_profiles ADD COLUMN updated_at INTEGER;
ALTER TABLE seed_dedupe_decisions ADD COLUMN canonical_id TEXT;
ALTER TABLE seed_entity_sources ADD COLUMN seed_run_id TEXT;
