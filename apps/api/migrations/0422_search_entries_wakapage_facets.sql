-- Migration: 0422_search_entries_wakapage_facets
-- Phase 1 — Extend search_entries with WakaPage facet columns.
--
-- These columns support WakaPage-specific discovery faceting (Phase 2 integration)
-- without requiring a schema backtrack later. Added as nullable columns so
-- all existing rows remain valid.
--
-- wakapage_page_id: links a search entry to the published WakaPage for this entity.
--   Null if the entity has no published WakaPage.
-- wakapage_slug:    the public-facing slug for direct URL construction.
--   Null if the entity has no published WakaPage.
-- wakapage_published_at: unix timestamp of the most recent publish.
--   Null if never published.
--
-- Platform Invariants:
--   T3 — existing tenant_id on search_entries covers T3; new columns nullable
--   G23 — additive only (ALTER TABLE ADD COLUMN)
--
-- Dependencies: search_entries (0008), wakapage_pages (0419)

ALTER TABLE search_entries ADD COLUMN wakapage_page_id      TEXT;
ALTER TABLE search_entries ADD COLUMN wakapage_slug         TEXT;
ALTER TABLE search_entries ADD COLUMN wakapage_published_at INTEGER;

CREATE INDEX IF NOT EXISTS idx_search_entries_wakapage_page_id
  ON search_entries(wakapage_page_id)
  WHERE wakapage_page_id IS NOT NULL;
