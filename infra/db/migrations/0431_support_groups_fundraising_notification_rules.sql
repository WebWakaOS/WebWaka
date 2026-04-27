-- Migration: 0396_support_groups_fundraising_notification_rules
-- Description: Seed platform-level notification routing rules for Support Group and
--   Fundraising event domains. Follows conventions established in 0269_seed_notification_rules.sql.
--
-- Platform-level rules (tenant_id IS NULL) are defaults for all tenants.
-- Tenant-specific overrides are inserted with tenant_id IS NOT NULL and take precedence.
--
-- Audience type semantics:
--   actor          — the user who triggered the event (e.g. group creator, donor)
--   subject        — the user the event is about (e.g. approved member, payout recipient)
--   workspace_admins — admins of the workspace that owns the resource
--   all_members    — all active members of the support group / campaign subscribers
--
-- Channel fallback chains ensure delivery on low-connectivity Nigerian networks (G21).
-- digest_eligible=1 means the event can be batched in the user's digest window.
-- min_severity='warning' bypasses opt-out preferences (G12) for the flagged events.

-- ============================================================================
-- SUPPORT GROUP RULES (14 events)
-- ============================================================================

INSERT OR IGNORE INTO notification_rule (
  id, tenant_id, event_key, rule_name, enabled,
  audience_type, channels, channel_fallback,
  template_family, priority, digest_eligible, min_severity,
  created_at, updated_at
) VALUES

  -- support_group.created → email + in_app (actor: group creator / workspace admin)
  ('rule_sg_created', NULL, 'support_group.created',
   'Support group created confirmation', 1,
   'actor', '["email","in_app"]', '["in_app"]',
   'support_group.created', 'normal', 0, 'info',
   unixepoch(), unixepoch()),

  -- support_group.member_joined → in_app (workspace_admins — pending approval queue)
  ('rule_sg_memjoin', NULL, 'support_group.member_joined',
   'New member join request', 1,
   'workspace_admins', '["in_app"]', '["in_app"]',
   'support_group.member_joined', 'normal', 1, 'info',
   unixepoch(), unixepoch()),

  -- support_group.member_approved → email + sms + in_app (subject: approved member)
  ('rule_sg_memapprove', NULL, 'support_group.member_approved',
   'Member approved notification', 1,
   'subject', '["email","sms","in_app"]', '["sms","in_app"]',
   'support_group.member_approved', 'high', 0, 'info',
   unixepoch(), unixepoch()),

  -- support_group.member_suspended → email + sms + in_app (subject; severity=warning bypasses opt-out)
  ('rule_sg_memsuspend', NULL, 'support_group.member_suspended',
   'Member suspension notice', 1,
   'subject', '["email","sms","in_app"]', '["sms","in_app"]',
   'support_group.member_suspended', 'high', 0, 'warning',
   unixepoch(), unixepoch()),

  -- support_group.broadcast_sent → sms + in_app (all_members; digest eligible for in_app dedup)
  ('rule_sg_broadcast', NULL, 'support_group.broadcast_sent',
   'Group broadcast delivery', 1,
   'all_members', '["sms","in_app"]', '["in_app"]',
   'support_group.broadcast_sent', 'normal', 1, 'info',
   unixepoch(), unixepoch()),

  -- support_group.meeting_scheduled → email + sms + in_app (all_members; digest eligible)
  ('rule_sg_meeting_sched', NULL, 'support_group.meeting_scheduled',
   'Meeting scheduled alert', 1,
   'all_members', '["email","sms","in_app"]', '["sms","in_app"]',
   'support_group.meeting_scheduled', 'normal', 1, 'info',
   unixepoch(), unixepoch()),

  -- support_group.meeting_completed → in_app (all_members; low priority digest)
  ('rule_sg_meeting_done', NULL, 'support_group.meeting_completed',
   'Meeting completed — minutes available', 1,
   'all_members', '["in_app"]', '["in_app"]',
   'support_group.meeting_completed', 'low', 1, 'info',
   unixepoch(), unixepoch()),

  -- support_group.resolution_recorded → in_app (all_members; low priority digest)
  ('rule_sg_resolution', NULL, 'support_group.resolution_recorded',
   'Resolution recorded', 1,
   'all_members', '["in_app"]', '["in_app"]',
   'support_group.resolution_recorded', 'low', 1, 'info',
   unixepoch(), unixepoch()),

  -- support_group.event_created → email + in_app (all_members; digest eligible)
  ('rule_sg_event', NULL, 'support_group.event_created',
   'Group event created', 1,
   'all_members', '["email","in_app"]', '["in_app"]',
   'support_group.event_created', 'normal', 1, 'info',
   unixepoch(), unixepoch()),

  -- support_group.gotv_recorded → in_app (actor only; low priority digest; P13: no voter_ref)
  ('rule_sg_gotv_rec', NULL, 'support_group.gotv_recorded',
   'GOTV mobilisation recorded', 1,
   'actor', '["in_app"]', '["in_app"]',
   'support_group.gotv_recorded', 'low', 1, 'info',
   unixepoch(), unixepoch()),

  -- support_group.gotv_vote_confirmed → sms + in_app (subject: voter; high; P13: no voter_ref)
  ('rule_sg_gotv_vote', NULL, 'support_group.gotv_vote_confirmed',
   'Vote confirmation to participant', 1,
   'subject', '["sms","in_app"]', '["in_app"]',
   'support_group.gotv_vote_confirmed', 'high', 0, 'info',
   unixepoch(), unixepoch()),

  -- support_group.petition_opened → email + in_app (all_members; digest eligible)
  ('rule_sg_petition_open', NULL, 'support_group.petition_opened',
   'New petition opened', 1,
   'all_members', '["email","in_app"]', '["in_app"]',
   'support_group.petition_opened', 'normal', 1, 'info',
   unixepoch(), unixepoch()),

  -- support_group.petition_signed → in_app (workspace_admins — signature count; low; digest)
  ('rule_sg_petition_sign', NULL, 'support_group.petition_signed',
   'Petition signature count update', 1,
   'workspace_admins', '["in_app"]', '["in_app"]',
   'support_group.petition_signed', 'low', 1, 'info',
   unixepoch(), unixepoch()),

  -- support_group.archived → email + in_app (all_members; severity=warning bypasses opt-out)
  ('rule_sg_archived', NULL, 'support_group.archived',
   'Support group archived notice', 1,
   'all_members', '["email","in_app"]', '["in_app"]',
   'support_group.archived', 'normal', 0, 'warning',
   unixepoch(), unixepoch());

