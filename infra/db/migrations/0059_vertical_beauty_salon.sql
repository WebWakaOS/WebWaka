-- Migration 0059: Beauty Salon / Barber Shop vertical
-- Platform Invariants: P9 (kobo integers), T3 (tenant_id NOT NULL on every table)
-- M9 — Commerce P2 Batch 1 (Set A, Task V-COMM-EXT-A3)

CREATE TABLE IF NOT EXISTS beauty_salon_profiles (
  id                  TEXT    PRIMARY KEY,
  workspace_id        TEXT    REFERENCES workspaces(id),
  tenant_id           TEXT    NOT NULL,
  salon_name          TEXT    NOT NULL,
  salon_type          TEXT    NOT NULL DEFAULT 'salon',  -- salon/barber/unisex
  nasc_number         TEXT,
  state_permit_number TEXT,
  state               TEXT    NOT NULL,
  status              TEXT    NOT NULL DEFAULT 'seeded',
  created_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at          INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_salon_tenant ON beauty_salon_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_salon_status ON beauty_salon_profiles(status);

CREATE TABLE IF NOT EXISTS salon_services (
  id               TEXT    PRIMARY KEY,
  workspace_id     TEXT    REFERENCES workspaces(id),
  tenant_id        TEXT    NOT NULL,
  service_name     TEXT    NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  price_kobo       INTEGER NOT NULL,  -- P9
  staff_id         TEXT,
  created_at       INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_salsvc_tenant ON salon_services(tenant_id);

CREATE TABLE IF NOT EXISTS salon_appointments (
  id               TEXT    PRIMARY KEY,
  workspace_id     TEXT    REFERENCES workspaces(id),
  tenant_id        TEXT    NOT NULL,
  client_phone     TEXT    NOT NULL,
  service_id       TEXT    REFERENCES salon_services(id),
  staff_id         TEXT,
  appointment_time INTEGER NOT NULL,  -- unix timestamp
  deposit_kobo     INTEGER NOT NULL DEFAULT 0,  -- P9
  status           TEXT    NOT NULL DEFAULT 'booked',
  created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at       INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_salapt_tenant ON salon_appointments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_salapt_status ON salon_appointments(status);
CREATE INDEX IF NOT EXISTS idx_salapt_time   ON salon_appointments(appointment_time);

CREATE TABLE IF NOT EXISTS salon_products (
  id               TEXT    PRIMARY KEY,
  workspace_id     TEXT    REFERENCES workspaces(id),
  tenant_id        TEXT    NOT NULL,
  product_name     TEXT    NOT NULL,
  brand            TEXT,
  unit_price_kobo  INTEGER NOT NULL,  -- P9
  quantity_in_stock INTEGER NOT NULL DEFAULT 0,
  created_at       INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_salprod_tenant ON salon_products(tenant_id);
