-- Migration 0452: Data Retention Automation — Phase 5 (E30)
-- M15 gate: data retention scheduler running and verifiably pseudonymizing expired data
--
-- 1. Creates data_retention_log table to record each scheduler run
-- 2. Registers 'pii-data-retention' job in scheduled_jobs
--
-- Platform Invariants:
--   G23 — audit_logs are NEVER pseudonymized by this scheduler (append-only invariant)
--   P13 — log entries record only row counts and table names, never raw PII
--   T3  — DataRetentionService binds tenant_id on all update queries
--   AC-FUNC-03 — rollback in rollback/0452_rollback.sql

-- ── 1. Data Retention Log Table ──────────────────────────────────────────────
-- Records each execution of the pii-data-retention scheduler job.
-- Enables audit trail of all pseudonymization runs for regulatory review.

CREATE TABLE IF NOT EXISTS data_retention_log (
  id                   TEXT    NOT NULL PRIMARY KEY,
  job_run_at           INTEGER NOT NULL,
  tables_processed     TEXT    NOT NULL DEFAULT '[]', -- JSON array of table names
  rows_pseudonymized   INTEGER NOT NULL DEFAULT 0,
  error_count          INTEGER NOT NULL DEFAULT 0,
  created_at           INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_data_retention_log_run_at
  ON data_retention_log(job_run_at DESC);

-- ── 2. Register pii-data-retention scheduled job ─────────────────────────────
-- Runs every 24 hours (86400 seconds). Priority 9 — runs before wallet reconciliation.
-- Enabled by default. next_run_at=0 triggers on first scheduler tick.

INSERT OR IGNORE INTO scheduled_jobs
  (name, run_interval_seconds, priority, enabled, next_run_at)
VALUES
  ('pii-data-retention', 86400, 9, 1, 0);
