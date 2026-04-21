-- Rollback: 0290_notif_kyc_identity
DELETE FROM notification_rule WHERE id IN (
  'rule_kyc_submitted_v1','rule_kyc_approved_v1','rule_kyc_rejected_v1',
  'rule_kyc_resubmit_v1','rule_identity_verified_v1','rule_identity_verifail_v1'
);
DELETE FROM notification_template WHERE id IN (
  'tpl_kyc_submitted_inapp_en_v1',
  'tpl_kyc_approved_email_en_v1','tpl_kyc_approved_sms_en_v1','tpl_kyc_approved_inapp_en_v1',
  'tpl_kyc_rejected_email_en_v1','tpl_kyc_rejected_sms_en_v1','tpl_kyc_rejected_inapp_en_v1',
  'tpl_kyc_resubmit_email_en_v1','tpl_kyc_resubmit_inapp_en_v1',
  'tpl_identity_verified_inapp_en_v1',
  'tpl_identity_verifail_email_en_v1','tpl_identity_verifail_inapp_en_v1'
);
