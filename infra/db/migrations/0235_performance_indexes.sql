-- Migration: 0235_performance_indexes
-- Description: Compound performance indexes for high-frequency query paths (Issue 7).
-- All indexes created with IF NOT EXISTS — safe to re-run.
-- Based on query pattern audit: billing enforcement, entity listing, discovery,
-- projection rebuilds, active session lookup, HITL expiry, and AI usage billing.

-- Subscriptions: billing enforcement runs this on EVERY authenticated request.
-- The middleware queries WHERE workspace_id = ? AND tenant_id = ? for plan status.
CREATE INDEX IF NOT EXISTS idx_subscriptions_workspace_tenant
  ON subscriptions(workspace_id, tenant_id);

-- Entities: high-frequency listing query (GET /entities?workspace_id=...)
-- Used in workspace dashboards and discovery layer.
CREATE INDEX IF NOT EXISTS idx_entities_tenant_workspace
  ON entities(tenant_id, workspace_id);

-- Profiles: discovery search queries filter by tenant + status
-- Used by GET /discovery/* and public B2B search.
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_status
  ON profiles(tenant_id, status);

-- Event log: projection rebuild scans for incremental processing
-- Compound on aggregate_type + aggregate_id + created_at for ordered replay.
CREATE INDEX IF NOT EXISTS idx_event_log_aggregate
  ON event_log(aggregate_type, aggregate_id, created_at);

-- Sessions: active session listing and revoke-all queries
-- Partial index — only indexes non-revoked sessions (smaller index, faster reads).
CREATE INDEX IF NOT EXISTS idx_sessions_user_active
  ON sessions(user_id, tenant_id) WHERE revoked_at IS NULL;

-- AI HITL queue: cross-tenant expiry sweep (CRON scans pending items globally)
-- Partial index on status = 'pending' reduces index size significantly.
CREATE INDEX IF NOT EXISTS idx_hitl_status_expires
  ON ai_hitl_queue(status, expires_at) WHERE status = 'pending';

-- AI usage events: billing aggregation queries for monthly budget calculations.
CREATE INDEX IF NOT EXISTS idx_ai_usage_tenant_created
  ON ai_usage_events(tenant_id, created_at);
