-- Migration 0225a: Create transactions table (platform financial ledger)
-- Required by 0226 (currency_code) and 0245 (dual-currency fields).
-- The transactions table is the platform-level general-purpose ledger used for
-- tracking tenant payment events across all verticals.
--
-- Platform Invariants:
--   P9  — amounts stored as INTEGER kobo (no floats)
--   T3  — tenant_id NOT NULL on all rows
--   T2  — workspace_id scoped

CREATE TABLE IF NOT EXISTS transactions (
  id           TEXT    NOT NULL PRIMARY KEY,
  tenant_id    TEXT    NOT NULL,
  workspace_id TEXT    NOT NULL,
  amount_kobo  INTEGER NOT NULL DEFAULT 0 CHECK (amount_kobo >= 0),
  tx_type      TEXT    NOT NULL DEFAULT 'payment',
  status       TEXT    NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','success','failed','refunded','reversed')),
  reference    TEXT,
  paystack_ref TEXT,
  metadata     TEXT    NOT NULL DEFAULT '{}',
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_transactions_tenant
  ON transactions(tenant_id);

CREATE INDEX IF NOT EXISTS idx_transactions_workspace
  ON transactions(workspace_id, tenant_id);

CREATE INDEX IF NOT EXISTS idx_transactions_status
  ON transactions(status, created_at DESC);
