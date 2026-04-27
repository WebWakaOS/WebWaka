-- Migration: 0394_search_entries_ward_code
-- Adds ward_code to search_entries — omitted from 0393 but required by
-- indexSupportGroup() in apps/api/src/lib/search-index.ts.
-- Ward-level geo-filtering allows discovery of support groups by ward.
-- Pre-launch: no backward-compat burden.

ALTER TABLE search_entries ADD COLUMN IF NOT EXISTS ward_code TEXT;

CREATE INDEX IF NOT EXISTS idx_search_entries_type_ward
  ON search_entries(entity_type, ward_code, visibility);
