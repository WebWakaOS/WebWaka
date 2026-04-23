-- WebWaka OS QA Seed — Phase 6: Notifications
-- Source: WebWaka_OS_QA_Execution_Plan.md v1.0 §3.1 Phase 6
-- Frozen baseline: WebWaka_OS_Corrected_Master_Inventory_v2.0-FROZEN
--
-- G23: NTF-002 is the NDPR hard-delete target (TC-N006).
--      Must be re-seeded after TC-N006 runs (see reset script).
-- G24: NOTIFICATION_SANDBOX_MODE=true must be confirmed in staging env
--      before any tests that trigger outbound notifications.
-- T3: All notification rows scoped to tenant_id.
--
-- Seed ID → UUID mapping:
--   NTF-001 = 90000000-0000-4000-b001-000000000001
--   NTF-002 = 90000000-0000-4000-b001-000000000002
--   NTF-003 = 90000000-0000-4000-b001-000000000003
--   PREF-001 = 90000000-0000-4000-b001-000000000011
--   TMPL-001 = 90000000-0000-4000-b001-000000000021

-- NTF-001: unread notification for USR-002 — state transition test (TC-N001)
INSERT OR IGNORE INTO notification_inbox (
  id, user_id, tenant_id, type, title, body,
  state, pinned, snoozed_until,
  created_at, updated_at
) VALUES (
  '90000000-0000-4000-b001-000000000001',
  '00000000-0000-4000-a000-000000000002',
  '10000000-0000-4000-b000-000000000001',
  'payment.received',
  'Payment Received',
  'Your bank transfer of ₦5,000 has been confirmed.',
  'unread',
  0,
  NULL,
  strftime('%s','now'),
  strftime('%s','now')
);

-- NTF-002: unread notification for USR-002 — NDPR hard-delete target (TC-N006)
-- WARNING: After TC-N006 runs this row is DELETED (hard delete, G23).
--          Re-seed using reset/reset-after-destructive.sql before next NDPR test run.
INSERT OR IGNORE INTO notification_inbox (
  id, user_id, tenant_id, type, title, body,
  state, pinned, snoozed_until,
  created_at, updated_at
) VALUES (
  '90000000-0000-4000-b001-000000000002',
  '00000000-0000-4000-a000-000000000002',
  '10000000-0000-4000-b000-000000000001',
  'system.announcement',
  'Welcome to WebWaka',
  'Your account is set up and ready to use.',
  'unread',
  0,
  NULL,
  strftime('%s','now'),
  strftime('%s','now')
);

-- NTF-003: pinned notification for USR-002 — dismiss-from-pinned test (TC-N004)
INSERT OR IGNORE INTO notification_inbox (
  id, user_id, tenant_id, type, title, body,
  state, pinned, snoozed_until,
  created_at, updated_at
) VALUES (
  '90000000-0000-4000-b001-000000000003',
  '00000000-0000-4000-a000-000000000002',
  '10000000-0000-4000-b000-000000000001',
  'workspace.invite',
  'You have a workspace invite',
  'You have been invited to join Tenant B Workspace.',
  'read',
  1,
  NULL,
  strftime('%s','now'),
  strftime('%s','now')
);

-- PREF-001: default notification preferences for USR-002 (TC-N008, TC-N009)
INSERT OR IGNORE INTO notification_preferences (
  id, user_id, tenant_id,
  channel_email, channel_sms, channel_push, channel_in_app,
  digest_type, digest_hour,
  created_at, updated_at
) VALUES (
  '90000000-0000-4000-b001-000000000011',
  '00000000-0000-4000-a000-000000000002',
  '10000000-0000-4000-b000-000000000001',
  1, 1, 0, 1,
  'daily',
  23,
  strftime('%s','now'),
  strftime('%s','now')
);

-- TMPL-001: active platform notification template (TC-N013, TC-N007)
-- Required for template preview and test-send from admin-dashboard
INSERT OR IGNORE INTO notification_templates (
  id, name, type, subject, body_template,
  channel, locale, status,
  created_at, updated_at
) VALUES (
  '90000000-0000-4000-b001-000000000021',
  'Payment Confirmation',
  'payment.received',
  'Your payment has been confirmed',
  'Hello {{user_name}}, your payment of ₦{{amount_naira}} has been confirmed.',
  'email',
  'en',
  'active',
  strftime('%s','now'),
  strftime('%s','now')
);
