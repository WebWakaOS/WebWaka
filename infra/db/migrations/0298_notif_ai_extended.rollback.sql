-- Rollback: 0298_notif_ai_extended
DELETE FROM notification_rule WHERE id IN (
  'rule_ai_hitl_required_v1','rule_ai_budget_exhausted_v1','rule_ai_response_failed_v1'
);
DELETE FROM notification_template WHERE id IN (
  'tpl_ai_hitl_required_email_en_v1','tpl_ai_hitl_required_inapp_en_v1',
  'tpl_ai_budget_exhausted_email_en_v1','tpl_ai_budget_exhausted_inapp_en_v1',
  'tpl_ai_response_failed_inapp_en_v1'
);
