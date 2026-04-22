-- 0331_vertical_pharmacy_supermarket_cooperative.sql
-- S09/S10: New vertical profile tables for pharmacy, supermarket, cooperative
-- pharmacy: partial→exists (no dedicated table existed; clinic_profiles was workaround)
-- supermarket: missing→exists
-- cooperative: partial→exists

-- PHARMACY PROFILES
CREATE TABLE IF NOT EXISTS pharmacy_profiles (
  id              TEXT    PRIMARY KEY,
  workspace_id    TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  pharmacy_name   TEXT    NOT NULL,
  pcn_licence     TEXT,
  nafdac_ref      TEXT,
  osm_node_id     TEXT,
  address         TEXT,
  phone           TEXT,
  website         TEXT,
  state           TEXT,
  lga             TEXT,
  pharmacy_type   TEXT    NOT NULL DEFAULT 'community'
                  CHECK (pharmacy_type IN ('community','hospital','chain_outlet','online','wholesale','other')),
  status          TEXT    NOT NULL DEFAULT 'seeded'
                  CHECK (status IN ('seeded','claimed','pcn_verified','nafdac_verified','active','closed')),
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pharmacy_profiles_tenant    ON pharmacy_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_profiles_workspace ON pharmacy_profiles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_profiles_state     ON pharmacy_profiles(state, tenant_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_profiles_osm       ON pharmacy_profiles(osm_node_id);

-- SUPERMARKET PROFILES
CREATE TABLE IF NOT EXISTS supermarket_profiles (
  id               TEXT    PRIMARY KEY,
  workspace_id     TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  shop_name        TEXT    NOT NULL,
  supermarket_type TEXT    NOT NULL DEFAULT 'supermarket'
                   CHECK (supermarket_type IN ('supermarket','minimart','grocery','mall','wholesale_club','other')),
  osm_node_id      TEXT,
  address          TEXT,
  phone            TEXT,
  website          TEXT,
  opening_hours    TEXT,
  state            TEXT,
  lga              TEXT,
  status           TEXT    NOT NULL DEFAULT 'seeded'
                   CHECK (status IN ('seeded','claimed','active','closed')),
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_supermarket_profiles_tenant    ON supermarket_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_supermarket_profiles_workspace ON supermarket_profiles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_supermarket_profiles_state     ON supermarket_profiles(state, tenant_id);

-- COOPERATIVE PROFILES
CREATE TABLE IF NOT EXISTS cooperative_profiles (
  id               TEXT    PRIMARY KEY,
  workspace_id     TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  cooperative_name TEXT    NOT NULL,
  cac_rc           TEXT,
  osm_node_id      TEXT,
  cooperative_type TEXT    NOT NULL DEFAULT 'multipurpose'
                   CHECK (cooperative_type IN ('savings','multipurpose','agricultural','credit','consumer','producer','other')),
  member_count     INTEGER NOT NULL DEFAULT 0,
  state            TEXT,
  lga              TEXT,
  status           TEXT    NOT NULL DEFAULT 'seeded'
                   CHECK (status IN ('seeded','claimed','cac_verified','members_enrolled','active')),
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cooperative_profiles_tenant    ON cooperative_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cooperative_profiles_workspace ON cooperative_profiles(workspace_id);

-- Update seedability matrix
INSERT OR REPLACE INTO vertical_seedability_matrix (
  vertical_slug, profile_status, profile_table, profile_migration, profile_column_count,
  requires_sidecar_enrichment, seedability_status, seedability_notes, created_at, updated_at
) VALUES
  ('pharmacy', 'exists', 'pharmacy_profiles', 'apps/api/migrations/0331_vertical_pharmacy_supermarket_cooperative.sql',
   16, 1, 'seedable_with_sidecar', 'pharmacy_profiles added (0331). OSM Nigeria 454 pharmacies seeded S09. pcn_licence/nafdac_ref from PCN/NAFDAC future enrichment.', unixepoch(), unixepoch()),
  ('supermarket', 'exists', 'supermarket_profiles', 'apps/api/migrations/0331_vertical_pharmacy_supermarket_cooperative.sql',
   16, 1, 'seedable_with_sidecar', 'supermarket_profiles added (0331). OSM Nigeria 458 supermarkets seeded S09.', unixepoch(), unixepoch()),
  ('cooperative', 'exists', 'cooperative_profiles', 'apps/api/migrations/0331_vertical_pharmacy_supermarket_cooperative.sql',
   13, 1, 'seedable_with_sidecar', 'cooperative_profiles added (0331). OSM Nigeria 30 cooperatives seeded S10. CAC blocked; OSM office=cooperative source.', unixepoch(), unixepoch());
