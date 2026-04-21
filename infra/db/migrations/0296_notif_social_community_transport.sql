-- Migration: 0296_notif_social_community_transport
-- Description: Notification templates + rules for social, community, and transport events.
--
-- New template families:
--   community.member_joined, transport.booking_confirmed,
--   transport.trip_completed, transport.booking_cancelled
--
-- Notes:
--   social.post_published, social.comment_added, social.follow_created are high-volume
--   engagement events. They are intentionally excluded from platform-level templates
--   (too noisy for SMS/email; vertical tenants can define their own in-app variants).
--   community.member_joined is included as it is workspace-admin relevant.

-- ──────────────────────────────────────────────────────────────────────────────
-- community.member_joined — In-app (notify workspace/community admin)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_community_member_joined_inapp_en_v1', NULL, 'community.member_joined',
  'in_app', 'en', 1, 'active', 'not_required',
  'New member joined {{community_name}}',
  '{{member_name}} has joined the community {{community_name}}.',
  '{"required":["member_name","community_name"],"optional":[],"properties":{"member_name":{"type":"string","description":"New member name","maxLength":100},"community_name":{"type":"string","description":"Community name","maxLength":150}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- transport.booking_confirmed — Email + SMS + In-app
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template, preheader_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_transport_confirmed_email_en_v1', NULL, 'transport.booking_confirmed',
  'email', 'en', 1, 'active', 'not_required',
  'Booking confirmed — {{route_description}}',
  '<h1>Booking Confirmed</h1>
<p>Hi {{user_name}},</p>
<p>Your transport booking is confirmed.</p>
<p><strong>Route:</strong> {{route_description}}<br>
<strong>Date/Time:</strong> {{departure_datetime}}<br>
<strong>Booking Ref:</strong> {{booking_ref}}<br>
<strong>Amount paid:</strong> {{amount_formatted}}</p>
<p>Please arrive at least 15 minutes before departure.</p>',
  'Your booking for {{route_description}} is confirmed.',
  '{"required":["user_name","route_description","departure_datetime","booking_ref","amount_formatted"],"optional":["seat_number","pickup_point"],"properties":{"user_name":{"type":"string","description":"Passenger name","maxLength":100},"route_description":{"type":"string","description":"Route e.g. Lagos → Abuja","maxLength":150},"departure_datetime":{"type":"string","description":"Formatted departure time","maxLength":50},"booking_ref":{"type":"string","description":"Booking reference","maxLength":50},"amount_formatted":{"type":"string","description":"Amount paid","maxLength":30},"seat_number":{"type":"string","description":"Assigned seat","maxLength":10},"pickup_point":{"type":"string","description":"Pickup location","maxLength":200}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, body_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_transport_confirmed_sms_en_v1', NULL, 'transport.booking_confirmed',
  'sms', 'en', 1, 'active', 'not_required',
  '{{tenant_name}}: Booking {{booking_ref}} confirmed. {{route_description}} on {{departure_datetime}}. Arrive 15 mins early.',
  '{"required":["booking_ref","route_description","departure_datetime"],"optional":[],"properties":{"booking_ref":{"type":"string","description":"Booking reference","maxLength":50},"route_description":{"type":"string","description":"Route description","maxLength":80},"departure_datetime":{"type":"string","description":"Departure time","maxLength":40}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_transport_confirmed_inapp_en_v1', NULL, 'transport.booking_confirmed',
  'in_app', 'en', 1, 'active', 'not_required',
  'Booking confirmed — {{booking_ref}}',
  'Your trip {{route_description}} on {{departure_datetime}} is confirmed. Ref: {{booking_ref}}.',
  '{"required":["route_description","departure_datetime","booking_ref"],"optional":[],"properties":{"route_description":{"type":"string","description":"Route description","maxLength":150},"departure_datetime":{"type":"string","description":"Departure time","maxLength":50},"booking_ref":{"type":"string","description":"Booking reference","maxLength":50}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- transport.trip_completed — SMS + In-app (trip completion receipt)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, body_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_transport_completed_sms_en_v1', NULL, 'transport.trip_completed',
  'sms', 'en', 1, 'active', 'not_required',
  '{{tenant_name}}: Your trip {{booking_ref}} has been completed. Thank you for travelling with us.',
  '{"required":["booking_ref"],"optional":["feedback_url"],"properties":{"booking_ref":{"type":"string","description":"Booking reference","maxLength":50},"feedback_url":{"type":"url","description":"Feedback/rating link"}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  cta_label, cta_url_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_transport_completed_inapp_en_v1', NULL, 'transport.trip_completed',
  'in_app', 'en', 1, 'active', 'not_required',
  'Trip completed — {{booking_ref}}',
  'Your trip {{route_description}} has been completed. We hope you had a great journey!',
  'Rate Your Trip', '{{feedback_url}}',
  '{"required":["booking_ref","route_description"],"optional":["feedback_url"],"properties":{"booking_ref":{"type":"string","description":"Booking reference","maxLength":50},"route_description":{"type":"string","description":"Route","maxLength":150},"feedback_url":{"type":"url","description":"Rating/feedback URL"}}}',
  unixepoch(), unixepoch()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- transport.booking_cancelled — Email + SMS + In-app
