-- Migration 0121: Agro-Input Dealer vertical (M10)
-- FSM: seeded → claimed → nasc_verified → active → suspended
-- P9: price_per_unit_kobo, total_kobo, credit_limit_kobo as INTEGER
-- T3: tenant_id NOT NULL
-- ADL-010: AI at L2 max — advisory only

CREATE TABLE IF NOT EXISTS agro_input_profiles (
  id                      TEXT PRIMARY KEY,
  workspace_id            TEXT NOT NULL,
  tenant_id               TEXT NOT NULL,
  company_name            TEXT NOT NULL,
  nasc_dealer_number      TEXT,
  fepsan_membership       TEXT,
  nafdac_agrochemical_reg TEXT,
  fmard_abp_participant   INTEGER NOT NULL DEFAULT 0,
  cac_rc                  TEXT,
  status                  TEXT NOT NULL DEFAULT 'seeded',
  created_at              INTEGER NOT NULL,
  updated_at              INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_agro_input_profiles_tenant ON agro_input_profiles(tenant_id);

CREATE TABLE IF NOT EXISTS agro_input_catalogue (
  id                        TEXT PRIMARY KEY,
  profile_id                TEXT NOT NULL,
  tenant_id                 TEXT NOT NULL,
  product_name              TEXT NOT NULL,
  category                  TEXT NOT NULL DEFAULT 'seed',
  nasc_or_nafdac_cert_number TEXT,
  unit                      TEXT NOT NULL DEFAULT 'kg',
  price_per_unit_kobo       INTEGER NOT NULL,
  quantity_in_stock         INTEGER NOT NULL DEFAULT 0,
  created_at                INTEGER NOT NULL,
  updated_at                INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_agro_catalogue_tenant ON agro_input_catalogue(tenant_id);

CREATE TABLE IF NOT EXISTS agro_input_orders (
  id                TEXT PRIMARY KEY,
  profile_id        TEXT NOT NULL,
  tenant_id         TEXT NOT NULL,
  farmer_phone      TEXT NOT NULL,
  farmer_name       TEXT,
  items             TEXT NOT NULL DEFAULT '[]',
  total_kobo        INTEGER NOT NULL,
  abp_subsidy_kobo  INTEGER NOT NULL DEFAULT 0,
  balance_kobo      INTEGER NOT NULL DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'pending',
  created_at        INTEGER NOT NULL,
  updated_at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_agro_orders_tenant ON agro_input_orders(tenant_id);

CREATE TABLE IF NOT EXISTS agro_input_farmer_credit (
  id                     TEXT PRIMARY KEY,
  profile_id             TEXT NOT NULL,
  tenant_id              TEXT NOT NULL,
  farmer_phone           TEXT NOT NULL,
  credit_limit_kobo      INTEGER NOT NULL DEFAULT 0,
  balance_owing_kobo     INTEGER NOT NULL DEFAULT 0,
  abp_wallet_balance_kobo INTEGER NOT NULL DEFAULT 0,
  created_at             INTEGER NOT NULL,
  updated_at             INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_agro_credit_tenant ON agro_input_farmer_credit(tenant_id);
