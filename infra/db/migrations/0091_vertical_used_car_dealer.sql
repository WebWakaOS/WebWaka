-- Migration: 0091_vertical_used_car_dealer.sql
-- Vertical: used-car-dealer (M12 Commerce P3) — Berger/Cotonou market
-- FSM: seeded → claimed → frsc_verified → active → suspended
-- Platform Invariants: P9 (kobo integers), P13 (VIN never to AI), T3 (tenant_id NOT NULL)

CREATE TABLE IF NOT EXISTS used_car_dealer_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  dealership_name TEXT NOT NULL,
  cac_rc TEXT,
  state_motor_dealers_assoc TEXT,
  frsc_dealer_reg TEXT,
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_used_car_dealer_profiles_tenant ON used_car_dealer_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_used_car_dealer_profiles_workspace ON used_car_dealer_profiles(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS used_car_listings (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  mileage_km INTEGER NOT NULL,
  vin TEXT,
  condition TEXT NOT NULL CHECK(condition IN ('excellent','good','fair')),
  asking_price_kobo INTEGER NOT NULL,
  customs_cleared INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available','reserved','sold')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_used_car_listings_tenant ON used_car_listings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_used_car_listings_workspace ON used_car_listings(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS used_car_enquiries (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  offer_price_kobo INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','negotiating','agreed','completed','cancelled')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_used_car_enquiries_tenant ON used_car_enquiries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_used_car_enquiries_workspace ON used_car_enquiries(workspace_id, tenant_id);
