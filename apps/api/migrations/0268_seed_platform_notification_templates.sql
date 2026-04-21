-- Migration: 0268_seed_platform_notification_templates
-- Description: Seed platform-level notification templates (tenant_id IS NULL).
--   These are the canonical template families for Phase 1 launch.
--   Active English (en) channel stubs only — locales ha/yo/ig/pcm/fr seeded in Phase 8 (N-116).
--   WhatsApp templates require Meta approval (N-040); seeded as 'draft' + 'pending_meta_approval'.
--
-- All body_template values use Handlebars syntax:
--   {{variable_name}} — HTML-escaped (email)
--   {{variable_name}} — plain text (SMS, push)
--   Reserved injected vars: {{tenant_name}}, {{platform_name}}, {{platform_logo_url}}, {{unsubscribe_url}}
--
-- N-039: unsubscribe_url injected at render time (signed JWT, not stored).
-- G14: variables_schema validates all variables before render.
-- G17 (OQ-003): free-plan tenants get attribution footer injected by renderer.

-- ──────────────────────────────────────────────────────────────────────────────
-- auth.welcome — Welcome email
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template,
  body_template,
  preheader_template,
  cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_notif_auth_welcome_email_en_v1',
  NULL,
  'auth.welcome',
  'email',
  'en',
  1,
  'active',
  'not_required',
  'Welcome to {{tenant_name}} — let''s get started',
  '<h1>Welcome, {{user_name}}!</h1>
<p>Your account on {{tenant_name}} is ready. Click below to verify your email address and start using the platform.</p>
<p>If you did not sign up for this account, you can safely ignore this email.</p>',
  'Your account is ready — verify your email to get started.',
  'Verify Email',
  '{{email_verification_url}}',
  '{"required":["user_name","email_verification_url"],"optional":["support_email"],"properties":{"user_name":{"type":"string","description":"Full name of the new user","maxLength":100},"email_verification_url":{"type":"url","description":"Email verification link (signed JWT, 24h TTL)"},"support_email":{"type":"string","description":"Support email address","maxLength":254}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- auth.welcome — In-app variant
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_notif_auth_welcome_inapp_en_v1',
  NULL, 'auth.welcome', 'in_app', 'en', 1, 'active', 'not_required',
  'Welcome to {{tenant_name}}!',
  'Hi {{user_name}}, your account is ready. Verify your email to unlock full access.',
  'Verify Email', '{{email_verification_url}}',
  '{"required":["user_name","email_verification_url"],"optional":[],"properties":{"user_name":{"type":"string","description":"Full name of the new user","maxLength":100},"email_verification_url":{"type":"url","description":"Email verification link"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- auth.password_reset — Email
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, preheader_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_notif_auth_pwreset_email_en_v1',
  NULL, 'auth.password_reset', 'email', 'en', 1, 'active', 'not_required',
  'Reset your {{tenant_name}} password',
  '<h1>Password Reset</h1>
<p>Hi {{user_name}}, we received a request to reset your password. Click the button below to set a new password. This link expires in {{expiry_hours}} hours.</p>
<p>If you did not request a password reset, please ignore this email — your account is secure.</p>',
  'Reset your password — link expires in {{expiry_hours}} hours.',
  'Reset Password',
  '{{password_reset_url}}',
  '{"required":["user_name","password_reset_url","expiry_hours"],"optional":[],"properties":{"user_name":{"type":"string","description":"User full name","maxLength":100},"password_reset_url":{"type":"url","description":"Password reset link (signed JWT)"},"expiry_hours":{"type":"number","description":"Link TTL in hours"}}}',
  unixepoch(), unixepoch()
);

-- auth.password_reset — SMS OTP variant (G5: transaction OTPs must use SMS only)
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  body_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_notif_auth_pwreset_sms_en_v1',
  NULL, 'auth.password_reset', 'sms', 'en', 1, 'active', 'not_required',
  '{{tenant_name}}: Your password reset code is {{otp_display}}. Expires in {{expiry_hours}}h. Do not share this code.',
  '{"required":["otp_display","expiry_hours"],"optional":[],"properties":{"otp_display":{"type":"string","description":"Pre-formatted OTP (e.g. 123 456). Never the raw code.","sensitive":true,"maxLength":20},"expiry_hours":{"type":"number","description":"OTP TTL in hours"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- auth.account_locked — Email + SMS (severity=critical)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_notif_auth_locked_email_en_v1',
  NULL, 'auth.account_locked', 'email', 'en', 1, 'active', 'not_required',
  '⚠ Your {{tenant_name}} account has been locked',
  '<h1>Security Alert</h1>
