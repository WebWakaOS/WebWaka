-- 0326_vertical_restaurant.sql
-- S09: Restaurant / Food Venue / Eatery vertical profile table
-- Subject: organization
-- Status lifecycle: seeded → claimed → nafdac_verified → active → closed

CREATE TABLE IF NOT EXISTS restaurant_profiles (
  id              TEXT    PRIMARY KEY,
  workspace_id    TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  restaurant_name TEXT    NOT NULL,
  cuisine_type    TEXT    NOT NULL DEFAULT 'nigerian'
                  CHECK (cuisine_type IN (
                    'nigerian','continental','fast_food','chinese','african',
                    'cafe','bar','lounge','grill','bakery','seafood','pizza',
                    'other')),
  food_venue_type TEXT    NOT NULL DEFAULT 'restaurant'
                  CHECK (food_venue_type IN (
                    'restaurant','fast_food','bar','cafe','food_court','other')),
  osm_node_id     TEXT,
  nafdac_ref      TEXT,
  address         TEXT,
  phone           TEXT,
  website         TEXT,
  opening_hours   TEXT,
  state           TEXT,
  lga             TEXT,
  status          TEXT    NOT NULL DEFAULT 'seeded'
                  CHECK (status IN ('seeded','claimed','nafdac_verified','active','closed')),
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_restaurant_profiles_tenant    ON restaurant_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_profiles_workspace ON restaurant_profiles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_profiles_state     ON restaurant_profiles(state, tenant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_profiles_osm       ON restaurant_profiles(osm_node_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_profiles_type      ON restaurant_profiles(food_venue_type, tenant_id);

-- Update seedability matrix: restaurant now has a dedicated profile table (0326)
INSERT OR REPLACE INTO vertical_seedability_matrix (
  vertical_slug, profile_status, profile_table, profile_migration, profile_column_count,
  requires_sidecar_enrichment, seedability_status, seedability_notes, created_at, updated_at
) VALUES (
  'restaurant', 'exists', 'restaurant_profiles', 'apps/api/migrations/0326_vertical_restaurant.sql',
  16, 1, 'seedable_with_sidecar',
  'restaurant_profiles table added (0326); seed entity/profile/restaurant_profile + sidecar. OSM primary source; 1627 named Nigeria food venues seeded (S09).', unixepoch(), unixepoch()
);
