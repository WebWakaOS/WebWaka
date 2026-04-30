-- Migration 0439: Case notification templates and rules
-- Phase 1 — Lifecycle notifications for case management
--
-- Inserts platform-level notification templates for case lifecycle events.
-- These are tenant_id=NULL rows, meaning they are shared across all tenants
-- unless a tenant overrides them with their own tenant-scoped rows.

-- ────────────────────────────────────────────────────────────────
-- Case notification templates
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS case_notification_rules (
  id            TEXT    NOT NULL PRIMARY KEY,
  tenant_id     TEXT,                           -- NULL = platform-level default
  trigger_event TEXT    NOT NULL,
    -- case.opened | case.assigned | case.note_added | case.resolved | case.closed | case.sla_breach
  channel       TEXT    NOT NULL DEFAULT 'in_app',
    -- in_app | sms | whatsapp | email
  recipient     TEXT    NOT NULL DEFAULT 'assigned_agent',
    -- reporter | assigned_agent | workspace_admin | group_admin
  template_key  TEXT    NOT NULL,               -- references i18n key
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),

  CHECK (trigger_event IN (
    'case.opened','case.assigned','case.note_added',
    'case.resolved','case.closed','case.sla_breach'
  )),
  CHECK (channel IN ('in_app','sms','whatsapp','email')),
  CHECK (recipient IN ('reporter','assigned_agent','workspace_admin','group_admin')),
  CHECK (is_active IN (0,1))
);

CREATE INDEX IF NOT EXISTS idx_case_notif_rules_event    ON case_notification_rules (trigger_event);
CREATE INDEX IF NOT EXISTS idx_case_notif_rules_tenant   ON case_notification_rules (tenant_id);

-- ────────────────────────────────────────────────────────────────
-- Platform-level default notification rules
-- ────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO case_notification_rules (id, tenant_id, trigger_event, channel, recipient, template_key)
VALUES
  ('cnr_opened_agent',    NULL, 'case.opened',     'in_app', 'assigned_agent',  'notif_case_opened'),
  ('cnr_assigned_agent',  NULL, 'case.assigned',   'in_app', 'assigned_agent',  'notif_case_assigned'),
  ('cnr_resolved_report', NULL, 'case.resolved',   'in_app', 'reporter',        'notif_case_resolved'),
  ('cnr_note_agent',      NULL, 'case.note_added', 'in_app', 'assigned_agent',  'notif_case_note'),
  ('cnr_sla_admin',       NULL, 'case.sla_breach', 'in_app', 'workspace_admin', 'notif_case_sla_breach');

-- ────────────────────────────────────────────────────────────────
-- Rollback SQL
-- DELETE FROM case_notification_rules WHERE id IN ('cnr_opened_agent','cnr_assigned_agent','cnr_resolved_report','cnr_note_agent','cnr_sla_admin');
-- DROP INDEX IF EXISTS idx_case_notif_rules_tenant;
-- DROP INDEX IF EXISTS idx_case_notif_rules_event;
-- DROP TABLE IF EXISTS case_notification_rules;
-- ────────────────────────────────────────────────────────────────
