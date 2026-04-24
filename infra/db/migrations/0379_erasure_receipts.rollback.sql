-- Rollback for 0379_erasure_receipts.sql
-- Drops the erasure_receipts table and its indexes.
-- WARNING: This will permanently delete all erasure receipt records.
-- Only run in development/test environments.

DROP INDEX IF EXISTS idx_erasure_receipts_tenant;
DROP TABLE IF EXISTS erasure_receipts;
