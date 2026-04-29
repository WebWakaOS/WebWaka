-- Rollback: 0422_search_entries_wakapage_facets
-- D1/SQLite: DROP COLUMN not supported for all schema versions.
-- The columns added here (wakapage_page_id, wakapage_slug, wakapage_published_at)
-- are nullable and harmless if left in place.
-- To fully remove them, recreate the search_entries table from 0008 schema.
-- This is a documented D1/SQLite limitation (precedent: 0418 rollback).

DROP INDEX IF EXISTS idx_search_entries_wakapage_page_id;

-- No-op remainder (D1/SQLite DROP COLUMN not supported in this context).
SELECT 1;
