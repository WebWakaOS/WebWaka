-- Migration 0179: Orphanage / Child Care NGO vertical (M12)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers
-- P13 (ABSOLUTE): NO child PII ever — ONLY aggregate counts
-- L3 HITL MANDATORY on ALL AI actions
-- NO child_ref_id column anywhere in this schema

CREATE TABLE IF NOT EXISTS orphanage_profiles (
  id               TEXT    PRIMARY KEY,
  workspace_id     TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  org_name         TEXT    NOT NULL,
  dss_license      TEXT,   -- Department of Social Services licence
  cac_it_cert      TEXT,   -- CAC Incorporated Trustee certificate
  fmwsd_reg        TEXT,   -- Federal Ministry of Women Affairs & Social Development
  capacity         INTEGER NOT NULL DEFAULT 0,
  status           TEXT    NOT NULL DEFAULT 'seeded',
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_orphanage_profiles_tenant ON orphanage_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orphanage_profiles_workspace ON orphanage_profiles(workspace_id);

-- AGGREGATE ONLY — no child_ref_id, no individual child rows (P13 absolute)
CREATE TABLE IF NOT EXISTS orphanage_population_summary (
  id              TEXT    PRIMARY KEY,
  profile_id      TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  report_date     INTEGER NOT NULL,
  total_children  INTEGER NOT NULL DEFAULT 0,
  age_0_5         INTEGER NOT NULL DEFAULT 0,
  age_6_12        INTEGER NOT NULL DEFAULT 0,
  age_13_18       INTEGER NOT NULL DEFAULT 0,
  gender_male     INTEGER NOT NULL DEFAULT 0,
  gender_female   INTEGER NOT NULL DEFAULT 0,
  created_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_orphanage_population_summary_tenant ON orphanage_population_summary(tenant_id);

CREATE TABLE IF NOT EXISTS orphanage_donations (
  id              TEXT    PRIMARY KEY,
  profile_id      TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  donor_ref       TEXT    NOT NULL, -- opaque/anonymous (P13) — never to AI
  amount_kobo     INTEGER NOT NULL DEFAULT 0,
  donation_date   INTEGER NOT NULL,
  donation_type   TEXT    NOT NULL DEFAULT 'cash', -- cash/kind/food/clothing/medical
  created_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_orphanage_donations_tenant ON orphanage_donations(tenant_id);

CREATE TABLE IF NOT EXISTS orphanage_expenditure (
  id              TEXT    PRIMARY KEY,
  profile_id      TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  expense_type    TEXT    NOT NULL, -- feeding/medical/education/clothing/utilities/staffing
  amount_kobo     INTEGER NOT NULL DEFAULT 0,
  expense_date    INTEGER NOT NULL,
  notes           TEXT,
  created_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_orphanage_expenditure_tenant ON orphanage_expenditure(tenant_id);
