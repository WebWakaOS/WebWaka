-- Migration: 0414_template_audit_log
-- Pillar 2 / Emergent Pillar-2 audit fix (2026-04-25).
--
-- Tracks every state transition on template_registry made via the new
-- /templates/:slug/approve, /reject, /deprecate API endpoints.
--
-- Previously approval/rejection happened via direct SQL with no audit trail;
-- this table closes that gap and is the foundation for moderation accountability
-- as the marketplace scales to dozens of niche templates.
--
-- Platform Invariants:
--   T2 — referenced from apps/api/src/routes/templates.ts (TypeScript strict)

CREATE TABLE IF NOT EXISTS template_audit_log (
  id           TEXT NOT NULL PRIMARY KEY,
  template_id  TEXT NOT NULL REFERENCES template_registry(id) ON DELETE CASCADE,
  from_status  TEXT NOT NULL,
  to_status    TEXT NOT NULL,
  changed_by   TEXT NOT NULL,
  reason       TEXT,
  changed_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_template_audit_template_id
  ON template_audit_log(template_id);

CREATE INDEX IF NOT EXISTS idx_template_audit_changed_at
  ON template_audit_log(changed_at);
