-- Migration 0448 — WhatsApp Business API Template Management
-- Phase 3 (E24): Registry for WhatsApp broadcast templates.
-- Manages template submission, Meta approval status, and in-app fallback on rejection.
--
-- Platform Invariants:
--   T3  — tenant_id on all records
--   AC-FUNC-03 — rollback in infra/db/migrations/rollback/0448_rollback.sql

CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id                  TEXT    NOT NULL PRIMARY KEY,
  tenant_id           TEXT    NOT NULL,
  event_type          TEXT    NOT NULL,
  template_name       TEXT    NOT NULL,
  template_status     TEXT    NOT NULL DEFAULT 'pending'
                              CHECK (template_status IN ('pending', 'submitted', 'approved', 'rejected', 'deprecated')),
  template_body       TEXT    NOT NULL,                     -- WhatsApp template body with {{1}} placeholders
  language_code       TEXT    NOT NULL DEFAULT 'en_NG',
  is_platform_default INTEGER NOT NULL DEFAULT 0,           -- 1 = platform-seeded template (top 5 event types)
  submitted_at        INTEGER,
  approved_at         INTEGER,
  rejected_at         INTEGER,
  rejection_reason    TEXT,
  fallback_to_inapp   INTEGER NOT NULL DEFAULT 0,           -- 1 = fallback to in-app notification when template rejected
  created_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (tenant_id, event_type, template_name)
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_tenant
  ON whatsapp_templates (tenant_id, template_status);

CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_defaults
  ON whatsapp_templates (is_platform_default, template_status);

-- Seed platform defaults (top 5 event types, M13 gate: WhatsApp templates for top 5 event types)
-- tenant_id = '__platform__' identifies global defaults visible to all enrolled tenants.
-- These are copied to tenant rows on first use via POST /whatsapp-templates.
INSERT OR IGNORE INTO whatsapp_templates
  (id, tenant_id, event_type, template_name, template_status, template_body, language_code, is_platform_default)
VALUES
  (
    'wt_platform_001',
    '__platform__',
    'group.broadcast_sent',
    'webwaka_group_broadcast',
    'pending',
    '{{1}}: {{2}}',
    'en_NG',
    1
  ),
  (
    'wt_platform_002',
    '__platform__',
    'case.opened',
    'webwaka_case_opened',
    'pending',
    'New case {{1}} opened in {{2}}. Assigned to you for review.',
    'en_NG',
    1
  ),
  (
    'wt_platform_003',
    '__platform__',
    'mutual_aid.approved',
    'webwaka_mutual_aid_approved',
    'pending',
    'Mutual aid request {{1}} approved. Amount: {{2}}. Funds will be disbursed shortly.',
    'en_NG',
    1
  ),
  (
    'wt_platform_004',
    '__platform__',
    'dues.payment_recorded',
    'webwaka_dues_payment',
    'pending',
    'Dues payment {{1}} confirmed for {{2}}. Thank you for your contribution.',
    'en_NG',
    1
  ),
  (
    'wt_platform_005',
    '__platform__',
    'workflow.completed',
    'webwaka_workflow_completed',
    'pending',
    'Workflow {{1}} completed: {{2}}.',
    'en_NG',
    1
  );
