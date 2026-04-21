-- Migration 0061: Catering Service vertical
-- Platform Invariants: P9 (kobo integers), T3 (tenant_id NOT NULL on every table)
-- M9 — Commerce P2 Batch 1 (Set A, Task V-COMM-EXT-A5)

CREATE TABLE IF NOT EXISTS catering_profiles (
  id             TEXT    PRIMARY KEY,
  workspace_id   TEXT    REFERENCES workspaces(id),
  tenant_id      TEXT    NOT NULL,
  business_name  TEXT    NOT NULL,
  nafdac_cert    TEXT,
  cac_number     TEXT,
  speciality     TEXT    NOT NULL DEFAULT 'all',  -- Nigerian/continental/confectionery/all
  status         TEXT    NOT NULL DEFAULT 'seeded',
  created_at     INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at     INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_cater_tenant ON catering_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cater_status ON catering_profiles(status);

CREATE TABLE IF NOT EXISTS catering_events (
  id                  TEXT    PRIMARY KEY,
  workspace_id        TEXT    REFERENCES workspaces(id),
  tenant_id           TEXT    NOT NULL,
  client_phone        TEXT    NOT NULL,
  event_type          TEXT    NOT NULL,  -- wedding/corporate/birthday/burial/other
  event_date          INTEGER NOT NULL,  -- unix timestamp
  guest_count         INTEGER NOT NULL DEFAULT 0,
  price_per_head_kobo INTEGER NOT NULL DEFAULT 0,  -- P9
  total_kobo          INTEGER NOT NULL DEFAULT 0,  -- P9
  deposit_kobo        INTEGER NOT NULL DEFAULT 0,  -- P9
  balance_kobo        INTEGER NOT NULL DEFAULT 0,  -- P9
  status              TEXT    NOT NULL DEFAULT 'quoted',
  created_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at          INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_catevt_tenant ON catering_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_catevt_status ON catering_events(status);
CREATE INDEX IF NOT EXISTS idx_catevt_date   ON catering_events(event_date);

CREATE TABLE IF NOT EXISTS catering_menus (
  id                TEXT    PRIMARY KEY,
  workspace_id      TEXT    REFERENCES workspaces(id),
  tenant_id         TEXT    NOT NULL,
  menu_name         TEXT    NOT NULL,
  description       TEXT,
  cost_per_head_kobo INTEGER NOT NULL DEFAULT 0,  -- P9
  created_at        INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_catmenu_tenant ON catering_menus(tenant_id);

CREATE TABLE IF NOT EXISTS catering_staff (
  id               TEXT    PRIMARY KEY,
  workspace_id     TEXT    REFERENCES workspaces(id),
  tenant_id        TEXT    NOT NULL,
  staff_name       TEXT    NOT NULL,
  role             TEXT    NOT NULL DEFAULT 'cook',  -- cook/server/driver
  nafdac_card_number TEXT,
  created_at       INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_catstaff_tenant ON catering_staff(tenant_id);
