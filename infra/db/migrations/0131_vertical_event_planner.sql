-- Migration 0131: Event Planner / MC vertical (M9)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers

CREATE TABLE IF NOT EXISTS event_planner_profiles (
  id                  TEXT    PRIMARY KEY,
  workspace_id        TEXT    NOT NULL,
  tenant_id           TEXT    NOT NULL,
  company_name        TEXT    NOT NULL,
  state_event_licence TEXT,
  cac_rc              TEXT,
  status              TEXT    NOT NULL DEFAULT 'seeded',
  created_at          INTEGER NOT NULL,
  updated_at          INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_event_planner_profiles_tenant ON event_planner_profiles(tenant_id);

CREATE TABLE IF NOT EXISTS planned_events (
  id                  TEXT    PRIMARY KEY,
  profile_id          TEXT    NOT NULL,
  tenant_id           TEXT    NOT NULL,
  client_phone        TEXT    NOT NULL,
  event_type          TEXT    NOT NULL, -- wedding/birthday/corporate/funeral/other
  event_date          INTEGER NOT NULL,
  venue               TEXT,
  guest_count         INTEGER NOT NULL DEFAULT 0,
  total_budget_kobo   INTEGER NOT NULL,
  deposit_kobo        INTEGER NOT NULL DEFAULT 0,
  balance_kobo        INTEGER NOT NULL,
  status              TEXT    NOT NULL DEFAULT 'enquiry', -- enquiry/confirmed/in_planning/day_of/completed
  created_at          INTEGER NOT NULL,
  updated_at          INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_planned_events_tenant ON planned_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_planned_events_profile ON planned_events(profile_id);

CREATE TABLE IF NOT EXISTS event_vendors (
  id               TEXT    PRIMARY KEY,
  event_id         TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  vendor_type      TEXT    NOT NULL, -- caterer/decorator/DJ/MC/usher/photographer/other
  vendor_phone     TEXT    NOT NULL,
  vendor_name      TEXT    NOT NULL,
  agreed_fee_kobo  INTEGER NOT NULL,
  deposit_paid_kobo INTEGER NOT NULL DEFAULT 0,
  status           TEXT    NOT NULL DEFAULT 'booked', -- booked/confirmed/cancelled
  created_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_event_vendors_tenant ON event_vendors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_event_vendors_event ON event_vendors(event_id);

CREATE TABLE IF NOT EXISTS event_tasks (
  id         TEXT    PRIMARY KEY,
  event_id   TEXT    NOT NULL,
  tenant_id  TEXT    NOT NULL,
  task_name  TEXT    NOT NULL,
  due_date   INTEGER,
  completed  INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_event_tasks_tenant ON event_tasks(tenant_id);
