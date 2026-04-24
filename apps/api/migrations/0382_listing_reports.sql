-- Migration 0382: listing_reports table (BUG-055 — "Report this listing" UX)
-- Stores user-submitted abuse / inaccuracy reports for public discovery listings.
-- T3: tenant_id scoped. G23: append-only (no DELETE, no UPDATE).
-- Rollback: DROP TABLE IF EXISTS listing_reports;

CREATE TABLE IF NOT EXISTS listing_reports (
  id            TEXT    NOT NULL PRIMARY KEY,
  entity_id     TEXT    NOT NULL,
  tenant_id     TEXT    NOT NULL,
  reporter_ip   TEXT,
  reason        TEXT    NOT NULL CHECK (reason IN ('inaccurate','spam','offensive','duplicate','other')),
  details       TEXT,
  status        TEXT    NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewed','dismissed')),
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_listing_reports_entity ON listing_reports(entity_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_listing_reports_status ON listing_reports(status, created_at);
