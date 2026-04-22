-- 0365b_fix_place_id_aliases.sql
-- Migrations 0366-0372 reference two place IDs that don't exist in the
-- places table, causing FOREIGN KEY constraint failures on profiles and
-- search_entries.
--
-- Issue:
--   Canonical ID (exists)        Used by 0366-0372 (missing)
--   place_state_crossriver    →  place_state_cross_river
--   place_state_akwaibom      →  place_state_akwa_ibom
--
-- Fix: insert alias rows with the underscore-separated spelling.
-- The aliases carry identical geography data so any FK or join still works.
-- ============================================================

INSERT OR IGNORE INTO places
  (id, name, geography_type, level, parent_id, ancestry_path, tenant_id, created_at, updated_at)
VALUES
  ('place_state_cross_river',
   'Cross River',
   'state',
   3,
   'place_zone_south_south',
   '["place_nigeria_001","place_zone_south_south"]',
   NULL,
   unixepoch(),
   unixepoch()),
  ('place_state_akwa_ibom',
   'Akwa Ibom',
   'state',
   3,
   'place_zone_south_south',
   '["place_nigeria_001","place_zone_south_south"]',
   NULL,
   unixepoch(),
   unixepoch());
