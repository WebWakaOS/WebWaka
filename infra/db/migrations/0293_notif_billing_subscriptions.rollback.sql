-- Rollback: 0293_notif_billing_subscriptions
DELETE FROM notification_rule WHERE id IN (
  'rule_billing_sub_created_v1','rule_billing_sub_renewed_v1','rule_billing_sub_cancelled_v1',
  'rule_billing_trial_ending_v1','rule_billing_trial_expired_v1','rule_billing_refund_v1'
);
DELETE FROM notification_template WHERE id IN (
  'tpl_billing_sub_created_email_en_v1','tpl_billing_sub_created_inapp_en_v1',
  'tpl_billing_sub_renewed_email_en_v1','tpl_billing_sub_renewed_inapp_en_v1',
  'tpl_billing_sub_cancelled_email_en_v1','tpl_billing_sub_cancelled_inapp_en_v1',
  'tpl_billing_trial_ending_email_en_v1','tpl_billing_trial_ending_inapp_en_v1',
  'tpl_billing_trial_expired_email_en_v1','tpl_billing_trial_expired_inapp_en_v1',
  'tpl_billing_refund_email_en_v1','tpl_billing_refund_inapp_en_v1'
);
