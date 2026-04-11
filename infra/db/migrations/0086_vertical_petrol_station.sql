-- Migration: 0086_vertical_petrol_station.sql
-- Vertical: petrol-station (M11 Commerce P3) — lighter-weight independent stations
-- FSM: seeded → claimed → nuprc_verified → active → suspended
-- Platform Invariants: P9 (kobo/litre integers), T3 (tenant_id NOT NULL)

CREATE TABLE IF NOT EXISTS petrol_station_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  station_name TEXT NOT NULL,
  nuprc_licence TEXT,
  state TEXT,
  lga TEXT,
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_petrol_station_profiles_tenant ON petrol_station_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_petrol_station_profiles_workspace ON petrol_station_profiles(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS petrol_daily_sales (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  sale_date INTEGER NOT NULL,
  product TEXT NOT NULL CHECK(product IN ('PMS','AGO','DPK')),
  litres_sold INTEGER NOT NULL,
  price_per_litre_kobo INTEGER NOT NULL,
  total_kobo INTEGER NOT NULL,
  cash_received_kobo INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_petrol_daily_sales_tenant ON petrol_daily_sales(tenant_id);
CREATE INDEX IF NOT EXISTS idx_petrol_daily_sales_workspace ON petrol_daily_sales(workspace_id, tenant_id);
