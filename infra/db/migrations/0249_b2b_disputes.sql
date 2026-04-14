-- Migration: 0249_b2b_disputes
-- Description: B2B marketplace dispute table for P25-F.
-- Disputes can be raised against purchase orders or bank transfer payments.
-- Platform admins resolve disputes; unresolved disputes auto-escalate after 72h.
-- T3: tenant-scoped.

CREATE TABLE IF NOT EXISTS b2b_disputes (
  id                TEXT NOT NULL PRIMARY KEY,
  purchase_order_id TEXT,
  invoice_id        TEXT,
  tenant_id         TEXT NOT NULL,
  raised_by_entity  TEXT NOT NULL,
  against_entity    TEXT NOT NULL,
  reason            TEXT NOT NULL,
  evidence_urls     TEXT NOT NULL DEFAULT '[]', -- JSON array of R2 URLs
  status            TEXT NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open', 'under_review', 'resolved', 'escalated')),
  admin_note        TEXT,
  resolved_by       TEXT,
  resolution        TEXT
                    CHECK (resolution IS NULL OR resolution IN (
                      'buyer_wins', 'seller_wins', 'partial_refund', 'dismissed'
                    )),
  resolved_at       INTEGER,
  escalated_at      INTEGER,
  created_at        INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_b2b_disputes_tenant
  ON b2b_disputes(tenant_id, status, created_at);

CREATE INDEX IF NOT EXISTS idx_b2b_disputes_open
  ON b2b_disputes(status, created_at) WHERE status IN ('open', 'under_review');
