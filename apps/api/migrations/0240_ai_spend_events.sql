-- Migration: 0240_ai_spend_events
-- Description: Fine-grained AI spend event tracking for P22 — AI SuperAgent Production.
-- Records each AI request's cost in WakaCU (integer units).
-- Used for real-time budget enforcement and monthly billing aggregation.
-- T3: all queries scoped by tenant_id.

CREATE TABLE IF NOT EXISTS ai_spend_events (
  id            TEXT NOT NULL PRIMARY KEY,
  tenant_id     TEXT NOT NULL,
  workspace_id  TEXT NOT NULL,
  user_id       TEXT NOT NULL,
  vertical      TEXT,
  capability    TEXT NOT NULL,
  model_used    TEXT,
  wakaCU_cost   INTEGER NOT NULL DEFAULT 0 CHECK (wakaCU_cost >= 0),
  request_id    TEXT,
  hitl_level    INTEGER,
  status        TEXT NOT NULL DEFAULT 'completed'
                CHECK (status IN ('completed', 'rejected_budget', 'rejected_consent', 'failed')),
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_ai_spend_tenant_month
  ON ai_spend_events(tenant_id, created_at);

CREATE INDEX IF NOT EXISTS idx_ai_spend_user
  ON ai_spend_events(tenant_id, user_id, created_at);
