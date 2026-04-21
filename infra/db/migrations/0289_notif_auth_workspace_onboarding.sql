-- Migration: 0289_notif_auth_workspace_onboarding
-- Description: New notification templates + rules for auth user lifecycle,
--   workspace lifecycle, and onboarding events not covered by 0268/0276.
--
-- New template families:
--   auth.email_verified, auth.password_changed,
--   workspace.activated, workspace.suspended, workspace.member_removed,
--   workspace.role_changed, workspace.plan_upgraded, workspace.plan_downgraded,
--   onboarding.stalled
--
-- G14: variables_schema validates all caller-supplied variables.
-- N-039: unsubscribe_url, tenant_name, platform_name injected at render time.

-- ──────────────────────────────────────────────────────────────────────────────
-- auth.email_verified — In-app (user is already in the app when they verify)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_auth_emailverified_inapp_en_v1', NULL, 'auth.email_verified',
  'in_app', 'en', 1, 'active', 'not_required',
  'Email verified successfully',
  'Your email address has been verified. Your account is fully active.',
  'Go to Dashboard', '/dashboard',
  '{"required":[],"optional":[],"properties":{}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- auth.password_changed — Email + SMS (security confirmation)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_auth_pwchanged_email_en_v1', NULL, 'auth.password_changed',
  'email', 'en', 1, 'active', 'not_required',
  'Your {{tenant_name}} password was changed',
  '<h1>Password Changed</h1>
<p>Hi {{user_name}}, your account password was successfully changed.</p>
<p>If you did not make this change, please contact support immediately and reset your password.</p>',
  '{"required":["user_name"],"optional":["support_email"],"properties":{"user_name":{"type":"string","description":"User full name","maxLength":100},"support_email":{"type":"string","description":"Support contact email","maxLength":254}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, body_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_auth_pwchanged_sms_en_v1', NULL, 'auth.password_changed',
  'sms', 'en', 1, 'active', 'not_required',
  '{{tenant_name}}: Your password was just changed. If this was not you, contact support immediately.',
  '{"required":[],"optional":["support_phone"],"properties":{"support_phone":{"type":"string","description":"Support phone number","maxLength":20}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- workspace.activated — Email + In-app
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template, preheader_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_ws_activated_email_en_v1', NULL, 'workspace.activated',
  'email', 'en', 1, 'active', 'not_required',
  'Your workspace is now active — {{workspace_name}}',
  '<h1>Workspace Active</h1>
<p>Hi {{user_name}},</p>
<p>Your workspace <strong>{{workspace_name}}</strong> on {{tenant_name}} is now active and ready to use.</p>
<p>Your current plan: <strong>{{plan_name}}</strong>.</p>',
  'Your workspace {{workspace_name}} is ready.',
  'Go to Dashboard', '{{dashboard_url}}',
  '{"required":["user_name","workspace_name","plan_name","dashboard_url"],"optional":[],"properties":{"user_name":{"type":"string","description":"Admin full name","maxLength":100},"workspace_name":{"type":"string","description":"Workspace name","maxLength":150},"plan_name":{"type":"string","description":"Current plan name","maxLength":50},"dashboard_url":{"type":"url","description":"Dashboard URL"}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_ws_activated_inapp_en_v1', NULL, 'workspace.activated',
  'in_app', 'en', 1, 'active', 'not_required',
  'Workspace activated: {{workspace_name}}',
  'Your workspace {{workspace_name}} is now active. Start exploring your dashboard.',
  'Open Dashboard', '{{dashboard_url}}',
  '{"required":["workspace_name","dashboard_url"],"optional":[],"properties":{"workspace_name":{"type":"string","description":"Workspace name","maxLength":150},"dashboard_url":{"type":"url","description":"Dashboard URL"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- workspace.suspended — Email + In-app (critical — access is revoked)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_ws_suspended_email_en_v1', NULL, 'workspace.suspended',
  'email', 'en', 1, 'active', 'not_required',
  '⚠ Your workspace has been suspended — {{workspace_name}}',
  '<h1>Workspace Suspended</h1>
