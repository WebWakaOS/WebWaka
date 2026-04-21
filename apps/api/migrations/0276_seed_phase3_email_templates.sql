-- Migration: 0276_seed_phase3_email_templates
-- Description: Seed platform-level notification templates missing from 0268 (N-040, Phase 3).
--   Adds: auth.workspace_invite, auth.email_verification, billing.template_purchase_receipt.
--
-- 0268 already seeded: auth.welcome, auth.password_reset, auth.account_locked,
--   billing.payment_success, billing.payment_failed, bank_transfer.receipt,
--   ai.budget_warning, system.provider_down.
--
-- Template notes:
--   {{tenant_name}}, {{unsubscribe_url}} are RESERVED — injected at render time by
--   TemplateRenderer (N-030) and never stored as variables_schema properties.
--   variables_schema only lists caller-supplied variables.
--
-- G14: variables_schema governs required/optional variable validation (fail-loud).
-- G17 (OQ-003): whatsapp_approval_status = 'not_required' for non-WhatsApp channels.
-- All body_template values use {{variable_name}} Handlebars syntax.

-- ──────────────────────────────────────────────────────────────────────────────
-- auth.workspace_invite — Email (maps to legacy workspace-invite EmailService template)
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
  'tpl_notif_auth_wsinvite_email_en_v1',
  NULL,
  'auth.workspace_invite',
  'email',
  'en',
  1,
  'active',
  'not_required',
  'You''ve been invited to join {{workspace_name}} on {{tenant_name}}',
  '<h1>You''ve been invited!</h1>
<p>Hi {{invitee_name}},</p>
<p><strong>{{inviter_name}}</strong> has invited you to join the workspace <strong>{{workspace_name}}</strong> on {{tenant_name}}.</p>
<p>Click the button below to accept the invitation. This invitation expires in {{expiry_hours}} hours.</p>
<p>If you do not have an account yet, you will be prompted to create one.</p>
<p>If you did not expect this invitation, you can safely ignore this email.</p>',
  'You''ve been invited to {{workspace_name}} — accept before it expires.',
  'Accept Invitation',
  '{{invite_url}}',
  '{"required":["invitee_name","inviter_name","workspace_name","invite_url","expiry_hours"],"optional":["support_email"],"properties":{"invitee_name":{"type":"string","description":"Full name of the invited person","maxLength":100},"inviter_name":{"type":"string","description":"Full name of the person who sent the invite","maxLength":100},"workspace_name":{"type":"string","description":"Name of the workspace being joined","maxLength":150},"invite_url":{"type":"url","description":"Signed invitation acceptance URL (HTTPS only)"},"expiry_hours":{"type":"number","description":"Hours until the invitation link expires"},"support_email":{"type":"string","description":"Support email address for questions","maxLength":254}}}',
  unixepoch(), unixepoch()
);

-- auth.workspace_invite — In-app notification
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_notif_auth_wsinvite_inapp_en_v1',
  NULL, 'auth.workspace_invite', 'in_app', 'en', 1, 'active', 'not_required',
  'You''ve been invited to join {{workspace_name}}',
  '{{inviter_name}} has invited you to join {{workspace_name}}. Tap to accept.',
  'Accept Invitation', '{{invite_url}}',
  '{"required":["inviter_name","workspace_name","invite_url"],"optional":[],"properties":{"inviter_name":{"type":"string","description":"Full name of the person who sent the invite","maxLength":100},"workspace_name":{"type":"string","description":"Workspace name","maxLength":150},"invite_url":{"type":"url","description":"Invitation acceptance URL"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- auth.email_verification — Email (standalone verification — not part of auth.welcome flow)
-- Used when user requests a new verification email after registration.
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
  'tpl_notif_auth_emailverify_email_en_v1',
  NULL,
  'auth.email_verification',
  'email',
  'en',
  1,
  'active',
  'not_required',
  'Verify your email address — {{tenant_name}}',
  '<h1>Verify your email</h1>
