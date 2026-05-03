-- Rollback: 0492_hdx_health_nc_ne_seed.sql
-- WARNING: Deletes all health facilities seeded by this migration
BEGIN TRANSACTION;
DELETE FROM seed_enrichment        WHERE seed_run_id = 'seed_run_s06_hdx_nc_ne_20260502';
DELETE FROM seed_entity_sources    WHERE seed_run_id = 'seed_run_s06_hdx_nc_ne_20260502';
DELETE FROM seed_ingestion_records WHERE seed_run_id = 'seed_run_s06_hdx_nc_ne_20260502';
DELETE FROM search_entries WHERE profile_id IN (
  SELECT id FROM profiles WHERE workspace_id = 'workspace_platform_seed_discovery'
    AND subject_id IN (SELECT id FROM organizations WHERE tenant_id = 'tenant_platform_seed'
      AND id LIKE 'org_s06_hdx_%')
);
DELETE FROM profiles WHERE workspace_id = 'workspace_platform_seed_discovery'
  AND subject_id IN (SELECT entity_id FROM seed_ingestion_records WHERE seed_run_id = 'seed_run_s06_hdx_nc_ne_20260502');
DELETE FROM organizations WHERE tenant_id = 'tenant_platform_seed'
  AND id IN (SELECT entity_id FROM seed_ingestion_records WHERE seed_run_id = 'seed_run_s06_hdx_nc_ne_20260502');
DELETE FROM seed_raw_artifacts WHERE seed_run_id = 'seed_run_s06_hdx_nc_ne_20260502';
DELETE FROM seed_runs          WHERE id = 'seed_run_s06_hdx_nc_ne_20260502';
COMMIT;