<p>Hi {{user_name}},</p>
<p>Your workspace <strong>{{workspace_name}}</strong> has been suspended.</p>
<p><strong>Reason:</strong> {{reason}}</p>
<p>To restore access, please {{action_required}}. If you believe this is an error, contact support.</p>',
  'Restore Access', '{{billing_url}}',
  '{"required":["user_name","workspace_name","reason","action_required","billing_url"],"optional":["support_email"],"properties":{"user_name":{"type":"string","description":"Admin full name","maxLength":100},"workspace_name":{"type":"string","description":"Workspace name","maxLength":150},"reason":{"type":"string","description":"Suspension reason e.g. unpaid invoice","maxLength":200},"action_required":{"type":"string","description":"Action text e.g. update your payment details","maxLength":200},"billing_url":{"type":"url","description":"Billing page URL"},"support_email":{"type":"string","description":"Support email","maxLength":254}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_ws_suspended_inapp_en_v1', NULL, 'workspace.suspended',
  'in_app', 'en', 1, 'active', 'not_required',
  'Workspace suspended: {{workspace_name}}',
  'Your workspace {{workspace_name}} has been suspended. Tap to resolve.',
  'Resolve Now', '{{billing_url}}',
  '{"required":["workspace_name","billing_url"],"optional":["reason"],"properties":{"workspace_name":{"type":"string","description":"Workspace name","maxLength":150},"billing_url":{"type":"url","description":"Billing page URL"},"reason":{"type":"string","description":"Brief suspension reason","maxLength":100}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- workspace.member_removed — In-app (notify the removed member)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_ws_member_removed_inapp_en_v1', NULL, 'workspace.member_removed',
  'in_app', 'en', 1, 'active', 'not_required',
  'You have been removed from {{workspace_name}}',
  'You have been removed from the workspace {{workspace_name}} on {{tenant_name}}.',
  '{"required":["workspace_name"],"optional":[],"properties":{"workspace_name":{"type":"string","description":"Workspace name","maxLength":150}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- workspace.role_changed — In-app (notify the member whose role changed)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_ws_role_changed_inapp_en_v1', NULL, 'workspace.role_changed',
  'in_app', 'en', 1, 'active', 'not_required',
  'Your role in {{workspace_name}} has been updated',
  'Your role in {{workspace_name}} has been changed to <strong>{{new_role}}</strong>.',
  '{"required":["workspace_name","new_role"],"optional":["old_role"],"properties":{"workspace_name":{"type":"string","description":"Workspace name","maxLength":150},"new_role":{"type":"string","description":"New role name","maxLength":50},"old_role":{"type":"string","description":"Previous role name","maxLength":50}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- workspace.plan_upgraded — Email + In-app
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template, preheader_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_ws_plan_upgraded_email_en_v1', NULL, 'workspace.plan_upgraded',
  'email', 'en', 1, 'active', 'not_required',
  'You''ve upgraded to {{new_plan}} on {{tenant_name}}',
  '<h1>Plan Upgraded</h1>
<p>Hi {{user_name}},</p>
<p>Your workspace <strong>{{workspace_name}}</strong> has been upgraded from <strong>{{old_plan}}</strong> to <strong>{{new_plan}}</strong>.</p>
<p>Your new features are active immediately. Enjoy the upgrade!</p>',
  'You are now on the {{new_plan}} plan.',
  'Explore New Features', '{{dashboard_url}}',
  '{"required":["user_name","workspace_name","old_plan","new_plan","dashboard_url"],"optional":[],"properties":{"user_name":{"type":"string","description":"Admin full name","maxLength":100},"workspace_name":{"type":"string","description":"Workspace name","maxLength":150},"old_plan":{"type":"string","description":"Previous plan name","maxLength":50},"new_plan":{"type":"string","description":"New plan name","maxLength":50},"dashboard_url":{"type":"url","description":"Dashboard URL"}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_ws_plan_upgraded_inapp_en_v1', NULL, 'workspace.plan_upgraded',
  'in_app', 'en', 1, 'active', 'not_required',
  'Upgraded to {{new_plan}}',
  'Your workspace {{workspace_name}} is now on the {{new_plan}} plan. New features are active.',
  'Explore Features', '{{dashboard_url}}',
  '{"required":["workspace_name","new_plan","dashboard_url"],"optional":[],"properties":{"workspace_name":{"type":"string","description":"Workspace name","maxLength":150},"new_plan":{"type":"string","description":"New plan name","maxLength":50},"dashboard_url":{"type":"url","description":"Dashboard URL"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- workspace.plan_downgraded — Email + In-app
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_ws_plan_downgraded_email_en_v1', NULL, 'workspace.plan_downgraded',
  'email', 'en', 1, 'active', 'not_required',
  'Your {{tenant_name}} plan has changed to {{new_plan}}',
  '<h1>Plan Changed</h1>
