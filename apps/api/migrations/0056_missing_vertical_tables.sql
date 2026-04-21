-- Migration 0056: Missing vertical profile tables
-- Adds tables not included in 0051/0052/0055 for RTU, okada-keke,
-- mosque, youth-org, womens-assoc, ministry-mission, sole-trader
-- (Platform Invariants T3, P9)

-- ───────────────────────────────────────────
-- Road Transport Union (NURTW/NURTW equivalent)
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS road_transport_union_profiles (
  id               TEXT    PRIMARY KEY,
  workspace_id     TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  union_name       TEXT    NOT NULL,
  registration_ref TEXT,
  member_count     INTEGER NOT NULL DEFAULT 0,
  status           TEXT    NOT NULL DEFAULT 'seeded'
                   CHECK(status IN ('seeded','claimed','active','suspended')),
  created_at       INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_rtu_workspace_tenant
  ON road_transport_union_profiles(workspace_id, tenant_id);

-- ───────────────────────────────────────────
-- Okada / Keke Co-operative
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS okada_keke_profiles (
  id            TEXT    PRIMARY KEY,
  workspace_id  TEXT    NOT NULL,
  tenant_id     TEXT    NOT NULL,
  operator_type TEXT    NOT NULL CHECK(operator_type IN ('okada','keke','both')),
  frsc_ref      TEXT,
  rider_count   INTEGER NOT NULL DEFAULT 0,
  status        TEXT    NOT NULL DEFAULT 'seeded'
                CHECK(status IN ('seeded','claimed','frsc_verified','active')),
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_okada_workspace_tenant
  ON okada_keke_profiles(workspace_id, tenant_id);

-- ───────────────────────────────────────────
-- Mosque / Islamic Centre
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mosque_profiles (
  id              TEXT    PRIMARY KEY,
  organization_id TEXT    NOT NULL,
  workspace_id    TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  mosque_name     TEXT    NOT NULL,
  it_number       TEXT,
  total_members   INTEGER NOT NULL DEFAULT 0,
  status          TEXT    NOT NULL DEFAULT 'seeded'
                  CHECK(status IN ('seeded','claimed','it_verified','active')),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_mosque_workspace_tenant
  ON mosque_profiles(workspace_id, tenant_id);

-- ───────────────────────────────────────────
-- Youth Organization
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS youth_org_profiles (
  id               TEXT    PRIMARY KEY,
  organization_id  TEXT    NOT NULL,
  workspace_id     TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  org_name         TEXT    NOT NULL,
  registration_ref TEXT,
  member_count     INTEGER NOT NULL DEFAULT 0,
  status           TEXT    NOT NULL DEFAULT 'seeded'
                   CHECK(status IN ('seeded','claimed','active','suspended')),
  created_at       INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_youth_org_workspace_tenant
  ON youth_org_profiles(workspace_id, tenant_id);

-- ───────────────────────────────────────────
-- Women's Association
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS womens_assoc_profiles (
  id              TEXT    PRIMARY KEY,
  organization_id TEXT    NOT NULL,
  workspace_id    TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  assoc_name      TEXT    NOT NULL,
  lga             TEXT    NOT NULL,
  state           TEXT    NOT NULL,
  member_count    INTEGER NOT NULL DEFAULT 0,
  status          TEXT    NOT NULL DEFAULT 'seeded'
                  CHECK(status IN ('seeded','claimed','active')),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_womens_assoc_workspace_tenant
  ON womens_assoc_profiles(workspace_id, tenant_id);

-- ───────────────────────────────────────────
-- Ministry / Apostolic Mission
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ministry_profiles (
  id              TEXT    PRIMARY KEY,
  organization_id TEXT    NOT NULL,
  workspace_id    TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  ministry_name   TEXT    NOT NULL,
  it_number       TEXT,
  founding_year   INTEGER,
  total_members   INTEGER NOT NULL DEFAULT 0,
  status          TEXT    NOT NULL DEFAULT 'seeded'
                  CHECK(status IN ('seeded','claimed','it_verified','active')),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_ministry_workspace_tenant
  ON ministry_profiles(workspace_id, tenant_id);

-- ───────────────────────────────────────────
-- Sole Trader / Artisan
-- P9: min_fee_kobo, max_fee_kobo are integer kobo
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sole_trader_profiles (
  id               TEXT    PRIMARY KEY,
  individual_id    TEXT    NOT NULL,
  workspace_id     TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  trade_type       TEXT    NOT NULL
                   CHECK(trade_type IN ('tailor','cobbler','welder','carpenter','painter',
                                        'plumber','electrician','mechanic','barber','chef','others')),
  skills           TEXT    NOT NULL DEFAULT '[]',
  lga              TEXT    NOT NULL,
  state            TEXT    NOT NULL,
  whatsapp_number  TEXT,
  min_fee_kobo     INTEGER,  -- P9 integer kobo
  max_fee_kobo     INTEGER,  -- P9 integer kobo
  rating_x10       INTEGER NOT NULL DEFAULT 50,  -- P9: 50 = 5.0 stars
  status           TEXT    NOT NULL DEFAULT 'seeded'
                   CHECK(status IN ('seeded','claimed','active')),
  created_at       INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_sole_trader_workspace_tenant
  ON sole_trader_profiles(workspace_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_sole_trader_lga_state
  ON sole_trader_profiles(lga, state, tenant_id);

-- ───────────────────────────────────────────
-- Tech Hub (Place entity)
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tech_hub_profiles (
  id           TEXT    PRIMARY KEY,
  workspace_id TEXT    NOT NULL,
  tenant_id    TEXT    NOT NULL,
  hub_name     TEXT    NOT NULL,
  lga          TEXT    NOT NULL,
  state        TEXT    NOT NULL,
  desk_count   INTEGER NOT NULL DEFAULT 0,
  focus_areas  TEXT    NOT NULL DEFAULT 'general',
  status       TEXT    NOT NULL DEFAULT 'seeded'
               CHECK(status IN ('seeded','claimed','active')),
  created_at   INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_tech_hub_workspace_tenant
  ON tech_hub_profiles(workspace_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_tech_hub_state
  ON tech_hub_profiles(state, tenant_id);
