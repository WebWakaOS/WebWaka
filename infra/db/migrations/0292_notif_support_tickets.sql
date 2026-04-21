-- Migration: 0292_notif_support_tickets
-- Description: Notification templates + rules for support ticket lifecycle events.
--
-- New template families:
--   support.ticket_created, support.ticket_assigned, support.ticket_replied,
--   support.ticket_resolved, support.ticket_closed

-- ──────────────────────────────────────────────────────────────────────────────
-- support.ticket_created — Email + In-app (confirmation to user)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template, preheader_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_support_created_email_en_v1', NULL, 'support.ticket_created',
  'email', 'en', 1, 'active', 'not_required',
  'Support ticket received — #{{ticket_id}}',
  '<h1>We''ve received your request</h1>
<p>Hi {{user_name}},</p>
<p>Your support ticket has been received and assigned reference <strong>#{{ticket_id}}</strong>.</p>
<p><strong>Subject:</strong> {{ticket_subject}}<br>
<strong>Priority:</strong> {{ticket_priority}}</p>
<p>Our support team will respond within {{response_sla}} business hours.</p>',
  'Support ticket #{{ticket_id}} received.',
  '{"required":["user_name","ticket_id","ticket_subject","ticket_priority","response_sla"],"optional":[],"properties":{"user_name":{"type":"string","description":"User full name","maxLength":100},"ticket_id":{"type":"string","description":"Ticket ID or reference number","maxLength":30},"ticket_subject":{"type":"string","description":"Ticket subject line","maxLength":200},"ticket_priority":{"type":"string","description":"Priority level e.g. Low, High","maxLength":20},"response_sla":{"type":"number","description":"SLA response time in business hours"}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_support_created_inapp_en_v1', NULL, 'support.ticket_created',
  'in_app', 'en', 1, 'active', 'not_required',
  'Ticket #{{ticket_id}} created',
  'Your support ticket #{{ticket_id}} has been received. We will respond soon.',
  '{"required":["ticket_id"],"optional":["ticket_subject"],"properties":{"ticket_id":{"type":"string","description":"Ticket ID","maxLength":30},"ticket_subject":{"type":"string","description":"Ticket subject","maxLength":200}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- support.ticket_assigned — In-app (notify the assigned support agent)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_support_assigned_inapp_en_v1', NULL, 'support.ticket_assigned',
  'in_app', 'en', 1, 'active', 'not_required',
  'Ticket #{{ticket_id}} assigned to you',
  'Support ticket #{{ticket_id}} has been assigned to you. Subject: {{ticket_subject}}.',
  'View Ticket', '{{ticket_url}}',
  '{"required":["ticket_id","ticket_subject","ticket_url"],"optional":["user_name"],"properties":{"ticket_id":{"type":"string","description":"Ticket ID","maxLength":30},"ticket_subject":{"type":"string","description":"Ticket subject","maxLength":200},"ticket_url":{"type":"url","description":"Ticket detail page URL"},"user_name":{"type":"string","description":"Customer name","maxLength":100}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- support.ticket_replied — Email + In-app (notify the other party of a reply)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template, preheader_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_support_replied_email_en_v1', NULL, 'support.ticket_replied',
  'email', 'en', 1, 'active', 'not_required',
  'New reply on your ticket #{{ticket_id}}',
  '<h1>New Reply on Ticket #{{ticket_id}}</h1>
