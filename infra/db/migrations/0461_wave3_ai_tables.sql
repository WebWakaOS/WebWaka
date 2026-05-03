-- Wave 3: AI anomaly flags + payment logs tables
-- Migration: 0461_wave3_ai_tables

-- ai_anomaly_flags: stores tenant-level AI spend anomaly detections
CREATE TABLE IF NOT EXISTS ai_anomaly_flags (
  id            TEXT    NOT NULL PRIMARY KEY,
  tenant_id     TEXT    NOT NULL,
  flag_type     TEXT    NOT NULL DEFAULT 'spend_spike',
  spend_24h_wc  INTEGER NOT NULL DEFAULT 0,
  avg_spend_wc  INTEGER NOT NULL DEFAULT 0,
  multiplier    REAL    NOT NULL DEFAULT 0,
  resolved_at   TEXT,
  detected_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  day_date      TEXT    NOT NULL DEFAULT (date('now')),
  UNIQUE (tenant_id, flag_type, day_date)
);

CREATE INDEX IF NOT EXISTS idx_ai_anomaly_flags_tenant
  ON ai_anomaly_flags (tenant_id, detected_at DESC);

-- payment_logs: AI-logged payment records (non-financial, record-keeping only)
CREATE TABLE IF NOT EXISTS payment_logs (
  id             TEXT    NOT NULL PRIMARY KEY,
  tenant_id      TEXT    NOT NULL,
  workspace_id   TEXT    NOT NULL,
  user_id        TEXT    NOT NULL,
  amount_kobo    INTEGER NOT NULL CHECK (amount_kobo > 0),
  payment_method TEXT    NOT NULL,
  reference      TEXT,
  notes          TEXT,
  created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_payment_logs_workspace
  ON payment_logs (tenant_id, workspace_id, created_at DESC);

-- support_tickets: created via AI create_support_ticket tool
CREATE TABLE IF NOT EXISTS support_tickets (
  id           TEXT    NOT NULL PRIMARY KEY,
  tenant_id    TEXT    NOT NULL,
  workspace_id TEXT    NOT NULL,
  user_id      TEXT    NOT NULL,
  subject      TEXT    NOT NULL,
  description  TEXT    NOT NULL,
  priority     TEXT    NOT NULL DEFAULT 'medium',
  category     TEXT    NOT NULL DEFAULT 'other',
  status       TEXT    NOT NULL DEFAULT 'open',
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_tenant
  ON support_tickets (tenant_id, status, created_at DESC);
