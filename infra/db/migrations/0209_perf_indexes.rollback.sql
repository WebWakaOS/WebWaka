-- Rollback for PERF-04: Database index audit — Sprint 5

DROP INDEX IF EXISTS idx_template_registry_status_installs;
DROP INDEX IF EXISTS idx_template_registry_type_status;
DROP INDEX IF EXISTS idx_discovery_events_type_created;
DROP INDEX IF EXISTS idx_discovery_events_ip_hash_type;
DROP INDEX IF EXISTS idx_search_entries_visibility_type;
DROP INDEX IF EXISTS idx_relationships_subject_id;
DROP INDEX IF EXISTS idx_places_type_parent;
DROP INDEX IF EXISTS idx_template_installations_tenant_status;
