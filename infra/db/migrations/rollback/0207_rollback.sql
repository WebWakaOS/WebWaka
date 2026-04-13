-- Rollback 0207: Drop template_installations table and indexes
DROP INDEX IF EXISTS idx_template_installations_status;
DROP INDEX IF EXISTS idx_template_installations_template;
DROP INDEX IF EXISTS idx_template_installations_tenant;
DROP TABLE IF EXISTS template_installations;
