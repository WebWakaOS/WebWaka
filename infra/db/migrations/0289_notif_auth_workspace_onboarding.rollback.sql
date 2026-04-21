-- Rollback: 0289_notif_auth_workspace_onboarding
DELETE FROM notification_rule WHERE id IN (
  'rule_auth_email_verified_v1','rule_auth_pw_changed_v1','rule_ws_activated_v1',
  'rule_ws_suspended_v1','rule_ws_member_removed_v1','rule_ws_role_changed_v1',
  'rule_ws_plan_upgraded_v1','rule_ws_plan_downgraded_v1','rule_onboarding_stalled_v1'
);
DELETE FROM notification_template WHERE id IN (
  'tpl_auth_emailverified_inapp_en_v1',
  'tpl_auth_pwchanged_email_en_v1','tpl_auth_pwchanged_sms_en_v1',
  'tpl_ws_activated_email_en_v1','tpl_ws_activated_inapp_en_v1',
  'tpl_ws_suspended_email_en_v1','tpl_ws_suspended_inapp_en_v1',
  'tpl_ws_member_removed_inapp_en_v1',
  'tpl_ws_role_changed_inapp_en_v1',
  'tpl_ws_plan_upgraded_email_en_v1','tpl_ws_plan_upgraded_inapp_en_v1',
  'tpl_ws_plan_downgraded_email_en_v1','tpl_ws_plan_downgraded_inapp_en_v1',
  'tpl_onboarding_stalled_email_en_v1','tpl_onboarding_stalled_inapp_en_v1'
);
