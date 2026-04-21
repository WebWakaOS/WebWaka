-- Migration 0161: IT Support / Computer Repair vertical (M10)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers
-- P13: client_ref_id opaque

CREATE TABLE IF NOT EXISTS it_support_profiles (
  id            TEXT    PRIMARY KEY,
  workspace_id  TEXT    NOT NULL,
  tenant_id     TEXT    NOT NULL,
  company_name  TEXT    NOT NULL,
  ncc_ref       TEXT,
  cac_rc        TEXT,
  service_type  TEXT    NOT NULL DEFAULT 'both', -- repair/support/both
  status        TEXT    NOT NULL DEFAULT 'seeded',
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_it_support_profiles_tenant ON it_support_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_it_support_profiles_workspace ON it_support_profiles(workspace_id);

CREATE TABLE IF NOT EXISTS it_tickets (
  id              TEXT    PRIMARY KEY,
  profile_id      TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  client_ref_id   TEXT    NOT NULL, -- opaque (P13)
  ticket_type     TEXT    NOT NULL, -- repair/installation/network/support/data_recovery
  device_type     TEXT,
  priority        TEXT    NOT NULL DEFAULT 'medium', -- low/medium/high/critical
  fault_desc      TEXT,
  labour_cost_kobo  INTEGER NOT NULL DEFAULT 0,
  parts_cost_kobo   INTEGER NOT NULL DEFAULT 0,
  total_cost_kobo   INTEGER NOT NULL DEFAULT 0,
  sla_hours         INTEGER NOT NULL DEFAULT 24,
  opened_date       INTEGER NOT NULL,
  closed_date       INTEGER,
  status            TEXT    NOT NULL DEFAULT 'open', -- open/in_progress/waiting_parts/resolved/closed
  created_at        INTEGER NOT NULL,
  updated_at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_it_tickets_tenant ON it_tickets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_it_tickets_profile ON it_tickets(profile_id);

CREATE TABLE IF NOT EXISTS it_retainers (
  id                    TEXT    PRIMARY KEY,
  profile_id            TEXT    NOT NULL,
  tenant_id             TEXT    NOT NULL,
  client_ref_id         TEXT    NOT NULL, -- opaque (P13)
  monthly_retainer_kobo INTEGER NOT NULL DEFAULT 0,
  sla_response_hours    INTEGER NOT NULL DEFAULT 4,
  start_date            INTEGER NOT NULL,
  end_date              INTEGER,
  status                TEXT    NOT NULL DEFAULT 'active', -- active/expired/cancelled
  created_at            INTEGER NOT NULL,
  updated_at            INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_it_retainers_tenant ON it_retainers(tenant_id);
