-- Migration 0051: Transport vertical infrastructure
-- packages/verticals-motor-park, verticals-transit, verticals-rideshare, verticals-haulage (M8c)
-- T3: tenant_id on all rows; all queries scoped.

-- Route licensing infrastructure (deferred from M6c)
CREATE TABLE IF NOT EXISTS transport_routes (
  id              TEXT    PRIMARY KEY,
  workspace_id    TEXT    NOT NULL REFERENCES workspaces(id),
  tenant_id       TEXT    NOT NULL,
  route_name      TEXT    NOT NULL,
  origin_place_id TEXT,            -- FK → places(id)
  dest_place_id   TEXT,            -- FK → places(id)
  route_type      TEXT    NOT NULL CHECK (route_type IN ('intercity','intracity','interstate','international')),
  license_ref     TEXT,            -- State licensing authority reference
  license_expires INTEGER,         -- Unix epoch
  fare_kobo       INTEGER,         -- Standard fare (P9)
  frequency_mins  INTEGER,         -- Average departure interval
  status          TEXT    NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','licensed','suspended','expired')),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_routes_tenant ON transport_routes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_routes_origin ON transport_routes(origin_place_id);
CREATE INDEX IF NOT EXISTS idx_routes_dest   ON transport_routes(dest_place_id);
CREATE INDEX IF NOT EXISTS idx_routes_status ON transport_routes(status, tenant_id);

-- Vehicle registry (FRSC-linked)
CREATE TABLE IF NOT EXISTS transport_vehicles (
  id              TEXT    PRIMARY KEY,
  workspace_id    TEXT    NOT NULL REFERENCES workspaces(id),
  tenant_id       TEXT    NOT NULL,
  route_id        TEXT    REFERENCES transport_routes(id),
  plate_number    TEXT    NOT NULL,
  vehicle_type    TEXT    NOT NULL CHECK (vehicle_type IN ('bus','minibus','taxi','truck','keke','okada','ferry','van')),
  capacity        INTEGER,
  frsc_license    TEXT,            -- Driver/operator FRSC license
  frsc_expires    INTEGER,         -- Unix epoch
  status          TEXT    NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','suspended')),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_vehicles_tenant ON transport_vehicles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_route  ON transport_vehicles(route_id);

-- Motor park profiles
CREATE TABLE IF NOT EXISTS motor_park_profiles (
  id              TEXT    PRIMARY KEY,
  workspace_id    TEXT    NOT NULL REFERENCES workspaces(id),
  tenant_id       TEXT    NOT NULL,
  place_id        TEXT,            -- FK → places(id) geography pin
  park_name       TEXT    NOT NULL,
  lga             TEXT    NOT NULL,
  state           TEXT    NOT NULL,
  frsc_operator_ref TEXT,
  nurtw_ref       TEXT,
  capacity        INTEGER,
  status          TEXT    NOT NULL DEFAULT 'seeded' CHECK (status IN ('seeded','claimed','frsc_verified','route_licensed','active')),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_motor_park_tenant ON motor_park_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_motor_park_state  ON motor_park_profiles(state, tenant_id);

-- Mass transit (city bus) profiles
CREATE TABLE IF NOT EXISTS transit_profiles (
  id              TEXT    PRIMARY KEY,
  workspace_id    TEXT    NOT NULL REFERENCES workspaces(id),
  tenant_id       TEXT    NOT NULL,
  operator_name   TEXT    NOT NULL,
  cac_reg_number  TEXT,
  frsc_fleet_ref  TEXT,
  fleet_size      INTEGER NOT NULL DEFAULT 0,
  status          TEXT    NOT NULL DEFAULT 'seeded' CHECK (status IN ('seeded','claimed','frsc_verified','route_licensed','active')),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_transit_tenant ON transit_profiles(tenant_id);

-- Rideshare / carpooling profiles
CREATE TABLE IF NOT EXISTS rideshare_profiles (
  id              TEXT    PRIMARY KEY,
  individual_id   TEXT    NOT NULL,   -- FK → individuals(id) driver
  workspace_id    TEXT    NOT NULL REFERENCES workspaces(id),
  tenant_id       TEXT    NOT NULL,
  frsc_license    TEXT,
  frsc_expires    INTEGER,
  vehicle_type    TEXT,               -- car|suv|van
  plate_number    TEXT,
  seat_count      INTEGER NOT NULL DEFAULT 4,
  rating_x10      INTEGER NOT NULL DEFAULT 50, -- e.g. 47 = 4.7 stars (P9 integer pattern)
  status          TEXT    NOT NULL DEFAULT 'seeded' CHECK (status IN ('seeded','claimed','frsc_verified','active','suspended')),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_rideshare_tenant ON rideshare_profiles(tenant_id);

-- Haulage / logistics operator profiles
CREATE TABLE IF NOT EXISTS haulage_profiles (
  id              TEXT    PRIMARY KEY,
  workspace_id    TEXT    NOT NULL REFERENCES workspaces(id),
  tenant_id       TEXT    NOT NULL,
  cac_reg_number  TEXT,
  frsc_fleet_ref  TEXT,
  service_types   TEXT    NOT NULL DEFAULT 'general', -- JSON array: ['general','refrigerated','hazmat']
  status          TEXT    NOT NULL DEFAULT 'seeded' CHECK (status IN ('seeded','claimed','frsc_verified','active')),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_haulage_tenant ON haulage_profiles(tenant_id);
