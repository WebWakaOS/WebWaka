-- Migration 0009 — Discovery events log
-- Lightweight audit trail for discovery activity: profile views, search hits, claim intents
-- Milestone 4 — Discovery Layer MVP

CREATE TABLE IF NOT EXISTS discovery_events (
  id            TEXT    NOT NULL PRIMARY KEY,
  event_type    TEXT    NOT NULL,  -- 'profile_view' | 'search_hit' | 'claim_intent'
  entity_type   TEXT,
  entity_id     TEXT,
  place_id      TEXT    REFERENCES places(id),
  query         TEXT,              -- search query string (for search_hit events)
  actor_id      TEXT,             -- authenticated user ID if known (nullable)
  ip_hash       TEXT,             -- hashed IP for rate-limiting (never raw IP)
  metadata      TEXT    NOT NULL DEFAULT '{}',  -- JSON
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_discovery_events_entity_id  ON discovery_events(entity_id);
CREATE INDEX IF NOT EXISTS idx_discovery_events_event_type ON discovery_events(event_type);
CREATE INDEX IF NOT EXISTS idx_discovery_events_place_id   ON discovery_events(place_id);
CREATE INDEX IF NOT EXISTS idx_discovery_events_created_at ON discovery_events(created_at);
