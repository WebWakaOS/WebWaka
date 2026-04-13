-- Migration 0213: Shared delivery_orders table (M9)
-- Used by: logistics-delivery, restaurant, supermarket verticals
-- P9: fee_kobo and cod_amount_kobo are integer kobo
-- T3: tenant_id on all rows and queries

CREATE TABLE IF NOT EXISTS delivery_orders (
  id                TEXT    NOT NULL PRIMARY KEY,
  workspace_id      TEXT    REFERENCES workspaces(id),
  tenant_id         TEXT    NOT NULL,
  vertical_slug     TEXT    NOT NULL DEFAULT 'logistics-delivery',
  customer_phone    TEXT    NOT NULL,
  origin_address    TEXT    NOT NULL,
  dest_address      TEXT    NOT NULL,
  rider_id          TEXT,
  status            TEXT    NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','assigned','picked_up','in_transit','delivered','returned','cancelled','failed')),
  fee_kobo          INTEGER NOT NULL DEFAULT 0 CHECK (fee_kobo >= 0),
  cod_amount_kobo   INTEGER NOT NULL DEFAULT 0 CHECK (cod_amount_kobo >= 0),
  notes             TEXT,
  created_at        INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_delivery_orders_tenant
  ON delivery_orders(tenant_id);

CREATE INDEX IF NOT EXISTS idx_delivery_orders_workspace
  ON delivery_orders(workspace_id);

CREATE INDEX IF NOT EXISTS idx_delivery_orders_status
  ON delivery_orders(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_delivery_orders_vertical
  ON delivery_orders(vertical_slug, tenant_id);
