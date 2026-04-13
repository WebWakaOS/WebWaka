-- Rollback 0206: Drop template registry table and indexes
DROP INDEX IF EXISTS idx_template_registry_author;
DROP INDEX IF EXISTS idx_template_registry_slug;
DROP INDEX IF EXISTS idx_template_registry_status;
DROP INDEX IF EXISTS idx_template_registry_type;
DROP TABLE IF EXISTS template_registry;
