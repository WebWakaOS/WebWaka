-- Migration: 0295_notif_airtime_pos_finance
-- Description: Notification templates + rules for airtime, POS, and finance events.
--
-- New template families:
--   airtime.purchase_completed, airtime.purchase_failed,
--   pos.sale_completed, pos.float_credited,
--   finance.transfer_completed, finance.transfer_failed

-- ──────────────────────────────────────────────────────────────────────────────
-- airtime.purchase_completed — SMS + In-app
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, body_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_airtime_completed_sms_en_v1', NULL, 'airtime.purchase_completed',
  'sms', 'en', 1, 'active', 'not_required',
  '{{tenant_name}}: Airtime of {{amount_formatted}} sent to {{phone_number}}. Ref: {{reference}}.',
  '{"required":["amount_formatted","phone_number","reference"],"optional":[],"properties":{"amount_formatted":{"type":"string","description":"Formatted airtime amount","maxLength":20},"phone_number":{"type":"string","description":"Recipient phone number (masked)","maxLength":20},"reference":{"type":"string","description":"Transaction reference","maxLength":50}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_airtime_completed_inapp_en_v1', NULL, 'airtime.purchase_completed',
  'in_app', 'en', 1, 'active', 'not_required',
  'Airtime sent — {{amount_formatted}}',
  '{{amount_formatted}} airtime sent to {{phone_number}}. Reference: {{reference}}.',
  '{"required":["amount_formatted","phone_number","reference"],"optional":[],"properties":{"amount_formatted":{"type":"string","description":"Airtime amount","maxLength":20},"phone_number":{"type":"string","description":"Recipient phone (masked)","maxLength":20},"reference":{"type":"string","description":"Transaction reference","maxLength":50}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- airtime.purchase_failed — SMS + In-app
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, body_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_airtime_failed_sms_en_v1', NULL, 'airtime.purchase_failed',
  'sms', 'en', 1, 'active', 'not_required',
  '{{tenant_name}}: Airtime purchase of {{amount_formatted}} to {{phone_number}} failed. Your account has not been charged.',
  '{"required":["amount_formatted","phone_number"],"optional":["reason"],"properties":{"amount_formatted":{"type":"string","description":"Airtime amount","maxLength":20},"phone_number":{"type":"string","description":"Recipient phone (masked)","maxLength":20},"reason":{"type":"string","description":"Failure reason","maxLength":100}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_airtime_failed_inapp_en_v1', NULL, 'airtime.purchase_failed',
  'in_app', 'en', 1, 'active', 'not_required',
  'Airtime purchase failed',
  'Airtime of {{amount_formatted}} to {{phone_number}} could not be processed. You have not been charged.',
  '{"required":["amount_formatted","phone_number"],"optional":["reason"],"properties":{"amount_formatted":{"type":"string","description":"Airtime amount","maxLength":20},"phone_number":{"type":"string","description":"Recipient phone (masked)","maxLength":20},"reason":{"type":"string","description":"Failure reason","maxLength":100}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- pos.sale_completed — In-app (operator receipt)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_pos_sale_completed_inapp_en_v1', NULL, 'pos.sale_completed',
  'in_app', 'en', 1, 'active', 'not_required',
  'Sale completed — {{amount_formatted}}',
  'Sale of {{amount_formatted}} completed. Reference: {{sale_ref}}. Items: {{item_count}}.',
  '{"required":["amount_formatted","sale_ref","item_count"],"optional":["payment_method"],"properties":{"amount_formatted":{"type":"string","description":"Sale total formatted","maxLength":30},"sale_ref":{"type":"string","description":"Sale reference","maxLength":50},"item_count":{"type":"number","description":"Number of items sold"},"payment_method":{"type":"string","description":"Payment method used","maxLength":50}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- pos.float_credited — In-app (operator alert: float topped up)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_pos_float_credited_inapp_en_v1', NULL, 'pos.float_credited',
  'in_app', 'en', 1, 'active', 'not_required',
  'POS float credited — {{amount_formatted}}',
  'Your POS float has been credited with {{amount_formatted}}. New float balance: {{new_balance}}.',
  '{"required":["amount_formatted","new_balance"],"optional":["reference"],"properties":{"amount_formatted":{"type":"string","description":"Amount credited","maxLength":30},"new_balance":{"type":"string","description":"New float balance","maxLength":30},"reference":{"type":"string","description":"Credit reference","maxLength":50}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- finance.transfer_completed — SMS + In-app
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, body_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_finance_transfer_completed_sms_en_v1', NULL, 'finance.transfer_completed',
  'sms', 'en', 1, 'active', 'not_required',
  '{{tenant_name}}: Transfer of {{amount_formatted}} to {{recipient_name}} completed. Ref: {{reference}}.',
  '{"required":["amount_formatted","recipient_name","reference"],"optional":[],"properties":{"amount_formatted":{"type":"string","description":"Transfer amount","maxLength":30},"recipient_name":{"type":"string","description":"Recipient name","maxLength":100},"reference":{"type":"string","description":"Transfer reference","maxLength":50}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_finance_transfer_completed_inapp_en_v1', NULL, 'finance.transfer_completed',
  'in_app', 'en', 1, 'active', 'not_required',
  'Transfer completed — {{amount_formatted}}',
  '{{amount_formatted}} transferred to {{recipient_name}}. Reference: {{reference}}.',
  '{"required":["amount_formatted","recipient_name","reference"],"optional":[],"properties":{"amount_formatted":{"type":"string","description":"Amount","maxLength":30},"recipient_name":{"type":"string","description":"Recipient name","maxLength":100},"reference":{"type":"string","description":"Reference","maxLength":50}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- finance.transfer_failed — SMS + In-app
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, body_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_finance_transfer_failed_sms_en_v1', NULL, 'finance.transfer_failed',
  'sms', 'en', 1, 'active', 'not_required',
  '{{tenant_name}}: Transfer of {{amount_formatted}} to {{recipient_name}} failed. Reason: {{reason}}. Your funds have been returned.',
  '{"required":["amount_formatted","recipient_name","reason"],"optional":[],"properties":{"amount_formatted":{"type":"string","description":"Amount","maxLength":30},"recipient_name":{"type":"string","description":"Recipient name","maxLength":100},"reason":{"type":"string","description":"Failure reason","maxLength":100}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_finance_transfer_failed_inapp_en_v1', NULL, 'finance.transfer_failed',
  'in_app', 'en', 1, 'active', 'not_required',
  'Transfer failed — {{amount_formatted}}',
  'Your transfer of {{amount_formatted}} to {{recipient_name}} failed. Funds have been returned to your account.',
  '{"required":["amount_formatted","recipient_name"],"optional":["reason"],"properties":{"amount_formatted":{"type":"string","description":"Amount","maxLength":30},"recipient_name":{"type":"string","description":"Recipient name","maxLength":100},"reason":{"type":"string","description":"Failure reason","maxLength":100}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- NOTIFICATION RULES
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_rule (
  id, tenant_id, event_key, rule_name, enabled, audience_type,
  channels, template_family, priority, digest_eligible, min_severity, feature_flag,
  created_at, updated_at
) VALUES
  ('rule_airtime_completed_v1', NULL, 'airtime.purchase_completed',
   'Airtime purchase confirmation', 1, 'actor',
   '["sms","in_app"]', 'airtime.purchase_completed', 'normal', 0, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_airtime_failed_v1', NULL, 'airtime.purchase_failed',
   'Airtime purchase failure', 1, 'actor',
   '["sms","in_app"]', 'airtime.purchase_failed', 'high', 0, 'warning', NULL,
   unixepoch(), unixepoch()),

  ('rule_pos_sale_completed_v1', NULL, 'pos.sale_completed',
   'POS sale completed receipt', 1, 'actor',
   '["in_app"]', 'pos.sale_completed', 'low', 1, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_pos_float_credited_v1', NULL, 'pos.float_credited',
   'POS float credited alert', 1, 'workspace_admins',
   '["in_app"]', 'pos.float_credited', 'normal', 0, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_finance_transfer_completed_v1', NULL, 'finance.transfer_completed',
   'Finance transfer completed', 1, 'actor',
   '["sms","in_app"]', 'finance.transfer_completed', 'normal', 0, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_finance_transfer_failed_v1', NULL, 'finance.transfer_failed',
   'Finance transfer failed', 1, 'actor',
   '["sms","in_app"]', 'finance.transfer_failed', 'high', 0, 'warning', NULL,
   unixepoch(), unixepoch());
