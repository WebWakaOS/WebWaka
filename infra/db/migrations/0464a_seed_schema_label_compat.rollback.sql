-- Rollback for 0464a_seed_schema_label_compat.sql
-- D1 (SQLite 3.35+) supports DROP COLUMN.
-- Only safe to apply if the label/confidence_tier/phase columns contain no data.

ALTER TABLE seed_sources DROP COLUMN IF EXISTS label;
ALTER TABLE seed_sources DROP COLUMN IF EXISTS confidence_tier;
ALTER TABLE seed_runs DROP COLUMN IF EXISTS label;
ALTER TABLE seed_runs DROP COLUMN IF EXISTS phase;
