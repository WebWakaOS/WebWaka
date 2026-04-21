-- Migration 0130: Accounting Firm / Audit Practice vertical (M9)
-- T3: tenant_id NOT NULL on every table
-- P9: all monetary values in kobo (integers)

CREATE TABLE IF NOT EXISTS accounting_firm_profiles (
  id                  TEXT    PRIMARY KEY,
  workspace_id        TEXT    NOT NULL,
  tenant_id           TEXT    NOT NULL,
  firm_name           TEXT    NOT NULL,
  ican_registration   TEXT,
  anan_registration   TEXT,
  firs_agent_cert     TEXT,
  cac_rc              TEXT,
  status              TEXT    NOT NULL DEFAULT 'seeded',
  created_at          INTEGER NOT NULL,
  updated_at          INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_accounting_firm_profiles_tenant ON accounting_firm_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_accounting_firm_profiles_workspace ON accounting_firm_profiles(workspace_id);

CREATE TABLE IF NOT EXISTS accounting_engagements (
  id                   TEXT    PRIMARY KEY,
  profile_id           TEXT    NOT NULL,
  tenant_id            TEXT    NOT NULL,
  client_ref_id        TEXT    NOT NULL,
  engagement_type      TEXT    NOT NULL, -- audit/tax/advisory/bookkeeping/payroll
  engagement_fee_kobo  INTEGER NOT NULL,
  start_date           INTEGER NOT NULL,
  end_date             INTEGER,
  status               TEXT    NOT NULL DEFAULT 'active', -- active/completed/cancelled
  created_at           INTEGER NOT NULL,
  updated_at           INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_accounting_engagements_tenant ON accounting_engagements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_accounting_engagements_profile ON accounting_engagements(profile_id);

CREATE TABLE IF NOT EXISTS accounting_invoices (
  id               TEXT    PRIMARY KEY,
  profile_id       TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  client_ref_id    TEXT    NOT NULL,
  engagement_id    TEXT,
  invoice_number   TEXT    NOT NULL,
  amount_kobo      INTEGER NOT NULL,
  paid_kobo        INTEGER NOT NULL DEFAULT 0,
  outstanding_kobo INTEGER NOT NULL,
  issued_date      INTEGER NOT NULL,
  due_date         INTEGER,
  status           TEXT    NOT NULL DEFAULT 'pending', -- pending/paid/overdue
  created_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_accounting_invoices_tenant ON accounting_invoices(tenant_id);

CREATE TABLE IF NOT EXISTS accounting_cpd_logs (
  id              TEXT    PRIMARY KEY,
  profile_id      TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  member_ref_id   TEXT    NOT NULL,
  cpd_provider    TEXT    NOT NULL,
  cpd_hours       INTEGER NOT NULL,
  completion_date INTEGER NOT NULL,
  created_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_accounting_cpd_logs_tenant ON accounting_cpd_logs(tenant_id);
