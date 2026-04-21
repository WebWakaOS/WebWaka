-- Rollback: 0291_notif_claims_negotiation
DELETE FROM notification_rule WHERE id IN (
  'rule_claim_submitted_v1','rule_claim_approved_v1','rule_claim_rejected_v1',
  'rule_claim_escalated_v1','rule_claim_advanced_v1',
  'rule_neg_offer_made_v1','rule_neg_accepted_v1','rule_neg_rejected_v1','rule_neg_expired_v1'
);
DELETE FROM notification_template WHERE id IN (
  'tpl_claim_submitted_email_en_v1','tpl_claim_submitted_inapp_en_v1',
  'tpl_claim_approved_email_en_v1','tpl_claim_approved_sms_en_v1','tpl_claim_approved_inapp_en_v1',
  'tpl_claim_rejected_email_en_v1','tpl_claim_rejected_sms_en_v1','tpl_claim_rejected_inapp_en_v1',
  'tpl_claim_escalated_email_en_v1','tpl_claim_escalated_inapp_en_v1',
  'tpl_claim_advanced_inapp_en_v1',
  'tpl_neg_offer_made_inapp_en_v1','tpl_neg_offer_made_sms_en_v1',
  'tpl_neg_accepted_email_en_v1','tpl_neg_accepted_inapp_en_v1',
  'tpl_neg_rejected_inapp_en_v1',
  'tpl_neg_expired_inapp_en_v1'
);
