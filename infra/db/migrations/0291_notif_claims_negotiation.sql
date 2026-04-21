-- Migration: 0291_notif_claims_negotiation
-- Description: Notification templates + rules for claims and negotiation events.
--
-- New template families:
--   claim.submitted, claim.approved, claim.rejected, claim.escalated, claim.advanced,
--   negotiation.offer_made, negotiation.accepted, negotiation.rejected,
--   negotiation.session_expired

-- ──────────────────────────────────────────────────────────────────────────────
-- claim.submitted — Email + In-app (confirmation to claimant)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template, preheader_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_claim_submitted_email_en_v1', NULL, 'claim.submitted',
  'email', 'en', 1, 'active', 'not_required',
  'Claim received — reference {{claim_ref}}',
  '<h1>Claim Received</h1>
<p>Hi {{user_name}},</p>
<p>Your claim has been received and is now under review.</p>
<p><strong>Reference:</strong> {{claim_ref}}<br>
<strong>Type:</strong> {{claim_type}}<br>
<strong>Submitted:</strong> {{submitted_at}}</p>
<p>We will notify you as soon as a decision has been made. This typically takes {{review_days}} business days.</p>',
  'Claim {{claim_ref}} received — under review.',
  '{"required":["user_name","claim_ref","claim_type","submitted_at","review_days"],"optional":[],"properties":{"user_name":{"type":"string","description":"Claimant full name","maxLength":100},"claim_ref":{"type":"string","description":"Unique claim reference","maxLength":50},"claim_type":{"type":"string","description":"Type of claim","maxLength":80},"submitted_at":{"type":"string","description":"Formatted submission date","maxLength":50},"review_days":{"type":"number","description":"Expected review time in business days"}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_claim_submitted_inapp_en_v1', NULL, 'claim.submitted',
  'in_app', 'en', 1, 'active', 'not_required',
  'Claim submitted — ref {{claim_ref}}',
  'Your claim {{claim_ref}} has been received and is under review.',
  '{"required":["claim_ref"],"optional":["claim_type"],"properties":{"claim_ref":{"type":"string","description":"Claim reference","maxLength":50},"claim_type":{"type":"string","description":"Type of claim","maxLength":80}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- claim.approved — Email + SMS + In-app
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template, preheader_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_claim_approved_email_en_v1', NULL, 'claim.approved',
  'email', 'en', 1, 'active', 'not_required',
  'Your claim has been approved — {{claim_ref}}',
  '<h1>Claim Approved ✓</h1>
<p>Hi {{user_name}},</p>
<p>Your claim <strong>{{claim_ref}}</strong> has been approved.</p>
<p><strong>Settlement amount:</strong> {{settlement_amount}}<br>
<strong>Settlement method:</strong> {{settlement_method}}</p>
<p>{{settlement_note}}</p>',
  'Claim {{claim_ref}} approved — settlement incoming.',
  'View Claim', '{{claim_url}}',
  '{"required":["user_name","claim_ref","settlement_amount","settlement_method","claim_url"],"optional":["settlement_note"],"properties":{"user_name":{"type":"string","description":"Claimant full name","maxLength":100},"claim_ref":{"type":"string","description":"Claim reference","maxLength":50},"settlement_amount":{"type":"string","description":"Formatted settlement amount","maxLength":30},"settlement_method":{"type":"string","description":"How settlement will be paid","maxLength":100},"claim_url":{"type":"url","description":"Claim detail page"},"settlement_note":{"type":"string","description":"Additional settlement instructions","maxLength":300}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, body_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_claim_approved_sms_en_v1', NULL, 'claim.approved',
  'sms', 'en', 1, 'active', 'not_required',
  '{{tenant_name}}: Claim {{claim_ref}} approved. Settlement of {{settlement_amount}} is being processed.',
  '{"required":["claim_ref","settlement_amount"],"optional":[],"properties":{"claim_ref":{"type":"string","description":"Claim reference","maxLength":50},"settlement_amount":{"type":"string","description":"Settlement amount formatted","maxLength":30}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_claim_approved_inapp_en_v1', NULL, 'claim.approved',
  'in_app', 'en', 1, 'active', 'not_required',
  'Claim {{claim_ref}} approved',
  'Your claim {{claim_ref}} has been approved. Settlement of {{settlement_amount}} is in progress.',
  'View Claim', '{{claim_url}}',
  '{"required":["claim_ref","settlement_amount","claim_url"],"optional":[],"properties":{"claim_ref":{"type":"string","description":"Claim reference","maxLength":50},"settlement_amount":{"type":"string","description":"Settlement amount","maxLength":30},"claim_url":{"type":"url","description":"Claim page URL"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- claim.rejected — Email + SMS + In-app
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_claim_rejected_email_en_v1', NULL, 'claim.rejected',
  'email', 'en', 1, 'active', 'not_required',
  'Your claim could not be approved — {{claim_ref}}',
  '<h1>Claim Decision</h1>
