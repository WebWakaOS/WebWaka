-- 0322_vertical_marketplace.sql
-- S09: Marketplace / Trading Hub vertical table
-- Subject: place (physical marketplace location)
-- T3: tenant_id NOT NULL; P9: no monetary fields at this level
-- Status lifecycle: seeded → claimed → association_linked → active → closed

CREATE TABLE IF NOT EXISTS marketplace_profiles (
  id              TEXT    PRIMARY KEY,
  workspace_id    TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  market_name     TEXT    NOT NULL,
  market_type     TEXT    NOT NULL DEFAULT 'general'
                  CHECK (market_type IN (
                    'general','food','animal','spare_parts','wholesale',
                    'waterside','building_materials','clothing','fish',
                    'farm_produce','night','specialist','other')),
  osm_node_id     TEXT,                -- OSM element ID for deduplication
  operating_days  TEXT,                -- e.g. "mon,tue,wed,thu,fri,sat"
  state           TEXT,                -- Nigerian state (normalised lower)
  lga             TEXT,                -- LGA name from OSM/source
  ward            TEXT,                -- Ward name from OSM/source
  status          TEXT    NOT NULL DEFAULT 'seeded'
                  CHECK (status IN ('seeded','claimed','association_linked','active','closed')),
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_marketplace_profiles_tenant    ON marketplace_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_profiles_workspace ON marketplace_profiles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_profiles_state     ON marketplace_profiles(state, tenant_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_profiles_osm       ON marketplace_profiles(osm_node_id);