<p>Hi {{user_name}}, your account was temporarily locked after {{attempt_count}} failed login attempts.</p>
<p>If this was you, please wait and try again after {{locked_minutes}} minutes, or contact support at {{support_email}}.</p>
<p>If you did not make these attempts, please contact support immediately.</p>',
  '{"required":["user_name","attempt_count","locked_minutes","support_email"],"optional":[],"properties":{"user_name":{"type":"string","description":"User full name","maxLength":100},"attempt_count":{"type":"number","description":"Number of failed login attempts"},"locked_minutes":{"type":"number","description":"Minutes until auto-unlock"},"support_email":{"type":"string","description":"Support email","maxLength":254}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  body_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_notif_auth_locked_sms_en_v1',
  NULL, 'auth.account_locked', 'sms', 'en', 1, 'active', 'not_required',
  '{{tenant_name}} SECURITY: Your account was locked after {{attempt_count}} failed attempts. Contact support if this was not you.',
  '{"required":["attempt_count"],"optional":["support_phone"],"properties":{"attempt_count":{"type":"number","description":"Number of failed login attempts"},"support_phone":{"type":"string","description":"Support phone number","maxLength":20}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- billing.payment_success — Email + In-app
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, preheader_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_notif_billing_pay_success_email_en_v1',
  NULL, 'billing.payment_success', 'email', 'en', 1, 'active', 'not_required',
  'Payment confirmed — {{tenant_name}}',
  '<h1>Payment Confirmed</h1>
<p>Hi {{user_name}}, your payment of <strong>{{amount_formatted}}</strong> has been received.</p>
<p><strong>Plan:</strong> {{plan_name}}<br>
<strong>Reference:</strong> {{paystack_ref}}<br>
<strong>Date:</strong> {{payment_date}}</p>
<p>Thank you for your continued subscription.</p>',
  'Your payment of {{amount_formatted}} was successful.',
  'View Receipt',
  '{{receipt_url}}',
  '{"required":["user_name","amount_formatted","plan_name","paystack_ref","payment_date"],"optional":["receipt_url"],"properties":{"user_name":{"type":"string","description":"User full name","maxLength":100},"amount_formatted":{"type":"string","description":"Formatted amount e.g. ₦15,000.00","maxLength":30},"plan_name":{"type":"string","description":"Subscription plan name","maxLength":50},"paystack_ref":{"type":"string","description":"Paystack payment reference","maxLength":100},"payment_date":{"type":"string","description":"Human-readable payment date","maxLength":50},"receipt_url":{"type":"url","description":"Link to receipt"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- billing.payment_failed — Email + SMS + In-app
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_notif_billing_pay_failed_email_en_v1',
  NULL, 'billing.payment_failed', 'email', 'en', 1, 'active', 'not_required',
  'Action required: Payment failed for {{tenant_name}}',
  '<h1>Payment Failed</h1>
<p>Hi {{user_name}}, your payment of <strong>{{amount_formatted}}</strong> for the <strong>{{plan_name}}</strong> plan could not be processed.</p>
<p><strong>Reason:</strong> {{failure_reason}}</p>
<p>Please update your payment details to continue using {{tenant_name}} without interruption.</p>',
  'Update Payment',
  '{{billing_url}}',
  '{"required":["user_name","amount_formatted","plan_name","failure_reason","billing_url"],"optional":[],"properties":{"user_name":{"type":"string","description":"User full name","maxLength":100},"amount_formatted":{"type":"string","description":"Formatted amount","maxLength":30},"plan_name":{"type":"string","description":"Plan name","maxLength":50},"failure_reason":{"type":"string","description":"Human-readable failure reason","maxLength":200},"billing_url":{"type":"url","description":"Billing page URL"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- bank_transfer.receipt — Email + SMS + In-app (USSD bypass via G21)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, preheader_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_notif_banktransfer_receipt_email_en_v1',
  NULL, 'bank_transfer.receipt', 'email', 'en', 1, 'active', 'not_required',
  'Transfer successful — {{amount_formatted}}',
  '<h1>Transfer Successful</h1>
