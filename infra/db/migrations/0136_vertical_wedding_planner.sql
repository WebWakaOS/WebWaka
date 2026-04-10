-- Migration 0136: Wedding Planner / Celebrant vertical (M12)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers
-- P13: no couple PII in AI; aggregate only

CREATE TABLE IF NOT EXISTS wedding_planner_profiles (
  id              TEXT    PRIMARY KEY,
  workspace_id    TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  company_name    TEXT    NOT NULL,
  cac_rc          TEXT,
  celebrant_cert  TEXT,
  status          TEXT    NOT NULL DEFAULT 'seeded',
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_wedding_planner_profiles_tenant ON wedding_planner_profiles(tenant_id);

CREATE TABLE IF NOT EXISTS wedding_events (
  id                TEXT    PRIMARY KEY,
  profile_id        TEXT    NOT NULL,
  tenant_id         TEXT    NOT NULL,
  event_date        INTEGER NOT NULL,
  venue             TEXT,
  guest_count       INTEGER NOT NULL DEFAULT 0,
  total_budget_kobo INTEGER NOT NULL,
  deposit_kobo      INTEGER NOT NULL DEFAULT 0,
  balance_kobo      INTEGER NOT NULL,
  style             TEXT    NOT NULL DEFAULT 'church', -- traditional/church/nikah/court/destination
  status            TEXT    NOT NULL DEFAULT 'enquiry', -- enquiry/booked/planning/day_of/completed
  created_at        INTEGER NOT NULL,
  updated_at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_wedding_events_tenant ON wedding_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_wedding_events_profile ON wedding_events(profile_id);

CREATE TABLE IF NOT EXISTS wedding_vendors (
  id                TEXT    PRIMARY KEY,
  event_id          TEXT    NOT NULL,
  tenant_id         TEXT    NOT NULL,
  vendor_type       TEXT    NOT NULL, -- caterer/decorator/photographer/DJ/usher/florist/other
  vendor_phone      TEXT    NOT NULL,
  agreed_fee_kobo   INTEGER NOT NULL,
  deposit_paid_kobo INTEGER NOT NULL DEFAULT 0,
  status            TEXT    NOT NULL DEFAULT 'booked', -- booked/confirmed/cancelled
  created_at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_wedding_vendors_tenant ON wedding_vendors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_wedding_vendors_event ON wedding_vendors(event_id);

CREATE TABLE IF NOT EXISTS wedding_tasks (
  id         TEXT    PRIMARY KEY,
  event_id   TEXT    NOT NULL,
  tenant_id  TEXT    NOT NULL,
  task_name  TEXT    NOT NULL,
  category   TEXT    NOT NULL DEFAULT 'logistics', -- venue/catering/styling/legal/logistics
  due_date   INTEGER,
  completed  INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_wedding_tasks_tenant ON wedding_tasks(tenant_id);
