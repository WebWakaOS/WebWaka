-- Migration 0156: Logistics & Delivery (Last-Mile) vertical (M9)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers; weight in grams (integer)
-- P13: sender_ref_id, recipient_ref_id opaque

CREATE TABLE IF NOT EXISTS logistics_delivery_profiles (
  id                  TEXT    PRIMARY KEY,
  workspace_id        TEXT    NOT NULL,
  tenant_id           TEXT    NOT NULL,
  business_name       TEXT    NOT NULL,
  frsc_cert           TEXT,
  cac_rc              TEXT,
  service_type        TEXT    NOT NULL DEFAULT 'same_day', -- same_day/next_day/interstate/all
  status              TEXT    NOT NULL DEFAULT 'seeded',
  created_at          INTEGER NOT NULL,
  updated_at          INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_logistics_delivery_profiles_tenant ON logistics_delivery_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_logistics_delivery_profiles_workspace ON logistics_delivery_profiles(workspace_id);

CREATE TABLE IF NOT EXISTS delivery_orders (
  id                     TEXT    PRIMARY KEY,
  profile_id             TEXT    NOT NULL,
  tenant_id              TEXT    NOT NULL,
  sender_ref_id          TEXT    NOT NULL, -- opaque (P13)
  recipient_ref_id       TEXT    NOT NULL, -- opaque (P13)
  pickup_address         TEXT    NOT NULL,
  delivery_address       TEXT    NOT NULL,
  package_type           TEXT    NOT NULL DEFAULT 'parcel', -- parcel/document/fragile/bulk
  weight_grams           INTEGER NOT NULL DEFAULT 0,
  declared_value_kobo    INTEGER NOT NULL DEFAULT 0,
  delivery_fee_kobo      INTEGER NOT NULL DEFAULT 0,
  pickup_date            INTEGER,
  delivery_date          INTEGER,
  status                 TEXT    NOT NULL DEFAULT 'pending', -- pending/picked_up/in_transit/delivered/returned/failed
  created_at             INTEGER NOT NULL,
  updated_at             INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_tenant ON delivery_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_profile ON delivery_orders(profile_id);

CREATE TABLE IF NOT EXISTS delivery_fleet (
  id                   TEXT    PRIMARY KEY,
  profile_id           TEXT    NOT NULL,
  tenant_id            TEXT    NOT NULL,
  vehicle_type         TEXT    NOT NULL, -- motorcycle/car/van/truck
  plate_number         TEXT    NOT NULL,
  capacity_kg_x100     INTEGER NOT NULL DEFAULT 0, -- capacity in kg ×100 (no floats)
  driver_ref_id        TEXT,    -- opaque (P13)
  status               TEXT    NOT NULL DEFAULT 'available', -- available/on_delivery/maintenance
  created_at           INTEGER NOT NULL,
  updated_at           INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_delivery_fleet_tenant ON delivery_fleet(tenant_id);
