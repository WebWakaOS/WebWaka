-- Migration: 0393_support_groups_fundraising_search
-- Extends search_entries for support groups and fundraising campaigns.
-- The D1-backed search runtime in apps/api/src/lib/search-index.ts
-- uses the search_entries table. No new tables are required — the
-- existing search_entries table accepts any entityType string.
--
-- This migration adds FTS index hints and a discovery_score column
-- used for weighted ranking of public groups and campaigns.

ALTER TABLE search_entries ADD COLUMN discovery_score INTEGER NOT NULL DEFAULT 0;
ALTER TABLE search_entries ADD COLUMN state_code TEXT;
ALTER TABLE search_entries ADD COLUMN lga_code TEXT;
ALTER TABLE search_entries ADD COLUMN campaign_type TEXT;
ALTER TABLE search_entries ADD COLUMN group_type TEXT;

CREATE INDEX IF NOT EXISTS idx_search_entries_type_state
  ON search_entries(entity_type, state_code, visibility);

CREATE INDEX IF NOT EXISTS idx_search_entries_type_lga
  ON search_entries(entity_type, lga_code, visibility);

CREATE INDEX IF NOT EXISTS idx_search_entries_campaign_type
  ON search_entries(campaign_type, visibility, tenant_id);

CREATE INDEX IF NOT EXISTS idx_search_entries_group_type
  ON search_entries(group_type, visibility, tenant_id);

CREATE INDEX IF NOT EXISTS idx_search_entries_discovery_score
  ON search_entries(entity_type, discovery_score DESC, visibility);
