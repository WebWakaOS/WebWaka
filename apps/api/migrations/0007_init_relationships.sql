-- Migration 0007: Relationships table
-- Deliverable 3 — @webwaka/relationships

CREATE TABLE IF NOT EXISTS relationships (
  id           TEXT    NOT NULL PRIMARY KEY,
  kind         TEXT    NOT NULL,
  subject_type TEXT    NOT NULL,
  subject_id   TEXT    NOT NULL,
  object_type  TEXT    NOT NULL,
  object_id    TEXT    NOT NULL,
  tenant_id    TEXT    NOT NULL,
  metadata     TEXT,              -- JSON blob
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_relationships_subject   ON relationships(subject_type, subject_id);
CREATE INDEX IF NOT EXISTS idx_relationships_object    ON relationships(object_type, object_id);
CREATE INDEX IF NOT EXISTS idx_relationships_kind      ON relationships(kind);
CREATE INDEX IF NOT EXISTS idx_relationships_tenant_id ON relationships(tenant_id);
