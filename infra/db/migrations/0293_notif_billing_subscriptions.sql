-- Migration: 0293_notif_billing_subscriptions
-- Description: Notification templates + rules for billing subscription lifecycle events.
--   These are separate from core payment events (covered in 0268/0288).
--
-- New template families:
--   billing.subscription_created, billing.subscription_renewed,
--   billing.subscription_cancelled, billing.trial_ending,
--   billing.trial_expired, billing.refund_issued

-- ──────────────────────────────────────────────────────────────────────────────
-- billing.subscription_created — Email + In-app (welcome to paid plan)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template, preheader_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_billing_sub_created_email_en_v1', NULL, 'billing.subscription_created',
  'email', 'en', 1, 'active', 'not_required',
  'Welcome to {{plan_name}} on {{tenant_name}}',
  '<h1>Subscription Active</h1>
<p>Hi {{user_name}},</p>
<p>Your <strong>{{plan_name}}</strong> subscription on {{tenant_name}} is now active.</p>
<p><strong>Billing cycle:</strong> {{billing_cycle}}<br>
<strong>Amount:</strong> {{amount_formatted}}<br>
<strong>Next renewal:</strong> {{next_renewal_date}}</p>
<p>Thank you for choosing {{tenant_name}}!</p>',
  'Your {{plan_name}} subscription is now active.',
  'Go to Dashboard', '{{dashboard_url}}',
  '{"required":["user_name","plan_name","billing_cycle","amount_formatted","next_renewal_date","dashboard_url"],"optional":[],"properties":{"user_name":{"type":"string","description":"User full name","maxLength":100},"plan_name":{"type":"string","description":"Plan name","maxLength":50},"billing_cycle":{"type":"string","description":"e.g. Monthly, Annual","maxLength":20},"amount_formatted":{"type":"string","description":"Formatted amount","maxLength":30},"next_renewal_date":{"type":"string","description":"Next renewal date","maxLength":30},"dashboard_url":{"type":"url","description":"Dashboard URL"}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_billing_sub_created_inapp_en_v1', NULL, 'billing.subscription_created',
  'in_app', 'en', 1, 'active', 'not_required',
  '{{plan_name}} subscription is active',
  'Your {{plan_name}} plan is now active. Explore all your features.',
  'Open Dashboard', '{{dashboard_url}}',
  '{"required":["plan_name","dashboard_url"],"optional":[],"properties":{"plan_name":{"type":"string","description":"Plan name","maxLength":50},"dashboard_url":{"type":"url","description":"Dashboard URL"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- billing.subscription_renewed — Email + In-app
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_billing_sub_renewed_email_en_v1', NULL, 'billing.subscription_renewed',
  'email', 'en', 1, 'active', 'not_required',
  'Subscription renewed — {{plan_name}}',
  '<h1>Subscription Renewed</h1>
<p>Hi {{user_name}},</p>
<p>Your <strong>{{plan_name}}</strong> subscription has been automatically renewed.</p>
<p><strong>Amount charged:</strong> {{amount_formatted}}<br>
<strong>Next renewal:</strong> {{next_renewal_date}}</p>',
  '{"required":["user_name","plan_name","amount_formatted","next_renewal_date"],"optional":["receipt_url"],"properties":{"user_name":{"type":"string","description":"User full name","maxLength":100},"plan_name":{"type":"string","description":"Plan name","maxLength":50},"amount_formatted":{"type":"string","description":"Amount charged","maxLength":30},"next_renewal_date":{"type":"string","description":"Next renewal date","maxLength":30},"receipt_url":{"type":"url","description":"Receipt URL"}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_billing_sub_renewed_inapp_en_v1', NULL, 'billing.subscription_renewed',
  'in_app', 'en', 1, 'active', 'not_required',
  '{{plan_name}} renewed',
  'Your {{plan_name}} subscription has been renewed. Next renewal: {{next_renewal_date}}.',
  '{"required":["plan_name","next_renewal_date"],"optional":[],"properties":{"plan_name":{"type":"string","description":"Plan name","maxLength":50},"next_renewal_date":{"type":"string","description":"Next renewal date","maxLength":30}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- billing.subscription_cancelled — Email + In-app
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_billing_sub_cancelled_email_en_v1', NULL, 'billing.subscription_cancelled',
  'email', 'en', 1, 'active', 'not_required',
  'Your {{tenant_name}} subscription has been cancelled',
  '<h1>Subscription Cancelled</h1>
