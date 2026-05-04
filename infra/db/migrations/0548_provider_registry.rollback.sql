-- Rollback: 0548_provider_registry
DROP INDEX IF EXISTS idx_provider_registry_status;
DROP INDEX IF EXISTS idx_provider_registry_scope_id;
DROP INDEX IF EXISTS idx_provider_registry_category_scope;
DROP TABLE IF EXISTS provider_registry;
