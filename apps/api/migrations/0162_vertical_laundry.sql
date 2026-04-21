-- Migration 0162: Laundry / Dry Cleaner vertical (M10)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers
-- P13: client_ref_id opaque

CREATE TABLE IF NOT EXISTS laundry_profiles (
  id             TEXT    PRIMARY KEY,
  workspace_id   TEXT    NOT NULL,
  tenant_id      TEXT    NOT NULL,
  business_name  TEXT    NOT NULL,
  cac_rc         TEXT,
  service_type   TEXT    NOT NULL DEFAULT 'both', -- laundry/dry_clean/both
  status         TEXT    NOT NULL DEFAULT 'seeded',
  created_at     INTEGER NOT NULL,
  updated_at     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_laundry_profiles_tenant ON laundry_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_laundry_profiles_workspace ON laundry_profiles(workspace_id);

CREATE TABLE IF NOT EXISTS laundry_price_list (
  id           TEXT    PRIMARY KEY,
  profile_id   TEXT    NOT NULL,
  tenant_id    TEXT    NOT NULL,
  item_type    TEXT    NOT NULL, -- shirt/trouser/suit/native_attire/bedsheet/curtain/jean
  service      TEXT    NOT NULL DEFAULT 'wash', -- wash/dry_clean/iron
  price_kobo   INTEGER NOT NULL DEFAULT 0,
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_laundry_price_list_tenant ON laundry_price_list(tenant_id);

CREATE TABLE IF NOT EXISTS laundry_orders (
  id               TEXT    PRIMARY KEY,
  profile_id       TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  client_ref_id    TEXT    NOT NULL, -- opaque (P13)
  items            TEXT    NOT NULL, -- JSON: [{item_type, service, quantity, unit_price_kobo}]
  pickup_date      INTEGER,
  delivery_date    INTEGER,
  total_kobo       INTEGER NOT NULL DEFAULT 0,
  status           TEXT    NOT NULL DEFAULT 'received', -- received/washing/drying/ironing/ready/delivered
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_laundry_orders_tenant ON laundry_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_laundry_orders_profile ON laundry_orders(profile_id);

CREATE TABLE IF NOT EXISTS laundry_subscriptions (
  id                    TEXT    PRIMARY KEY,
  profile_id            TEXT    NOT NULL,
  tenant_id             TEXT    NOT NULL,
  client_ref_id         TEXT    NOT NULL, -- opaque (P13)
  package_name          TEXT    NOT NULL,
  frequency             TEXT    NOT NULL DEFAULT 'monthly', -- weekly/monthly
  price_kobo            INTEGER NOT NULL DEFAULT 0,
  items_included        INTEGER NOT NULL DEFAULT 0,
  start_date            INTEGER NOT NULL,
  end_date              INTEGER,
  status                TEXT    NOT NULL DEFAULT 'active',
  created_at            INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_laundry_subscriptions_tenant ON laundry_subscriptions(tenant_id);
