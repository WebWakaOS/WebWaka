-- Wave 2: Inventory audit log table for stock adjustments
-- Tracks all stock changes (receive, return, write-off, sale) per product

CREATE TABLE IF NOT EXISTS inventory_audit_log (
  id           TEXT    PRIMARY KEY,
  tenant_id    TEXT    NOT NULL,
  workspace_id TEXT    NOT NULL,
  product_id   TEXT    NOT NULL,
  product_name TEXT    NOT NULL,
  change_type  TEXT    NOT NULL CHECK (change_type IN ('receive','return','writeoff','sale','adjustment')),
  qty_before   INTEGER NOT NULL DEFAULT 0,
  qty_change   INTEGER NOT NULL,
  qty_after    INTEGER NOT NULL DEFAULT 0,
  note         TEXT,
  actor_email  TEXT    NOT NULL DEFAULT 'system',
  created_at   INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inv_audit_workspace ON inventory_audit_log (tenant_id, workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inv_audit_product   ON inventory_audit_log (tenant_id, product_id, created_at DESC);
