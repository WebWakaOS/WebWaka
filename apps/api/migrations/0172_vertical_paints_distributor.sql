-- Migration 0172: Paints & Coatings Distributor vertical (M12)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers
-- Container size in litres ×100 (no floats)

CREATE TABLE IF NOT EXISTS paints_distributor_profiles (
  id             TEXT    PRIMARY KEY,
  workspace_id   TEXT    NOT NULL,
  tenant_id      TEXT    NOT NULL,
  company_name   TEXT    NOT NULL,
  son_cert       TEXT,
  nafdac_ref     TEXT,
  cac_rc         TEXT,
  status         TEXT    NOT NULL DEFAULT 'seeded',
  created_at     INTEGER NOT NULL,
  updated_at     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_paints_distributor_profiles_tenant ON paints_distributor_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_paints_distributor_profiles_workspace ON paints_distributor_profiles(workspace_id);

CREATE TABLE IF NOT EXISTS paints_inventory (
  id                   TEXT    PRIMARY KEY,
  profile_id           TEXT    NOT NULL,
  tenant_id            TEXT    NOT NULL,
  brand_name           TEXT    NOT NULL,
  colour_code          TEXT,
  finish_type          TEXT    NOT NULL DEFAULT 'matt', -- matt/gloss/eggshell/primer/satin
  container_litres_x100 INTEGER NOT NULL DEFAULT 400, -- 4L = 400
  qty_in_stock         INTEGER NOT NULL DEFAULT 0,
  cost_price_kobo      INTEGER NOT NULL DEFAULT 0,
  retail_price_kobo    INTEGER NOT NULL DEFAULT 0,
  reorder_level        INTEGER NOT NULL DEFAULT 5,
  created_at           INTEGER NOT NULL,
  updated_at           INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_paints_inventory_tenant ON paints_inventory(tenant_id);

CREATE TABLE IF NOT EXISTS paints_orders (
  id               TEXT    PRIMARY KEY,
  profile_id       TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  client_ref_id    TEXT    NOT NULL, -- opaque (P13)
  items            TEXT    NOT NULL, -- JSON: [{product_id, quantity, unit_price_kobo}]
  total_kobo       INTEGER NOT NULL DEFAULT 0,
  order_date       INTEGER NOT NULL,
  delivery_date    INTEGER,
  is_bulk          INTEGER NOT NULL DEFAULT 0,
  status           TEXT    NOT NULL DEFAULT 'pending', -- pending/confirmed/dispatched/delivered
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_paints_orders_tenant ON paints_orders(tenant_id);
