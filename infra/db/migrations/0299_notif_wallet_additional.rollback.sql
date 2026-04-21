-- Rollback: 0299_notif_wallet_additional
DELETE FROM notification_rule WHERE id IN (
  'rule_wallet_funding_requested_v1','rule_wallet_funding_hitl_v1',
  'rule_wallet_funding_proof_v1'
);
DELETE FROM notification_template WHERE id IN (
  'tpl_wallet_funding_requested_email_en_v1','tpl_wallet_funding_requested_inapp_en_v1',
  'tpl_wallet_funding_hitl_email_en_v1','tpl_wallet_funding_hitl_inapp_en_v1',
  'tpl_wallet_funding_proof_inapp_en_v1'
);
