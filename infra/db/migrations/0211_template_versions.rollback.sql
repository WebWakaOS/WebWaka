-- Rollback: 0211_template_versions
-- Drops template_upgrade_log and template_versions tables.

DROP INDEX IF EXISTS idx_upgrade_log_tenant;
DROP INDEX IF EXISTS idx_upgrade_log_installation;
DROP TABLE IF EXISTS template_upgrade_log;

DROP INDEX IF EXISTS idx_template_versions_template_id;
DROP TABLE IF EXISTS template_versions;
