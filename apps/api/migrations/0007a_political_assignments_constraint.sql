-- Migration 0007a: Add UNIQUE(individual_id, jurisdiction_id, office_type) to political_assignments
-- Issue #12 — Milestone 2 carry-over
--
-- SQLite does not support ADD CONSTRAINT on existing tables.
-- This migration recreates the table with the required unique constraint.

CREATE TABLE IF NOT EXISTS political_assignments_new (
  id                 TEXT NOT NULL PRIMARY KEY,
  individual_id      TEXT NOT NULL REFERENCES individuals(id),
  office_type        TEXT NOT NULL,
  jurisdiction_id    TEXT NOT NULL REFERENCES jurisdictions(id),
  term_id            TEXT NOT NULL REFERENCES terms(id),
  verification_state TEXT NOT NULL DEFAULT 'unverified',
  tenant_id          TEXT NOT NULL,
  created_at         INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at         INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (individual_id, jurisdiction_id, office_type)
);

INSERT OR IGNORE INTO political_assignments_new SELECT * FROM political_assignments;
DROP TABLE political_assignments;
ALTER TABLE political_assignments_new RENAME TO political_assignments;

CREATE INDEX IF NOT EXISTS idx_political_assignments_individual_id   ON political_assignments(individual_id);
CREATE INDEX IF NOT EXISTS idx_political_assignments_jurisdiction_id ON political_assignments(jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_political_assignments_office_type     ON political_assignments(office_type);
CREATE INDEX IF NOT EXISTS idx_political_assignments_tenant_id       ON political_assignments(tenant_id);