<p>Hi {{user_name}},</p>
<p>After careful review, we were unable to approve your claim <strong>{{claim_ref}}</strong>.</p>
<p><strong>Reason:</strong> {{rejection_reason}}</p>
<p>If you disagree with this decision, you may appeal within {{appeal_days}} days by contacting support.</p>',
  'Appeal Decision', '{{support_url}}',
  '{"required":["user_name","claim_ref","rejection_reason","appeal_days","support_url"],"optional":["support_email"],"properties":{"user_name":{"type":"string","description":"Claimant full name","maxLength":100},"claim_ref":{"type":"string","description":"Claim reference","maxLength":50},"rejection_reason":{"type":"string","description":"Reason for rejection","maxLength":400},"appeal_days":{"type":"number","description":"Days available to appeal"},"support_url":{"type":"url","description":"Appeal/support contact URL"},"support_email":{"type":"string","description":"Support email","maxLength":254}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, body_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_claim_rejected_sms_en_v1', NULL, 'claim.rejected',
  'sms', 'en', 1, 'active', 'not_required',
  '{{tenant_name}}: Claim {{claim_ref}} was not approved. Check your email for details or contact support.',
  '{"required":["claim_ref"],"optional":[],"properties":{"claim_ref":{"type":"string","description":"Claim reference","maxLength":50}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_claim_rejected_inapp_en_v1', NULL, 'claim.rejected',
  'in_app', 'en', 1, 'active', 'not_required',
  'Claim {{claim_ref}} not approved',
  'Your claim {{claim_ref}} could not be approved. See your email for the full decision.',
  '{"required":["claim_ref"],"optional":["rejection_reason"],"properties":{"claim_ref":{"type":"string","description":"Claim reference","maxLength":50},"rejection_reason":{"type":"string","description":"Brief reason","maxLength":150}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- claim.escalated — Email + In-app
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_claim_escalated_email_en_v1', NULL, 'claim.escalated',
  'email', 'en', 1, 'active', 'not_required',
  'Your claim has been escalated for senior review — {{claim_ref}}',
  '<h1>Claim Escalated</h1>
<p>Hi {{user_name}},</p>
<p>Your claim <strong>{{claim_ref}}</strong> has been escalated to our senior review team.</p>
<p>This typically happens when a case requires additional expertise. We will keep you updated throughout the process.</p>',
  '{"required":["user_name","claim_ref"],"optional":["support_email","escalation_reason"],"properties":{"user_name":{"type":"string","description":"Claimant full name","maxLength":100},"claim_ref":{"type":"string","description":"Claim reference","maxLength":50},"escalation_reason":{"type":"string","description":"Why the claim was escalated","maxLength":300},"support_email":{"type":"string","description":"Support email","maxLength":254}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_claim_escalated_inapp_en_v1', NULL, 'claim.escalated',
  'in_app', 'en', 1, 'active', 'not_required',
  'Claim escalated for senior review',
  'Your claim {{claim_ref}} has been escalated. A senior reviewer will assess your case.',
  '{"required":["claim_ref"],"optional":[],"properties":{"claim_ref":{"type":"string","description":"Claim reference","maxLength":50}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- claim.advanced — In-app (state progression update)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_claim_advanced_inapp_en_v1', NULL, 'claim.advanced',
  'in_app', 'en', 1, 'active', 'not_required',
  'Claim {{claim_ref}} status updated',
  'Your claim {{claim_ref}} has moved to the <strong>{{new_state}}</strong> stage.',
  '{"required":["claim_ref","new_state"],"optional":["old_state"],"properties":{"claim_ref":{"type":"string","description":"Claim reference","maxLength":50},"new_state":{"type":"string","description":"New claim state","maxLength":50},"old_state":{"type":"string","description":"Previous state","maxLength":50}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- negotiation.offer_made — In-app + SMS (notify the counterparty)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_neg_offer_made_inapp_en_v1', NULL, 'negotiation.offer_made',
  'in_app', 'en', 1, 'active', 'not_required',
  'New offer from {{offeror_name}}',
  '{{offeror_name}} has made an offer of {{offer_amount}} in your negotiation session.',
  'Review Offer', '{{negotiation_url}}',
  '{"required":["offeror_name","offer_amount","negotiation_url"],"optional":["session_ref"],"properties":{"offeror_name":{"type":"string","description":"Name of the party making the offer","maxLength":100},"offer_amount":{"type":"string","description":"Formatted offer amount","maxLength":30},"negotiation_url":{"type":"url","description":"Negotiation session URL"},"session_ref":{"type":"string","description":"Session reference","maxLength":50}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, body_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_neg_offer_made_sms_en_v1', NULL, 'negotiation.offer_made',
  'sms', 'en', 1, 'active', 'not_required',
  '{{tenant_name}}: {{offeror_name}} made an offer of {{offer_amount}} in your negotiation. Log in to respond.',
  '{"required":["offeror_name","offer_amount"],"optional":[],"properties":{"offeror_name":{"type":"string","description":"Offeror name","maxLength":100},"offer_amount":{"type":"string","description":"Offer amount","maxLength":30}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- negotiation.accepted — Email + In-app (notify the accepting party and offeror)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template, preheader_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_neg_accepted_email_en_v1', NULL, 'negotiation.accepted',
  'email', 'en', 1, 'active', 'not_required',
  'Negotiation accepted — {{session_ref}}',
  '<h1>Negotiation Successful</h1>
