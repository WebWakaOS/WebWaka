-- Rollback 0443 — Analytics Events
DROP INDEX IF EXISTS idx_analytics_events_key;
DROP INDEX IF EXISTS idx_analytics_events_entity;
DROP INDEX IF EXISTS idx_analytics_events_tenant_workspace;
DROP TABLE IF EXISTS analytics_events;
