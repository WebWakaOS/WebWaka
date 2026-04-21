-- Migration: 0290_notif_kyc_identity
-- Description: Notification templates + rules for KYC and identity verification events.
--
-- New template families:
--   kyc.submitted, kyc.approved, kyc.rejected,
--   kyc.resubmission_required, identity.verified, identity.verification_failed

-- ──────────────────────────────────────────────────────────────────────────────
-- kyc.submitted — In-app (simple acknowledgement; no email needed at submission)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_kyc_submitted_inapp_en_v1', NULL, 'kyc.submitted',
  'in_app', 'en', 1, 'active', 'not_required',
  'KYC submission received',
  'Your identity verification documents have been received and are under review. We will notify you once a decision has been made.',
  '{"required":[],"optional":["reference"],"properties":{"reference":{"type":"string","description":"KYC submission reference","maxLength":100}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- kyc.approved — Email + SMS + In-app (positive outcome — user gets full access)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template, preheader_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_kyc_approved_email_en_v1', NULL, 'kyc.approved',
  'email', 'en', 1, 'active', 'not_required',
  'Your identity has been verified — {{tenant_name}}',
  '<h1>Identity Verified ✓</h1>
<p>Hi {{user_name}},</p>
<p>Great news! Your identity has been successfully verified on {{tenant_name}}.</p>
<p>Your account is now upgraded to <strong>KYC Tier {{new_tier}}</strong>, unlocking higher transaction limits and additional features.</p>',
  'Your identity has been verified — your account is upgraded.',
  'Go to Dashboard', '{{dashboard_url}}',
  '{"required":["user_name","new_tier","dashboard_url"],"optional":["old_tier"],"properties":{"user_name":{"type":"string","description":"User full name","maxLength":100},"new_tier":{"type":"string","description":"New KYC tier e.g. Tier 2","maxLength":30},"old_tier":{"type":"string","description":"Previous KYC tier","maxLength":30},"dashboard_url":{"type":"url","description":"Dashboard URL"}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, body_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_kyc_approved_sms_en_v1', NULL, 'kyc.approved',
  'sms', 'en', 1, 'active', 'not_required',
  '{{tenant_name}}: Identity verified! Your account is now KYC Tier {{new_tier}}. Higher limits are now active.',
  '{"required":["new_tier"],"optional":[],"properties":{"new_tier":{"type":"string","description":"New KYC tier","maxLength":30}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_kyc_approved_inapp_en_v1', NULL, 'kyc.approved',
  'in_app', 'en', 1, 'active', 'not_required',
  'Identity verified — KYC Tier {{new_tier}}',
  'Your identity has been verified. Your account is now KYC Tier {{new_tier}} with increased transaction limits.',
  'View Dashboard', '{{dashboard_url}}',
  '{"required":["new_tier","dashboard_url"],"optional":[],"properties":{"new_tier":{"type":"string","description":"New KYC tier","maxLength":30},"dashboard_url":{"type":"url","description":"Dashboard URL"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- kyc.rejected — Email + SMS + In-app
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_kyc_rejected_email_en_v1', NULL, 'kyc.rejected',
  'email', 'en', 1, 'active', 'not_required',
  'Identity verification unsuccessful — {{tenant_name}}',
  '<h1>Verification Unsuccessful</h1>
<p>Hi {{user_name}},</p>
<p>Unfortunately, your identity verification could not be completed.</p>
<p><strong>Reason:</strong> {{rejection_reason}}</p>
<p>You may resubmit your documents. Please ensure your documents are clear, valid, and match your account details.</p>',
  'Resubmit Documents', '{{kyc_url}}',
  '{"required":["user_name","rejection_reason","kyc_url"],"optional":["support_email"],"properties":{"user_name":{"type":"string","description":"User full name","maxLength":100},"rejection_reason":{"type":"string","description":"Human-readable rejection reason","maxLength":300},"kyc_url":{"type":"url","description":"KYC resubmission page URL"},"support_email":{"type":"string","description":"Support email","maxLength":254}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, body_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_kyc_rejected_sms_en_v1', NULL, 'kyc.rejected',
  'sms', 'en', 1, 'active', 'not_required',
  '{{tenant_name}}: Your identity verification was unsuccessful. Please check your email for details and resubmit your documents.',
  '{"required":[],"optional":[],"properties":{}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_kyc_rejected_inapp_en_v1', NULL, 'kyc.rejected',
  'in_app', 'en', 1, 'active', 'not_required',
  'Identity verification unsuccessful',
  'Your identity verification was unsuccessful. Please review the reason and resubmit your documents.',
  'Resubmit', '{{kyc_url}}',
  '{"required":["kyc_url"],"optional":["rejection_reason"],"properties":{"kyc_url":{"type":"url","description":"KYC resubmission URL"},"rejection_reason":{"type":"string","description":"Brief rejection reason","maxLength":150}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- kyc.resubmission_required — Email + In-app (additional documents requested)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_kyc_resubmit_email_en_v1', NULL, 'kyc.resubmission_required',
  'email', 'en', 1, 'active', 'not_required',
  'Additional information required for verification — {{tenant_name}}',
  '<h1>Additional Information Required</h1>
