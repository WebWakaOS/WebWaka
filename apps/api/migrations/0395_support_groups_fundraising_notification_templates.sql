-- Migration: 0395_support_groups_fundraising_notification_templates
-- Description: Seed platform-level notification templates for Support Group and Fundraising
--   event domains. Active English (en) stubs only — Phase 8 (N-116) will add ha/yo/ig/pcm/fr.
--   Follows conventions established in 0268_seed_platform_notification_templates.sql.
--
-- Template families map directly to event keys for clarity.
-- All bodies use Handlebars syntax. Reserved injected vars: {{tenant_name}}, {{platform_name}},
--   {{platform_logo_url}}, {{unsubscribe_url}}.
--
-- P13 guardrail: voter_ref, donor_phone, bank_account_number, donor_display_name NEVER
--   appear in any template body or variables_schema required/optional fields.
-- G14: variables_schema validates all variables before render.
-- G17 (OQ-003): WhatsApp templates seeded as 'pending_meta_approval'; dispatch blocked until
--   status is updated to 'meta_approved' by platform operator.
-- N-039: unsubscribe_url injected at render time (signed JWT, not stored here).

-- ============================================================================
-- SUPPORT GROUP TEMPLATES (14 event families)
-- ============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- support_group.created — Email + In-app (audience: actor / workspace admin)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, preheader_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_sg_created_email_en_v1',
  NULL, 'support_group.created', 'email', 'en', 1, 'active', 'not_required',
  'Your support group "{{group_name}}" is live on {{tenant_name}}',
  '<h1>Support Group Created</h1>
<p>Hi {{user_name}}, your election support group <strong>{{group_name}}</strong> has been created successfully on {{tenant_name}}.</p>
<p><strong>Group type:</strong> {{group_type}}<br>
<strong>Hierarchy level:</strong> {{hierarchy_level}}</p>
<p>You can now invite members, schedule meetings, and begin mobilisation activities.</p>',
  'Your support group is live — start mobilising.',
  'Manage Group',
  '{{group_url}}',
  '{"required":["user_name","group_name","group_type","hierarchy_level","group_url"],"optional":["group_description"],"properties":{"user_name":{"type":"string","description":"Workspace admin full name","maxLength":100},"group_name":{"type":"string","description":"Support group display name","maxLength":150},"group_type":{"type":"string","description":"Group type e.g. ward, lga, state","maxLength":50},"hierarchy_level":{"type":"string","description":"Political hierarchy level","maxLength":50},"group_url":{"type":"url","description":"Direct link to group management page"},"group_description":{"type":"string","description":"Optional group description","maxLength":300}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_sg_created_inapp_en_v1',
  NULL, 'support_group.created', 'in_app', 'en', 1, 'active', 'not_required',
  'Support group "{{group_name}}" created',
  'Your election support group <strong>{{group_name}}</strong> ({{hierarchy_level}}) is now live. Start inviting members.',
  'Manage Group',
  '{{group_url}}',
  '{"required":["group_name","hierarchy_level","group_url"],"optional":[],"properties":{"group_name":{"type":"string","description":"Support group display name","maxLength":150},"hierarchy_level":{"type":"string","description":"Political hierarchy level","maxLength":50},"group_url":{"type":"url","description":"Direct link to group management page"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- support_group.member_joined — In-app (audience: workspace_admins — pending approval)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_sg_memjoin_inapp_en_v1',
  NULL, 'support_group.member_joined', 'in_app', 'en', 1, 'active', 'not_required',
  'New member request: {{group_name}}',
  '{{member_name}} has applied to join <strong>{{group_name}}</strong>. Review and approve their membership.',
  'Review Request',
  '{{members_url}}',
  '{"required":["group_name","member_name","members_url"],"optional":[],"properties":{"group_name":{"type":"string","description":"Support group name","maxLength":150},"member_name":{"type":"string","description":"Applicant display name (no phone/voter ref)","maxLength":100},"members_url":{"type":"url","description":"Link to member management page"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- support_group.member_approved — Email + SMS + In-app (audience: subject — the approved member)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, preheader_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_sg_memapprove_email_en_v1',
  NULL, 'support_group.member_approved', 'email', 'en', 1, 'active', 'not_required',
  'You''re now a member of {{group_name}} on {{tenant_name}}',
  '<h1>Membership Approved</h1>
<p>Hi {{user_name}}, your application to join <strong>{{group_name}}</strong> has been approved.</p>
<p><strong>Your role:</strong> {{member_role}}<br>
<strong>Group level:</strong> {{hierarchy_level}}</p>
<p>You can now access group broadcasts, meeting schedules, and mobilisation activities.</p>',
  'Your membership has been approved — get started now.',
  'View Group',
  '{{group_url}}',
  '{"required":["user_name","group_name","member_role","hierarchy_level","group_url"],"optional":[],"properties":{"user_name":{"type":"string","description":"Member full name","maxLength":100},"group_name":{"type":"string","description":"Support group name","maxLength":150},"member_role":{"type":"string","description":"Member role e.g. member, coordinator","maxLength":50},"hierarchy_level":{"type":"string","description":"Political hierarchy level","maxLength":50},"group_url":{"type":"url","description":"Link to the group"}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  body_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_sg_memapprove_sms_en_v1',
  NULL, 'support_group.member_approved', 'sms', 'en', 1, 'active', 'not_required',
  '{{tenant_name}}: You have been approved as {{member_role}} in {{group_name}}. Welcome to the team!',
  '{"required":["group_name","member_role"],"optional":[],"properties":{"group_name":{"type":"string","description":"Support group name","maxLength":80},"member_role":{"type":"string","description":"Member role","maxLength":50}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_sg_memapprove_inapp_en_v1',
  NULL, 'support_group.member_approved', 'in_app', 'en', 1, 'active', 'not_required',
  'Membership approved: {{group_name}}',
  'You have been approved as <strong>{{member_role}}</strong> in {{group_name}}.',
  'View Group',
  '{{group_url}}',
  '{"required":["group_name","member_role","group_url"],"optional":[],"properties":{"group_name":{"type":"string","description":"Support group name","maxLength":150},"member_role":{"type":"string","description":"Member role","maxLength":50},"group_url":{"type":"url","description":"Link to the group"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- support_group.member_suspended — Email + SMS + In-app (audience: subject)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_sg_memsuspend_email_en_v1',
  NULL, 'support_group.member_suspended', 'email', 'en', 1, 'active', 'not_required',
  'Your membership in {{group_name}} has been suspended',
  '<h1>Membership Suspended</h1>
