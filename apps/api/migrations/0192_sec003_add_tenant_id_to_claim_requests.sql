-- Migration 0192 — SEC-003: Add tenant_id to claim_requests
-- Platform Invariant T3: Every tenant-scoped table must have tenant_id.
-- claim_requests was created in 0010 without tenant_id — a governance violation.

ALTER TABLE claim_requests ADD COLUMN tenant_id TEXT;

CREATE INDEX IF NOT EXISTS idx_claim_requests_tenant
  ON claim_requests(tenant_id);
