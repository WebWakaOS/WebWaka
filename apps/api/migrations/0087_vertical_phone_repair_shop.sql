-- Migration: 0087_vertical_phone_repair_shop.sql
-- Vertical: phone-repair-shop (M10 Commerce P3)
-- FSM: seeded → claimed → active (3-state)
-- Platform Invariants: P9 (kobo integers), P13 (IMEI never to AI), T3 (tenant_id NOT NULL)
--
-- Tables:
--   phone_repair_profiles  — one per workspace (FSM-gated)
--   phone_repair_jobs      — repair jobs (IMEI stored but stripped from AI layer per P13)
--   phone_repair_parts     — parts inventory (cost in integer kobo per P9)

CREATE TABLE IF NOT EXISTS phone_repair_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  shop_name TEXT NOT NULL,
  lg_permit_number TEXT,
  state TEXT,
  lga TEXT,
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_phone_repair_profiles_tenant ON phone_repair_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_phone_repair_profiles_workspace ON phone_repair_profiles(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS phone_repair_jobs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  device_brand TEXT NOT NULL,
  device_model TEXT NOT NULL,
  imei TEXT,
  fault_description TEXT NOT NULL,
  labour_kobo INTEGER NOT NULL CHECK(labour_kobo > 0),
  parts_kobo INTEGER NOT NULL DEFAULT 0,
  total_kobo INTEGER NOT NULL CHECK(total_kobo > 0),
  status TEXT NOT NULL DEFAULT 'intake'
    CHECK(status IN ('intake','diagnosing','awaiting_parts','repairing','completed','collected')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_phone_repair_jobs_tenant ON phone_repair_jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_phone_repair_jobs_workspace ON phone_repair_jobs(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS phone_repair_parts (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  part_name TEXT NOT NULL,
  compatible_models TEXT NOT NULL DEFAULT '[]',
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_cost_kobo INTEGER NOT NULL CHECK(unit_cost_kobo > 0),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_phone_repair_parts_tenant ON phone_repair_parts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_phone_repair_parts_workspace ON phone_repair_parts(workspace_id, tenant_id);
