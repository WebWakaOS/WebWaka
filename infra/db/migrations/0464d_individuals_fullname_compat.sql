-- Migration 0464d: Fix individuals table to allow full_name-only inserts
--
-- The political/OSM seed migrations (0465-0543) insert individuals using only
-- the `full_name` column (no first_name/last_name). Since first_name and last_name
-- are NOT NULL without a DEFAULT, those INSERTs fail silently via INSERT OR IGNORE,
-- which then causes FOREIGN KEY violations on political_assignments.
--
-- SQLite does not support ALTER TABLE MODIFY COLUMN, and DROP TABLE on a referenced
-- table fails. So we use RENAME + CREATE + COPY + DROP-BACKUP approach:
--   1. Rename individuals → individuals_v1_bak (no FKs reference the backup name)
--   2. Create new individuals with DEFAULT '' on first_name/last_name
--   3. Copy all existing data from backup to new table
--   4. Drop the backup (safe: no FKs reference individuals_v1_bak)
--
-- SAFETY: All existing 9000+ rows are preserved. FK references from political_assignments
-- etc. continue to work because they reference "individuals" by name (still exists).
-- Rollback: 0464d_individuals_fullname_compat.rollback.sql

-- Step 1: Rename the original table to a backup
ALTER TABLE individuals RENAME TO individuals_v1_bak;

-- Step 2: Recreate individuals with DEFAULT '' on first_name and last_name
CREATE TABLE individuals (
  id                  TEXT NOT NULL PRIMARY KEY,
  tenant_id           TEXT NOT NULL,
  first_name          TEXT NOT NULL DEFAULT '',
  last_name           TEXT NOT NULL DEFAULT '',
  middle_name         TEXT,
  display_name        TEXT,
  verification_state  TEXT NOT NULL DEFAULT 'unverified',
  created_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  nin_hash            TEXT,
  full_name           TEXT,
  workspace_id        TEXT
);

-- Step 3: Copy all existing data from backup to new table
INSERT INTO individuals
  SELECT id, tenant_id, first_name, last_name, middle_name, display_name,
         verification_state, created_at, updated_at, nin_hash, full_name, workspace_id
  FROM individuals_v1_bak;

-- Step 4: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_individuals_tenant ON individuals(tenant_id);

-- Step 5: Drop the backup (safe: no other table has FKs referencing individuals_v1_bak)
DROP TABLE individuals_v1_bak;
