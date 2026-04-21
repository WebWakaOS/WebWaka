-- 0217: Webhook subscriptions — PROD-04 Webhook System
-- T3: tenant_id + workspace_id on all records
-- Stores per-workspace webhook endpoint registrations.

CREATE TABLE IF NOT EXISTS webhook_subscriptions (
  id          TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id   TEXT NOT NULL,
  url         TEXT NOT NULL,
  events      TEXT NOT NULL DEFAULT '[]',  -- JSON array of event type strings
  secret      TEXT NOT NULL,               -- HMAC-SHA256 signing secret (stored plaintext; secret is workspace-owned)
  active      INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_ws_workspace ON webhook_subscriptions(workspace_id, tenant_id);
CREATE INDEX idx_ws_active ON webhook_subscriptions(active);
