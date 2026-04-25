-- Migration: 0391_ai_agent_tables
-- Description: Five generic AI-agent tables used by the SA-5.x write-capable built-in tools.
--   ai_schedule_slots  — slot inventory read/marked-reserved by create-booking
--   ai_bookings        — booking rows created by create-booking
--   ai_agent_invoices  — draft invoice rows created by create-invoice
--   ai_agent_outbox    — queued business notifications created by send-notification
-- All tables are tenant-scoped (T3). Monetary values are integer kobo (P9).
-- No raw PII stored beyond entity ID references (P13).
-- Governance: G23 — additive only.

-- ai_schedule_slots: workspace-managed appointment slot inventory.
-- Created by workspace admins (or a future admin API). The create-booking AI tool
-- reads this table to validate slot ownership and marks matched slots 'reserved'.
CREATE TABLE IF NOT EXISTS ai_schedule_slots (
  id            TEXT    NOT NULL PRIMARY KEY,
  tenant_id     TEXT    NOT NULL,
  workspace_id  TEXT    NOT NULL,
  schedule_id   TEXT    NOT NULL,              -- logical schedule group (e.g. "Dr-Ade-Mon")
  service_name  TEXT,                          -- what the slot is for
  slot_time     INTEGER NOT NULL,              -- unix timestamp of the slot
  duration_mins INTEGER NOT NULL DEFAULT 60,   -- slot duration in minutes
  status        TEXT    NOT NULL DEFAULT 'available'
                CHECK (status IN ('available', 'reserved', 'booked', 'cancelled')),
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_ai_slots_schedule
  ON ai_schedule_slots(tenant_id, schedule_id, status);

CREATE INDEX IF NOT EXISTS idx_ai_slots_time
  ON ai_schedule_slots(tenant_id, slot_time) WHERE status = 'available';

-- ai_bookings: booking rows written by the create-booking AI tool.
-- Each booking is linked to one ai_schedule_slots row (one-to-one).
-- In a D1 batch: insert booking + UPDATE slot status='reserved'.
CREATE TABLE IF NOT EXISTS ai_bookings (
  id            TEXT    NOT NULL PRIMARY KEY,
  tenant_id     TEXT    NOT NULL,
  workspace_id  TEXT    NOT NULL,
  schedule_id   TEXT    NOT NULL,
  slot_id       TEXT    NOT NULL,             -- FK to ai_schedule_slots.id
  contact_id    TEXT    NOT NULL,             -- entity ID of the customer (T3 validated)
  notes         TEXT,                         -- PII-stripped optional notes (≤ 500 chars)
  status        TEXT    NOT NULL DEFAULT 'reserved'
                CHECK (status IN ('reserved', 'confirmed', 'cancelled')),
  created_by    TEXT    NOT NULL,             -- user_id who triggered the AI action
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_ai_bookings_tenant_slot
  ON ai_bookings(tenant_id, slot_id);

CREATE INDEX IF NOT EXISTS idx_ai_bookings_contact
  ON ai_bookings(tenant_id, contact_id);

-- ai_agent_invoices: draft invoice rows created by the create-invoice AI tool.
-- Uses integer kobo for all monetary values (P9).
CREATE TABLE IF NOT EXISTS ai_agent_invoices (
  id            TEXT    NOT NULL PRIMARY KEY,
  tenant_id     TEXT    NOT NULL,
  workspace_id  TEXT    NOT NULL,
  contact_id    TEXT,                          -- buyer/recipient entity ID
  line_items    TEXT    NOT NULL DEFAULT '[]', -- JSON: [{description, qty, unit_price_kobo, total_kobo}]
  total_kobo    INTEGER NOT NULL CHECK (total_kobo >= 0), -- P9: sum of all line totals
  due_date      TEXT,                          -- ISO-8601 date string (optional)
  status        TEXT    NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')),
  created_by    TEXT    NOT NULL,              -- user_id who triggered the AI action
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_ai_invoices_tenant_at
  ON ai_agent_invoices(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_invoices_contact
  ON ai_agent_invoices(tenant_id, contact_id);

-- ai_agent_outbox: outbound notification rows created by the send-notification AI tool.
-- CRON delivery worker drains this table (see Task #15).
-- Messages are PII-stripped before insertion (P13).
CREATE TABLE IF NOT EXISTS ai_agent_outbox (
  id            TEXT    NOT NULL PRIMARY KEY,
  tenant_id     TEXT    NOT NULL,
  workspace_id  TEXT    NOT NULL,
  contact_id    TEXT    NOT NULL,              -- recipient entity ID (no raw name/phone/email stored)
  channel       TEXT    NOT NULL CHECK (channel IN ('inapp', 'sms', 'email')),
  message       TEXT    NOT NULL,              -- PII-stripped message body (≤ 500 chars)
  sent_at       TEXT,                          -- ISO-8601 when delivered; NULL = pending
  status        TEXT    NOT NULL DEFAULT 'queued'
                CHECK (status IN ('queued', 'sent', 'failed')),
  retry_count   INTEGER NOT NULL DEFAULT 0,
  created_by    TEXT    NOT NULL,              -- user_id who triggered the AI action
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_ai_outbox_tenant_status
  ON ai_agent_outbox(tenant_id, status, created_at DESC);
