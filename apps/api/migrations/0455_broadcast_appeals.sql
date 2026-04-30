-- Migration 0455: Broadcast Moderation Appeals — Phase 5 (E32)
-- M15 gate: moderation appeal flow operational
--
-- Creates the broadcast_appeals table for the E32 moderation appeal flow:
--   - Members may appeal a moderation decision on their broadcast/post
--   - Appeals are reviewed by workspace admins (HITL level 1) or platform moderators (HITL level 2)
--   - Appeal review decisions (approve/reject) are recorded with reasons
--
-- Platform Invariants:
--   T3  — all queries bind tenant_id + workspace_id
--   G23 — appeal decisions are append-only; original decision is preserved in evidence_json
--   P13 — reviewer identity stored but not publicly exposed
--   AC-FUNC-03 — rollback in rollback/0455_rollback.sql

-- ── 1. Broadcast Appeals Table ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS broadcast_appeals (
  id              TEXT    NOT NULL PRIMARY KEY,
  tenant_id       TEXT    NOT NULL,
  workspace_id    TEXT    NOT NULL,
  broadcast_id    TEXT    NOT NULL,       -- FK → broadcasts(id) (soft, not enforced in D1)
  appellant_id    TEXT    NOT NULL,       -- user_id of the person appealing
  original_action TEXT    NOT NULL,       -- 'removed' | 'flagged' | 'withheld' | 'rejected'
  appeal_reason   TEXT    NOT NULL,       -- free-text from appellant
  status          TEXT    NOT NULL DEFAULT 'pending',
  -- 'pending' | 'approved' | 'rejected' | 'escalated' | 'withdrawn'
  reviewer_id     TEXT,                  -- user_id of admin/moderator who reviewed
  review_notes    TEXT,
  review_decision TEXT,                  -- 'reinstate' | 'uphold' | 'escalate'
  reviewed_at     INTEGER,               -- unix timestamp
  evidence_json   TEXT    NOT NULL DEFAULT '{}',
  -- stores original moderation event snapshot (mod_action, rule_key, flagged_content_hash)
  hitl_level      INTEGER,               -- 1=workspace admin, 2=platform moderator
  escalated_to    TEXT,                  -- reviewer_id of escalation target
  escalated_at    INTEGER,
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL,
  CHECK (status IN ('pending','approved','rejected','escalated','withdrawn')),
  CHECK (original_action IN ('removed','flagged','withheld','rejected')),
  CHECK (review_decision IN ('reinstate','uphold','escalate') OR review_decision IS NULL),
  CHECK (hitl_level IN (1, 2) OR hitl_level IS NULL)
);

CREATE INDEX IF NOT EXISTS idx_broadcast_appeals_tenant
  ON broadcast_appeals(tenant_id, workspace_id, status);

CREATE INDEX IF NOT EXISTS idx_broadcast_appeals_appellant
  ON broadcast_appeals(appellant_id, status);

CREATE INDEX IF NOT EXISTS idx_broadcast_appeals_broadcast
  ON broadcast_appeals(broadcast_id);

CREATE INDEX IF NOT EXISTS idx_broadcast_appeals_created
  ON broadcast_appeals(created_at DESC);
