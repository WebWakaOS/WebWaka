-- 0322b_seed_identity_map_v3_schema.sql
-- Migrate seed_identity_map from v2 schema to v3 superset schema.
-- 
-- v2 columns: id, seed_run_id, source_id, source_record_id, source_record_hash,
--             entity_type, entity_id, profile_id, vertical_slug, stable_key,
--             generation_method, mapping_state, created_at, updated_at
--
-- v3 additions (used by 0323+ seed migrations):
--   source_entity_type  (replaces entity_type)
--   target_entity_id    (replaces entity_id)
--   target_entity_type  (new: type of the target entity)
--   id_stability        (new: stable | unstable | provisional)
--   status              (new: maps from mapping_state)
--
-- Strategy: CREATE_NEW + INSERT SELECT + RENAME + DROP
-- No external FKs reference seed_identity_map, so rename is safe.
-- ============================================================

CREATE TABLE seed_identity_map_v3 (
  id                 TEXT    PRIMARY KEY,
  seed_run_id        TEXT,
  source_entity_type TEXT,
  source_id          TEXT    NOT NULL REFERENCES seed_sources(id),
  source_record_id   TEXT    NOT NULL,
  source_record_hash TEXT,
  target_entity_id   TEXT,
  target_entity_type TEXT,
  profile_id         TEXT,
  vertical_slug      TEXT,
  stable_key         TEXT,
  generation_method  TEXT,
  id_stability       TEXT,
  status             TEXT,
  mapping_state      TEXT,
  created_at         INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at         INTEGER
);

INSERT OR IGNORE INTO seed_identity_map_v3
  (id, seed_run_id, source_entity_type, source_id, source_record_id,
   source_record_hash, target_entity_id, profile_id, vertical_slug,
   stable_key, generation_method, status, mapping_state,
   created_at, updated_at)
SELECT
  id, seed_run_id, entity_type, source_id, source_record_id,
  source_record_hash, entity_id, profile_id, vertical_slug,
  stable_key, generation_method, mapping_state, mapping_state,
  created_at, updated_at
FROM seed_identity_map;

DROP INDEX IF EXISTS idx_seed_identity_map_entity;
DROP INDEX IF EXISTS idx_seed_identity_map_run;
DROP INDEX IF EXISTS idx_seed_identity_map_stable;
DROP INDEX IF EXISTS idx_seed_identity_map_mapping;

ALTER TABLE seed_identity_map RENAME TO seed_identity_map_v2_bak;
ALTER TABLE seed_identity_map_v3 RENAME TO seed_identity_map;

DROP TABLE seed_identity_map_v2_bak;

CREATE INDEX IF NOT EXISTS idx_seed_identity_map_entity   ON seed_identity_map(source_entity_type, target_entity_id);
CREATE INDEX IF NOT EXISTS idx_seed_identity_map_run      ON seed_identity_map(seed_run_id);
CREATE INDEX IF NOT EXISTS idx_seed_identity_map_stable   ON seed_identity_map(stable_key);
CREATE INDEX IF NOT EXISTS idx_seed_identity_map_status   ON seed_identity_map(status);
