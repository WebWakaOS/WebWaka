-- Migration 0055: Commerce verticals (M8e)
-- packages/verticals-restaurant, verticals-market, verticals-professional,
--          verticals-school, verticals-clinic, verticals-tech-hub
-- T3: tenant_id on all rows. P9: monetary amounts in integer kobo.

-- Restaurant menus
CREATE TABLE IF NOT EXISTS restaurant_menus (
  id           TEXT    PRIMARY KEY,
  workspace_id TEXT    NOT NULL REFERENCES workspaces(id),
  tenant_id    TEXT    NOT NULL,
  name         TEXT    NOT NULL,
  description  TEXT,
  price_kobo   INTEGER NOT NULL CHECK (price_kobo > 0),
  category     TEXT    NOT NULL DEFAULT 'main' CHECK (category IN ('starter','main','dessert','drink','snack','special')),
  available    INTEGER NOT NULL DEFAULT 1,  -- 0/1 boolean
  photo_url    TEXT,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_menu_tenant    ON restaurant_menus(tenant_id);
CREATE INDEX IF NOT EXISTS idx_menu_available ON restaurant_menus(available, tenant_id);

-- Market stall registry
CREATE TABLE IF NOT EXISTS market_stalls (
  id           TEXT    PRIMARY KEY,
  workspace_id TEXT    NOT NULL REFERENCES workspaces(id),
  tenant_id    TEXT    NOT NULL,
  stall_number TEXT    NOT NULL,
  trader_name  TEXT    NOT NULL,
  goods_type   TEXT    NOT NULL,   -- foodstuff|clothing|electronics|provisions|hardware|others
  phone        TEXT,
  status       TEXT    NOT NULL DEFAULT 'active' CHECK (status IN ('active','vacant','suspended')),
  created_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_stalls_tenant    ON market_stalls(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stalls_workspace ON market_stalls(workspace_id, tenant_id);

-- Professional (lawyer, doctor, accountant, engineer, etc.) profiles
CREATE TABLE IF NOT EXISTS professional_profiles (
  id                  TEXT    PRIMARY KEY,
  individual_id       TEXT    NOT NULL,   -- FK → individuals(id)
  workspace_id        TEXT    NOT NULL REFERENCES workspaces(id),
  tenant_id           TEXT    NOT NULL,
  profession          TEXT    NOT NULL CHECK (profession IN ('lawyer','doctor','accountant','engineer','architect','pharmacist','nurse','surveyor','optician','dentist','others')),
  license_body        TEXT,               -- NBA|MDCN|ICAN|COREN|ARCON|PCN|NMCN|etc
  license_number      TEXT,
  license_expires     INTEGER,
  years_experience    INTEGER NOT NULL DEFAULT 0,
  consultation_fee_kobo INTEGER,          -- P9
  status              TEXT    NOT NULL DEFAULT 'seeded' CHECK (status IN ('seeded','claimed','license_verified','active')),
  created_at          INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_professional_tenant     ON professional_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_professional_profession ON professional_profiles(profession, tenant_id);

-- School / educational institution profiles
CREATE TABLE IF NOT EXISTS school_profiles (
  id              TEXT    PRIMARY KEY,
  organization_id TEXT    NOT NULL REFERENCES organizations(id),
  workspace_id    TEXT    NOT NULL REFERENCES workspaces(id),
  tenant_id       TEXT    NOT NULL,
  school_name     TEXT    NOT NULL,
  school_type     TEXT    NOT NULL CHECK (school_type IN ('nursery','primary','secondary','tertiary','vocational','tutoring','others')),
  cac_reg_number  TEXT,
  state_reg_ref   TEXT,                -- State Ministry of Education reference
  student_count   INTEGER NOT NULL DEFAULT 0,
  status          TEXT    NOT NULL DEFAULT 'seeded' CHECK (status IN ('seeded','claimed','reg_verified','active')),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_school_tenant ON school_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_school_type   ON school_profiles(school_type, tenant_id);

-- Clinic / healthcare facility profiles
CREATE TABLE IF NOT EXISTS clinic_profiles (
  id              TEXT    PRIMARY KEY,
  organization_id TEXT    NOT NULL REFERENCES organizations(id),
  workspace_id    TEXT    NOT NULL REFERENCES workspaces(id),
  tenant_id       TEXT    NOT NULL,
  facility_name   TEXT    NOT NULL,
  facility_type   TEXT    NOT NULL CHECK (facility_type IN ('clinic','hospital','pharmacy','laboratory','maternity','dental','optical','others')),
  mdcn_ref        TEXT,                -- Medical and Dental Council of Nigeria
  cac_reg_number  TEXT,
  bed_count       INTEGER NOT NULL DEFAULT 0,
  status          TEXT    NOT NULL DEFAULT 'seeded' CHECK (status IN ('seeded','claimed','mdcn_verified','active')),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_clinic_tenant ON clinic_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_clinic_type   ON clinic_profiles(facility_type, tenant_id);

-- Tech hub profiles
CREATE TABLE IF NOT EXISTS tech_hub_profiles (
  id              TEXT    PRIMARY KEY,
  workspace_id    TEXT    NOT NULL REFERENCES workspaces(id),
  tenant_id       TEXT    NOT NULL,
  hub_name        TEXT    NOT NULL,
  lga             TEXT    NOT NULL,
  state           TEXT    NOT NULL,
  desk_count      INTEGER NOT NULL DEFAULT 0,
  focus_areas     TEXT    NOT NULL DEFAULT 'general',  -- JSON array: ['fintech','agritech','healthtech',...]
  status          TEXT    NOT NULL DEFAULT 'seeded' CHECK (status IN ('seeded','claimed','active')),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_tech_hub_tenant ON tech_hub_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tech_hub_state  ON tech_hub_profiles(state, tenant_id);
