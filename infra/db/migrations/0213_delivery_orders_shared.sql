-- Migration 0213: Shared delivery_orders table (M9) — column patch
-- delivery_orders was first created in 0156_vertical_logistics_delivery.sql with
-- the P13 opaque-reference schema.  This migration extends it with the
-- workspace-centric columns required by the shared M9 delivery feature
-- (logistics-delivery, restaurant, supermarket verticals).
--
-- P9: fee_kobo and cod_amount_kobo are integer kobo
-- T3: tenant_id on all rows and queries

ALTER TABLE delivery_orders ADD COLUMN workspace_id    TEXT    REFERENCES workspaces(id);
ALTER TABLE delivery_orders ADD COLUMN vertical_slug   TEXT    NOT NULL DEFAULT 'logistics-delivery';
ALTER TABLE delivery_orders ADD COLUMN customer_phone  TEXT;
ALTER TABLE delivery_orders ADD COLUMN origin_address  TEXT;
ALTER TABLE delivery_orders ADD COLUMN dest_address    TEXT;
ALTER TABLE delivery_orders ADD COLUMN rider_id        TEXT;
ALTER TABLE delivery_orders ADD COLUMN fee_kobo        INTEGER NOT NULL DEFAULT 0;
ALTER TABLE delivery_orders ADD COLUMN cod_amount_kobo INTEGER NOT NULL DEFAULT 0;
ALTER TABLE delivery_orders ADD COLUMN notes           TEXT;

CREATE INDEX IF NOT EXISTS idx_delivery_orders_tenant
  ON delivery_orders(tenant_id);

CREATE INDEX IF NOT EXISTS idx_delivery_orders_workspace
  ON delivery_orders(workspace_id);

CREATE INDEX IF NOT EXISTS idx_delivery_orders_status
  ON delivery_orders(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_delivery_orders_vertical
  ON delivery_orders(vertical_slug, tenant_id);
