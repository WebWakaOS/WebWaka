-- Rollback: 0296_notif_social_community_transport
DELETE FROM notification_rule WHERE id IN (
  'rule_community_member_joined_v1','rule_transport_confirmed_v1',
  'rule_transport_completed_v1','rule_transport_cancelled_v1'
);
DELETE FROM notification_template WHERE id IN (
  'tpl_community_member_joined_inapp_en_v1',
  'tpl_transport_confirmed_email_en_v1','tpl_transport_confirmed_sms_en_v1',
  'tpl_transport_confirmed_inapp_en_v1',
  'tpl_transport_completed_sms_en_v1','tpl_transport_completed_inapp_en_v1',
  'tpl_transport_cancelled_email_en_v1','tpl_transport_cancelled_sms_en_v1',
  'tpl_transport_cancelled_inapp_en_v1'
);
