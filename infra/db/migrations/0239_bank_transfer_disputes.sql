-- Migration: 0239_bank_transfer_disputes
-- Description: Bank transfer dispute table for P21-H fraud controls.
-- Disputes can be raised by buyers within 24h of confirmation (dispute window).
-- Platform admins review disputes and can reverse confirmed status.
-- T3: tenant-scoped. P9: disputed_amount_kobo is integer.

CREATE TABLE IF NOT EXISTS bank_transfer_disputes (
  id              TEXT NOT NULL PRIMARY KEY,
  transfer_order_id TEXT NOT NULL,
  workspace_id    TEXT NOT NULL,
  tenant_id       TEXT NOT NULL,
  raised_by       TEXT NOT NULL,              -- userId of the disputant (buyer or admin)
  reason          TEXT NOT NULL,
  disputed_amount_kobo INTEGER,               -- NULL = full amount disputed
  status          TEXT NOT NULL DEFAULT 'open'
                  CHECK (status IN ('open', 'under_review', 'resolved', 'escalated')),
  resolved_by     TEXT,
  resolution      TEXT,                       -- 'refunded' | 'upheld' | 'partial_refund'
  resolved_at     INTEGER,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_bank_disputes_order
  ON bank_transfer_disputes(transfer_order_id);

CREATE INDEX IF NOT EXISTS idx_bank_disputes_tenant
  ON bank_transfer_disputes(tenant_id, status, created_at);
