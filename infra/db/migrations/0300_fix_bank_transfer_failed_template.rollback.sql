-- Rollback: 0300_fix_bank_transfer_failed_template
DELETE FROM notification_template WHERE id IN (
  'tpl_banktransfer_failed_email_en_v1',
  'tpl_banktransfer_failed_sms_en_v1',
  'tpl_banktransfer_failed_inapp_en_v1'
);
-- Restore the removed duplicate rule
INSERT OR IGNORE INTO notification_rule (
  id, tenant_id, event_key, rule_name, enabled, audience_type,
  channels, channel_fallback, template_family, priority, digest_eligible, min_severity, feature_flag,
  created_at, updated_at
) VALUES (
  'rule_banktransfer_failed_v1', NULL, 'bank_transfer.failed',
  'Bank transfer failure alert', 1, 'actor',
  '["email","sms","in_app"]', '["sms","in_app"]', 'bank_transfer.receipt', 'high', 0, 'warning', NULL,
  unixepoch(), unixepoch()
);
-- Restore pre-existing rule to original channel set
UPDATE notification_rule
SET channels = '["email","sms"]', channel_fallback = NULL, min_severity = 'info', updated_at = unixepoch()
WHERE id = 'rule_bank_transfer_failed';