<p>Hi {{user_name}}, your membership in <strong>{{group_name}}</strong> has been temporarily suspended.</p>
<p>If you believe this is an error, please contact your group administrator or {{tenant_name}} support.</p>',
  '{"required":["user_name","group_name"],"optional":["support_email"],"properties":{"user_name":{"type":"string","description":"Member full name","maxLength":100},"group_name":{"type":"string","description":"Support group name","maxLength":150},"support_email":{"type":"string","description":"Support contact email","maxLength":254}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  body_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_sg_memsuspend_sms_en_v1',
  NULL, 'support_group.member_suspended', 'sms', 'en', 1, 'active', 'not_required',
  '{{tenant_name}}: Your membership in {{group_name}} has been suspended. Contact support for assistance.',
  '{"required":["group_name"],"optional":[],"properties":{"group_name":{"type":"string","description":"Support group name","maxLength":80}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_sg_memsuspend_inapp_en_v1',
  NULL, 'support_group.member_suspended', 'in_app', 'en', 1, 'active', 'not_required',
  'Membership suspended: {{group_name}}',
  'Your membership in {{group_name}} has been suspended. Contact your group admin if this is an error.',
  '{"required":["group_name"],"optional":[],"properties":{"group_name":{"type":"string","description":"Support group name","maxLength":150}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- support_group.broadcast_sent — SMS + Push + In-app (audience: all_members, digest eligible)
-- Note: P13 — message_snippet must be stripped of any PII before publishing
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  body_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_sg_broadcast_sms_en_v1',
  NULL, 'support_group.broadcast_sent', 'sms', 'en', 1, 'active', 'not_required',
  '{{group_name}} ({{tenant_name}}): {{message_snippet}}{{#if has_more}} [See app for full message]{{/if}}',
  '{"required":["group_name","message_snippet"],"optional":["has_more"],"properties":{"group_name":{"type":"string","description":"Support group name","maxLength":80},"message_snippet":{"type":"string","description":"First 120 characters of broadcast body (no PII)","maxLength":120},"has_more":{"type":"boolean","description":"True if the full message is longer than the snippet"}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_sg_broadcast_inapp_en_v1',
  NULL, 'support_group.broadcast_sent', 'in_app', 'en', 1, 'active', 'not_required',
  'Broadcast from {{group_name}}',
  '{{message_snippet}}',
  'Read Full Message',
  '{{broadcast_url}}',
  '{"required":["group_name","message_snippet","broadcast_url"],"optional":[],"properties":{"group_name":{"type":"string","description":"Support group name","maxLength":150},"message_snippet":{"type":"string","description":"First 160 characters of broadcast (no PII)","maxLength":160},"broadcast_url":{"type":"url","description":"Link to full broadcast"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- support_group.meeting_scheduled — Email + SMS + In-app (all_members, digest eligible)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, preheader_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_sg_meeting_sched_email_en_v1',
  NULL, 'support_group.meeting_scheduled', 'email', 'en', 1, 'active', 'not_required',
  'Meeting scheduled: {{meeting_title}} — {{group_name}}',
  '<h1>Meeting Scheduled</h1>
<p>A meeting has been scheduled for your support group <strong>{{group_name}}</strong>.</p>
<p><strong>Meeting:</strong> {{meeting_title}}<br>
<strong>Date &amp; Time:</strong> {{meeting_date}}<br>
<strong>Location:</strong> {{meeting_location}}</p>
<p>Please confirm your attendance.</p>',
  '{{meeting_title}} on {{meeting_date}} — {{meeting_location}}.',
  'View Meeting Details',
  '{{meeting_url}}',
  '{"required":["group_name","meeting_title","meeting_date","meeting_location","meeting_url"],"optional":["agenda_snippet"],"properties":{"group_name":{"type":"string","description":"Support group name","maxLength":150},"meeting_title":{"type":"string","description":"Meeting title","maxLength":200},"meeting_date":{"type":"string","description":"Human-readable date and time","maxLength":80},"meeting_location":{"type":"string","description":"Physical or virtual location","maxLength":200},"meeting_url":{"type":"url","description":"Link to meeting details"},"agenda_snippet":{"type":"string","description":"Short agenda summary (no PII)","maxLength":300}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  body_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_sg_meeting_sched_sms_en_v1',
  NULL, 'support_group.meeting_scheduled', 'sms', 'en', 1, 'active', 'not_required',
  '{{group_name}} ({{tenant_name}}): Meeting "{{meeting_title}}" on {{meeting_date}} at {{meeting_location}}.',
  '{"required":["group_name","meeting_title","meeting_date","meeting_location"],"optional":[],"properties":{"group_name":{"type":"string","description":"Support group name","maxLength":80},"meeting_title":{"type":"string","description":"Meeting title","maxLength":100},"meeting_date":{"type":"string","description":"Date and time string","maxLength":50},"meeting_location":{"type":"string","description":"Location","maxLength":100}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_sg_meeting_sched_inapp_en_v1',
  NULL, 'support_group.meeting_scheduled', 'in_app', 'en', 1, 'active', 'not_required',
  'Meeting scheduled: {{meeting_title}}',
  '{{group_name}}: <strong>{{meeting_title}}</strong> on {{meeting_date}} at {{meeting_location}}.',
  'View Meeting',
  '{{meeting_url}}',
  '{"required":["group_name","meeting_title","meeting_date","meeting_location","meeting_url"],"optional":[],"properties":{"group_name":{"type":"string","description":"Support group name","maxLength":150},"meeting_title":{"type":"string","description":"Meeting title","maxLength":200},"meeting_date":{"type":"string","description":"Date and time string","maxLength":80},"meeting_location":{"type":"string","description":"Location","maxLength":200},"meeting_url":{"type":"url","description":"Link to meeting details"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- support_group.meeting_completed — In-app (all_members, digest eligible)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_sg_meeting_done_inapp_en_v1',
  NULL, 'support_group.meeting_completed', 'in_app', 'en', 1, 'active', 'not_required',
  'Meeting completed: {{meeting_title}}',
  '{{group_name}}: The meeting <strong>{{meeting_title}}</strong> has been marked as completed. Minutes are available.',
  'View Minutes',
  '{{meeting_url}}',
  '{"required":["group_name","meeting_title","meeting_url"],"optional":[],"properties":{"group_name":{"type":"string","description":"Support group name","maxLength":150},"meeting_title":{"type":"string","description":"Meeting title","maxLength":200},"meeting_url":{"type":"url","description":"Link to meeting record with minutes"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- support_group.resolution_recorded — In-app (all_members, digest eligible)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_sg_resolution_inapp_en_v1',
  NULL, 'support_group.resolution_recorded', 'in_app', 'en', 1, 'active', 'not_required',
  'New resolution: {{resolution_title}}',
  '{{group_name}}: A new resolution has been recorded — <strong>{{resolution_title}}</strong>.',
  'View Resolution',
  '{{resolution_url}}',
  '{"required":["group_name","resolution_title","resolution_url"],"optional":[],"properties":{"group_name":{"type":"string","description":"Support group name","maxLength":150},"resolution_title":{"type":"string","description":"Resolution title","maxLength":200},"resolution_url":{"type":"url","description":"Link to the resolution record"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- support_group.event_created — Email + In-app (all_members, digest eligible)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, preheader_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_sg_event_email_en_v1',
  NULL, 'support_group.event_created', 'email', 'en', 1, 'active', 'not_required',
  'New group event: {{event_title}} — {{group_name}}',
  '<h1>New Group Event</h1>