<p>Hi {{user_name}},</p>
<p>We need a little more information to complete your identity verification on {{tenant_name}}.</p>
<p><strong>What is needed:</strong> {{required_action}}</p>
<p>Please resubmit your documents at your earliest convenience. Verification is on hold until then.</p>',
  'Update Documents', '{{kyc_url}}',
  '{"required":["user_name","required_action","kyc_url"],"optional":["support_email"],"properties":{"user_name":{"type":"string","description":"User full name","maxLength":100},"required_action":{"type":"string","description":"What the user needs to provide","maxLength":300},"kyc_url":{"type":"url","description":"KYC resubmission page URL"},"support_email":{"type":"string","description":"Support email","maxLength":254}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_kyc_resubmit_inapp_en_v1', NULL, 'kyc.resubmission_required',
  'in_app', 'en', 1, 'active', 'not_required',
  'More information needed for verification',
  'Additional documents are required to complete your identity verification. Tap to update.',
  'Update Documents', '{{kyc_url}}',
  '{"required":["kyc_url"],"optional":["required_action"],"properties":{"kyc_url":{"type":"url","description":"KYC page URL"},"required_action":{"type":"string","description":"Brief action required","maxLength":150}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- identity.verified — In-app (BVN/NIN verified — lightweight confirmation)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_identity_verified_inapp_en_v1', NULL, 'identity.verified',
  'in_app', 'en', 1, 'active', 'not_required',
  'Identity check passed',
  'Your {{id_type}} has been successfully verified.',
  '{"required":["id_type"],"optional":[],"properties":{"id_type":{"type":"string","description":"Type of ID verified e.g. BVN, NIN","maxLength":20}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- identity.verification_failed — Email + In-app
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_identity_verifail_email_en_v1', NULL, 'identity.verification_failed',
  'email', 'en', 1, 'active', 'not_required',
  'Identity check failed — {{tenant_name}}',
  '<h1>Identity Check Failed</h1>
<p>Hi {{user_name}},</p>
<p>We could not verify your {{id_type}}.</p>
<p><strong>Reason:</strong> {{reason}}</p>
<p>Please check your details and try again. If the problem persists, contact support.</p>',
  'Try Again', '{{kyc_url}}',
  '{"required":["user_name","id_type","reason","kyc_url"],"optional":["support_email"],"properties":{"user_name":{"type":"string","description":"User full name","maxLength":100},"id_type":{"type":"string","description":"ID type e.g. BVN, NIN","maxLength":20},"reason":{"type":"string","description":"Failure reason","maxLength":300},"kyc_url":{"type":"url","description":"KYC retry page"},"support_email":{"type":"string","description":"Support email","maxLength":254}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_identity_verifail_inapp_en_v1', NULL, 'identity.verification_failed',
  'in_app', 'en', 1, 'active', 'not_required',
  '{{id_type}} verification failed',
  'We could not verify your {{id_type}}. Please check your details and try again.',
  'Try Again', '{{kyc_url}}',
  '{"required":["id_type","kyc_url"],"optional":["reason"],"properties":{"id_type":{"type":"string","description":"ID type","maxLength":20},"kyc_url":{"type":"url","description":"KYC retry URL"},"reason":{"type":"string","description":"Brief failure reason","maxLength":100}}}',
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
  ('rule_kyc_submitted_v1', NULL, 'kyc.submitted',
   'KYC submission acknowledged', 1, 'actor',
   '["in_app"]', 'kyc.submitted', 'normal', 0, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_kyc_approved_v1', NULL, 'kyc.approved',
   'KYC approved — tier upgraded', 1, 'actor',
   '["email","sms","in_app"]', 'kyc.approved', 'high', 0, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_kyc_rejected_v1', NULL, 'kyc.rejected',
   'KYC rejected — action required', 1, 'actor',
   '["email","sms","in_app"]', 'kyc.rejected', 'high', 0, 'warning', NULL,
   unixepoch(), unixepoch()),

  ('rule_kyc_resubmit_v1', NULL, 'kyc.resubmission_required',
   'KYC resubmission required', 1, 'actor',
   '["email","in_app"]', 'kyc.resubmission_required', 'high', 0, 'warning', NULL,
   unixepoch(), unixepoch()),

  ('rule_identity_verified_v1', NULL, 'identity.verified',
   'Identity check passed', 1, 'actor',
   '["in_app"]', 'identity.verified', 'normal', 0, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_identity_verifail_v1', NULL, 'identity.verification_failed',
   'Identity verification failed', 1, 'actor',
   '["email","in_app"]', 'identity.verification_failed', 'high', 0, 'warning', NULL,
   unixepoch(), unixepoch());
