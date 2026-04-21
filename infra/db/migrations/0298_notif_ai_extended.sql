-- Migration: 0298_notif_ai_extended
-- Description: Notification templates + rules for AI/SuperAgent events not
--   covered by the existing ai.budget_warning template (0268).
--
-- New template families:
--   ai.hitl_required, ai.budget_exhausted, ai.response_failed

-- ──────────────────────────────────────────────────────────────────────────────
-- ai.hitl_required — Email + In-app (notify human reviewer / super-admin)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_ai_hitl_required_email_en_v1', NULL, 'ai.hitl_required',
  'email', 'en', 1, 'active', 'not_required',
  '[Action Required] AI request requires human review — {{request_id}}',
  '<h1>Human Review Required</h1>
<p>Hi {{reviewer_name}},</p>
<p>An AI SuperAgent request requires your review before a response can be delivered.</p>
<p><strong>Request ID:</strong> {{request_id}}<br>
<strong>Agent type:</strong> {{agent_type}}<br>
<strong>Escalation level:</strong> {{escalation_level}}<br>
<strong>Workspace:</strong> {{workspace_name}}</p>
<p>Please review and approve or reject the response within {{review_sla_hours}} hours. Requests not reviewed within this window are automatically rejected.</p>',
  'Review AI Request', '{{hitl_review_url}}',
  '{"required":["reviewer_name","request_id","agent_type","escalation_level","workspace_name","review_sla_hours","hitl_review_url"],"optional":[],"properties":{"reviewer_name":{"type":"string","description":"Reviewer full name","maxLength":100},"request_id":{"type":"string","description":"AI request ID","maxLength":100},"agent_type":{"type":"string","description":"Agent type e.g. advisory, claims","maxLength":50},"escalation_level":{"type":"string","description":"L1, L2, or L3","maxLength":10},"workspace_name":{"type":"string","description":"Requesting workspace name","maxLength":150},"review_sla_hours":{"type":"number","description":"SLA hours for review"},"hitl_review_url":{"type":"url","description":"HITL review page URL"}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_ai_hitl_required_inapp_en_v1', NULL, 'ai.hitl_required',
  'in_app', 'en', 1, 'active', 'not_required',
  'AI review required — {{request_id}}',
  'AI request {{request_id}} from {{workspace_name}} requires human review. SLA: {{review_sla_hours}}h.',
  'Review Now', '{{hitl_review_url}}',
  '{"required":["request_id","workspace_name","review_sla_hours","hitl_review_url"],"optional":["agent_type"],"properties":{"request_id":{"type":"string","description":"Request ID","maxLength":100},"workspace_name":{"type":"string","description":"Workspace name","maxLength":150},"review_sla_hours":{"type":"number","description":"SLA hours"},"hitl_review_url":{"type":"url","description":"Review URL"},"agent_type":{"type":"string","description":"Agent type","maxLength":50}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- ai.budget_exhausted — Email + In-app (workspace admins — service suspended)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_ai_budget_exhausted_email_en_v1', NULL, 'ai.budget_exhausted',
  'email', 'en', 1, 'active', 'not_required',
  'AI service suspended — monthly budget exhausted',
  '<h1>AI Budget Exhausted</h1>
<p>Hi {{user_name}},</p>
<p>Your workspace has exhausted its monthly AI budget of <strong>{{budget_formatted}}</strong>.</p>
<p>All AI SuperAgent features have been temporarily suspended until the next billing cycle on <strong>{{reset_date}}</strong>.</p>
<p>To restore AI access immediately, upgrade your plan or add budget credits.</p>',
  'Upgrade Plan', '{{billing_url}}',
  '{"required":["user_name","budget_formatted","reset_date","billing_url"],"optional":["current_spend_formatted"],"properties":{"user_name":{"type":"string","description":"User full name","maxLength":100},"budget_formatted":{"type":"string","description":"Monthly AI budget formatted","maxLength":30},"reset_date":{"type":"string","description":"Next budget reset date","maxLength":30},"billing_url":{"type":"url","description":"Billing/upgrade URL"},"current_spend_formatted":{"type":"string","description":"Current spend formatted","maxLength":30}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_ai_budget_exhausted_inapp_en_v1', NULL, 'ai.budget_exhausted',
  'in_app', 'en', 1, 'active', 'not_required',
  'AI budget exhausted — service suspended',
  'Your monthly AI budget ({{budget_formatted}}) has been exhausted. AI features are suspended until {{reset_date}}.',
  'Upgrade Plan', '{{billing_url}}',
  '{"required":["budget_formatted","reset_date","billing_url"],"optional":[],"properties":{"budget_formatted":{"type":"string","description":"Monthly budget","maxLength":30},"reset_date":{"type":"string","description":"Reset date","maxLength":30},"billing_url":{"type":"url","description":"Billing URL"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- ai.response_failed — In-app (notify the requesting user)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_ai_response_failed_inapp_en_v1', NULL, 'ai.response_failed',
  'in_app', 'en', 1, 'active', 'not_required',
  'AI request could not be completed',
  'Your AI request could not be completed at this time. Please try again or contact support if the issue persists.',
  '{"required":[],"optional":["request_id","reason"],"properties":{"request_id":{"type":"string","description":"Request ID for reference","maxLength":100},"reason":{"type":"string","description":"Brief failure reason","maxLength":150}}}',
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
  ('rule_ai_hitl_required_v1', NULL, 'ai.hitl_required',
   'AI HITL review request to super-admin', 1, 'super_admins',
   '["email","in_app"]', 'ai.hitl_required', 'critical', 0, 'critical', NULL,
   unixepoch(), unixepoch()),

  ('rule_ai_budget_exhausted_v1', NULL, 'ai.budget_exhausted',
   'AI budget exhausted — service suspended', 1, 'workspace_admins',
   '["email","in_app"]', 'ai.budget_exhausted', 'critical', 0, 'critical', NULL,
   unixepoch(), unixepoch()),

  ('rule_ai_response_failed_v1', NULL, 'ai.response_failed',
   'AI response failed notification', 1, 'actor',
   '["in_app"]', 'ai.response_failed', 'normal', 1, 'info', NULL,
   unixepoch(), unixepoch());