<p>Hi {{user_name}},</p>
<p>The negotiation session <strong>{{session_ref}}</strong> has been accepted.</p>
<p><strong>Agreed amount:</strong> {{agreed_amount}}<br>
<strong>Accepted by:</strong> {{acceptor_name}}</p>
<p>Next steps: {{next_steps}}</p>',
  'Negotiation {{session_ref}} accepted at {{agreed_amount}}.',
  'View Details', '{{negotiation_url}}',
  '{"required":["user_name","session_ref","agreed_amount","acceptor_name","negotiation_url"],"optional":["next_steps"],"properties":{"user_name":{"type":"string","description":"User full name","maxLength":100},"session_ref":{"type":"string","description":"Session reference","maxLength":50},"agreed_amount":{"type":"string","description":"Agreed amount formatted","maxLength":30},"acceptor_name":{"type":"string","description":"Name of accepting party","maxLength":100},"negotiation_url":{"type":"url","description":"Session detail page"},"next_steps":{"type":"string","description":"What happens next","maxLength":300}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_neg_accepted_inapp_en_v1', NULL, 'negotiation.accepted',
  'in_app', 'en', 1, 'active', 'not_required',
  'Negotiation accepted at {{agreed_amount}}',
  'Your negotiation session {{session_ref}} has been accepted at {{agreed_amount}}.',
  'View Session', '{{negotiation_url}}',
  '{"required":["session_ref","agreed_amount","negotiation_url"],"optional":[],"properties":{"session_ref":{"type":"string","description":"Session reference","maxLength":50},"agreed_amount":{"type":"string","description":"Agreed amount","maxLength":30},"negotiation_url":{"type":"url","description":"Session URL"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- negotiation.rejected — In-app
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_neg_rejected_inapp_en_v1', NULL, 'negotiation.rejected',
  'in_app', 'en', 1, 'active', 'not_required',
  'Offer rejected in session {{session_ref}}',
  'Your offer was rejected in negotiation session {{session_ref}}. You may make a counter-offer.',
  '{"required":["session_ref"],"optional":["negotiation_url"],"properties":{"session_ref":{"type":"string","description":"Session reference","maxLength":50},"negotiation_url":{"type":"url","description":"Session URL"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- negotiation.session_expired — In-app
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_neg_expired_inapp_en_v1', NULL, 'negotiation.session_expired',
  'in_app', 'en', 1, 'active', 'not_required',
  'Negotiation session expired — {{session_ref}}',
  'Your negotiation session {{session_ref}} has expired without agreement. You may start a new session.',
  '{"required":["session_ref"],"optional":[],"properties":{"session_ref":{"type":"string","description":"Session reference","maxLength":50}}}',
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
  ('rule_claim_submitted_v1', NULL, 'claim.submitted',
   'Claim submitted acknowledgement', 1, 'actor',
   '["email","in_app"]', 'claim.submitted', 'normal', 0, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_claim_approved_v1', NULL, 'claim.approved',
   'Claim approved', 1, 'actor',
   '["email","sms","in_app"]', 'claim.approved', 'high', 0, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_claim_rejected_v1', NULL, 'claim.rejected',
   'Claim rejected', 1, 'actor',
   '["email","sms","in_app"]', 'claim.rejected', 'high', 0, 'warning', NULL,
   unixepoch(), unixepoch()),

  ('rule_claim_escalated_v1', NULL, 'claim.escalated',
   'Claim escalated to senior review', 1, 'actor',
   '["email","in_app"]', 'claim.escalated', 'normal', 0, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_claim_advanced_v1', NULL, 'claim.advanced',
   'Claim status advanced', 1, 'actor',
   '["in_app"]', 'claim.advanced', 'low', 1, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_neg_offer_made_v1', NULL, 'negotiation.offer_made',
   'Negotiation offer received (to counterparty)', 1, 'subject',
   '["in_app","sms"]', 'negotiation.offer_made', 'normal', 0, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_neg_accepted_v1', NULL, 'negotiation.accepted',
   'Negotiation accepted', 1, 'actor',
   '["email","in_app"]', 'negotiation.accepted', 'normal', 0, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_neg_rejected_v1', NULL, 'negotiation.rejected',
   'Negotiation offer rejected', 1, 'actor',
   '["in_app"]', 'negotiation.rejected', 'normal', 0, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_neg_expired_v1', NULL, 'negotiation.session_expired',
   'Negotiation session expired', 1, 'actor',
   '["in_app"]', 'negotiation.session_expired', 'low', 1, 'info', NULL,
   unixepoch(), unixepoch());
