-- Migration: 0088_vertical_shoemaker.sql
-- Vertical: shoemaker (M12 Commerce P3) — Aba leather cluster focus
-- FSM: seeded → claimed → active (3-state informal)
-- Platform Invariants: P9 (kobo integers), T3 (tenant_id NOT NULL)

CREATE TABLE IF NOT EXISTS shoemaker_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  business_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('cobbler','bespoke','both')),
  artisan_assoc_number TEXT,
  state TEXT,
  lga TEXT,
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_shoemaker_profiles_tenant ON shoemaker_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_shoemaker_profiles_workspace ON shoemaker_profiles(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS shoe_jobs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  job_type TEXT NOT NULL CHECK(job_type IN ('repair','bespoke')),
  customer_phone TEXT,
  description TEXT NOT NULL,
  shoe_size INTEGER NOT NULL,
  price_kobo INTEGER NOT NULL,
  deposit_kobo INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'received' CHECK(status IN ('received','in_progress','ready','collected')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_shoe_jobs_tenant ON shoe_jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_shoe_jobs_workspace ON shoe_jobs(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS shoe_materials (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  material_name TEXT NOT NULL,
  unit TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_cost_kobo INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_shoe_materials_tenant ON shoe_materials(tenant_id);
CREATE INDEX IF NOT EXISTS idx_shoe_materials_workspace ON shoe_materials(workspace_id, tenant_id);
