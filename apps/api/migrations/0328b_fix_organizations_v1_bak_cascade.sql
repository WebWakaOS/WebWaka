-- 0328b_fix_organizations_v1_bak_cascade.sql
-- Fix 7 tables whose organization FK was cascade-rewritten by D1 to
-- "organizations_v1_bak"(id) when 0314d renamed organizations → organizations_v1_bak.
--
-- Affected tables (and row counts at migration time):
--   party_affiliations         9,254 rows  → also cascades to candidate_records
--   political_party_profiles      21 rows
--   church_profiles                0 rows
--   ngo_profiles                   0 rows
--   school_profiles          167,820 rows
--   clinic_profiles           33,250 rows
--   contact_submissions            0 rows
--
-- candidate_records references party_affiliations — must be fixed after pa rename.
-- No other external FKs reference the remaining 6 tables.
--
-- Strategy: CREATE_NEW → INSERT SELECT → RENAME OLD→BAK → RENAME NEW→ORIG → DROP BAK
-- Cascade-aware ordering:
--   1. Fix party_affiliations first (renames it)
--   2. Immediately fix candidate_records before dropping pa_bak
--   3. Fix remaining 6 tables independently
-- ============================================================

-- ============================================================
-- 1. party_affiliations  (9,254 rows; candidate_records has FK to it)
-- ============================================================

