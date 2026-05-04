-- Rollback: 0546_political_assignments_nullable_jurisdiction
-- Restores political_assignments.jurisdiction_id to TEXT NOT NULL.
-- WARNING: rows with NULL jurisdiction_id will be lost.

ALTER TABLE political_assignments RENAME TO political_assignments_bak_0546r;

CREATE TABLE "political_assignments" (
  id                 TEXT NOT NULL PRIMARY KEY,
  individual_id      TEXT NOT NULL REFERENCES individuals(id),
  office_type        TEXT NOT NULL,
  jurisdiction_id    TEXT NOT NULL REFERENCES jurisdictions(id),
  term_id            TEXT NOT NULL REFERENCES terms(id),
  verification_state TEXT NOT NULL DEFAULT 'unverified',
  tenant_id          TEXT NOT NULL,
  created_at         INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at         INTEGER NOT NULL DEFAULT (unixepoch()),
  took_office_year   INTEGER,
  left_office_year   INTEGER,
  jurisdiction_place_id TEXT,
  UNIQUE (individual_id, jurisdiction_id, office_type)
);

-- Copy back only rows that have a valid jurisdiction_id
INSERT INTO political_assignments
  SELECT * FROM political_assignments_bak_0546r
  WHERE jurisdiction_id IS NOT NULL;

DROP TABLE political_assignments_bak_0546r;