<p>Hi {{user_name}},</p>
<p>Your <strong>{{plan_name}}</strong> subscription has been cancelled.</p>
<p>Your access will remain active until <strong>{{access_end_date}}</strong>. After that, your workspace will be downgraded to the free tier.</p>
<p>We are sorry to see you go. If you change your mind, you can reactivate any time.</p>',
  'Reactivate', '{{billing_url}}',
  '{"required":["user_name","plan_name","access_end_date","billing_url"],"optional":["cancellation_reason"],"properties":{"user_name":{"type":"string","description":"User full name","maxLength":100},"plan_name":{"type":"string","description":"Plan name","maxLength":50},"access_end_date":{"type":"string","description":"Date access ends","maxLength":30},"billing_url":{"type":"url","description":"Billing reactivation URL"},"cancellation_reason":{"type":"string","description":"Optional cancellation reason","maxLength":200}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_billing_sub_cancelled_inapp_en_v1', NULL, 'billing.subscription_cancelled',
  'in_app', 'en', 1, 'active', 'not_required',
  'Subscription cancelled',
  'Your {{plan_name}} subscription has been cancelled. Access continues until {{access_end_date}}.',
  'Reactivate', '{{billing_url}}',
  '{"required":["plan_name","access_end_date","billing_url"],"optional":[],"properties":{"plan_name":{"type":"string","description":"Plan name","maxLength":50},"access_end_date":{"type":"string","description":"Date access ends","maxLength":30},"billing_url":{"type":"url","description":"Billing URL"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- billing.trial_ending — Email + In-app (7-day advance warning)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template, preheader_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_billing_trial_ending_email_en_v1', NULL, 'billing.trial_ending',
  'email', 'en', 1, 'active', 'not_required',
  'Your {{tenant_name}} trial ends in {{days_remaining}} days',
  '<h1>Trial Ending Soon</h1>
<p>Hi {{user_name}},</p>
<p>Your free trial on {{tenant_name}} ends in <strong>{{days_remaining}} days</strong> ({{trial_end_date}}).</p>
<p>To keep all your features and data, upgrade to a paid plan before your trial expires.</p>',
  'Your trial ends in {{days_remaining}} days — upgrade to keep access.',
  'Upgrade Now', '{{billing_url}}',
  '{"required":["user_name","days_remaining","trial_end_date","billing_url"],"optional":["plan_name"],"properties":{"user_name":{"type":"string","description":"User full name","maxLength":100},"days_remaining":{"type":"number","description":"Days remaining in trial"},"trial_end_date":{"type":"string","description":"Trial expiry date","maxLength":30},"billing_url":{"type":"url","description":"Billing/upgrade page URL"},"plan_name":{"type":"string","description":"Recommended plan name","maxLength":50}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_billing_trial_ending_inapp_en_v1', NULL, 'billing.trial_ending',
  'in_app', 'en', 1, 'active', 'not_required',
  'Trial ends in {{days_remaining}} days',
  'Your free trial expires in {{days_remaining}} days. Upgrade now to keep your data and features.',
  'Upgrade', '{{billing_url}}',
  '{"required":["days_remaining","billing_url"],"optional":[],"properties":{"days_remaining":{"type":"number","description":"Days remaining"},"billing_url":{"type":"url","description":"Billing URL"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- billing.trial_expired — Email + In-app
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_billing_trial_expired_email_en_v1', NULL, 'billing.trial_expired',
  'email', 'en', 1, 'active', 'not_required',
  'Your {{tenant_name}} trial has ended',
  '<h1>Trial Expired</h1>