CREATE TABLE party_affiliations_new (
  id                TEXT NOT NULL PRIMARY KEY,
  individual_id     TEXT NOT NULL REFERENCES individuals(id),
  party_id          TEXT NOT NULL REFERENCES organizations(id),
  membership_number TEXT,
  joined_at         TEXT,
  left_at           TEXT,
  is_primary        INTEGER NOT NULL DEFAULT 1,
  created_at        INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT OR IGNORE INTO party_affiliations_new
  (id, individual_id, party_id, membership_number, joined_at, left_at,
   is_primary, created_at, updated_at)
SELECT id, individual_id, party_id, membership_number, joined_at, left_at,
       is_primary, created_at, updated_at
FROM party_affiliations;

-- Rename old → bak (D1 cascades: candidate_records.party_affiliation_id → pa_bak)
ALTER TABLE party_affiliations RENAME TO party_affiliations_bak;
-- Rename new → correct name (D1 cascades: nothing references party_affiliations_new)
ALTER TABLE party_affiliations_new RENAME TO party_affiliations;

-- ============================================================
-- 2. candidate_records  (cascade-broken by step 1 rename)
--    Create NEW with FK to party_affiliations (now the correct table)
-- ============================================================

CREATE TABLE candidate_records_new (
  individual_id        TEXT NOT NULL REFERENCES individuals(id),
  office_type          TEXT NOT NULL,
  jurisdiction_id      TEXT NOT NULL REFERENCES jurisdictions(id),
  party_affiliation_id TEXT REFERENCES party_affiliations(id),
  election_date        TEXT NOT NULL,
  verification_state   TEXT NOT NULL DEFAULT 'unverified',
  created_at           INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at           INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (individual_id, office_type, jurisdiction_id, election_date)
);

INSERT OR IGNORE INTO candidate_records_new
  (individual_id, office_type, jurisdiction_id, party_affiliation_id,
   election_date, verification_state, created_at, updated_at)
SELECT individual_id, office_type, jurisdiction_id, party_affiliation_id,
       election_date, verification_state, created_at, updated_at
FROM candidate_records;

ALTER TABLE candidate_records RENAME TO candidate_records_bak;
ALTER TABLE candidate_records_new RENAME TO candidate_records;

-- Now safe to drop backups (no more FK references)
DROP TABLE candidate_records_bak;
DROP TABLE party_affiliations_bak;

-- ============================================================
-- 3. political_party_profiles  (21 rows, no external FK refs)
-- ============================================================

CREATE TABLE political_party_profiles_new (
  id              TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  workspace_id    TEXT NOT NULL REFERENCES workspaces(id),
  tenant_id       TEXT NOT NULL,
  party_name      TEXT NOT NULL,
  abbreviation    TEXT,
  cac_reg_number  TEXT,
  inec_reg_number TEXT,
  chairperson_id  TEXT,
  status          TEXT NOT NULL DEFAULT 'seeded',
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT OR IGNORE INTO political_party_profiles_new
  (id, organization_id, workspace_id, tenant_id, party_name, abbreviation,
   cac_reg_number, inec_reg_number, chairperson_id, status, created_at)
SELECT id, organization_id, workspace_id, tenant_id, party_name, abbreviation,
       cac_reg_number, inec_reg_number, chairperson_id, status, created_at
FROM political_party_profiles;

ALTER TABLE political_party_profiles RENAME TO political_party_profiles_bak;
ALTER TABLE political_party_profiles_new RENAME TO political_party_profiles;
DROP TABLE political_party_profiles_bak;

-- ============================================================
-- 4. church_profiles  (0 rows, no external FK refs)
-- ============================================================

CREATE TABLE church_profiles_new (
  id              TEXT    PRIMARY KEY,
  organization_id TEXT    NOT NULL REFERENCES organizations(id),
  workspace_id    TEXT    NOT NULL REFERENCES workspaces(id),
  tenant_id       TEXT    NOT NULL,
  community_id    TEXT,
  it_number       TEXT,
  denomination    TEXT NOT NULL CHECK (denomination IN (
    'pentecostal','catholic','anglican','baptist','methodist',
    'orthodox','evangelical','others')),
  founding_year   INTEGER,
  senior_pastor   TEXT,
  total_members   INTEGER NOT NULL DEFAULT 0,
  branch_count    INTEGER NOT NULL DEFAULT 1,
  status          TEXT NOT NULL DEFAULT 'seeded' CHECK (status IN (
    'seeded','claimed','it_verified','community_active','active')),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

ALTER TABLE church_profiles RENAME TO church_profiles_bak;
ALTER TABLE church_profiles_new RENAME TO church_profiles;
DROP TABLE church_profiles_bak;

-- ============================================================
-- 5. ngo_profiles  (0 rows, no external FK refs)
-- ============================================================

CREATE TABLE ngo_profiles_new (
  id              TEXT    PRIMARY KEY,
  organization_id TEXT    NOT NULL REFERENCES organizations(id),
  workspace_id    TEXT    NOT NULL REFERENCES workspaces(id),
  tenant_id       TEXT    NOT NULL,
  community_id    TEXT,
  it_number       TEXT,
  sector          TEXT NOT NULL CHECK (sector IN (
    'education','health','environment','women','youth','disability',
    'agriculture','legal','tech','others')),
  cac_reg_number  TEXT,
  country_partner TEXT,
  beneficiary_count INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'seeded' CHECK (status IN (
    'seeded','claimed','it_verified','community_active','active')),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

ALTER TABLE ngo_profiles RENAME TO ngo_profiles_bak;
ALTER TABLE ngo_profiles_new RENAME TO ngo_profiles;
DROP TABLE ngo_profiles_bak;

-- ============================================================
-- 6. school_profiles  (167,820 rows, no external FK refs)
-- ============================================================

CREATE TABLE school_profiles_new (
  id              TEXT    PRIMARY KEY,
  organization_id TEXT    NOT NULL REFERENCES organizations(id),
  workspace_id    TEXT    NOT NULL REFERENCES workspaces(id),
  tenant_id       TEXT    NOT NULL,
  school_name     TEXT    NOT NULL,
  school_type     TEXT NOT NULL CHECK (school_type IN (
    'nursery','primary','secondary','tertiary','vocational','tutoring','others')),
  cac_reg_number  TEXT,
  state_reg_ref   TEXT,
  student_count   INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'seeded' CHECK (status IN (
    'seeded','claimed','reg_verified','active')),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT OR IGNORE INTO school_profiles_new
  (id, organization_id, workspace_id, tenant_id, school_name, school_type,
   cac_reg_number, state_reg_ref, student_count, status, created_at)
SELECT id, organization_id, workspace_id, tenant_id, school_name, school_type,
       cac_reg_number, state_reg_ref, student_count, status, created_at
FROM school_profiles;

ALTER TABLE school_profiles RENAME TO school_profiles_bak;
ALTER TABLE school_profiles_new RENAME TO school_profiles;
DROP TABLE school_profiles_bak;

-- ============================================================
-- 7. clinic_profiles  (33,250 rows, no external FK refs)
-- ============================================================

CREATE TABLE clinic_profiles_new (
  id              TEXT    PRIMARY KEY,
  organization_id TEXT    NOT NULL REFERENCES organizations(id),
  workspace_id    TEXT    NOT NULL REFERENCES workspaces(id),
  tenant_id       TEXT    NOT NULL,
  facility_name   TEXT    NOT NULL,
  facility_type   TEXT NOT NULL CHECK (facility_type IN (
    'clinic','hospital','pharmacy','laboratory','maternity',
    'dental','optical','others')),
  mdcn_ref        TEXT,
  cac_reg_number  TEXT,
  bed_count       INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'seeded' CHECK (status IN (
    'seeded','claimed','mdcn_verified','active')),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT OR IGNORE INTO clinic_profiles_new
  (id, organization_id, workspace_id, tenant_id, facility_name, facility_type,
   mdcn_ref, cac_reg_number, bed_count, status, created_at)
SELECT id, organization_id, workspace_id, tenant_id, facility_name, facility_type,
       mdcn_ref, cac_reg_number, bed_count, status, created_at
FROM clinic_profiles;

ALTER TABLE clinic_profiles RENAME TO clinic_profiles_bak;
ALTER TABLE clinic_profiles_new RENAME TO clinic_profiles;
DROP TABLE clinic_profiles_bak;

-- ============================================================
-- 8. contact_submissions  (0 rows, no external FK refs)
-- ============================================================

CREATE TABLE contact_submissions_new (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL,
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  email       TEXT,
  message     TEXT NOT NULL,
  is_read     INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES organizations(id)
);

ALTER TABLE contact_submissions RENAME TO contact_submissions_bak;
ALTER TABLE contact_submissions_new RENAME TO contact_submissions;
DROP TABLE contact_submissions_bak;
