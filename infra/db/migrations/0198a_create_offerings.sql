-- Migration 0198a: Create offerings table
-- Core workspace entity for service/product offerings (MON-04 offering limit).
-- Referenced by search-sync triggers (0199) and offering-limit enforcement.
--
-- Platform Invariants:
--   P1  — Build Once  (shared via @webwaka/offerings package)
--   P9  — Naira/Kobo  (price stored as integer kobo)
--   T3  — Tenant isolation (all queries scoped by tenant_id)
--   T2  — Workspace isolation (workspace_id foreign key)

CREATE TABLE IF NOT EXISTS offerings (
  id           TEXT    NOT NULL PRIMARY KEY,
  tenant_id    TEXT    NOT NULL,
  workspace_id TEXT    NOT NULL,
  name         TEXT    NOT NULL,
  description  TEXT,
  price_kobo   INTEGER,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 0 CHECK (is_published IN (0, 1)),
  category     TEXT,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_offerings_tenant
  ON offerings (tenant_id);

CREATE INDEX IF NOT EXISTS idx_offerings_workspace
  ON offerings (workspace_id, tenant_id);

CREATE INDEX IF NOT EXISTS idx_offerings_published
  ON offerings (tenant_id, is_published, sort_order);
