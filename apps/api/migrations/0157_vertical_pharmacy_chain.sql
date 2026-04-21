-- Migration 0157: Pharmacy Chain / Drugstore vertical (M9)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers
-- P13: patient_ref_id, prescriber_ref_id opaque — NEVER to AI

CREATE TABLE IF NOT EXISTS pharmacy_chain_profiles (
  id                TEXT    PRIMARY KEY,
  workspace_id      TEXT    NOT NULL,
  tenant_id         TEXT    NOT NULL,
  business_name     TEXT    NOT NULL,
  pcn_licence       TEXT,
  nafdac_licence    TEXT,
  cac_rc            TEXT,
  category          TEXT    NOT NULL DEFAULT 'retail', -- retail/wholesale/both
  status            TEXT    NOT NULL DEFAULT 'seeded',
  created_at        INTEGER NOT NULL,
  updated_at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pharmacy_chain_profiles_tenant ON pharmacy_chain_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_chain_profiles_workspace ON pharmacy_chain_profiles(workspace_id);

CREATE TABLE IF NOT EXISTS drug_inventory (
  id                      TEXT    PRIMARY KEY,
  profile_id              TEXT    NOT NULL,
  tenant_id               TEXT    NOT NULL,
  drug_name               TEXT    NOT NULL,
  nafdac_reg              TEXT,
  quantity_in_stock       INTEGER NOT NULL DEFAULT 0,
  reorder_level           INTEGER NOT NULL DEFAULT 10,
  unit_price_kobo         INTEGER NOT NULL DEFAULT 0,
  wholesale_price_kobo    INTEGER NOT NULL DEFAULT 0,
  expiry_date             INTEGER, -- unix timestamp
  prescription_required   INTEGER NOT NULL DEFAULT 0, -- 0=false, 1=true (SQLite bool)
  created_at              INTEGER NOT NULL,
  updated_at              INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_drug_inventory_tenant ON drug_inventory(tenant_id);
CREATE INDEX IF NOT EXISTS idx_drug_inventory_profile ON drug_inventory(profile_id);

CREATE TABLE IF NOT EXISTS prescription_dispensing (
  id                  TEXT    PRIMARY KEY,
  profile_id          TEXT    NOT NULL,
  tenant_id           TEXT    NOT NULL,
  patient_ref_id      TEXT    NOT NULL, -- opaque (P13)
  prescriber_ref_id   TEXT,             -- opaque (P13)
  drug_id             TEXT    NOT NULL,
  quantity            INTEGER NOT NULL DEFAULT 1,
  total_kobo          INTEGER NOT NULL DEFAULT 0,
  dispensed_date      INTEGER NOT NULL,
  status              TEXT    NOT NULL DEFAULT 'pending', -- pending/dispensed/returned
  created_at          INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_prescription_dispensing_tenant ON prescription_dispensing(tenant_id);
CREATE INDEX IF NOT EXISTS idx_prescription_dispensing_profile ON prescription_dispensing(profile_id);

CREATE TABLE IF NOT EXISTS drug_sales (
  id                  TEXT    PRIMARY KEY,
  profile_id          TEXT    NOT NULL,
  tenant_id           TEXT    NOT NULL,
  drug_id             TEXT    NOT NULL,
  client_ref_id       TEXT,   -- opaque (P13)
  quantity            INTEGER NOT NULL DEFAULT 1,
  unit_price_kobo     INTEGER NOT NULL DEFAULT 0,
  total_kobo          INTEGER NOT NULL DEFAULT 0,
  sale_date           INTEGER NOT NULL,
  is_prescription     INTEGER NOT NULL DEFAULT 0,
  is_wholesale        INTEGER NOT NULL DEFAULT 0,
  created_at          INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_drug_sales_tenant ON drug_sales(tenant_id);
CREATE INDEX IF NOT EXISTS idx_drug_sales_profile ON drug_sales(profile_id);
