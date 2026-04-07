-- Migration 0008 — Search index tables
-- Full-text search index for discoverable entities
-- Used by GET /discovery/search
-- Milestone 4 — Discovery Layer MVP

CREATE TABLE IF NOT EXISTS search_entries (
  id            TEXT    NOT NULL PRIMARY KEY,
  entity_type   TEXT    NOT NULL,   -- 'individual' | 'organization' | 'place' | 'offering'
  entity_id     TEXT    NOT NULL,
  tenant_id     TEXT    NOT NULL,
  display_name  TEXT    NOT NULL,
  keywords      TEXT    NOT NULL,   -- space-separated normalised terms
  place_id      TEXT    REFERENCES places(id),
  ancestry_path TEXT    NOT NULL DEFAULT '[]',  -- JSON array of place IDs
  visibility    TEXT    NOT NULL DEFAULT 'public', -- 'public' | 'private' | 'unlisted'
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_search_entries_entity_type ON search_entries(entity_type);
CREATE INDEX IF NOT EXISTS idx_search_entries_place_id    ON search_entries(place_id);
CREATE INDEX IF NOT EXISTS idx_search_entries_tenant_id   ON search_entries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_search_entries_visibility  ON search_entries(visibility);

-- SQLite FTS5 virtual table for keyword search
CREATE VIRTUAL TABLE IF NOT EXISTS search_fts USING fts5(
  entity_id UNINDEXED,
  display_name,
  keywords,
  content='search_entries',
  content_rowid='rowid'
);
