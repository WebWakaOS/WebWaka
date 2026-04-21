-- Rollback: 0295_notif_airtime_pos_finance
DELETE FROM notification_rule WHERE id IN (
  'rule_airtime_completed_v1','rule_airtime_failed_v1',
  'rule_pos_sale_completed_v1','rule_pos_float_credited_v1',
  'rule_finance_transfer_completed_v1','rule_finance_transfer_failed_v1'
);
DELETE FROM notification_template WHERE id IN (
  'tpl_airtime_completed_sms_en_v1','tpl_airtime_completed_inapp_en_v1',
  'tpl_airtime_failed_sms_en_v1','tpl_airtime_failed_inapp_en_v1',
  'tpl_pos_sale_completed_inapp_en_v1',
  'tpl_pos_float_credited_inapp_en_v1',
  'tpl_finance_transfer_completed_sms_en_v1','tpl_finance_transfer_completed_inapp_en_v1',
  'tpl_finance_transfer_failed_sms_en_v1','tpl_finance_transfer_failed_inapp_en_v1'
);
