-- Rollback: 0393_dsar_scheduler_interval
-- Restore dsar-export-processor run interval to 3600s.

INSERT INTO scheduled_jobs (name, run_interval_seconds, priority)
VALUES ('dsar-export-processor', 3600, 7)
ON CONFLICT(name) DO UPDATE SET
  run_interval_seconds = 3600;