-- ============================================================================
-- FUNDRAISING RULES (13 events)
-- ============================================================================

INSERT OR IGNORE INTO notification_rule (
  id, tenant_id, event_key, rule_name, enabled,
  audience_type, channels, channel_fallback,
  template_family, priority, digest_eligible, min_severity,
  created_at, updated_at
) VALUES

  -- fundraising.campaign_created → email + in_app (actor: campaign owner)
  ('rule_fr_camp_created', NULL, 'fundraising.campaign_created',
   'Campaign created — pending review', 1,
   'actor', '["email","in_app"]', '["in_app"]',
   'fundraising.campaign_created', 'normal', 0, 'info',
   unixepoch(), unixepoch()),

  -- fundraising.campaign_approved → email + in_app (actor; high — campaign now live)
  ('rule_fr_camp_approved', NULL, 'fundraising.campaign_approved',
   'Campaign approved and live', 1,
   'actor', '["email","in_app"]', '["in_app"]',
   'fundraising.campaign_approved', 'high', 0, 'info',
   unixepoch(), unixepoch()),

  -- fundraising.campaign_rejected → email + in_app (actor; severity=warning)
  ('rule_fr_camp_rejected', NULL, 'fundraising.campaign_rejected',
   'Campaign not approved', 1,
   'actor', '["email","in_app"]', '["in_app"]',
   'fundraising.campaign_rejected', 'high', 0, 'warning',
   unixepoch(), unixepoch()),

  -- fundraising.campaign_completed → email + in_app (actor; high — payout CTA)
  ('rule_fr_camp_complete', NULL, 'fundraising.campaign_completed',
   'Campaign completed — payout available', 1,
   'actor', '["email","in_app"]', '["in_app"]',
   'fundraising.campaign_completed', 'high', 0, 'info',
   unixepoch(), unixepoch()),

  -- fundraising.contribution_received → email + sms + in_app (actor/donor; high; P13)
  ('rule_fr_contrib_recv', NULL, 'fundraising.contribution_received',
   'Contribution received — awaiting confirmation', 1,
   'actor', '["email","sms","in_app"]', '["sms","in_app"]',
   'fundraising.contribution_received', 'high', 0, 'info',
   unixepoch(), unixepoch()),

  -- fundraising.contribution_confirmed → email + sms + in_app (actor/donor; high; P13)
  ('rule_fr_contrib_confirm', NULL, 'fundraising.contribution_confirmed',
   'Contribution payment confirmed receipt', 1,
   'actor', '["email","sms","in_app"]', '["sms","in_app"]',
   'fundraising.contribution_confirmed', 'high', 0, 'info',
   unixepoch(), unixepoch()),

  -- fundraising.contribution_failed → email + sms (actor; severity=warning; no in_app to avoid confusion)
  ('rule_fr_contrib_fail', NULL, 'fundraising.contribution_failed',
   'Contribution payment failure alert', 1,
   'actor', '["email","sms"]', '["sms"]',
   'fundraising.contribution_failed', 'high', 0, 'warning',
   unixepoch(), unixepoch()),

  -- fundraising.pledge_created → email + in_app (actor; digest eligible)
  ('rule_fr_pledge', NULL, 'fundraising.pledge_created',
   'Pledge received', 1,
   'actor', '["email","in_app"]', '["in_app"]',
   'fundraising.pledge_created', 'normal', 1, 'info',
   unixepoch(), unixepoch()),

  -- fundraising.milestone_reached → email + in_app (workspace_admins)
  ('rule_fr_milestone', NULL, 'fundraising.milestone_reached',
   'Campaign milestone reached', 1,
   'workspace_admins', '["email","in_app"]', '["in_app"]',
   'fundraising.milestone_reached', 'normal', 0, 'info',
   unixepoch(), unixepoch()),

  -- fundraising.update_posted → email + in_app (all_members / subscribers; digest eligible)
  ('rule_fr_update', NULL, 'fundraising.update_posted',
   'Campaign update posted', 1,
   'all_members', '["email","in_app"]', '["in_app"]',
   'fundraising.update_posted', 'normal', 1, 'info',
   unixepoch(), unixepoch()),

  -- fundraising.payout_requested → email + in_app (workspace_admins; high; HITL trigger)
  ('rule_fr_payout_req', NULL, 'fundraising.payout_requested',
   'Payout request submitted — HITL review', 1,
   'workspace_admins', '["email","in_app"]', '["in_app"]',
   'fundraising.payout_requested', 'high', 0, 'info',
   unixepoch(), unixepoch()),

  -- fundraising.payout_approved → email + sms + in_app (subject: campaign owner; high)
  ('rule_fr_payout_approve', NULL, 'fundraising.payout_approved',
   'Payout approved notification', 1,
   'subject', '["email","sms","in_app"]', '["sms","in_app"]',
   'fundraising.payout_approved', 'high', 0, 'info',
   unixepoch(), unixepoch()),

  -- fundraising.payout_rejected → email + in_app (subject; severity=warning)
  ('rule_fr_payout_reject', NULL, 'fundraising.payout_rejected',
   'Payout not approved notice', 1,
   'subject', '["email","in_app"]', '["in_app"]',
   'fundraising.payout_rejected', 'high', 0, 'warning',
   unixepoch(), unixepoch());
