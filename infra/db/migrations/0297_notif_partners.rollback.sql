-- Rollback: 0297_notif_partners
DELETE FROM notification_rule WHERE id IN (
  'rule_partner_app_approved_v1','rule_partner_app_rejected_v1',
  'rule_partner_commission_v1','rule_partner_subpartner_v1'
);
DELETE FROM notification_template WHERE id IN (
  'tpl_partner_app_approved_email_en_v1','tpl_partner_app_approved_inapp_en_v1',
  'tpl_partner_app_rejected_email_en_v1','tpl_partner_app_rejected_inapp_en_v1',
  'tpl_partner_commission_email_en_v1','tpl_partner_commission_inapp_en_v1',
  'tpl_partner_subpartner_inapp_en_v1'
);
