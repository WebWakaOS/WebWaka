-- Migration 0159: Gas / LPG Distributor vertical (M10)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers
-- CRITICAL: cylinder sizes in INTEGER GRAMS — NEVER float kg
-- P13: customer_ref_id opaque

CREATE TABLE IF NOT EXISTS gas_distributor_profiles (
  id                    TEXT    PRIMARY KEY,
  workspace_id          TEXT    NOT NULL,
  tenant_id             TEXT    NOT NULL,
  business_name         TEXT    NOT NULL,
  dpr_dealer_licence    TEXT,
  nuprc_ref             TEXT,
  lpgassoc_membership   TEXT,
  cac_rc                TEXT,
  status                TEXT    NOT NULL DEFAULT 'seeded',
  created_at            INTEGER NOT NULL,
  updated_at            INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_gas_distributor_profiles_tenant ON gas_distributor_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gas_distributor_profiles_workspace ON gas_distributor_profiles(workspace_id);

CREATE TABLE IF NOT EXISTS gas_inventory (
  id                    TEXT    PRIMARY KEY,
  profile_id            TEXT    NOT NULL,
  tenant_id             TEXT    NOT NULL,
  cylinder_size_grams   INTEGER NOT NULL, -- 3000/5000/12500/25000/50000 — integer grams ONLY
  stock_count           INTEGER NOT NULL DEFAULT 0,
  refill_price_kobo     INTEGER NOT NULL DEFAULT 0,
  bulk_price_kobo       INTEGER NOT NULL DEFAULT 0,
  reorder_level         INTEGER NOT NULL DEFAULT 10,
  created_at            INTEGER NOT NULL,
  updated_at            INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_gas_inventory_tenant ON gas_inventory(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gas_inventory_profile ON gas_inventory(profile_id);

CREATE TABLE IF NOT EXISTS gas_orders (
  id                    TEXT    PRIMARY KEY,
  profile_id            TEXT    NOT NULL,
  tenant_id             TEXT    NOT NULL,
  customer_ref_id       TEXT    NOT NULL, -- opaque (P13)
  cylinder_size_grams   INTEGER NOT NULL, -- integer grams
  quantity              INTEGER NOT NULL DEFAULT 1,
  unit_price_kobo       INTEGER NOT NULL DEFAULT 0,
  total_kobo            INTEGER NOT NULL DEFAULT 0,
  order_date            INTEGER NOT NULL,
  delivery_date         INTEGER,
  is_bulk               INTEGER NOT NULL DEFAULT 0,
  status                TEXT    NOT NULL DEFAULT 'pending', -- pending/confirmed/out_for_delivery/delivered/returned
  created_at            INTEGER NOT NULL,
  updated_at            INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_gas_orders_tenant ON gas_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gas_orders_profile ON gas_orders(profile_id);

CREATE TABLE IF NOT EXISTS gas_safety_log (
  id                   TEXT    PRIMARY KEY,
  profile_id           TEXT    NOT NULL,
  tenant_id            TEXT    NOT NULL,
  inspection_date      INTEGER NOT NULL,
  inspector_ref        TEXT,
  cylinders_inspected  INTEGER NOT NULL DEFAULT 0,
  passed               INTEGER NOT NULL DEFAULT 1,
  notes                TEXT,
  created_at           INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_gas_safety_log_tenant ON gas_safety_log(tenant_id);