<p>A new event has been created for <strong>{{group_name}}</strong>.</p>
<p><strong>Event:</strong> {{event_title}}<br>
<strong>Date:</strong> {{event_date}}<br>
<strong>Location:</strong> {{event_location}}</p>
<p>RSVP to confirm your attendance.</p>',
  '{{event_title}} on {{event_date}}.',
  'RSVP Now',
  '{{event_url}}',
  '{"required":["group_name","event_title","event_date","event_location","event_url"],"optional":["event_description"],"properties":{"group_name":{"type":"string","description":"Support group name","maxLength":150},"event_title":{"type":"string","description":"Event title","maxLength":200},"event_date":{"type":"string","description":"Human-readable event date","maxLength":80},"event_location":{"type":"string","description":"Event location","maxLength":200},"event_url":{"type":"url","description":"Event RSVP page"},"event_description":{"type":"string","description":"Event description (no PII)","maxLength":500}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_sg_event_inapp_en_v1',
  NULL, 'support_group.event_created', 'in_app', 'en', 1, 'active', 'not_required',
  'New event: {{event_title}}',
  '{{group_name}}: <strong>{{event_title}}</strong> on {{event_date}} at {{event_location}}.',
  'RSVP',
  '{{event_url}}',
  '{"required":["group_name","event_title","event_date","event_location","event_url"],"optional":[],"properties":{"group_name":{"type":"string","description":"Support group name","maxLength":150},"event_title":{"type":"string","description":"Event title","maxLength":200},"event_date":{"type":"string","description":"Event date","maxLength":80},"event_location":{"type":"string","description":"Event location","maxLength":200},"event_url":{"type":"url","description":"Event RSVP page"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- support_group.gotv_recorded — In-app (actor only, digest eligible)
-- P13: No voter_ref in payload. Event confirms mobilisation, not voter identity.
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_sg_gotv_rec_inapp_en_v1',
  NULL, 'support_group.gotv_recorded', 'in_app', 'en', 1, 'active', 'not_required',
  'GOTV mobilisation recorded',
  '{{group_name}}: A new GOTV mobilisation record has been logged. Total mobilised: <strong>{{total_mobilised}}</strong>.',
  '{"required":["group_name","total_mobilised"],"optional":[],"properties":{"group_name":{"type":"string","description":"Support group name","maxLength":150},"total_mobilised":{"type":"number","description":"Running total of GOTV records for this group (count, not voter IDs)"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- support_group.gotv_vote_confirmed — SMS + In-app (audience: subject)
-- P13: No voter_ref. Confirmation message only. G5: OTP/action SMS allowed.
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  body_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_sg_gotv_vote_sms_en_v1',
  NULL, 'support_group.gotv_vote_confirmed', 'sms', 'en', 1, 'active', 'not_required',
  '{{tenant_name}}: Your vote has been confirmed for {{group_name}}. Thank you for participating in this election.',
  '{"required":["group_name"],"optional":[],"properties":{"group_name":{"type":"string","description":"Support group name (no voter ref)","maxLength":80}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_sg_gotv_vote_inapp_en_v1',
  NULL, 'support_group.gotv_vote_confirmed', 'in_app', 'en', 1, 'active', 'not_required',
  'Vote confirmed',
  'Your vote participation has been confirmed for <strong>{{group_name}}</strong>. Thank you.',
  '{"required":["group_name"],"optional":[],"properties":{"group_name":{"type":"string","description":"Support group name","maxLength":150}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- support_group.petition_opened — Email + In-app (all_members, digest eligible)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, preheader_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_sg_petition_open_email_en_v1',
  NULL, 'support_group.petition_opened', 'email', 'en', 1, 'active', 'not_required',
  'New petition from {{group_name}}: {{petition_title}}',
  '<h1>New Petition</h1>
