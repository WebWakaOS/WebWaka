-- Migration: 0265_escalation_policies
-- Description: Create escalation_policy table — defines automatic escalation chains
--   when notifications fail or go unacknowledged.
--
--   Phase 6 (N-100a): EscalationEngine reads from this table.
--   Used by: AI HITL escalation (ai.hitl_escalated_to_l3), claim escalations,
--   and any critical notification that requires human acknowledgment.
--
-- G1  — tenant_id NOT NULL (NULL = platform-level policy)

CREATE TABLE IF NOT EXISTS escalation_policy (
  id                    TEXT PRIMARY KEY,     -- 'esc_policy_' + uuid
  tenant_id             TEXT,                 -- NULL = platform-wide policy
  name                  TEXT NOT NULL,
  trigger_event_key     TEXT NOT NULL,        -- notification_event.event_key that activates this
  escalation_steps      TEXT NOT NULL,        -- JSON: ordered array of escalation steps
  -- Each step in escalation_steps:
  -- {
  --   "step": 1,
  --   "delay_seconds": 300,
  --   "audience": "workspace_admins" | "tenant_admins" | "super_admins" | "custom",
  --   "channels": ["email", "sms"],
  --   "template_family": "ai.hitl_escalated_to_l3",
  --   "requires_ack": true
  -- }
  timeout_seconds       INTEGER NOT NULL DEFAULT 3600,  -- time before next step fires
  max_steps             INTEGER NOT NULL DEFAULT 3,
  enabled               INTEGER NOT NULL DEFAULT 1
    CHECK (enabled IN (0, 1)),
  created_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at            INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_esc_policy_trigger
  ON escalation_policy(trigger_event_key);

CREATE INDEX IF NOT EXISTS idx_esc_policy_tenant
  ON escalation_policy(tenant_id)
  WHERE tenant_id IS NOT NULL;
