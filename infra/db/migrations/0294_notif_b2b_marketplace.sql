-- Migration: 0294_notif_b2b_marketplace
-- Description: Notification templates + rules for B2B marketplace events.
--
-- New template families:
--   b2b.rfq_created, b2b.bid_submitted, b2b.bid_accepted,
--   b2b.po_issued, b2b.invoice_raised, b2b.dispute_raised

-- ──────────────────────────────────────────────────────────────────────────────
-- b2b.rfq_created — Email + In-app (notify matching suppliers)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_b2b_rfq_created_email_en_v1', NULL, 'b2b.rfq_created',
  'email', 'en', 1, 'active', 'not_required',
  'New RFQ matching your products — {{rfq_title}}',
  '<h1>New Request for Quotation</h1>
<p>Hi {{user_name}},</p>
<p>A new request for quotation matching your product category has been posted.</p>
<p><strong>RFQ:</strong> {{rfq_title}}<br>
<strong>Quantity:</strong> {{quantity}}<br>
<strong>Deadline:</strong> {{submission_deadline}}<br>
<strong>Buyer:</strong> {{buyer_name}}</p>
<p>Submit your best quote before the deadline.</p>',
  'Submit Quote', '{{rfq_url}}',
  '{"required":["user_name","rfq_title","quantity","submission_deadline","buyer_name","rfq_url"],"optional":["estimated_value"],"properties":{"user_name":{"type":"string","description":"Supplier contact name","maxLength":100},"rfq_title":{"type":"string","description":"RFQ title/description","maxLength":200},"quantity":{"type":"string","description":"Quantity required","maxLength":50},"submission_deadline":{"type":"string","description":"Bid submission deadline","maxLength":50},"buyer_name":{"type":"string","description":"Buyer business name","maxLength":100},"rfq_url":{"type":"url","description":"RFQ detail page"},"estimated_value":{"type":"string","description":"Estimated contract value","maxLength":30}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_b2b_rfq_created_inapp_en_v1', NULL, 'b2b.rfq_created',
  'in_app', 'en', 1, 'active', 'not_required',
  'New RFQ: {{rfq_title}}',
  'A new RFQ matching your products has been posted by {{buyer_name}}. Deadline: {{submission_deadline}}.',
  'View RFQ', '{{rfq_url}}',
  '{"required":["rfq_title","buyer_name","submission_deadline","rfq_url"],"optional":[],"properties":{"rfq_title":{"type":"string","description":"RFQ title","maxLength":200},"buyer_name":{"type":"string","description":"Buyer name","maxLength":100},"submission_deadline":{"type":"string","description":"Deadline","maxLength":50},"rfq_url":{"type":"url","description":"RFQ URL"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- b2b.bid_submitted — In-app (notify the buyer that a bid came in)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_b2b_bid_submitted_inapp_en_v1', NULL, 'b2b.bid_submitted',
  'in_app', 'en', 1, 'active', 'not_required',
  'New bid on your RFQ — {{rfq_title}}',
  '{{supplier_name}} submitted a bid of {{bid_amount}} on your RFQ: {{rfq_title}}.',
  'Review Bid', '{{rfq_url}}',
  '{"required":["rfq_title","supplier_name","bid_amount","rfq_url"],"optional":[],"properties":{"rfq_title":{"type":"string","description":"RFQ title","maxLength":200},"supplier_name":{"type":"string","description":"Supplier name","maxLength":100},"bid_amount":{"type":"string","description":"Bid amount formatted","maxLength":30},"rfq_url":{"type":"url","description":"RFQ URL"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- b2b.bid_accepted — Email + In-app (notify winning supplier)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template, preheader_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_b2b_bid_accepted_email_en_v1', NULL, 'b2b.bid_accepted',
  'email', 'en', 1, 'active', 'not_required',
  'Congratulations — your bid has been accepted',
  '<h1>Bid Accepted</h1>
