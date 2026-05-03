-- Rollback for 0464c_seed_schema_final_patch.sql
ALTER TABLE politician_profiles DROP COLUMN IF EXISTS updated_at;
ALTER TABLE seed_dedupe_decisions DROP COLUMN IF EXISTS canonical_id;
ALTER TABLE seed_entity_sources DROP COLUMN IF EXISTS seed_run_id;