<p>A new petition has been opened by <strong>{{group_name}}</strong>.</p>
<p><strong>Petition:</strong> {{petition_title}}</p>
<p>{{petition_summary}}</p>
<p>Click below to read and add your signature before the deadline.</p>',
  'New petition from {{group_name}} — add your signature.',
  'Sign Petition',
  '{{petition_url}}',
  '{"required":["group_name","petition_title","petition_url"],"optional":["petition_summary"],"properties":{"group_name":{"type":"string","description":"Support group name","maxLength":150},"petition_title":{"type":"string","description":"Petition title","maxLength":200},"petition_summary":{"type":"string","description":"Short petition description (no PII)","maxLength":400},"petition_url":{"type":"url","description":"Public petition signing page"}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_sg_petition_open_inapp_en_v1',
  NULL, 'support_group.petition_opened', 'in_app', 'en', 1, 'active', 'not_required',
  'New petition: {{petition_title}}',
  '{{group_name}}: <strong>{{petition_title}}</strong> — add your signature.',
  'Sign Petition',
  '{{petition_url}}',
  '{"required":["group_name","petition_title","petition_url"],"optional":[],"properties":{"group_name":{"type":"string","description":"Support group name","maxLength":150},"petition_title":{"type":"string","description":"Petition title","maxLength":200},"petition_url":{"type":"url","description":"Petition signing page"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- support_group.petition_signed — In-app (workspace_admins — signature tracker, digest eligible)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_sg_petition_sign_inapp_en_v1',
  NULL, 'support_group.petition_signed', 'in_app', 'en', 1, 'active', 'not_required',
  'Petition update: {{petition_title}}',
  '{{group_name}} petition <strong>{{petition_title}}</strong> now has <strong>{{signature_count}}</strong> signatures.',
  'View Petition',
  '{{petition_url}}',
  '{"required":["group_name","petition_title","signature_count","petition_url"],"optional":[],"properties":{"group_name":{"type":"string","description":"Support group name","maxLength":150},"petition_title":{"type":"string","description":"Petition title","maxLength":200},"signature_count":{"type":"number","description":"Total signature count (no signer identities)"},"petition_url":{"type":"url","description":"Link to petition management page"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- support_group.archived — Email + In-app (all_members)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_sg_archived_email_en_v1',
  NULL, 'support_group.archived', 'email', 'en', 1, 'active', 'not_required',
  '{{group_name}} has been archived on {{tenant_name}}',
  '<h1>Support Group Archived</h1>
<p>Hi {{user_name}}, the election support group <strong>{{group_name}}</strong> has been archived.</p>
<p>Historical records, meetings, and broadcasts remain accessible in read-only mode.</p>
<p>If you have questions, please contact {{tenant_name}} support.</p>',
  '{"required":["user_name","group_name"],"optional":["support_email"],"properties":{"user_name":{"type":"string","description":"Member full name","maxLength":100},"group_name":{"type":"string","description":"Support group name","maxLength":150},"support_email":{"type":"string","description":"Support contact email","maxLength":254}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_sg_archived_inapp_en_v1',
  NULL, 'support_group.archived', 'in_app', 'en', 1, 'active', 'not_required',
  'Group archived: {{group_name}}',
  '<strong>{{group_name}}</strong> has been archived. Records remain accessible in read-only mode.',
  '{"required":["group_name"],"optional":[],"properties":{"group_name":{"type":"string","description":"Support group name","maxLength":150}}}',
  unixepoch(), unixepoch()
);

-- ============================================================================
-- FUNDRAISING TEMPLATES (13 event families)
-- ============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- fundraising.campaign_created — Email + In-app (actor)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, preheader_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_fr_camp_created_email_en_v1',
  NULL, 'fundraising.campaign_created', 'email', 'en', 1, 'active', 'not_required',
  'Campaign "{{campaign_title}}" created — pending review on {{tenant_name}}',
  '<h1>Campaign Created</h1>
<p>Hi {{user_name}}, your fundraising campaign <strong>{{campaign_title}}</strong> has been created and is now pending moderation review.</p>
<p><strong>Campaign type:</strong> {{campaign_type}}<br>
<strong>Target:</strong> {{target_formatted}}</p>
<p>You will be notified once it has been reviewed.</p>',
  'Campaign created — pending review.',
  'View Campaign',
  '{{campaign_url}}',
  '{"required":["user_name","campaign_title","campaign_type","target_formatted","campaign_url"],"optional":[],"properties":{"user_name":{"type":"string","description":"Campaign owner full name","maxLength":100},"campaign_title":{"type":"string","description":"Campaign title","maxLength":200},"campaign_type":{"type":"string","description":"Campaign type e.g. election, community","maxLength":50},"target_formatted":{"type":"string","description":"Target amount formatted e.g. ₦500,000.00","maxLength":30},"campaign_url":{"type":"url","description":"Campaign management page"}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_fr_camp_created_inapp_en_v1',
  NULL, 'fundraising.campaign_created', 'in_app', 'en', 1, 'active', 'not_required',
  'Campaign created: {{campaign_title}}',
  '<strong>{{campaign_title}}</strong> ({{campaign_type}}, target: {{target_formatted}}) is pending review.',
  'View Campaign',
  '{{campaign_url}}',
  '{"required":["campaign_title","campaign_type","target_formatted","campaign_url"],"optional":[],"properties":{"campaign_title":{"type":"string","description":"Campaign title","maxLength":200},"campaign_type":{"type":"string","description":"Campaign type","maxLength":50},"target_formatted":{"type":"string","description":"Target amount formatted","maxLength":30},"campaign_url":{"type":"url","description":"Campaign management page"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- fundraising.campaign_approved — Email + In-app (actor)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, preheader_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_fr_camp_approved_email_en_v1',
  NULL, 'fundraising.campaign_approved', 'email', 'en', 1, 'active', 'not_required',
  'Your campaign "{{campaign_title}}" has been approved on {{tenant_name}}',
  '<h1>Campaign Approved</h1>
