-- Rollback: 0292_notif_support_tickets
DELETE FROM notification_rule WHERE id IN (
  'rule_support_created_v1','rule_support_assigned_v1','rule_support_replied_v1',
  'rule_support_resolved_v1','rule_support_closed_v1'
);
DELETE FROM notification_template WHERE id IN (
  'tpl_support_created_email_en_v1','tpl_support_created_inapp_en_v1',
  'tpl_support_assigned_inapp_en_v1',
  'tpl_support_replied_email_en_v1','tpl_support_replied_inapp_en_v1',
  'tpl_support_resolved_email_en_v1','tpl_support_resolved_inapp_en_v1',
  'tpl_support_closed_inapp_en_v1'
);
