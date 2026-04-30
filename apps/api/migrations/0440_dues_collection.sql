-- Migration 0440 — Dues Collection
-- Phase 2: Value Movement sub-type — Dues Collection (FR-VM-15)
-- Creates dues_schedules (group-linked recurring schedule) and dues_payments (per-member payment records)
--
-- Platform Invariants:
--   T3  — tenant_id on all records
--   P9  — amount_kobo is INTEGER (never float)
--   P4  — dues fields stay in dues_* tables; core groups table untouched
--   P10 — ndpr_consented required on dues_payments

CREATE TABLE IF NOT EXISTS dues_schedules (
  id               TEXT PRIMARY KEY,
  tenant_id        TEXT NOT NULL,
  workspace_id     TEXT NOT NULL,
  group_id         TEXT NOT NULL,
  title            TEXT NOT NULL,
  description      TEXT,
  amount_kobo      INTEGER NOT NULL CHECK (amount_kobo > 0),   -- P9: integer kobo
  period           TEXT NOT NULL CHECK (period IN ('weekly','monthly','quarterly','annual')),
  currency_code    TEXT NOT NULL DEFAULT 'NGN',
  start_date       TEXT NOT NULL,                              -- ISO date YYYY-MM-DD
  end_date         TEXT,                                       -- NULL = open-ended
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','closed')),
  created_by       TEXT NOT NULL,
  created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at       INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_dues_schedules_tenant_group
  ON dues_schedules (tenant_id, group_id);

CREATE INDEX IF NOT EXISTS idx_dues_schedules_workspace
  ON dues_schedules (tenant_id, workspace_id);

-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS dues_payments (
  id               TEXT PRIMARY KEY,
  tenant_id        TEXT NOT NULL,
  workspace_id     TEXT NOT NULL,
  schedule_id      TEXT NOT NULL REFERENCES dues_schedules(id),
  member_user_id   TEXT NOT NULL,
  amount_kobo      INTEGER NOT NULL CHECK (amount_kobo > 0),   -- P9
  period_label     TEXT NOT NULL,                              -- e.g. "2026-05" for monthly
  paystack_ref     TEXT,
  payment_channel  TEXT NOT NULL DEFAULT 'card' CHECK (payment_channel IN ('card','bank_transfer','ussd','mobile_money','manual')),
  status           TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending','confirmed','failed','refunded')),
  ndpr_consented   INTEGER NOT NULL DEFAULT 0 CHECK (ndpr_consented IN (0,1)), -- P10
  note             TEXT,
  created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
  confirmed_at     INTEGER
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_dues_payments_unique
  ON dues_payments (tenant_id, schedule_id, member_user_id, period_label)
  WHERE status = 'confirmed';

CREATE INDEX IF NOT EXISTS idx_dues_payments_schedule
  ON dues_payments (tenant_id, schedule_id);

CREATE INDEX IF NOT EXISTS idx_dues_payments_member
  ON dues_payments (tenant_id, member_user_id);
