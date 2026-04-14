-- Rollback for 0230_init_tenants.sql
DROP INDEX IF EXISTS idx_tenants_plan;
DROP INDEX IF EXISTS idx_tenants_status;
DROP TABLE IF EXISTS tenants;
