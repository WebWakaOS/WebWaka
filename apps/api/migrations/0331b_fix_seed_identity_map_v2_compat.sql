-- 0331b_fix_seed_identity_map_v2_compat.sql
-- 0322b migrated seed_identity_map to v3 schema, renaming:
--   entity_type  → source_entity_type
--   entity_id    → target_entity_id
-- However every seed migration from 0332 onwards still inserts using the
-- original v2 column names (entity_type, entity_id).
-- Fix: add the v2 names back as additional nullable columns so all pending
-- seed INSERTs succeed.  Both column sets coexist; query code may read from
-- either.  source_entity_type / target_entity_id keep their populated v3 data.
-- ============================================================

ALTER TABLE seed_identity_map ADD COLUMN entity_type TEXT;
ALTER TABLE seed_identity_map ADD COLUMN entity_id   TEXT;