<p>Hi {{user_name}},</p>
<p>Your bid of <strong>{{bid_amount}}</strong> for the RFQ <strong>{{rfq_title}}</strong> has been accepted by <strong>{{buyer_name}}</strong>.</p>
<p>A Purchase Order will be issued shortly. Please check the portal for next steps.</p>',
  'Your bid on {{rfq_title}} has been accepted!',
  'View Details', '{{rfq_url}}',
  '{"required":["user_name","bid_amount","rfq_title","buyer_name","rfq_url"],"optional":[],"properties":{"user_name":{"type":"string","description":"Supplier contact name","maxLength":100},"bid_amount":{"type":"string","description":"Accepted bid amount","maxLength":30},"rfq_title":{"type":"string","description":"RFQ title","maxLength":200},"buyer_name":{"type":"string","description":"Buyer business name","maxLength":100},"rfq_url":{"type":"url","description":"RFQ/deal page URL"}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_b2b_bid_accepted_inapp_en_v1', NULL, 'b2b.bid_accepted',
  'in_app', 'en', 1, 'active', 'not_required',
  'Your bid was accepted — {{rfq_title}}',
  'Your bid of {{bid_amount}} on {{rfq_title}} has been accepted. A PO will follow shortly.',
  'View Deal', '{{rfq_url}}',
  '{"required":["bid_amount","rfq_title","rfq_url"],"optional":[],"properties":{"bid_amount":{"type":"string","description":"Accepted bid amount","maxLength":30},"rfq_title":{"type":"string","description":"RFQ title","maxLength":200},"rfq_url":{"type":"url","description":"Deal page URL"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- b2b.po_issued — Email + In-app (notify supplier that PO has been issued)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_b2b_po_issued_email_en_v1', NULL, 'b2b.po_issued',
  'email', 'en', 1, 'active', 'not_required',
  'Purchase Order issued — PO #{{po_number}}',
  '<h1>Purchase Order Issued</h1>
<p>Hi {{user_name}},</p>
<p>A Purchase Order has been issued for your approved bid.</p>
<p><strong>PO Number:</strong> {{po_number}}<br>
<strong>Value:</strong> {{po_value}}<br>
<strong>Delivery by:</strong> {{delivery_date}}<br>
<strong>Buyer:</strong> {{buyer_name}}</p>
<p>Please review and confirm the PO in the portal.</p>',
  'Confirm PO', '{{po_url}}',
  '{"required":["user_name","po_number","po_value","delivery_date","buyer_name","po_url"],"optional":[],"properties":{"user_name":{"type":"string","description":"Supplier contact","maxLength":100},"po_number":{"type":"string","description":"PO reference number","maxLength":50},"po_value":{"type":"string","description":"PO value formatted","maxLength":30},"delivery_date":{"type":"string","description":"Expected delivery date","maxLength":30},"buyer_name":{"type":"string","description":"Buyer business name","maxLength":100},"po_url":{"type":"url","description":"PO detail page"}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_b2b_po_issued_inapp_en_v1', NULL, 'b2b.po_issued',
  'in_app', 'en', 1, 'active', 'not_required',
  'PO #{{po_number}} issued — action required',
  'Purchase Order #{{po_number}} for {{po_value}} has been issued. Please review and confirm.',
  'Confirm PO', '{{po_url}}',
  '{"required":["po_number","po_value","po_url"],"optional":[],"properties":{"po_number":{"type":"string","description":"PO number","maxLength":50},"po_value":{"type":"string","description":"PO value","maxLength":30},"po_url":{"type":"url","description":"PO URL"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- b2b.invoice_raised — Email + In-app (notify buyer)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_b2b_invoice_raised_email_en_v1', NULL, 'b2b.invoice_raised',
  'email', 'en', 1, 'active', 'not_required',
  'Invoice received — INV #{{invoice_number}}',
  '<h1>Invoice Received</h1>
<p>Hi {{user_name}},</p>
<p>You have received a new invoice from <strong>{{supplier_name}}</strong>.</p>
<p><strong>Invoice:</strong> #{{invoice_number}}<br>
<strong>Amount:</strong> {{invoice_amount}}<br>
<strong>Due date:</strong> {{due_date}}</p>
<p>Please review and approve payment before the due date.</p>',
  'View Invoice', '{{invoice_url}}',
  '{"required":["user_name","supplier_name","invoice_number","invoice_amount","due_date","invoice_url"],"optional":[],"properties":{"user_name":{"type":"string","description":"Buyer contact name","maxLength":100},"supplier_name":{"type":"string","description":"Supplier business name","maxLength":100},"invoice_number":{"type":"string","description":"Invoice number","maxLength":50},"invoice_amount":{"type":"string","description":"Invoice amount formatted","maxLength":30},"due_date":{"type":"string","description":"Payment due date","maxLength":30},"invoice_url":{"type":"url","description":"Invoice page URL"}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_b2b_invoice_raised_inapp_en_v1', NULL, 'b2b.invoice_raised',
  'in_app', 'en', 1, 'active', 'not_required',
  'Invoice #{{invoice_number}} received',
  'Invoice #{{invoice_number}} for {{invoice_amount}} from {{supplier_name}} is due {{due_date}}.',
  'View Invoice', '{{invoice_url}}',
  '{"required":["invoice_number","invoice_amount","supplier_name","due_date","invoice_url"],"optional":[],"properties":{"invoice_number":{"type":"string","description":"Invoice number","maxLength":50},"invoice_amount":{"type":"string","description":"Amount","maxLength":30},"supplier_name":{"type":"string","description":"Supplier name","maxLength":100},"due_date":{"type":"string","description":"Due date","maxLength":30},"invoice_url":{"type":"url","description":"Invoice URL"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- b2b.dispute_raised — Email + SMS + In-app (critical — both parties notified)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_b2b_dispute_raised_email_en_v1', NULL, 'b2b.dispute_raised',
  'email', 'en', 1, 'active', 'not_required',
  'Dispute raised on transaction — {{dispute_ref}}',
  '<h1>Dispute Raised</h1>
