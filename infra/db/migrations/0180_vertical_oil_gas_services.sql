-- Migration 0180: Oil & Gas Service Provider vertical (M12)
-- T3: tenant_id NOT NULL; P9: contract_value_kobo as 64-bit INTEGER (D1 supports bigint via INTEGER)
-- CRITICAL: NO REAL/FLOAT columns — all monetary as INTEGER kobo (P9)
-- Local content percentage as integer ×100 (e.g., 55% = 5500)
-- Tier 3 KYC mandatory; two-gate FSM: ncdmb_certified → dpr_registered
-- P13: client_ref_id opaque

CREATE TABLE IF NOT EXISTS oil_gas_services_profiles (
  id                TEXT    PRIMARY KEY,
  workspace_id      TEXT    NOT NULL,
  tenant_id         TEXT    NOT NULL,
  company_name      TEXT    NOT NULL,
  ncdmb_cert        TEXT,   -- Nigerian Content Development & Monitoring Board
  dpr_registration  TEXT,   -- DPR (now NUPRC) registration
  cac_rc            TEXT,
  service_category  TEXT    NOT NULL DEFAULT 'services', -- drilling/logistics/engineering/services/inspection
  status            TEXT    NOT NULL DEFAULT 'seeded',
  created_at        INTEGER NOT NULL,
  updated_at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_oil_gas_services_profiles_tenant ON oil_gas_services_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_oil_gas_services_profiles_workspace ON oil_gas_services_profiles(workspace_id);

CREATE TABLE IF NOT EXISTS oil_gas_contracts (
  id                      TEXT    PRIMARY KEY,
  profile_id              TEXT    NOT NULL,
  tenant_id               TEXT    NOT NULL,
  client_ref_id           TEXT    NOT NULL, -- opaque (P13)
  contract_title          TEXT    NOT NULL,
  contract_value_kobo     INTEGER NOT NULL DEFAULT 0, -- 64-bit INTEGER — no REAL column (P9 critical)
  local_content_pct_x100  INTEGER NOT NULL DEFAULT 0, -- percentage ×100 (no floats)
  start_date              INTEGER NOT NULL,
  end_date                INTEGER,
  mobilisation_kobo       INTEGER NOT NULL DEFAULT 0,
  invoiced_kobo           INTEGER NOT NULL DEFAULT 0,
  status                  TEXT    NOT NULL DEFAULT 'bid', -- bid/awarded/mobilising/active/completed/terminated
  created_at              INTEGER NOT NULL,
  updated_at              INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_oil_gas_contracts_tenant ON oil_gas_contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_oil_gas_contracts_profile ON oil_gas_contracts(profile_id);

CREATE TABLE IF NOT EXISTS oil_gas_hse_log (
  id               TEXT    PRIMARY KEY,
  profile_id       TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  log_date         INTEGER NOT NULL,
  incident_count   INTEGER NOT NULL DEFAULT 0,
  near_miss_count  INTEGER NOT NULL DEFAULT 0,
  man_hours        INTEGER NOT NULL DEFAULT 0,
  ltifr_x1000      INTEGER NOT NULL DEFAULT 0, -- Lost Time Injury Frequency Rate ×1000 (no float)
  notes            TEXT,
  created_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_oil_gas_hse_log_tenant ON oil_gas_hse_log(tenant_id);

CREATE TABLE IF NOT EXISTS oil_gas_ncdmb_reports (
  id                       TEXT    PRIMARY KEY,
  profile_id               TEXT    NOT NULL,
  tenant_id                TEXT    NOT NULL,
  contract_id              TEXT    NOT NULL,
  report_period            TEXT    NOT NULL, -- YYYY-QN
  local_content_pct_x100  INTEGER NOT NULL DEFAULT 0,
  nigerian_staff_count     INTEGER NOT NULL DEFAULT 0,
  expatriate_staff_count   INTEGER NOT NULL DEFAULT 0,
  local_spend_kobo         INTEGER NOT NULL DEFAULT 0,
  created_at               INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_oil_gas_ncdmb_reports_tenant ON oil_gas_ncdmb_reports(tenant_id);
