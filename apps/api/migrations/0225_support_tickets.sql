-- Migration: 0225_support_tickets
-- Description: Support ticket system for MED-013 (PROD-10) — P6-C
-- Invariant: T3 (tenant_id isolation), SEC (assignee update requires admin role)

CREATE TABLE IF NOT EXISTS support_tickets (
  id           TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id    TEXT NOT NULL,
  subject      TEXT NOT NULL,
  body         TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'open'
               CHECK(status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority     TEXT NOT NULL DEFAULT 'normal'
               CHECK(priority IN ('low', 'normal', 'high', 'urgent')),
  assignee_id  TEXT,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_tenant
  ON support_tickets (tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status
  ON support_tickets (status, priority);

CREATE INDEX IF NOT EXISTS idx_support_tickets_workspace
  ON support_tickets (workspace_id);