<p>Hi {{user_name}},</p>
<p>A dispute has been raised on transaction <strong>{{dispute_ref}}</strong>.</p>
<p><strong>Raised by:</strong> {{raised_by}}<br>
<strong>Reason:</strong> {{dispute_reason}}</p>
<p>A platform mediator will review the dispute. Please provide any supporting documents within {{response_deadline}} days.</p>',
  'View Dispute', '{{dispute_url}}',
  '{"required":["user_name","dispute_ref","raised_by","dispute_reason","response_deadline","dispute_url"],"optional":["support_email"],"properties":{"user_name":{"type":"string","description":"Recipient name","maxLength":100},"dispute_ref":{"type":"string","description":"Dispute reference","maxLength":50},"raised_by":{"type":"string","description":"Party who raised the dispute","maxLength":100},"dispute_reason":{"type":"string","description":"Reason for dispute","maxLength":400},"response_deadline":{"type":"number","description":"Days to respond"},"dispute_url":{"type":"url","description":"Dispute page URL"},"support_email":{"type":"string","description":"Mediation contact","maxLength":254}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, body_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_b2b_dispute_raised_sms_en_v1', NULL, 'b2b.dispute_raised',
  'sms', 'en', 1, 'active', 'not_required',
  '{{tenant_name}}: A dispute has been raised on transaction {{dispute_ref}}. Check your email for details.',
  '{"required":["dispute_ref"],"optional":[],"properties":{"dispute_ref":{"type":"string","description":"Dispute reference","maxLength":50}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_b2b_dispute_raised_inapp_en_v1', NULL, 'b2b.dispute_raised',
  'in_app', 'en', 1, 'active', 'not_required',
  'Dispute raised — {{dispute_ref}}',
  'A dispute has been raised on {{dispute_ref}} by {{raised_by}}. Respond within {{response_deadline}} days.',
  'View Dispute', '{{dispute_url}}',
  '{"required":["dispute_ref","raised_by","response_deadline","dispute_url"],"optional":[],"properties":{"dispute_ref":{"type":"string","description":"Dispute reference","maxLength":50},"raised_by":{"type":"string","description":"Party who raised dispute","maxLength":100},"response_deadline":{"type":"number","description":"Days to respond"},"dispute_url":{"type":"url","description":"Dispute URL"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- NOTIFICATION RULES
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_rule (
  id, tenant_id, event_key, rule_name, enabled, audience_type,
  channels, template_family, priority, digest_eligible, min_severity, feature_flag,
  created_at, updated_at
) VALUES
  ('rule_b2b_rfq_created_v1', NULL, 'b2b.rfq_created',
   'B2B RFQ posted to matching suppliers', 1, 'workspace_admins',
   '["email","in_app"]', 'b2b.rfq_created', 'normal', 0, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_b2b_bid_submitted_v1', NULL, 'b2b.bid_submitted',
   'B2B bid received on RFQ', 1, 'workspace_admins',
   '["in_app"]', 'b2b.bid_submitted', 'normal', 1, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_b2b_bid_accepted_v1', NULL, 'b2b.bid_accepted',
   'B2B bid accepted — notify supplier', 1, 'actor',
   '["email","in_app"]', 'b2b.bid_accepted', 'high', 0, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_b2b_po_issued_v1', NULL, 'b2b.po_issued',
   'B2B purchase order issued', 1, 'subject',
   '["email","in_app"]', 'b2b.po_issued', 'high', 0, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_b2b_invoice_raised_v1', NULL, 'b2b.invoice_raised',
   'B2B invoice raised — notify buyer', 1, 'subject',
   '["email","in_app"]', 'b2b.invoice_raised', 'high', 0, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_b2b_dispute_raised_v1', NULL, 'b2b.dispute_raised',
   'B2B dispute raised — notify all parties', 1, 'actor',
   '["email","sms","in_app"]', 'b2b.dispute_raised', 'critical', 0, 'critical', NULL,
   unixepoch(), unixepoch());