<p>Hi {{user_name}}, great news — your fundraising campaign <strong>{{campaign_title}}</strong> has been approved and is now live.</p>
<p>Share your campaign link with supporters to start receiving contributions.</p>',
  'Your campaign is approved and live — share it now.',
  'View Live Campaign',
  '{{campaign_public_url}}',
  '{"required":["user_name","campaign_title","campaign_public_url"],"optional":[],"properties":{"user_name":{"type":"string","description":"Campaign owner full name","maxLength":100},"campaign_title":{"type":"string","description":"Campaign title","maxLength":200},"campaign_public_url":{"type":"url","description":"Public campaign page URL"}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_fr_camp_approved_inapp_en_v1',
  NULL, 'fundraising.campaign_approved', 'in_app', 'en', 1, 'active', 'not_required',
  'Campaign approved: {{campaign_title}}',
  '<strong>{{campaign_title}}</strong> is now live and accepting contributions.',
  'View Campaign',
  '{{campaign_public_url}}',
  '{"required":["campaign_title","campaign_public_url"],"optional":[],"properties":{"campaign_title":{"type":"string","description":"Campaign title","maxLength":200},"campaign_public_url":{"type":"url","description":"Public campaign page URL"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- fundraising.campaign_rejected — Email + In-app (actor, warning)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_fr_camp_rejected_email_en_v1',
  NULL, 'fundraising.campaign_rejected', 'email', 'en', 1, 'active', 'not_required',
  'Action required: Campaign "{{campaign_title}}" was not approved',
  '<h1>Campaign Not Approved</h1>
<p>Hi {{user_name}}, your fundraising campaign <strong>{{campaign_title}}</strong> was not approved during moderation.</p>
<p><strong>Reason:</strong> {{rejection_reason}}</p>
<p>Please review the feedback, make the necessary updates, and resubmit your campaign.</p>',
  '{"required":["user_name","campaign_title","rejection_reason"],"optional":["support_email"],"properties":{"user_name":{"type":"string","description":"Campaign owner full name","maxLength":100},"campaign_title":{"type":"string","description":"Campaign title","maxLength":200},"rejection_reason":{"type":"string","description":"Human-readable rejection reason","maxLength":500},"support_email":{"type":"string","description":"Support contact email","maxLength":254}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_fr_camp_rejected_inapp_en_v1',
  NULL, 'fundraising.campaign_rejected', 'in_app', 'en', 1, 'active', 'not_required',
  'Campaign not approved: {{campaign_title}}',
  '<strong>{{campaign_title}}</strong> was not approved. Reason: {{rejection_reason}}. Please review and resubmit.',
  '{"required":["campaign_title","rejection_reason"],"optional":[],"properties":{"campaign_title":{"type":"string","description":"Campaign title","maxLength":200},"rejection_reason":{"type":"string","description":"Rejection reason","maxLength":300}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- fundraising.campaign_completed — Email + In-app (actor)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, preheader_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_fr_camp_complete_email_en_v1',
  NULL, 'fundraising.campaign_completed', 'email', 'en', 1, 'active', 'not_required',
  'Campaign complete: "{{campaign_title}}" raised {{total_raised_formatted}}',
  '<h1>Campaign Completed</h1>
<p>Hi {{user_name}}, your fundraising campaign <strong>{{campaign_title}}</strong> has been completed.</p>
<p><strong>Total raised:</strong> {{total_raised_formatted}}<br>
<strong>Total contributions:</strong> {{contribution_count}}</p>
<p>Thank you to all your supporters. You may now initiate a payout request.</p>',
  'Campaign completed — {{total_raised_formatted}} raised.',
  'Request Payout',
  '{{payout_url}}',
  '{"required":["user_name","campaign_title","total_raised_formatted","contribution_count","payout_url"],"optional":[],"properties":{"user_name":{"type":"string","description":"Campaign owner full name","maxLength":100},"campaign_title":{"type":"string","description":"Campaign title","maxLength":200},"total_raised_formatted":{"type":"string","description":"Total amount raised formatted e.g. ₦2,500,000.00","maxLength":30},"contribution_count":{"type":"number","description":"Number of confirmed contributions"},"payout_url":{"type":"url","description":"Link to payout request page"}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_fr_camp_complete_inapp_en_v1',
  NULL, 'fundraising.campaign_completed', 'in_app', 'en', 1, 'active', 'not_required',
  'Campaign completed: {{campaign_title}}',
  '<strong>{{campaign_title}}</strong> is complete — {{total_raised_formatted}} raised from {{contribution_count}} contributions.',
  'Request Payout',
  '{{payout_url}}',
  '{"required":["campaign_title","total_raised_formatted","contribution_count","payout_url"],"optional":[],"properties":{"campaign_title":{"type":"string","description":"Campaign title","maxLength":200},"total_raised_formatted":{"type":"string","description":"Total raised formatted","maxLength":30},"contribution_count":{"type":"number","description":"Number of contributions"},"payout_url":{"type":"url","description":"Payout request page"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- fundraising.contribution_received — Email + SMS + In-app (actor/donor, high priority)
-- P13: No donor_phone, no donor_display_name, no bank details in template vars.
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, preheader_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_fr_contrib_recv_email_en_v1',
  NULL, 'fundraising.contribution_received', 'email', 'en', 1, 'active', 'not_required',
  'Contribution of {{amount_formatted}} received — {{campaign_title}}',
  '<h1>Contribution Received</h1>
