-- Migration 0132: Law Firm / Legal Practice vertical (M9)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers
-- CRITICAL: matter_ref_id is opaque UUID — NEVER stores client name or identity
-- L3 HITL MANDATORY for ALL AI calls

CREATE TABLE IF NOT EXISTS law_firm_profiles (
  id                    TEXT    PRIMARY KEY,
  workspace_id          TEXT    NOT NULL,
  tenant_id             TEXT    NOT NULL,
  firm_name             TEXT    NOT NULL,
  nba_firm_registration TEXT,
  nba_branch            TEXT,
  njc_affiliated        INTEGER NOT NULL DEFAULT 0,
  cac_rc                TEXT,
  status                TEXT    NOT NULL DEFAULT 'seeded',
  created_at            INTEGER NOT NULL,
  updated_at            INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_law_firm_profiles_tenant ON law_firm_profiles(tenant_id);

CREATE TABLE IF NOT EXISTS legal_matters (
  id              TEXT    PRIMARY KEY,
  profile_id      TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  matter_ref_id   TEXT    NOT NULL UNIQUE,
  matter_type     TEXT    NOT NULL, -- litigation/transaction/advisory/criminal/family
  billing_type    TEXT    NOT NULL, -- retainer/hourly/fixed/contingency
  agreed_fee_kobo INTEGER NOT NULL,
  status          TEXT    NOT NULL DEFAULT 'active', -- active/closed/archived
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_legal_matters_tenant ON legal_matters(tenant_id);
CREATE INDEX IF NOT EXISTS idx_legal_matters_profile ON legal_matters(profile_id);

CREATE TABLE IF NOT EXISTS legal_time_entries (
  id                TEXT    PRIMARY KEY,
  profile_id        TEXT    NOT NULL,
  tenant_id         TEXT    NOT NULL,
  matter_ref_id     TEXT    NOT NULL,
  fee_earner_ref_id TEXT    NOT NULL,
  time_minutes      INTEGER NOT NULL,
  rate_per_hour_kobo INTEGER NOT NULL,
  amount_kobo       INTEGER NOT NULL,
  entry_date        INTEGER NOT NULL,
  created_at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_legal_time_entries_tenant ON legal_time_entries(tenant_id);

CREATE TABLE IF NOT EXISTS legal_court_calendar (
  id             TEXT    PRIMARY KEY,
  profile_id     TEXT    NOT NULL,
  tenant_id      TEXT    NOT NULL,
  matter_ref_id  TEXT    NOT NULL,
  court_date     INTEGER NOT NULL,
  court_name     TEXT    NOT NULL,
  court_type     TEXT    NOT NULL, -- FHC/SHC/Appeal/Magistrate
  hearing_type   TEXT    NOT NULL,
  created_at     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_legal_court_calendar_tenant ON legal_court_calendar(tenant_id);

CREATE TABLE IF NOT EXISTS legal_invoices (
  id               TEXT    PRIMARY KEY,
  profile_id       TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  matter_ref_id    TEXT    NOT NULL,
  invoice_number   TEXT    NOT NULL,
  total_kobo       INTEGER NOT NULL,
  paid_kobo        INTEGER NOT NULL DEFAULT 0,
  outstanding_kobo INTEGER NOT NULL,
  issued_date      INTEGER NOT NULL,
  created_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_legal_invoices_tenant ON legal_invoices(tenant_id);