<p>Hi {{user_name}}, your transfer of <strong>{{amount_formatted}}</strong> to <strong>{{recipient_name}}</strong> ({{recipient_bank}}) was successful.</p>
<p><strong>Reference:</strong> {{transfer_ref}}<br>
<strong>Date:</strong> {{transfer_date}}</p>',
  'Your transfer of {{amount_formatted}} was successful.',
  '{"required":["user_name","amount_formatted","recipient_name","recipient_bank","transfer_ref","transfer_date"],"optional":[],"properties":{"user_name":{"type":"string","description":"Sender full name","maxLength":100},"amount_formatted":{"type":"string","description":"Formatted amount e.g. ₦5,000.00","maxLength":30},"recipient_name":{"type":"string","description":"Recipient name","maxLength":100},"recipient_bank":{"type":"string","description":"Recipient bank name","maxLength":100},"transfer_ref":{"type":"string","description":"Transfer reference","maxLength":100},"transfer_date":{"type":"string","description":"Human-readable date","maxLength":50}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  body_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_notif_banktransfer_receipt_sms_en_v1',
  NULL, 'bank_transfer.receipt', 'sms', 'en', 1, 'active', 'not_required',
  '{{tenant_name}}: Transfer of {{amount_formatted}} to {{recipient_name}} ({{recipient_bank}}) successful. Ref: {{transfer_ref}}.',
  '{"required":["amount_formatted","recipient_name","recipient_bank","transfer_ref"],"optional":[],"properties":{"amount_formatted":{"type":"string","description":"Formatted amount","maxLength":30},"recipient_name":{"type":"string","description":"Recipient name","maxLength":50},"recipient_bank":{"type":"string","description":"Recipient bank name","maxLength":50},"transfer_ref":{"type":"string","description":"Transfer reference","maxLength":50}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- ai.budget_warning — Email + In-app
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_notif_ai_budget_warn_email_en_v1',
  NULL, 'ai.budget_warning', 'email', 'en', 1, 'active', 'not_required',
  'AI spend alert: {{percent_used}}% of budget used',
  '<h1>AI Budget Warning</h1>
<p>Hi {{user_name}}, your workspace has used <strong>{{percent_used}}%</strong> ({{current_spend_formatted}}) of your monthly AI budget ({{budget_formatted}}).</p>
<p>At this rate, you may exhaust your budget before the end of the month. Consider upgrading your plan or reviewing AI usage.</p>',
  'Review AI Usage',
  '{{ai_usage_url}}',
  '{"required":["user_name","percent_used","current_spend_formatted","budget_formatted","ai_usage_url"],"optional":[],"properties":{"user_name":{"type":"string","description":"User full name","maxLength":100},"percent_used":{"type":"number","description":"Percentage of budget used (0-100)"},"current_spend_formatted":{"type":"string","description":"Current spend formatted e.g. ₦2,500.00","maxLength":30},"budget_formatted":{"type":"string","description":"Total budget formatted","maxLength":30},"ai_usage_url":{"type":"url","description":"Link to AI usage dashboard"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- system.provider_down — Slack + Email (super_admin alert)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_notif_system_provider_down_email_en_v1',
  NULL, 'system.provider_down', 'email', 'en', 1, 'active', 'not_required',
  '[ALERT] Notification provider down: {{provider_name}}',
  '<h1>Provider Down Alert</h1>
<p>Provider <strong>{{provider_name}}</strong> is unresponsive for channel <strong>{{channel}}</strong>.</p>
<p><strong>Reason:</strong> {{reason}}<br>
<strong>Detected at:</strong> {{detected_at}}</p>
<p>The platform sender fallback (G3) is now active for affected tenants.</p>',
  '{"required":["provider_name","channel","reason","detected_at"],"optional":["affected_tenant_count"],"properties":{"provider_name":{"type":"string","description":"Name of the failed provider","maxLength":50},"channel":{"type":"string","description":"Affected channel","maxLength":20},"reason":{"type":"string","description":"Failure reason","maxLength":300},"detected_at":{"type":"string","description":"Detection timestamp","maxLength":50},"affected_tenant_count":{"type":"number","description":"Number of tenants affected"}}}',
  unixepoch(), unixepoch()
);