-- ──────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_transport_cancelled_email_en_v1', NULL, 'transport.booking_cancelled',
  'email', 'en', 1, 'active', 'not_required',
  'Booking cancelled — {{booking_ref}}',
  '<h1>Booking Cancelled</h1>
<p>Hi {{user_name}},</p>
<p>Your booking <strong>{{booking_ref}}</strong> for <strong>{{route_description}}</strong> has been cancelled.</p>
<p><strong>Reason:</strong> {{cancellation_reason}}</p>
<p>{{refund_note}}</p>',
  '{"required":["user_name","booking_ref","route_description","cancellation_reason"],"optional":["refund_note","support_email"],"properties":{"user_name":{"type":"string","description":"Passenger name","maxLength":100},"booking_ref":{"type":"string","description":"Booking reference","maxLength":50},"route_description":{"type":"string","description":"Route","maxLength":150},"cancellation_reason":{"type":"string","description":"Why the booking was cancelled","maxLength":300},"refund_note":{"type":"string","description":"Refund information","maxLength":200},"support_email":{"type":"string","description":"Support email","maxLength":254}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, body_template, variables_schema, created_at, updated_at
) VALUES (
  'tpl_transport_cancelled_sms_en_v1', NULL, 'transport.booking_cancelled',
  'sms', 'en', 1, 'active', 'not_required',
  '{{tenant_name}}: Booking {{booking_ref}} for {{route_description}} has been cancelled. Check your email for refund details.',
  '{"required":["booking_ref","route_description"],"optional":[],"properties":{"booking_ref":{"type":"string","description":"Booking reference","maxLength":50},"route_description":{"type":"string","description":"Route","maxLength":80}}}',
  unixepoch(), unixepoch()
);

INSERT OR IGNORE INTO notification_template (
  id, tenant_id, template_family, channel, locale, version, status,
  whatsapp_approval_status, subject_template, body_template,
  variables_schema, created_at, updated_at
) VALUES (
  'tpl_transport_cancelled_inapp_en_v1', NULL, 'transport.booking_cancelled',
  'in_app', 'en', 1, 'active', 'not_required',
  'Booking {{booking_ref}} cancelled',
  'Your booking {{booking_ref}} for {{route_description}} has been cancelled.',
  '{"required":["booking_ref","route_description"],"optional":["cancellation_reason"],"properties":{"booking_ref":{"type":"string","description":"Booking reference","maxLength":50},"route_description":{"type":"string","description":"Route","maxLength":150},"cancellation_reason":{"type":"string","description":"Brief reason","maxLength":100}}}',
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
  ('rule_community_member_joined_v1', NULL, 'community.member_joined',
   'New community member alert to admin', 1, 'workspace_admins',
   '["in_app"]', 'community.member_joined', 'low', 1, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_transport_confirmed_v1', NULL, 'transport.booking_confirmed',
   'Transport booking confirmation', 1, 'actor',
   '["email","sms","in_app"]', 'transport.booking_confirmed', 'high', 0, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_transport_completed_v1', NULL, 'transport.trip_completed',
   'Transport trip completed receipt', 1, 'actor',
   '["sms","in_app"]', 'transport.trip_completed', 'low', 1, 'info', NULL,
   unixepoch(), unixepoch()),

  ('rule_transport_cancelled_v1', NULL, 'transport.booking_cancelled',
   'Transport booking cancelled alert', 1, 'actor',
   '["email","sms","in_app"]', 'transport.booking_cancelled', 'high', 0, 'warning', NULL,
   unixepoch(), unixepoch());
