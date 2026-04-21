-- Migration: 0297_notif_partners
-- Description: Notification templates + rules for partner ecosystem events.
--
-- New template families:
--   partner.application_approved, partner.application_rejected,
--   partner.commission_earned, partner.sub_partner_created

-- ──────────────────────────────────────────────────────────────────────────────
-- partner.application_approved — Email + In-app
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template, preheader_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_partner_app_approved_email_en_v1', NULL, 'partner.application_approved',
  'email', 'en', 1, 'active', 'not_required',
  'Welcome to the {{tenant_name}} Partner Network',
  '<h1>Partner Application Approved ✓</h1>
<p>Hi {{contact_name}},</p>
<p>Congratulations! Your application to join the <strong>{{tenant_name}}</strong> partner network has been approved.</p>
<p><strong>Partner tier:</strong> {{partner_tier}}<br>
<strong>Commission rate:</strong> {{commission_rate}}</p>
<p>Log in to access your partner dashboard and start earning commissions.</p>',
  'Welcome to the {{tenant_name}} partner network!',
  'Access Partner Dashboard', '{{partner_dashboard_url}}',
  '{"required":["contact_name","partner_tier","commission_rate","partner_dashboard_url"],"optional":["support_email"],"properties":{"contact_name":{"type":"string","description":"Partner contact name","maxLength":100},"partner_tier":{"type":"string","description":"Partner tier e.g. Silver, Gold","maxLength":50},"commission_rate":{"type":"string","description":"Commission rate e.g. 5%","maxLength":20},"partner_dashboard_url":{"type":"url","description":"Partner dashboard URL"},"support_email":{"type":"string","description":"Partner support email","maxLength":254}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_partner_app_approved_inapp_en_v1', NULL, 'partner.application_approved',
  'in_app', 'en', 1, 'active', 'not_required',
  'Partner application approved!',
  'Your partner application has been approved. You are now a {{partner_tier}} partner.',
  'View Dashboard', '{{partner_dashboard_url}}',
  '{"required":["partner_tier","partner_dashboard_url"],"optional":[],"properties":{"partner_tier":{"type":"string","description":"Partner tier","maxLength":50},"partner_dashboard_url":{"type":"url","description":"Dashboard URL"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- partner.application_rejected — Email + In-app
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_partner_app_rejected_email_en_v1', NULL, 'partner.application_rejected',
  'email', 'en', 1, 'active', 'not_required',
  'Partner application update — {{tenant_name}}',
  '<h1>Application Decision</h1>
<p>Hi {{contact_name}},</p>
<p>Thank you for applying to the {{tenant_name}} partner network. After careful review, we are unable to approve your application at this time.</p>
<p><strong>Reason:</strong> {{rejection_reason}}</p>
<p>You are welcome to reapply after {{reapply_days}} days if your circumstances change. If you have questions, please contact our partner team.</p>',
  '{"required":["contact_name","rejection_reason","reapply_days"],"optional":["support_email"],"properties":{"contact_name":{"type":"string","description":"Partner contact name","maxLength":100},"rejection_reason":{"type":"string","description":"Reason for rejection","maxLength":400},"reapply_days":{"type":"number","description":"Days before reapplication is allowed"},"support_email":{"type":"string","description":"Partner support email","maxLength":254}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_partner_app_rejected_inapp_en_v1', NULL, 'partner.application_rejected',
  'in_app', 'en', 1, 'active', 'not_required',
  'Partner application not approved',
  'Your partner application could not be approved at this time. Check your email for details.',
  '{"required":[],"optional":["rejection_reason"],"properties":{"rejection_reason":{"type":"string","description":"Brief reason","maxLength":150}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- partner.commission_earned — Email + In-app
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_partner_commission_email_en_v1', NULL, 'partner.commission_earned',
  'email', 'en', 1, 'active', 'not_required',
  'Commission earned — {{commission_amount}}',
  '<h1>Commission Earned</h1>
<p>Hi {{contact_name}},</p>
<p>You have earned a commission of <strong>{{commission_amount}}</strong> from your partner activity on {{tenant_name}}.</p>
<p><strong>Source:</strong> {{commission_source}}<br>
<strong>Total pending:</strong> {{total_pending}}</p>
<p>Commissions are settled {{settlement_schedule}}.</p>',
  'View Earnings', '{{partner_dashboard_url}}',
  '{"required":["contact_name","commission_amount","commission_source","total_pending","settlement_schedule","partner_dashboard_url"],"optional":[],"properties":{"contact_name":{"type":"string","description":"Partner contact name","maxLength":100},"commission_amount":{"type":"string","description":"Commission amount earned","maxLength":30},"commission_source":{"type":"string","description":"What generated the commission","maxLength":200},"total_pending":{"type":"string","description":"Total pending commission balance","maxLength":30},"settlement_schedule":{"type":"string","description":"Settlement schedule e.g. monthly on the 1st","maxLength":100},"partner_dashboard_url":{"type":"url","description":"Partner dashboard URL"}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_partner_commission_inapp_en_v1', NULL, 'partner.commission_earned',
  'in_app', 'en', 1, 'active', 'not_required',
  'Commission earned — {{commission_amount}}',
  'You earned {{commission_amount}} in commission from {{commission_source}}.',
  'View Earnings', '{{partner_dashboard_url}}',
  '{"required":["commission_amount","commission_source","partner_dashboard_url"],"optional":[],"properties":{"commission_amount":{"type":"string","description":"Commission amount","maxLength":30},"commission_source":{"type":"string","description":"Commission source","maxLength":200},"partner_dashboard_url":{"type":"url","description":"Dashboard URL"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- partner.sub_partner_created — In-app (notify the parent partner)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_partner_subpartner_inapp_en_v1', NULL, 'partner.sub_partner_created',
  'in_app', 'en', 1, 'active', 'not_required',
  'New sub-partner joined your network',
  '{{sub_partner_name}} has joined as a sub-partner under your network.',
  '{"required":["sub_partner_name"],"optional":["sub_partner_tier"],"properties":{"sub_partner_name":{"type":"string","description":"Sub-partner business name","maxLength":150},"sub_partner_tier":{"type":"string","description":"Sub-partner tier","maxLength":50}}}',
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
  ('rule_partner_app_approved_v1', NULL, 'partner.application_approved',
   'Partner application approved welcome', 1, 'actor',
   '["email","in_app"]', 'partner.application_approved', 'high', 0, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_partner_app_rejected_v1', NULL, 'partner.application_rejected',
   'Partner application rejected', 1, 'actor',
   '["email","in_app"]', 'partner.application_rejected', 'normal', 0, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_partner_commission_v1', NULL, 'partner.commission_earned',
   'Partner commission earned notification', 1, 'actor',
   '["email","in_app"]', 'partner.commission_earned', 'normal', 1, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_partner_subpartner_v1', NULL, 'partner.sub_partner_created',
   'Sub-partner created notification', 1, 'actor',
   '["in_app"]', 'partner.sub_partner_created', 'low', 1, 'info', NULL,
   unixepoch(), unixepoch());
