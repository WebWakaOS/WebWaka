-- Migration 0214: Shared reservations table (M9)
-- Used by: hotel, restaurant, event-hall verticals
-- P9: amount_kobo is integer kobo
-- T3: tenant_id on all rows and queries

CREATE TABLE IF NOT EXISTS reservations (
  id               TEXT    NOT NULL PRIMARY KEY,
  workspace_id     TEXT    REFERENCES workspaces(id),
  tenant_id        TEXT    NOT NULL,
  vertical_slug    TEXT    NOT NULL,
  customer_name    TEXT    NOT NULL,
  customer_phone   TEXT    NOT NULL,
  resource_id      TEXT    NOT NULL,
  check_in         INTEGER,
  check_out        INTEGER,
  guests_count     INTEGER NOT NULL DEFAULT 1 CHECK (guests_count >= 1),
  status           TEXT    NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','confirmed','checked_in','checked_out','cancelled','no_show')),
  paystack_ref     TEXT,
  amount_kobo      INTEGER NOT NULL DEFAULT 0 CHECK (amount_kobo >= 0),
  notes            TEXT,
  created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at       INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_reservations_tenant
  ON reservations(tenant_id);

CREATE INDEX IF NOT EXISTS idx_reservations_workspace
  ON reservations(workspace_id);

CREATE INDEX IF NOT EXISTS idx_reservations_vertical
  ON reservations(vertical_slug, tenant_id);

CREATE INDEX IF NOT EXISTS idx_reservations_resource
  ON reservations(resource_id, check_in);

CREATE INDEX IF NOT EXISTS idx_reservations_status
  ON reservations(status, created_at DESC);