<p>Hi {{user_name}}, a contribution of <strong>{{amount_formatted}}</strong> has been received for your campaign <strong>{{campaign_title}}</strong>.</p>
<p><strong>Transaction reference:</strong> {{transaction_ref}}<br>
<strong>Status:</strong> Pending payment confirmation</p>
<p>You will receive a further notification once the payment is confirmed.</p>',
  'Contribution of {{amount_formatted}} received — awaiting confirmation.',
  '{"required":["user_name","campaign_title","amount_formatted","transaction_ref"],"optional":[],"properties":{"user_name":{"type":"string","description":"Campaign owner full name (no donor PII)","maxLength":100},"campaign_title":{"type":"string","description":"Campaign title","maxLength":200},"amount_formatted":{"type":"string","description":"Formatted contribution amount e.g. ₦10,000.00","maxLength":30},"transaction_ref":{"type":"string","description":"Payment transaction reference","maxLength":100}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  body_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_fr_contrib_recv_sms_en_v1',
  NULL, 'fundraising.contribution_received', 'sms', 'en', 1, 'active', 'not_required',
  '{{tenant_name}}: {{amount_formatted}} received for campaign "{{campaign_title}}". Ref: {{transaction_ref}}. Awaiting confirmation.',
  '{"required":["campaign_title","amount_formatted","transaction_ref"],"optional":[],"properties":{"campaign_title":{"type":"string","description":"Campaign title","maxLength":80},"amount_formatted":{"type":"string","description":"Formatted amount","maxLength":30},"transaction_ref":{"type":"string","description":"Transaction reference","maxLength":50}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_fr_contrib_recv_inapp_en_v1',
  NULL, 'fundraising.contribution_received', 'in_app', 'en', 1, 'active', 'not_required',
  'Contribution received: {{amount_formatted}}',
  '<strong>{{amount_formatted}}</strong> received for <strong>{{campaign_title}}</strong> (Ref: {{transaction_ref}}). Awaiting payment confirmation.',
  '{"required":["campaign_title","amount_formatted","transaction_ref"],"optional":[],"properties":{"campaign_title":{"type":"string","description":"Campaign title","maxLength":200},"amount_formatted":{"type":"string","description":"Formatted amount","maxLength":30},"transaction_ref":{"type":"string","description":"Transaction reference","maxLength":100}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- fundraising.contribution_confirmed — Email + SMS + In-app (actor/donor, high priority)
-- P13: No donor_phone, no donor_display_name.
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, preheader_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_fr_contrib_confirm_email_en_v1',
  NULL, 'fundraising.contribution_confirmed', 'email', 'en', 1, 'active', 'not_required',
  'Payment confirmed — {{amount_formatted}} to {{campaign_title}}',
  '<h1>Contribution Confirmed</h1>
<p>Hi {{user_name}}, your contribution of <strong>{{amount_formatted}}</strong> to the campaign <strong>{{campaign_title}}</strong> has been confirmed.</p>
<p><strong>Transaction reference:</strong> {{transaction_ref}}</p>
<p>Thank you for your support. Your contribution will be visible on the campaign page once published.</p>',
  'Your contribution of {{amount_formatted}} to {{campaign_title}} is confirmed.',
  '{"required":["user_name","campaign_title","amount_formatted","transaction_ref"],"optional":[],"properties":{"user_name":{"type":"string","description":"Donor name (no phone or voter ref)","maxLength":100},"campaign_title":{"type":"string","description":"Campaign title","maxLength":200},"amount_formatted":{"type":"string","description":"Formatted contribution amount","maxLength":30},"transaction_ref":{"type":"string","description":"Payment transaction reference","maxLength":100}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  body_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_fr_contrib_confirm_sms_en_v1',
  NULL, 'fundraising.contribution_confirmed', 'sms', 'en', 1, 'active', 'not_required',
  '{{tenant_name}}: Your contribution of {{amount_formatted}} to "{{campaign_title}}" is confirmed. Ref: {{transaction_ref}}. Thank you.',
  '{"required":["campaign_title","amount_formatted","transaction_ref"],"optional":[],"properties":{"campaign_title":{"type":"string","description":"Campaign title","maxLength":80},"amount_formatted":{"type":"string","description":"Formatted amount","maxLength":30},"transaction_ref":{"type":"string","description":"Transaction reference","maxLength":50}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_fr_contrib_confirm_inapp_en_v1',
  NULL, 'fundraising.contribution_confirmed', 'in_app', 'en', 1, 'active', 'not_required',
  'Payment confirmed: {{amount_formatted}}',
  'Your contribution of <strong>{{amount_formatted}}</strong> to <strong>{{campaign_title}}</strong> is confirmed. Ref: {{transaction_ref}}.',
  '{"required":["campaign_title","amount_formatted","transaction_ref"],"optional":[],"properties":{"campaign_title":{"type":"string","description":"Campaign title","maxLength":200},"amount_formatted":{"type":"string","description":"Formatted amount","maxLength":30},"transaction_ref":{"type":"string","description":"Transaction reference","maxLength":100}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- fundraising.contribution_failed — Email + SMS (actor, warning)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_fr_contrib_fail_email_en_v1',
  NULL, 'fundraising.contribution_failed', 'email', 'en', 1, 'active', 'not_required',
  'Action required: Contribution payment failed for {{campaign_title}}',
  '<h1>Contribution Payment Failed</h1>
<p>Hi {{user_name}}, a contribution payment of <strong>{{amount_formatted}}</strong> for the campaign <strong>{{campaign_title}}</strong> could not be processed.</p>
<p><strong>Reason:</strong> {{failure_reason}}</p>
<p>Please retry your contribution using the campaign page.</p>',
  '{"required":["user_name","campaign_title","amount_formatted","failure_reason"],"optional":["campaign_url"],"properties":{"user_name":{"type":"string","description":"Donor name","maxLength":100},"campaign_title":{"type":"string","description":"Campaign title","maxLength":200},"amount_formatted":{"type":"string","description":"Formatted amount attempted","maxLength":30},"failure_reason":{"type":"string","description":"Human-readable failure reason","maxLength":300},"campaign_url":{"type":"url","description":"Campaign page to retry"}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  body_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_fr_contrib_fail_sms_en_v1',
  NULL, 'fundraising.contribution_failed', 'sms', 'en', 1, 'active', 'not_required',
  '{{tenant_name}}: Your payment of {{amount_formatted}} to "{{campaign_title}}" failed. {{failure_reason}}. Please try again.',
  '{"required":["campaign_title","amount_formatted","failure_reason"],"optional":[],"properties":{"campaign_title":{"type":"string","description":"Campaign title","maxLength":80},"amount_formatted":{"type":"string","description":"Formatted amount","maxLength":30},"failure_reason":{"type":"string","description":"Failure reason","maxLength":100}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- fundraising.pledge_created — Email + In-app (actor, digest eligible)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_fr_pledge_email_en_v1',
  NULL, 'fundraising.pledge_created', 'email', 'en', 1, 'active', 'not_required',
  'Pledge of {{pledge_amount_formatted}} received — {{campaign_title}}',
  '<h1>Pledge Received</h1>
