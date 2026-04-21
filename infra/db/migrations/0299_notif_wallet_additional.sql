-- Migration: 0299_notif_wallet_additional
-- Description: Notification templates + rules for wallet events not covered in 0286.
--   Adds the admin-facing events that arise during the funding workflow.
--
-- New template families:
--   wallet.funding.requested  — platform super-admin is notified when a user submits a funding request
--   wallet.funding.hitl_required — reviewer is notified when HITL threshold is exceeded
--   wallet.funding.proof_submitted — admin notified when proof of payment is uploaded
--
-- All rules gated on 'wallet_enabled' feature flag.

-- ──────────────────────────────────────────────────────────────────────────────
-- wallet.funding.requested — Email + In-app (to platform super-admin / ops team)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_wallet_funding_requested_email_en_v1', NULL, 'wallet.funding.requested',
  'email', 'en', 1, 'active', 'not_required',
  '[Wallet] New funding request — {{amount_naira}} (Ref: {{reference}})',
  '<h1>New Wallet Funding Request</h1>
<p>A new funding request has been submitted and is awaiting confirmation.</p>
<p><strong>User:</strong> {{user_name}} ({{user_email}})<br>
<strong>Wallet:</strong> {{wallet_id}}<br>
<strong>Amount:</strong> ₦{{amount_naira}}<br>
<strong>Reference:</strong> {{reference}}<br>
<strong>Bank:</strong> {{bank_name}}<br>
<strong>Submitted:</strong> {{submitted_at}}</p>
<p>Log in to the platform admin to confirm or reject this request.</p>',
  'Review Request', '{{admin_review_url}}',
  '{"required":["user_name","user_email","wallet_id","amount_naira","reference","bank_name","submitted_at","admin_review_url"],"optional":[],"properties":{"user_name":{"type":"string","description":"Requesting user name","maxLength":100},"user_email":{"type":"string","description":"User email","maxLength":254},"wallet_id":{"type":"string","description":"Wallet ID","maxLength":50},"amount_naira":{"type":"string","description":"Amount in naira (display)","maxLength":20},"reference":{"type":"string","description":"Funding request reference","maxLength":100},"bank_name":{"type":"string","description":"User-stated originating bank","maxLength":100},"submitted_at":{"type":"string","description":"Submission timestamp","maxLength":50},"admin_review_url":{"type":"url","description":"Admin review page URL"}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_wallet_funding_requested_inapp_en_v1', NULL, 'wallet.funding.requested',
  'in_app', 'en', 1, 'active', 'not_required',
  'New wallet funding request — ₦{{amount_naira}}',
  '{{user_name}} submitted a wallet funding request for ₦{{amount_naira}}. Ref: {{reference}}.',
  'Review', '{{admin_review_url}}',
  '{"required":["user_name","amount_naira","reference","admin_review_url"],"optional":[],"properties":{"user_name":{"type":"string","description":"User name","maxLength":100},"amount_naira":{"type":"string","description":"Amount","maxLength":20},"reference":{"type":"string","description":"Reference","maxLength":100},"admin_review_url":{"type":"url","description":"Admin review URL"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- wallet.funding.hitl_required — Email + In-app (to HITL reviewer / super-admin)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_wallet_funding_hitl_email_en_v1', NULL, 'wallet.funding.hitl_required',
  'email', 'en', 1, 'active', 'not_required',
  '[HITL] Large wallet funding requires senior review — ₦{{amount_naira}}',
  '<h1>Senior Review Required</h1>
<p>A wallet funding request has exceeded the automatic confirmation threshold and requires senior review.</p>
<p><strong>User:</strong> {{user_name}}<br>
<strong>Amount:</strong> ₦{{amount_naira}}<br>
<strong>Reference:</strong> {{reference}}<br>
<strong>HITL threshold:</strong> ₦{{hitl_threshold_naira}}<br>
<strong>Wallet KYC tier:</strong> {{kyc_tier}}</p>
<p>Please review the proof of payment and approve or reject within {{review_sla_hours}} hours.</p>',
  'Review Now', '{{hitl_review_url}}',
  '{"required":["user_name","amount_naira","reference","hitl_threshold_naira","kyc_tier","review_sla_hours","hitl_review_url"],"optional":[],"properties":{"user_name":{"type":"string","description":"User name","maxLength":100},"amount_naira":{"type":"string","description":"Amount in naira","maxLength":20},"reference":{"type":"string","description":"Funding reference","maxLength":100},"hitl_threshold_naira":{"type":"string","description":"HITL threshold amount","maxLength":20},"kyc_tier":{"type":"string","description":"User KYC tier","maxLength":20},"review_sla_hours":{"type":"number","description":"Hours to complete review"},"hitl_review_url":{"type":"url","description":"HITL review page URL"}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_wallet_funding_hitl_inapp_en_v1', NULL, 'wallet.funding.hitl_required',
  'in_app', 'en', 1, 'active', 'not_required',
  'HITL: Large wallet funding — ₦{{amount_naira}}',
  'Wallet funding of ₦{{amount_naira}} from {{user_name}} exceeds threshold and needs your review.',
  'Review', '{{hitl_review_url}}',
  '{"required":["amount_naira","user_name","hitl_review_url"],"optional":["reference"],"properties":{"amount_naira":{"type":"string","description":"Amount","maxLength":20},"user_name":{"type":"string","description":"User name","maxLength":100},"hitl_review_url":{"type":"url","description":"Review URL"},"reference":{"type":"string","description":"Funding reference","maxLength":100}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- wallet.funding.proof_submitted — In-app (admin notified when user uploads proof)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_wallet_funding_proof_inapp_en_v1', NULL, 'wallet.funding.proof_submitted',
  'in_app', 'en', 1, 'active', 'not_required',
  'Proof uploaded — funding ref {{reference}}',
  '{{user_name}} uploaded proof of payment for wallet funding request {{reference}} (₦{{amount_naira}}).',
  'Review Proof', '{{admin_review_url}}',
  '{"required":["user_name","reference","amount_naira","admin_review_url"],"optional":[],"properties":{"user_name":{"type":"string","description":"User name","maxLength":100},"reference":{"type":"string","description":"Funding reference","maxLength":100},"amount_naira":{"type":"string","description":"Amount","maxLength":20},"admin_review_url":{"type":"url","description":"Admin review URL"}}}',
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
  ('rule_wallet_funding_requested_v1', NULL, 'wallet.funding.requested',
   'Wallet funding request — admin notification', 1, 'super_admins',
   '["email","in_app"]', 'wallet.funding.requested', 'high', 0, 'info', 'wallet_enabled',
   unixepoch(), unixepoch()),

  ('rule_wallet_funding_hitl_v1', NULL, 'wallet.funding.hitl_required',
   'Wallet funding HITL review required', 1, 'super_admins',
   '["email","in_app"]', 'wallet.funding.hitl_required', 'critical', 0, 'critical', 'wallet_enabled',
   unixepoch(), unixepoch()),

  ('rule_wallet_funding_proof_v1', NULL, 'wallet.funding.proof_submitted',
   'Wallet funding proof uploaded — admin notification', 1, 'super_admins',
   '["in_app"]', 'wallet.funding.proof_submitted', 'high', 0, 'info', 'wallet_enabled',
   unixepoch(), unixepoch());
