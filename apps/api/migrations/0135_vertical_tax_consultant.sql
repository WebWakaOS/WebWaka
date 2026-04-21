-- Migration 0135: Tax Consultant / Revenue Agent vertical (M12)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers
-- P13: client_ref_id opaque; TIN/liability never to AI
-- L3 HITL MANDATORY for all AI

CREATE TABLE IF NOT EXISTS tax_consultant_profiles (
  id                  TEXT    PRIMARY KEY,
  workspace_id        TEXT    NOT NULL,
  tenant_id           TEXT    NOT NULL,
  firm_name           TEXT    NOT NULL,
  firs_tax_agent_cert TEXT,
  citn_membership     TEXT,
  cac_rc              TEXT,
  status              TEXT    NOT NULL DEFAULT 'seeded',
  created_at          INTEGER NOT NULL,
  updated_at          INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tax_consultant_profiles_tenant ON tax_consultant_profiles(tenant_id);

CREATE TABLE IF NOT EXISTS tax_client_files (
  id             TEXT    PRIMARY KEY,
  profile_id     TEXT    NOT NULL,
  tenant_id      TEXT    NOT NULL,
  client_ref_id  TEXT    NOT NULL,
  tax_type       TEXT    NOT NULL, -- VAT/CIT/PAYE/WHT/SDL
  firs_tin       TEXT    NOT NULL,
  filing_period  TEXT    NOT NULL,
  liability_kobo INTEGER NOT NULL,
  filed_date     INTEGER,
  firs_ref       TEXT,
  status         TEXT    NOT NULL DEFAULT 'pending', -- pending/filed/assessed/paid/appealed
  created_at     INTEGER NOT NULL,
  updated_at     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tax_client_files_tenant ON tax_client_files(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tax_client_files_profile ON tax_client_files(profile_id);

CREATE TABLE IF NOT EXISTS tax_remittances (
  id               TEXT    PRIMARY KEY,
  profile_id       TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  client_ref_id    TEXT    NOT NULL,
  tax_type         TEXT    NOT NULL,
  period           TEXT    NOT NULL,
  amount_kobo      INTEGER NOT NULL,
  remittance_date  INTEGER NOT NULL,
  bank_ref         TEXT,
  created_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tax_remittances_tenant ON tax_remittances(tenant_id);

CREATE TABLE IF NOT EXISTS tax_billing (
  id                   TEXT    PRIMARY KEY,
  profile_id           TEXT    NOT NULL,
  tenant_id            TEXT    NOT NULL,
  client_ref_id        TEXT    NOT NULL,
  period               TEXT    NOT NULL,
  professional_fee_kobo INTEGER NOT NULL,
  paid_kobo            INTEGER NOT NULL DEFAULT 0,
  created_at           INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tax_billing_tenant ON tax_billing(tenant_id);
