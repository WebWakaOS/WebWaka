-- Migration: 0393_dsar_scheduler_interval
-- Reduce dsar-export-processor run_interval_seconds from 3600 → 900 (15 minutes).
--
-- The cron trigger in schedulers/wrangler.toml already fires every */15 minutes,
-- but the scheduled_jobs table gated DSAR processing at 3600s (hourly) because
-- 0382_scheduled_jobs.sql seeded it with run_interval_seconds = 3600.
-- This migration aligns the table-level gate with the cron trigger cadence.

INSERT INTO scheduled_jobs (name, run_interval_seconds, priority)
VALUES ('dsar-export-processor', 900, 7)
ON CONFLICT(name) DO UPDATE SET
  run_interval_seconds = 900;
