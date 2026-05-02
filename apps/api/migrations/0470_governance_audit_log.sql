-- Migration 0470: Governance Audit Log (cross-cutting)
-- Append-only audit trail for all configuration changes across all 5 layers.

CREATE TABLE IF NOT EXISTS governance_audit_log (
  id              TEXT NOT NULL PRIMARY KEY,
  -- Actor
  actor_id        TEXT NOT NULL,
  actor_role      TEXT NOT NULL,
  actor_level     TEXT NOT NULL CHECK (actor_level IN ('super_admin','platform_admin','partner_admin','tenant_admin','workspace_admin','system')),
  -- Context
  tenant_id       TEXT,
  partner_id      TEXT,
  workspace_id    TEXT,
  -- Action
  action          TEXT NOT NULL,
  resource_type   TEXT NOT NULL,
  resource_id     TEXT,
  -- Payload
  before_json     TEXT,
  after_json      TEXT,
  -- Metadata
  ip_address      TEXT,
  user_agent      TEXT,
  request_id      TEXT,
  -- Approval linkage
  approval_id     TEXT REFERENCES delegation_approval_queue(id),
  -- Outcome
  status          TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success','failure','pending_approval')),
  failure_reason  TEXT,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

-- No UPDATE/DELETE ever allowed on this table — enforced at application layer.
-- Index for common query patterns:
CREATE INDEX IF NOT EXISTS idx_gov_audit_actor      ON governance_audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_gov_audit_tenant     ON governance_audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gov_audit_resource   ON governance_audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_gov_audit_action     ON governance_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_gov_audit_created    ON governance_audit_log(created_at DESC);
