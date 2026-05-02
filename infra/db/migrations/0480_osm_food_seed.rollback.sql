-- ============================================================
-- Rollback: 0480_osm_food_seed.sql
-- WARNING: Deletes all records seeded by this migration
-- ============================================================
BEGIN TRANSACTION;

-- Remove enrichment, entity sources, ingestion records (FK children first)
DELETE FROM seed_enrichment        WHERE seed_run_id = 'seed_run_s09_osm_food_20260502';
DELETE FROM seed_entity_sources    WHERE seed_run_id = 'seed_run_s09_osm_food_20260502';
DELETE FROM seed_ingestion_records WHERE seed_run_id = 'seed_run_s09_osm_food_20260502';

-- Remove search_entries → profiles (via profile_id linkage)
DELETE FROM search_entries WHERE profile_id IN (
  SELECT id FROM profiles WHERE workspace_id = 'workspace_platform_seed_discovery'
    AND subject_id IN (
      SELECT entity_id FROM seed_entity_sources WHERE source_id = 'seed_source_osm_food_ng_20260502'
    )
);
DELETE FROM profiles WHERE workspace_id = 'workspace_platform_seed_discovery'
  AND subject_id IN (
    SELECT id FROM organizations WHERE tenant_id = 'tenant_platform_seed'
      AND id LIKE 'org_%'
      AND id IN (
        SELECT entity_id FROM seed_ingestion_records WHERE seed_run_id = 'seed_run_s09_osm_food_20260502'
      )
  );
DELETE FROM organizations WHERE tenant_id = 'tenant_platform_seed'
  AND id IN (
    SELECT entity_id FROM seed_ingestion_records WHERE seed_run_id = 'seed_run_s09_osm_food_20260502'
  );

-- Remove seed infrastructure
DELETE FROM seed_raw_artifacts WHERE seed_run_id = 'seed_run_s09_osm_food_20260502';
DELETE FROM seed_runs          WHERE id = 'seed_run_s09_osm_food_20260502';
-- Note: seed_sources retained (shared reference)

COMMIT;