<p>Hi {{user_name}}, a pledge of <strong>{{pledge_amount_formatted}}</strong> has been made to your campaign <strong>{{campaign_title}}</strong>.</p>
<p>Pledges are commitments to contribute — the actual payment will be processed when the pledge is fulfilled.</p>',
  '{"required":["user_name","campaign_title","pledge_amount_formatted"],"optional":[],"properties":{"user_name":{"type":"string","description":"Campaign owner name","maxLength":100},"campaign_title":{"type":"string","description":"Campaign title","maxLength":200},"pledge_amount_formatted":{"type":"string","description":"Formatted pledge amount","maxLength":30}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_fr_pledge_inapp_en_v1',
  NULL, 'fundraising.pledge_created', 'in_app', 'en', 1, 'active', 'not_required',
  'New pledge: {{pledge_amount_formatted}}',
  'A pledge of <strong>{{pledge_amount_formatted}}</strong> has been made to <strong>{{campaign_title}}</strong>.',
  '{"required":["campaign_title","pledge_amount_formatted"],"optional":[],"properties":{"campaign_title":{"type":"string","description":"Campaign title","maxLength":200},"pledge_amount_formatted":{"type":"string","description":"Formatted pledge amount","maxLength":30}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- fundraising.milestone_reached — Email + In-app (workspace_admins)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, preheader_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_fr_milestone_email_en_v1',
  NULL, 'fundraising.milestone_reached', 'email', 'en', 1, 'active', 'not_required',
  'Milestone reached: {{milestone_title}} — {{campaign_title}}',
  '<h1>Milestone Reached!</h1>
<p>Hi {{user_name}}, great progress! The milestone <strong>{{milestone_title}}</strong> for campaign <strong>{{campaign_title}}</strong> has been reached.</p>
<p><strong>Milestone amount:</strong> {{milestone_amount_formatted}}<br>
<strong>Total raised so far:</strong> {{total_raised_formatted}}</p>',
  'Milestone {{milestone_title}} reached — {{total_raised_formatted}} raised so far.',
  'View Campaign',
  '{{campaign_url}}',
  '{"required":["user_name","campaign_title","milestone_title","milestone_amount_formatted","total_raised_formatted","campaign_url"],"optional":[],"properties":{"user_name":{"type":"string","description":"Campaign admin name","maxLength":100},"campaign_title":{"type":"string","description":"Campaign title","maxLength":200},"milestone_title":{"type":"string","description":"Milestone title","maxLength":200},"milestone_amount_formatted":{"type":"string","description":"Milestone target amount formatted","maxLength":30},"total_raised_formatted":{"type":"string","description":"Total raised so far","maxLength":30},"campaign_url":{"type":"url","description":"Campaign page"}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_fr_milestone_inapp_en_v1',
  NULL, 'fundraising.milestone_reached', 'in_app', 'en', 1, 'active', 'not_required',
  'Milestone reached: {{milestone_title}}',
  '<strong>{{campaign_title}}</strong>: Milestone <strong>{{milestone_title}}</strong> reached — {{total_raised_formatted}} raised.',
  'View Campaign',
  '{{campaign_url}}',
  '{"required":["campaign_title","milestone_title","total_raised_formatted","campaign_url"],"optional":[],"properties":{"campaign_title":{"type":"string","description":"Campaign title","maxLength":200},"milestone_title":{"type":"string","description":"Milestone title","maxLength":200},"total_raised_formatted":{"type":"string","description":"Total raised so far","maxLength":30},"campaign_url":{"type":"url","description":"Campaign page"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- fundraising.update_posted — Email + In-app (all_members / subscribers, digest eligible)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, preheader_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_fr_update_email_en_v1',
  NULL, 'fundraising.update_posted', 'email', 'en', 1, 'active', 'not_required',
  'Campaign update: {{update_title}} — {{campaign_title}}',
  '<h1>Campaign Update</h1>
<p>The campaign <strong>{{campaign_title}}</strong> has posted a new update.</p>
<p><strong>{{update_title}}</strong></p>
<p>{{update_snippet}}</p>',
  'New update from {{campaign_title}}: {{update_title}}.',
  'Read Full Update',
  '{{update_url}}',
  '{"required":["campaign_title","update_title","update_snippet","update_url"],"optional":[],"properties":{"campaign_title":{"type":"string","description":"Campaign title","maxLength":200},"update_title":{"type":"string","description":"Update title","maxLength":200},"update_snippet":{"type":"string","description":"First 300 characters of update body (no PII)","maxLength":300},"update_url":{"type":"url","description":"Link to full update"}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_fr_update_inapp_en_v1',
  NULL, 'fundraising.update_posted', 'in_app', 'en', 1, 'active', 'not_required',
  'Update: {{update_title}}',
  '<strong>{{campaign_title}}</strong>: {{update_snippet}}',
  'Read Update',
  '{{update_url}}',
  '{"required":["campaign_title","update_title","update_snippet","update_url"],"optional":[],"properties":{"campaign_title":{"type":"string","description":"Campaign title","maxLength":200},"update_title":{"type":"string","description":"Update title","maxLength":200},"update_snippet":{"type":"string","description":"Short update snippet (no PII)","maxLength":200},"update_url":{"type":"url","description":"Link to full update"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- fundraising.payout_requested — Email + In-app (workspace_admins, high priority)
-- HITL: This triggers human review. Notifies both campaign admin and super_admins.
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_fr_payout_req_email_en_v1',
  NULL, 'fundraising.payout_requested', 'email', 'en', 1, 'active', 'not_required',
  'Payout request submitted: {{amount_formatted}} — {{campaign_title}}',
  '<h1>Payout Request Submitted</h1>
