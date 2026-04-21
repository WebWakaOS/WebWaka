-- Migration: 0300_fix_bank_transfer_failed_template
-- Description: Fix orphan rule 'rule_bank_transfer_failed' (seeded pre-0288) which
--   references template_family 'bank_transfer.failed' that was never created.
--   Also removes the duplicate rule 'rule_banktransfer_failed_v1' added in 0288
--   (which incorrectly pointed to bank_transfer.receipt for a failure event).
--
-- Resolution:
--   1. Seed bank_transfer.failed templates (email + SMS + in_app) with failure messaging
--   2. Remove the duplicate rule seeded in 0288 (bank_transfer.receipt is for success only)
--
-- After this migration:
--   bank_transfer.completed → bank_transfer.receipt  (success receipt)
--   bank_transfer.failed    → bank_transfer.failed   (failure alert — distinct messaging)

-- ──────────────────────────────────────────────────────────────────────────────
-- bank_transfer.failed — Email
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_banktransfer_failed_email_en_v1', NULL, 'bank_transfer.failed',
  'email', 'en', 1, 'active', 'not_required',
  'Transfer failed — {{amount_formatted}} to {{recipient_name}}',
  '<h1>Transfer Failed</h1>
<p>Hi {{user_name}},</p>
<p>Your transfer of <strong>{{amount_formatted}}</strong> to <strong>{{recipient_name}}</strong> ({{recipient_bank}}) could not be completed.</p>
<p><strong>Reference:</strong> {{transfer_ref}}<br>
<strong>Reason:</strong> {{failure_reason}}</p>
<p>Your funds have been returned to your account. If the issue persists, please contact support.</p>',
  'Try Again', '{{support_url}}',
  '{"required":["user_name","amount_formatted","recipient_name","recipient_bank","transfer_ref","failure_reason"],"optional":["support_url","support_email"],"properties":{"user_name":{"type":"string","description":"Sender full name","maxLength":100},"amount_formatted":{"type":"string","description":"Formatted amount e.g. ₦5,000.00","maxLength":30},"recipient_name":{"type":"string","description":"Recipient name","maxLength":100},"recipient_bank":{"type":"string","description":"Recipient bank name","maxLength":100},"transfer_ref":{"type":"string","description":"Transfer reference","maxLength":100},"failure_reason":{"type":"string","description":"Human-readable failure reason","maxLength":200},"support_url":{"type":"url","description":"Support contact URL"},"support_email":{"type":"string","description":"Support email","maxLength":254}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- bank_transfer.failed — SMS
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, body_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_banktransfer_failed_sms_en_v1', NULL, 'bank_transfer.failed',
  'sms', 'en', 1, 'active', 'not_required',
  '{{tenant_name}}: Transfer of {{amount_formatted}} to {{recipient_name}} FAILED. Ref: {{transfer_ref}}. Funds returned. Contact support if needed.',
  '{"required":["amount_formatted","recipient_name","transfer_ref"],"optional":["support_phone"],"properties":{"amount_formatted":{"type":"string","description":"Formatted amount","maxLength":30},"recipient_name":{"type":"string","description":"Recipient name","maxLength":50},"transfer_ref":{"type":"string","description":"Transfer reference","maxLength":50},"support_phone":{"type":"string","description":"Support phone","maxLength":20}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- bank_transfer.failed — In-app
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_banktransfer_failed_inapp_en_v1', NULL, 'bank_transfer.failed',
  'in_app', 'en', 1, 'active', 'not_required',
  'Transfer failed — {{amount_formatted}}',
  'Your transfer of {{amount_formatted}} to {{recipient_name}} failed. Ref: {{transfer_ref}}. Funds have been returned.',
  '{"required":["amount_formatted","recipient_name","transfer_ref"],"optional":["failure_reason"],"properties":{"amount_formatted":{"type":"string","description":"Formatted amount","maxLength":30},"recipient_name":{"type":"string","description":"Recipient name","maxLength":100},"transfer_ref":{"type":"string","description":"Transfer reference","maxLength":100},"failure_reason":{"type":"string","description":"Brief failure reason","maxLength":100}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- Remove the duplicate rule added in 0288 that incorrectly routed
-- bank_transfer.failed → bank_transfer.receipt (success template).
-- The pre-existing rule 'rule_bank_transfer_failed' correctly routes
-- bank_transfer.failed → bank_transfer.failed (now satisfied above).
-- ──────────────────────────────────────────────────────────────────────────────
DELETE FROM notification_rule WHERE id = 'rule_banktransfer_failed_v1';

-- Update the pre-existing rule to add in_app channel (it only had email+sms)
UPDATE notification_rule
SET channels = '["email","sms","in_app"]',
    channel_fallback = '["sms","in_app"]',
    min_severity = 'warning',
    updated_at = unixepoch()
WHERE id = 'rule_bank_transfer_failed';
