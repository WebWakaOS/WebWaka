-- Migration: 0236_hitl_escalations
-- Description: Escalation record table for HITL Level 3 items that expire without review (Issue 8).
-- When a regulatory-level HITL item (level 3) expires, the projections CRON
-- writes an escalation row here. Tenant admins are notified via email/in-app.
-- Platform super_admins can view cross-tenant escalations for regulatory audit.
-- T3: All queries scoped by tenant_id.

CREATE TABLE IF NOT EXISTS hitl_escalations (
  id              TEXT NOT NULL PRIMARY KEY,
  queue_item_id   TEXT NOT NULL,
  tenant_id       TEXT NOT NULL,
  workspace_id    TEXT NOT NULL DEFAULT '',
  escalation_type TEXT NOT NULL DEFAULT 'expired_regulatory'
                  CHECK (escalation_type IN ('expired_regulatory', 'review_timeout', 'policy_violation')),
  notified_at     INTEGER,
  resolved_at     INTEGER,
  resolved_by     TEXT,
  resolution_note TEXT,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_hitl_escalations_tenant
  ON hitl_escalations(tenant_id, created_at);

CREATE INDEX IF NOT EXISTS idx_hitl_escalations_unresolved
  ON hitl_escalations(tenant_id, resolved_at) WHERE resolved_at IS NULL;
