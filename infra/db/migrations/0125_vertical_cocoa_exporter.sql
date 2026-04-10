-- Migration 0125: Cocoa / Export Commodities Trader vertical (M12)
-- FSM: seeded → claimed → nepc_verified → active → suspended
-- P9: price_per_kg_kobo, fob_value_kobo as INTEGER
-- T3: tenant_id NOT NULL
-- KYC Tier 3 mandatory — export FX transactions

CREATE TABLE IF NOT EXISTS cocoa_exporter_profiles (
  id                   TEXT PRIMARY KEY,
  workspace_id         TEXT NOT NULL,
  tenant_id            TEXT NOT NULL,
  company_name         TEXT NOT NULL,
  nepc_exporter_licence TEXT,
  nxp_number           TEXT,
  crin_registered      INTEGER NOT NULL DEFAULT 0,
  cbn_forex_dealer     INTEGER NOT NULL DEFAULT 0,
  cac_rc               TEXT,
  status               TEXT NOT NULL DEFAULT 'seeded',
  created_at           INTEGER NOT NULL,
  updated_at           INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cocoa_exporter_profiles_tenant ON cocoa_exporter_profiles(tenant_id);

CREATE TABLE IF NOT EXISTS cocoa_procurement (
  id               TEXT PRIMARY KEY,
  profile_id       TEXT NOT NULL,
  tenant_id        TEXT NOT NULL,
  farmer_phone     TEXT NOT NULL,
  quantity_kg      INTEGER NOT NULL,
  grade            TEXT NOT NULL DEFAULT 'grade1',
  price_per_kg_kobo INTEGER NOT NULL,
  intake_date      INTEGER NOT NULL,
  created_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cocoa_procurement_tenant ON cocoa_procurement(tenant_id);

CREATE TABLE IF NOT EXISTS cocoa_exports (
  id                    TEXT PRIMARY KEY,
  profile_id            TEXT NOT NULL,
  tenant_id             TEXT NOT NULL,
  buyer_country         TEXT NOT NULL,
  quantity_kg           INTEGER NOT NULL,
  quality_cert_ref      TEXT,
  nepc_licence_ref      TEXT,
  cbn_fx_form           TEXT,
  fob_value_kobo        INTEGER NOT NULL,
  shipping_date         INTEGER,
  fx_repatriated_kobo   INTEGER NOT NULL DEFAULT 0,
  repatriation_date     INTEGER,
  status                TEXT NOT NULL DEFAULT 'prepared',
  created_at            INTEGER NOT NULL,
  updated_at            INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cocoa_exports_tenant ON cocoa_exports(tenant_id);