<p>Hi {{user_name}},</p>
<p>Your free trial on {{tenant_name}} has expired. Your workspace has been moved to the free tier.</p>
<p>Upgrade to a paid plan to restore full access to your data and features. Your data is safe and ready whenever you are.</p>',
  'Upgrade Now', '{{billing_url}}',
  '{"required":["user_name","billing_url"],"optional":["data_retention_days"],"properties":{"user_name":{"type":"string","description":"User full name","maxLength":100},"billing_url":{"type":"url","description":"Billing/upgrade URL"},"data_retention_days":{"type":"number","description":"How long data will be retained"}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_billing_trial_expired_inapp_en_v1', NULL, 'billing.trial_expired',
  'in_app', 'en', 1, 'active', 'not_required',
  'Trial expired — upgrade to continue',
  'Your free trial has ended. Upgrade now to restore full access.',
  'Upgrade', '{{billing_url}}',
  '{"required":["billing_url"],"optional":[],"properties":{"billing_url":{"type":"url","description":"Billing URL"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- billing.refund_issued — Email + In-app
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_billing_refund_email_en_v1', NULL, 'billing.refund_issued',
  'email', 'en', 1, 'active', 'not_required',
  'Refund issued — {{amount_formatted}}',
  '<h1>Refund Issued</h1>
<p>Hi {{user_name}},</p>
<p>A refund of <strong>{{amount_formatted}}</strong> has been issued to your original payment method.</p>
<p><strong>Reference:</strong> {{refund_ref}}<br>
<strong>Processing time:</strong> {{processing_days}} business days</p>',
  '{"required":["user_name","amount_formatted","refund_ref","processing_days"],"optional":["reason"],"properties":{"user_name":{"type":"string","description":"User full name","maxLength":100},"amount_formatted":{"type":"string","description":"Refund amount formatted","maxLength":30},"refund_ref":{"type":"string","description":"Refund reference number","maxLength":100},"processing_days":{"type":"number","description":"Days for refund to arrive"},"reason":{"type":"string","description":"Reason for refund","maxLength":200}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_billing_refund_inapp_en_v1', NULL, 'billing.refund_issued',
  'in_app', 'en', 1, 'active', 'not_required',
  'Refund of {{amount_formatted}} issued',
  'A refund of {{amount_formatted}} has been issued. Allow {{processing_days}} business days to arrive.',
  '{"required":["amount_formatted","processing_days"],"optional":["refund_ref"],"properties":{"amount_formatted":{"type":"string","description":"Refund amount","maxLength":30},"processing_days":{"type":"number","description":"Days for refund to arrive"},"refund_ref":{"type":"string","description":"Refund reference","maxLength":100}}}',
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
  ('rule_billing_sub_created_v1', NULL, 'billing.subscription_created',
   'Subscription created welcome', 1, 'workspace_admins',
   '["email","in_app"]', 'billing.subscription_created', 'normal', 0, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_billing_sub_renewed_v1', NULL, 'billing.subscription_renewed',
   'Subscription renewed confirmation', 1, 'workspace_admins',
   '["email","in_app"]', 'billing.subscription_renewed', 'low', 1, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_billing_sub_cancelled_v1', NULL, 'billing.subscription_cancelled',
   'Subscription cancelled notification', 1, 'workspace_admins',
   '["email","in_app"]', 'billing.subscription_cancelled', 'high', 0, 'warning', NULL,
   unixepoch(), unixepoch()),

  ('rule_billing_trial_ending_v1', NULL, 'billing.trial_ending',
   'Trial ending soon reminder', 1, 'workspace_admins',
   '["email","in_app"]', 'billing.trial_ending', 'high', 0, 'warning', NULL,
   unixepoch(), unixepoch()),

  ('rule_billing_trial_expired_v1', NULL, 'billing.trial_expired',
   'Trial expired downgrade notice', 1, 'workspace_admins',
   '["email","in_app"]', 'billing.trial_expired', 'high', 0, 'warning', NULL,
   unixepoch(), unixepoch()),

  ('rule_billing_refund_v1', NULL, 'billing.refund_issued',
   'Refund issued confirmation', 1, 'actor',
   '["email","in_app"]', 'billing.refund_issued', 'normal', 0, 'info', NULL,
   unixepoch(), unixepoch());