<p>Hi {{user_name}}, your payout request of <strong>{{amount_formatted}}</strong> for campaign <strong>{{campaign_title}}</strong> has been submitted and is now under review.</p>
<p>Payouts for election-related campaigns are subject to a human-in-the-loop review process. You will be notified once a decision has been made.</p>',
  'View Request',
  '{{payout_url}}',
  '{"required":["user_name","campaign_title","amount_formatted","payout_url"],"optional":[],"properties":{"user_name":{"type":"string","description":"Campaign owner name","maxLength":100},"campaign_title":{"type":"string","description":"Campaign title","maxLength":200},"amount_formatted":{"type":"string","description":"Payout amount formatted","maxLength":30},"payout_url":{"type":"url","description":"Link to payout request record"}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, cta_label, cta_url_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_fr_payout_req_inapp_en_v1',
  NULL, 'fundraising.payout_requested', 'in_app', 'en', 1, 'active', 'not_required',
  'Payout request under review: {{amount_formatted}}',
  'Payout request of <strong>{{amount_formatted}}</strong> for <strong>{{campaign_title}}</strong> is under review (HITL).',
  'View Request',
  '{{payout_url}}',
  '{"required":["campaign_title","amount_formatted","payout_url"],"optional":[],"properties":{"campaign_title":{"type":"string","description":"Campaign title","maxLength":200},"amount_formatted":{"type":"string","description":"Payout amount formatted","maxLength":30},"payout_url":{"type":"url","description":"Link to payout request record"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- fundraising.payout_approved — Email + SMS + In-app (subject: campaign owner, high priority)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template, preheader_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_fr_payout_approve_email_en_v1',
  NULL, 'fundraising.payout_approved', 'email', 'en', 1, 'active', 'not_required',
  'Payout approved: {{amount_formatted}} — {{campaign_title}}',
  '<h1>Payout Approved</h1>
<p>Hi {{user_name}}, your payout request of <strong>{{amount_formatted}}</strong> for campaign <strong>{{campaign_title}}</strong> has been approved.</p>
<p><strong>Payout reference:</strong> {{payout_ref}}</p>
<p>The funds will be transferred to your registered bank account. Processing typically takes 1–3 business days.</p>',
  'Payout of {{amount_formatted}} approved — processing now.',
  '{"required":["user_name","campaign_title","amount_formatted","payout_ref"],"optional":[],"properties":{"user_name":{"type":"string","description":"Campaign owner name","maxLength":100},"campaign_title":{"type":"string","description":"Campaign title","maxLength":200},"amount_formatted":{"type":"string","description":"Payout amount formatted","maxLength":30},"payout_ref":{"type":"string","description":"Payout reference (no bank account number)","maxLength":100}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  body_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_fr_payout_approve_sms_en_v1',
  NULL, 'fundraising.payout_approved', 'sms', 'en', 1, 'active', 'not_required',
  '{{tenant_name}}: Your payout of {{amount_formatted}} for "{{campaign_title}}" has been approved. Ref: {{payout_ref}}. Funds processing in 1-3 business days.',
  '{"required":["campaign_title","amount_formatted","payout_ref"],"optional":[],"properties":{"campaign_title":{"type":"string","description":"Campaign title","maxLength":80},"amount_formatted":{"type":"string","description":"Formatted amount","maxLength":30},"payout_ref":{"type":"string","description":"Payout reference","maxLength":50}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_fr_payout_approve_inapp_en_v1',
  NULL, 'fundraising.payout_approved', 'in_app', 'en', 1, 'active', 'not_required',
  'Payout approved: {{amount_formatted}}',
  'Payout of <strong>{{amount_formatted}}</strong> for <strong>{{campaign_title}}</strong> approved. Ref: {{payout_ref}}.',
  '{"required":["campaign_title","amount_formatted","payout_ref"],"optional":[],"properties":{"campaign_title":{"type":"string","description":"Campaign title","maxLength":200},"amount_formatted":{"type":"string","description":"Formatted amount","maxLength":30},"payout_ref":{"type":"string","description":"Payout reference","maxLength":100}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- fundraising.payout_rejected — Email + In-app (subject: campaign owner, warning)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_fr_payout_reject_email_en_v1',
  NULL, 'fundraising.payout_rejected', 'email', 'en', 1, 'active', 'not_required',
  'Action required: Payout request not approved — {{campaign_title}}',
  '<h1>Payout Not Approved</h1>
<p>Hi {{user_name}}, your payout request of <strong>{{amount_formatted}}</strong> for campaign <strong>{{campaign_title}}</strong> was not approved.</p>
<p><strong>Reason:</strong> {{rejection_reason}}</p>
<p>Please review the feedback and contact {{tenant_name}} support if you have questions.</p>',
  '{"required":["user_name","campaign_title","amount_formatted","rejection_reason"],"optional":["support_email"],"properties":{"user_name":{"type":"string","description":"Campaign owner name","maxLength":100},"campaign_title":{"type":"string","description":"Campaign title","maxLength":200},"amount_formatted":{"type":"string","description":"Payout amount formatted","maxLength":30},"rejection_reason":{"type":"string","description":"Human-readable rejection reason","maxLength":500},"support_email":{"type":"string","description":"Support contact email","maxLength":254}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status,
  subject_template, body_template,
  variables_schema,
  created_at, updated_at
) VALUES (
  'tpl_fr_payout_reject_inapp_en_v1',
  NULL, 'fundraising.payout_rejected', 'in_app', 'en', 1, 'active', 'not_required',
  'Payout not approved: {{campaign_title}}',
  'Payout of <strong>{{amount_formatted}}</strong> for <strong>{{campaign_title}}</strong> was not approved. Reason: {{rejection_reason}}.',
  '{"required":["campaign_title","amount_formatted","rejection_reason"],"optional":[],"properties":{"campaign_title":{"type":"string","description":"Campaign title","maxLength":200},"amount_formatted":{"type":"string","description":"Formatted amount","maxLength":30},"rejection_reason":{"type":"string","description":"Rejection reason","maxLength":300}}}',
  unixepoch(), unixepoch()
);
