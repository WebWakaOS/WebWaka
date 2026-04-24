-- Migration 0379: NDPR Erasure Receipts table
-- COMP-002/003 fix: Adds erasure_receipts table to satisfy NDPR Article 3.1(9)
-- right-to-erasure compliance requirement.
--
-- Purpose: Stores an immutable audit receipt for every user data erasure operation.
-- Unlike audit_logs (which are cleared of PII on erasure), erasure_receipts retains
-- the receipt ID, tenant, timestamp, and anon_ref (opaque) so compliance officers
-- can prove erasure completion without holding re-identifiable data.
--
-- G23: This table is append-only. No UPDATE or DELETE is permitted (enforced at
-- application layer). The anon_ref column stores the anonymisation key used to
-- overwrite user PII — it is not reversible.
--
-- Rollback: 0379_erasure_receipts.rollback.sql (DROP TABLE IF EXISTS erasure_receipts)

CREATE TABLE IF NOT EXISTS erasure_receipts (
  id           TEXT    NOT NULL PRIMARY KEY,
  tenant_id    TEXT    NOT NULL,
  user_id_hash TEXT    NOT NULL,
  anon_ref     TEXT    NOT NULL,
  erased_at    INTEGER NOT NULL,
  method       TEXT    NOT NULL DEFAULT 'ndpr_self_request',
  created_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_erasure_receipts_tenant ON erasure_receipts (tenant_id, erased_at);
