-- Migration: 0391_ai_agent_tables
-- Description: Three generic AI-agent write tables used by the SA-5.x write-capable
--   built-in tools (create-booking, create-invoice, send-notification).
--   All tables are tenant-scoped (T3). Monetary values are integer kobo (P9).
--   No raw PII stored beyond contact_id references (P13).
-- Governance: G23 — additive only.

-- ai_agent_bookings: generic booking row created by the create-booking AI tool.
-- Intentionally vertical-agnostic — vertical-specific booking tables (salon_appointments,
-- travel_bookings, etc.) remain unchanged. This table stores AI-agent-initiated bookings
-- across ALL verticals that use function_call capability.
CREATE TABLE IF NOT EXISTS ai_agent_bookings (
  id            TEXT    NOT NULL PRIMARY KEY,
  tenant_id     TEXT    NOT NULL,
  workspace_id  TEXT    NOT NULL,
  contact_id    TEXT,                          -- recipient/customer entity ID (may be NULL)
  service_name  TEXT,                          -- human-readable service being booked
  slot_time     INTEGER,                       -- unix timestamp of the booked slot
  notes         TEXT,                          -- PII-stripped booking notes
  status        TEXT    NOT NULL DEFAULT 'reserved'
                CHECK (status IN ('reserved', 'confirmed', 'cancelled')),
  created_by    TEXT    NOT NULL,              -- user_id who triggered the AI action
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_ai_bookings_tenant_at
  ON ai_agent_bookings(tenant_id, created_at DESC);

-- ai_agent_invoices: draft invoice row created by the create-invoice AI tool.
-- Uses integer kobo for all monetary values (P9).
-- The CRON projections layer converts draft invoices to PDF via the billing service.
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

-- ai_agent_outbox: outbound notification row created by the send-notification AI tool.
-- Channels: inapp | sms | email.  The CRON delivery worker drains this table.
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
