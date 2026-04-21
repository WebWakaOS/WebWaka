-- Rollback: 0276_seed_phase3_email_templates
-- Removes platform-level notification templates seeded for Phase 3 auth and billing events.

DELETE FROM notification_template
WHERE id IN (
  'tpl_notif_auth_wsinvite_email_en_v1',
  'tpl_notif_auth_wsinvite_inapp_en_v1',
  'tpl_notif_auth_emailverify_email_en_v1',
  'tpl_notif_auth_emailverify_inapp_en_v1',
  'tpl_notif_billing_tplreceipt_email_en_v1',
  'tpl_notif_billing_tplreceipt_inapp_en_v1'
);
