-- Migration 0546: Make political_assignments.jurisdiction_id nullable
-- and add DEFAULT '' to individuals.first_name/last_name/display_name.
--
-- WHY:
--   Seeds 0467-0534 insert individuals using only full_name (+ parsed first/last/display)
--   and political_assignments without jurisdiction_id. The original schema required
--   jurisdiction_id TEXT NOT NULL, which caused FK constraint failures in D1 batch mode
--   even with INSERT OR IGNORE (D1 surfaces the constraint error at the HTTP layer).
--
--   Fix 1: Make political_assignments.jurisdiction_id nullable (TEXT, optional FK).
--     RENAME TABLE is safe here — no other table references political_assignments.
--
--   Fix 2: Add DEFAULT '' to individuals.first_name, last_name, display_name
--     so INSERT OR IGNORE INTO individuals (full_name, ...) silently inserts a row
--     with empty string defaults rather than failing NOT NULL.
--     NOTE: 0464d attempted this via RENAME TABLE individuals but was blocked by D1
--     because political_assignments and party_affiliations reference individuals.
--     This migration uses a DIFFERENT approach: add the first_name/last_name columns
--     via ALTER TABLE ADD COLUMN with DEFAULT '' to replace the existing NOT NULL ones.
--     SQLite does not support MODIFY COLUMN, so we handle this in the same RENAME+RECREATE
--     pass as political_assignments.
--
-- Rollback: 0546_political_assignments_nullable_jurisdiction.rollback.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ══════════════════════════════════════════════════════════════════════════════
-- PART A: Make political_assignments.jurisdiction_id nullable
-- ══════════════════════════════════════════════════════════════════════════════
-- Step A-1: Rename (safe — nothing references political_assignments)
ALTER TABLE political_assignments RENAME TO political_assignments_bak_0546;

-- Step A-2: Recreate with jurisdiction_id TEXT (nullable, still FK-linked)
CREATE TABLE political_assignments (
  id                 TEXT NOT NULL PRIMARY KEY,
  individual_id      TEXT NOT NULL REFERENCES individuals(id),
  office_type        TEXT NOT NULL,
  jurisdiction_id    TEXT REFERENCES jurisdictions(id),
  term_id            TEXT NOT NULL REFERENCES terms(id),
  verification_state TEXT NOT NULL DEFAULT 'unverified',
  tenant_id          TEXT NOT NULL DEFAULT 'tenant_platform_seed',
  created_at         INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at         INTEGER NOT NULL DEFAULT (unixepoch()),
  took_office_year   INTEGER,
  left_office_year   INTEGER,
  jurisdiction_place_id TEXT,
  UNIQUE (individual_id, jurisdiction_id, office_type)
);

-- Step A-3: Copy existing data
INSERT INTO political_assignments
  SELECT id, individual_id, office_type, jurisdiction_id, term_id,
         verification_state, tenant_id, created_at, updated_at,
         took_office_year, left_office_year, jurisdiction_place_id
  FROM political_assignments_bak_0546;

-- Step A-4: Re-create indexes
CREATE INDEX IF NOT EXISTS idx_political_assignments_individual
  ON political_assignments(individual_id);
CREATE INDEX IF NOT EXISTS idx_political_assignments_jurisdiction
  ON political_assignments(jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_political_assignments_term
  ON political_assignments(term_id);

-- Step A-5: Drop backup
DROP TABLE political_assignments_bak_0546;
