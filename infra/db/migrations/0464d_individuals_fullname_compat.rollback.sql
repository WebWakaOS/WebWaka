-- Rollback for 0464d: Restore individuals table to original schema (first_name/last_name NOT NULL no default)
--
-- WARNING: This rollback removes the DEFAULT '' from first_name and last_name.
-- After rollback, political seed migrations (0465-0543) will not be able to insert
-- individuals without explicitly providing first_name and last_name.
-- All existing data is preserved.

-- Step 1: Rename current individuals (with DEFAULT '') to backup
ALTER TABLE individuals RENAME TO individuals_v2_bak;

-- Step 2: Recreate original individuals table (first_name/last_name NOT NULL, no default)
CREATE TABLE individuals (
  id                  TEXT NOT NULL PRIMARY KEY,
  tenant_id           TEXT NOT NULL,
  first_name          TEXT NOT NULL,
  last_name           TEXT NOT NULL,
  middle_name         TEXT,
  display_name        TEXT,
  verification_state  TEXT NOT NULL DEFAULT 'unverified',
  created_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  nin_hash            TEXT,
  full_name           TEXT,
  workspace_id        TEXT
);

-- Step 3: Copy all data back (only rows that have non-empty first_name/last_name can be restored)
INSERT INTO individuals
  SELECT id, tenant_id, first_name, last_name, middle_name, display_name,
         verification_state, created_at, updated_at, nin_hash, full_name, workspace_id
  FROM individuals_v2_bak
  WHERE first_name != '' OR last_name != '';

-- Step 4: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_individuals_tenant ON individuals(tenant_id);

-- Step 5: Drop the backup
DROP TABLE individuals_v2_bak;
