-- PERF-04: Database index audit — Sprint 5
-- Adds indexes for high-traffic query patterns identified in the performance audit.
-- All indexes use IF NOT EXISTS to be idempotent.

-- Template registry: listing queries filter by status and sort by install_count
CREATE INDEX IF NOT EXISTS idx_template_registry_status_installs
  ON template_registry (status, install_count DESC, created_at DESC);

-- Template registry: type filter within approved templates
CREATE INDEX IF NOT EXISTS idx_template_registry_type_status
  ON template_registry (template_type, status);

-- Discovery events: trending query groups by entity_id, filters by event_type + created_at
CREATE INDEX IF NOT EXISTS idx_discovery_events_type_created
  ON discovery_events (event_type, created_at);

-- Discovery events: claim-intent rate limiting by ip_hash
CREATE INDEX IF NOT EXISTS idx_discovery_events_ip_hash_type
  ON discovery_events (ip_hash, event_type, created_at)
  WHERE ip_hash IS NOT NULL;

-- Search entries: nearby queries filter by visibility + entity_type (composite)
CREATE INDEX IF NOT EXISTS idx_search_entries_visibility_type
  ON search_entries (visibility, entity_type);

-- Relationships: discovery profile view joins by subject_id
CREATE INDEX IF NOT EXISTS idx_relationships_subject_id
  ON relationships (subject_id, created_at DESC);

-- Places: geography queries filter by geography_type + parent_id
CREATE INDEX IF NOT EXISTS idx_places_type_parent
  ON places (geography_type, parent_id);

-- Template installations: tenant-scoped active installs
CREATE INDEX IF NOT EXISTS idx_template_installations_tenant_status
  ON template_installations (tenant_id, status);
