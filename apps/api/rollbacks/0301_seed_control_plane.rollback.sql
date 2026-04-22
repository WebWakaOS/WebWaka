DELETE FROM seed_sources WHERE id = 'seed_source_webwaka_s00_plan_20260421';
DELETE FROM seed_runs WHERE id = 'seed_run_s00_control_plane_20260421';

DROP TABLE IF EXISTS seed_coverage_snapshots;
DROP TABLE IF EXISTS seed_enrichment;
DROP TABLE IF EXISTS seed_entity_sources;
DROP TABLE IF EXISTS seed_dedupe_decisions;
DROP TABLE IF EXISTS seed_raw_artifacts;
DROP TABLE IF EXISTS seed_sources;
DROP TABLE IF EXISTS seed_runs;

DELETE FROM workspaces WHERE id = 'workspace_platform_seed_discovery';
DELETE FROM organizations WHERE id = 'org_platform_seed';
DELETE FROM tenants WHERE id = 'tenant_platform_seed';