<p>Hi {{user_name}},</p>
<p>Please verify your email address to complete your registration on {{tenant_name}}. Click the button below — this link expires in {{expiry_hours}} hours.</p>
<p>If you did not create an account, you can safely ignore this email.</p>',
  'Verify your email to activate your account.',
  'Verify Email',
  '{{email_verification_url}}',
  '{"required":["user_name","email_verification_url","expiry_hours"],"optional":["support_email"],"properties":{"user_name":{"type":"string","description":"Full name of the user","maxLength":100},"email_verification_url":{"type":"url","description":"Email verification link (signed JWT)"},"expiry_hours":{"type":"number","description":"Hours until verification link expires"},"support_email":{"type":"string","description":"Support email address","maxLength":254}}}',
  unixepoch(), unixepoch()
);

-- auth.email_verification — In-app notification
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_notif_auth_emailverify_inapp_en_v1',
  NULL, 'auth.email_verification', 'in_app', 'en', 1, 'active', 'not_required',
  'Please verify your email address',
  'Tap to verify your email address and unlock your account on {{tenant_name}}.',
  'Verify Email', '{{email_verification_url}}',
  '{"required":["email_verification_url"],"optional":[],"properties":{"email_verification_url":{"type":"url","description":"Email verification URL"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- billing.template_purchase_receipt — Email (maps to legacy template-purchase-receipt)
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
  'tpl_notif_billing_tplreceipt_email_en_v1',
  NULL,
  'billing.template_purchase_receipt',
  'email',
  'en',
  1,
  'active',
  'not_required',
  'Your template purchase receipt — {{template_name}}',
  '<h1>Purchase Receipt</h1>
<p>Hi {{buyer_name}},</p>
<p>Thank you for purchasing <strong>{{template_name}}</strong> from the {{tenant_name}} marketplace.</p>
<table cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:480px;">
  <tr><td><strong>Template</strong></td><td>{{template_name}}</td></tr>
  <tr><td><strong>Category</strong></td><td>{{template_category}}</td></tr>
  <tr><td><strong>Amount Paid</strong></td><td>{{amount_display}}</td></tr>
  <tr><td><strong>Reference</strong></td><td>{{transaction_reference}}</td></tr>
  <tr><td><strong>Date</strong></td><td>{{purchase_date}}</td></tr>
</table>
<p>You can now install and use your purchased template from your dashboard.</p>',
  'Receipt for your purchase of {{template_name}}.',
  'View in Dashboard',
  '{{dashboard_url}}',
  '{"required":["buyer_name","template_name","template_category","amount_display","transaction_reference","purchase_date","dashboard_url"],"optional":["support_email"],"properties":{"buyer_name":{"type":"string","description":"Full name of the purchaser","maxLength":100},"template_name":{"type":"string","description":"Name of the purchased template","maxLength":150},"template_category":{"type":"string","description":"Template category or vertical","maxLength":80},"amount_display":{"type":"string","description":"Formatted amount with currency symbol (e.g. ₦1,500)","maxLength":30},"transaction_reference":{"type":"string","description":"Unique transaction reference number","maxLength":100},"purchase_date":{"type":"string","description":"Formatted purchase date string","maxLength":50},"dashboard_url":{"type":"url","description":"Link to the user''s dashboard or template library"},"support_email":{"type":"string","description":"Support email for purchase queries","maxLength":254}}}',
  unixepoch(), unixepoch()
);

-- billing.template_purchase_receipt — In-app
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_notif_billing_tplreceipt_inapp_en_v1',
  NULL, 'billing.template_purchase_receipt', 'in_app', 'en', 1, 'active', 'not_required',
  'Purchase successful: {{template_name}}',
  'You purchased {{template_name}} for {{amount_display}}. It is now available in your template library.',
  'Open Template Library', '{{dashboard_url}}',
  '{"required":["template_name","amount_display","dashboard_url"],"optional":[],"properties":{"template_name":{"type":"string","description":"Name of the purchased template","maxLength":150},"amount_display":{"type":"string","description":"Formatted purchase amount with currency","maxLength":30},"dashboard_url":{"type":"url","description":"Link to template library"}}}',
  unixepoch(), unixepoch()
);