<p>Hi {{user_name}},</p>
<p>Your workspace <strong>{{workspace_name}}</strong> has moved from <strong>{{old_plan}}</strong> to <strong>{{new_plan}}</strong>.</p>
<p>Some features may no longer be available. Upgrade anytime to restore full access.</p>',
  'Upgrade Plan', '{{billing_url}}',
  '{"required":["user_name","workspace_name","old_plan","new_plan","billing_url"],"optional":[],"properties":{"user_name":{"type":"string","description":"Admin full name","maxLength":100},"workspace_name":{"type":"string","description":"Workspace name","maxLength":150},"old_plan":{"type":"string","description":"Previous plan","maxLength":50},"new_plan":{"type":"string","description":"New plan","maxLength":50},"billing_url":{"type":"url","description":"Billing/upgrade page URL"}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_ws_plan_downgraded_inapp_en_v1', NULL, 'workspace.plan_downgraded',
  'in_app', 'en', 1, 'active', 'not_required',
  'Plan changed to {{new_plan}}',
  'Your workspace {{workspace_name}} is now on {{new_plan}}. Some features may be limited.',
  'Upgrade Plan', '{{billing_url}}',
  '{"required":["workspace_name","new_plan","billing_url"],"optional":[],"properties":{"workspace_name":{"type":"string","description":"Workspace name","maxLength":150},"new_plan":{"type":"string","description":"New plan","maxLength":50},"billing_url":{"type":"url","description":"Upgrade page URL"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- onboarding.stalled — Email + In-app (re-engagement nudge)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template, preheader_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_onboarding_stalled_email_en_v1', NULL, 'onboarding.stalled',
  'email', 'en', 1, 'active', 'not_required',
  'Your {{tenant_name}} setup is almost done — finish in 2 minutes',
  '<h1>Almost there, {{user_name}}!</h1>
<p>You started setting up your workspace on {{tenant_name}} but haven''t completed your profile yet.</p>
<p>It only takes 2 minutes to finish. Click below to pick up where you left off.</p>
<p>If you need help, our support team is ready to assist.</p>',
  'Your setup is almost done — finish in 2 minutes.',
  'Complete Setup', '{{onboarding_url}}',
  '{"required":["user_name","onboarding_url"],"optional":["support_email","stalled_step"],"properties":{"user_name":{"type":"string","description":"User full name","maxLength":100},"onboarding_url":{"type":"url","description":"Onboarding continuation URL"},"support_email":{"type":"string","description":"Support email","maxLength":254},"stalled_step":{"type":"string","description":"The step where the user stopped","maxLength":100}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_onboarding_stalled_inapp_en_v1', NULL, 'onboarding.stalled',
  'in_app', 'en', 1, 'active', 'not_required',
  'Complete your setup',
  'You haven''t finished setting up your workspace. Tap to continue — it only takes 2 minutes.',
  'Continue Setup', '{{onboarding_url}}',
  '{"required":["onboarding_url"],"optional":["stalled_step"],"properties":{"onboarding_url":{"type":"url","description":"Onboarding continuation URL"},"stalled_step":{"type":"string","description":"The step where the user stopped","maxLength":100}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- NOTIFICATION RULES for this migration's new template families
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_rule (
  id, tenant_id, event_key, rule_name, enabled, audience_type,
  channels, template_family, priority, digest_eligible, min_severity, feature_flag,
  created_at, updated_at
) VALUES
  ('rule_auth_email_verified_v1', NULL, 'auth.user.email_verified',
   'Email verified confirmation', 1, 'actor',
   '["in_app"]', 'auth.email_verified', 'normal', 0, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_auth_pw_changed_v1', NULL, 'auth.user.password_changed',
   'Password changed security confirmation', 1, 'actor',
   '["email","sms"]', 'auth.password_changed', 'high', 0, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_ws_activated_v1', NULL, 'workspace.activated',
   'Workspace activated welcome', 1, 'workspace_admins',
   '["email","in_app"]', 'workspace.activated', 'normal', 0, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_ws_suspended_v1', NULL, 'workspace.suspended',
   'Workspace suspended alert', 1, 'workspace_admins',
   '["email","in_app"]', 'workspace.suspended', 'critical', 0, 'critical', NULL,
   unixepoch(), unixepoch()),

  ('rule_ws_member_removed_v1', NULL, 'workspace.member_removed',
   'Member removed from workspace', 1, 'subject',
   '["in_app"]', 'workspace.member_removed', 'normal', 0, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_ws_role_changed_v1', NULL, 'workspace.role_changed',
   'Member role updated in workspace', 1, 'subject',
   '["in_app"]', 'workspace.role_changed', 'normal', 0, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_ws_plan_upgraded_v1', NULL, 'workspace.plan_upgraded',
   'Workspace plan upgraded', 1, 'actor',
   '["email","in_app"]', 'workspace.plan_upgraded', 'normal', 0, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_ws_plan_downgraded_v1', NULL, 'workspace.plan_downgraded',
   'Workspace plan downgraded', 1, 'actor',
   '["email","in_app"]', 'workspace.plan_downgraded', 'high', 0, 'warning', NULL,
   unixepoch(), unixepoch()),

  ('rule_onboarding_stalled_v1', NULL, 'onboarding.stalled',
   'Onboarding stalled re-engagement nudge', 1, 'actor',
   '["email","in_app"]', 'onboarding.stalled', 'normal', 0, 'info', NULL,
   unixepoch(), unixepoch());