<p>Hi {{user_name}},</p>
<p><strong>{{replier_name}}</strong> has replied to your support ticket.</p>
<p><strong>Subject:</strong> {{ticket_subject}}</p>
<p>Click below to view the reply and respond.</p>',
  '{{replier_name}} replied to ticket #{{ticket_id}}.',
  'View Reply', '{{ticket_url}}',
  '{"required":["user_name","ticket_id","ticket_subject","replier_name","ticket_url"],"optional":[],"properties":{"user_name":{"type":"string","description":"Recipient full name","maxLength":100},"ticket_id":{"type":"string","description":"Ticket ID","maxLength":30},"ticket_subject":{"type":"string","description":"Ticket subject","maxLength":200},"replier_name":{"type":"string","description":"Name of the person who replied","maxLength":100},"ticket_url":{"type":"url","description":"Ticket URL"}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_support_replied_inapp_en_v1', NULL, 'support.ticket_replied',
  'in_app', 'en', 1, 'active', 'not_required',
  'New reply on ticket #{{ticket_id}}',
  '{{replier_name}} replied to your support ticket #{{ticket_id}}.',
  'View Reply', '{{ticket_url}}',
  '{"required":["ticket_id","replier_name","ticket_url"],"optional":[],"properties":{"ticket_id":{"type":"string","description":"Ticket ID","maxLength":30},"replier_name":{"type":"string","description":"Replier name","maxLength":100},"ticket_url":{"type":"url","description":"Ticket URL"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- support.ticket_resolved — Email + In-app
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template, preheader_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_support_resolved_email_en_v1', NULL, 'support.ticket_resolved',
  'email', 'en', 1, 'active', 'not_required',
  'Your support ticket has been resolved — #{{ticket_id}}',
  '<h1>Ticket Resolved</h1>
<p>Hi {{user_name}},</p>
<p>Your support ticket <strong>#{{ticket_id}}</strong> has been marked as resolved.</p>
<p>We hope we were able to help. If the issue persists, you can reopen the ticket or contact us again.</p>',
  'Ticket #{{ticket_id}} has been resolved.',
  'View Resolution', '{{ticket_url}}',
  '{"required":["user_name","ticket_id","ticket_url"],"optional":["resolution_summary"],"properties":{"user_name":{"type":"string","description":"User full name","maxLength":100},"ticket_id":{"type":"string","description":"Ticket ID","maxLength":30},"ticket_url":{"type":"url","description":"Ticket URL"},"resolution_summary":{"type":"string","description":"Brief summary of resolution","maxLength":300}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_support_resolved_inapp_en_v1', NULL, 'support.ticket_resolved',
  'in_app', 'en', 1, 'active', 'not_required',
  'Ticket #{{ticket_id}} resolved',
  'Your support ticket #{{ticket_id}} has been resolved. Tap to view the resolution.',
  'View Ticket', '{{ticket_url}}',
  '{"required":["ticket_id","ticket_url"],"optional":[],"properties":{"ticket_id":{"type":"string","description":"Ticket ID","maxLength":30},"ticket_url":{"type":"url","description":"Ticket URL"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- support.ticket_closed — In-app
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_support_closed_inapp_en_v1', NULL, 'support.ticket_closed',
  'in_app', 'en', 1, 'active', 'not_required',
  'Ticket #{{ticket_id}} closed',
  'Your support ticket #{{ticket_id}} has been closed. Open a new ticket if you need further help.',
  '{"required":["ticket_id"],"optional":[],"properties":{"ticket_id":{"type":"string","description":"Ticket ID","maxLength":30}}}',
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
  ('rule_support_created_v1', NULL, 'support.ticket_created',
   'Support ticket received confirmation', 1, 'actor',
   '["email","in_app"]', 'support.ticket_created', 'normal', 0, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_support_assigned_v1', NULL, 'support.ticket_assigned',
   'Support ticket assigned to agent', 1, 'subject',
   '["in_app"]', 'support.ticket_assigned', 'normal', 0, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_support_replied_v1', NULL, 'support.ticket_replied',
   'Support ticket reply notification', 1, 'subject',
   '["email","in_app"]', 'support.ticket_replied', 'normal', 0, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_support_resolved_v1', NULL, 'support.ticket_resolved',
   'Support ticket resolved', 1, 'actor',
   '["email","in_app"]', 'support.ticket_resolved', 'normal', 0, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_support_closed_v1', NULL, 'support.ticket_closed',
   'Support ticket closed', 1, 'actor',
   '["in_app"]', 'support.ticket_closed', 'low', 1, 'info', NULL,
   unixepoch(), unixepoch());
