
-- WebWaka OS QA Seed — Phase 6: Notifications
-- Source: WebWaka_OS_QA_Execution_Plan.md v1.0 §3.1 Phase 6
-- Frozen baseline: WebWaka_OS_Corrected_Master_Inventory_v2.0-FROZEN
--
-- SCHEMA FIX 2026-04-23: Aligned with actual migration schemas:
--   notification_inbox_item (0259): id (req), tenant_id, user_id, title, body,
--     is_read (0/1), severity (DEFAULT 'info'), created_at
--     NOTE: table is notification_inbox_item (singular, not notification_inbox)
--     NOTE: no 'type', 'state', 'pinned', 'snoozed_until' columns
--     state mapped: 'unread' → is_read=0, 'read' → is_read=1
--   notification_preference (0256): per-channel rows, not per-user multi-column
--     columns: id, scope_type, scope_id, tenant_id, event_key, channel, enabled
--     NOTE: table is notification_preference (singular, not notification_preferences)
--   notification_template (0257): id, tenant_id, template_family (not type),
--     channel, locale, version, status, body_template, variables_schema (req), created_by
--     NOTE: table is notification_template (singular, not notification_templates)
--
-- G23: NTF-002 is the NDPR hard-delete target (TC-N006).
--      Must be re-seeded after TC-N006 runs (see reset/reset-after-destructive.sql).
-- G24: NOTIFICATION_SANDBOX_MODE=true must be confirmed in staging env.
-- T3: All notification rows scoped to tenant_id.

-- ─────────────────────────────────────────────────────────────────
-- Notification Inbox Items
-- ─────────────────────────────────────────────────────────────────

-- NTF-001: unread — USR-002, state transition test (TC-N001)
INSERT OR IGNORE INTO notification_inbox_item (
  id, user_id, tenant_id,
  title, body,
  is_read, severity,
  created_at
) VALUES (
  '90000000-0000-4000-b001-000000000001',
  '00000000-0000-4000-a000-000000000002',
  '10000000-0000-4000-b000-000000000001',
  'Payment Received',
  'Your bank transfer of ₦5,000 has been confirmed.',
  0, 'info',
  strftime('%s','now')
);

-- NTF-002: unread — NDPR hard-delete target (TC-N006)
-- WARNING: After TC-N006 this row is hard-deleted (G23).
--          Re-seed via reset/reset-after-destructive.sql before next NDPR run.
INSERT OR IGNORE INTO notification_inbox_item (
  id, user_id, tenant_id,
  title, body,
  is_read, severity,
  created_at
) VALUES (
  '90000000-0000-4000-b001-000000000002',
  '00000000-0000-4000-a000-000000000002',
  '10000000-0000-4000-b000-000000000001',
  'Welcome to WebWaka',
  'Your account is set up and ready to use.',
  0, 'info',
  strftime('%s','now')
);

-- NTF-003: read (is_read=1) — dismiss-from-read test (TC-N004)
INSERT OR IGNORE INTO notification_inbox_item (
  id, user_id, tenant_id,
  title, body,
  is_read, severity,
  created_at
) VALUES (
  '90000000-0000-4000-b001-000000000003',
  '00000000-0000-4000-a000-000000000002',
  '10000000-0000-4000-b000-000000000001',
  'You have a workspace invite',
  'You have been invited to join Tenant B Workspace.',
  1, 'info',
  strftime('%s','now')
);

-- ─────────────────────────────────────────────────────────────────
-- Notification Preferences — per channel, per user (TC-N008, TC-N009)
-- Table: notification_preference (singular), one row per channel
-- scope_type='user', scope_id=user_id
-- ─────────────────────────────────────────────────────────────────

-- PREF-001a: USR-002 email enabled
INSERT OR IGNORE INTO notification_preference (
  id, scope_type, scope_id, tenant_id,
  event_key, channel, enabled,
  created_at, updated_at
) VALUES (
  '90000000-0000-4000-b001-000000000011',
  'user', '00000000-0000-4000-a000-000000000002',
  '10000000-0000-4000-b000-000000000001',
  '*', 'email', 1,
  strftime('%s','now'), strftime('%s','now')
);

-- PREF-001b: USR-002 sms enabled
INSERT OR IGNORE INTO notification_preference (
  id, scope_type, scope_id, tenant_id,
  event_key, channel, enabled,
  created_at, updated_at
) VALUES (
  '90000000-0000-4000-b001-000000000012',
  'user', '00000000-0000-4000-a000-000000000002',
  '10000000-0000-4000-b000-000000000001',
  '*', 'sms', 1,
  strftime('%s','now'), strftime('%s','now')
);

-- PREF-001c: USR-002 in_app enabled
INSERT OR IGNORE INTO notification_preference (
  id, scope_type, scope_id, tenant_id,
  event_key, channel, enabled,
  created_at, updated_at
) VALUES (
  '90000000-0000-4000-b001-000000000013',
  'user', '00000000-0000-4000-a000-000000000002',
  '10000000-0000-4000-b000-000000000001',
  '*', 'in_app', 1,
  strftime('%s','now'), strftime('%s','now')
);

-- PREF-001d: USR-002 push disabled (tests push-off path TC-N009)
INSERT OR IGNORE INTO notification_preference (
  id, scope_type, scope_id, tenant_id,
  event_key, channel, enabled,
  created_at, updated_at
) VALUES (
  '90000000-0000-4000-b001-000000000014',
  'user', '00000000-0000-4000-a000-000000000002',
  '10000000-0000-4000-b000-000000000001',
  '*', 'push', 0,
  strftime('%s','now'), strftime('%s','now')
);

-- ─────────────────────────────────────────────────────────────────
-- Notification Template (TC-N013, TC-N007)
-- Table: notification_template (singular, not notification_templates)
-- template_family replaces 'type'; variables_schema (JSON) is required
-- ─────────────────────────────────────────────────────────────────

-- TMPL-001: Payment Confirmation — platform template (tenant_id=NULL = platform default)
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family,
  channel, locale, version, status,
  subject_template, body_template,
  variables_schema, created_by,
  created_at, updated_at
) VALUES (
  '90000000-0000-4000-b001-000000000021',
  NULL,
  'payment.received',
  'email', 'en', 1, 'active',
  'Your payment has been confirmed',
  'Hello {{user_name}}, your payment of ₦{{amount_naira}} has been confirmed.',
  '{"user_name":"string","amount_naira":"string"}',
  '00000000-0000-4000-a000-000000000001',
  strftime('%s','now'), strftime('%s','now')
);

