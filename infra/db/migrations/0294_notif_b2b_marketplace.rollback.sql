-- Rollback: 0294_notif_b2b_marketplace
DELETE FROM notification_rule WHERE id IN (
  'rule_b2b_rfq_created_v1','rule_b2b_bid_submitted_v1','rule_b2b_bid_accepted_v1',
  'rule_b2b_po_issued_v1','rule_b2b_invoice_raised_v1','rule_b2b_dispute_raised_v1'
);
DELETE FROM notification_template WHERE id IN (
  'tpl_b2b_rfq_created_email_en_v1','tpl_b2b_rfq_created_inapp_en_v1',
  'tpl_b2b_bid_submitted_inapp_en_v1',
  'tpl_b2b_bid_accepted_email_en_v1','tpl_b2b_bid_accepted_inapp_en_v1',
  'tpl_b2b_po_issued_email_en_v1','tpl_b2b_po_issued_inapp_en_v1',
  'tpl_b2b_invoice_raised_email_en_v1','tpl_b2b_invoice_raised_inapp_en_v1',
  'tpl_b2b_dispute_raised_email_en_v1','tpl_b2b_dispute_raised_sms_en_v1',
  'tpl_b2b_dispute_raised_inapp_en_v1'
);
