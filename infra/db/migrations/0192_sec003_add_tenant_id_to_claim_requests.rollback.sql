-- Rollback 0192 — Remove tenant_id from claim_requests

DROP INDEX IF EXISTS idx_claim_requests_tenant;
ALTER TABLE claim_requests DROP COLUMN tenant_id;
