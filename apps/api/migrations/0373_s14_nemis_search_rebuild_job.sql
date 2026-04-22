-- 0373_s14_nemis_search_rebuild_job.sql
-- Phase S14: Insert the 1 missing seed_search_rebuild_jobs tracking row
-- for the NEMIS schools FTS rebuild (deferred from 0307 apply due to D1 capacity).
-- The FTS was subsequently rebuilt by later migrations; this closes the tracking gap.

INSERT OR IGNORE INTO seed_search_rebuild_jobs (
  id,
  seed_run_id,
  batch_name,
  status,
  entity_type,
  entity_count,
  search_entries_count,
  started_at,
  completed_at,
  fts_rebuilt_at,
  notes,
  created_at,
  updated_at
) VALUES (
  'srj_s06_nemis_20260422',
  'seed_run_s06_nemis_schools_20260421',
  'fts_rebuild',
  'completed',
  'school',
  174268,
  167790,
  strftime('%s', '2026-04-22'),
  strftime('%s', '2026-04-22'),
  strftime('%s', '2026-04-22'),
  'NEMIS FTS rebuild deferred from 0307 apply (D1 at capacity). Completed retroactively on 2026-04-22 after D1 Pro upgrade.',
  strftime('%s', '2026-04-22'),
  strftime('%s', '2026-04-22')
);
