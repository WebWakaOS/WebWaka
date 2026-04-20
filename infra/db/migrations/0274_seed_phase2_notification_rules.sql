-- Migration: 0274_seed_phase2_notification_rules
-- Description: Seed platform-level notification rules for Phase 2 auth event types
--   introduced in N-026: workspace invite and email verification sent.
--
-- These rules enable the notification pipeline to dispatch emails for:
--   auth.user.invited              → workspace invitation email (template: auth.workspace_invite)
--   auth.user.email_verification_sent → verification email (template: auth.email_verification)
--
-- Platform-level (tenant_id IS NULL) — tenant rules can override.
-- Added in Phase 2 alongside N-026 auth-routes.ts email replacement.

INSERT OR IGNORE INTO notification_rule (
  id, tenant_id, event_key, rule_name, enabled,
  audience_type, channels, channel_fallback,
  template_family, priority, digest_eligible, min_severity,
  created_at, updated_at
) VALUES
  -- auth.user.invited → email only (invite recipient must click the link)
  ('rule_auth_invited', NULL, 'auth.user.invited', 'Workspace invitation email', 1,
   'actor', '["email"]', NULL,
   'auth.workspace_invite', 'high', 0, 'info',
   unixepoch(), unixepoch()),

  -- auth.user.email_verification_sent → email only (verification link)
  ('rule_auth_email_verify_sent', NULL, 'auth.user.email_verification_sent',
   'Email verification link', 1,
   'actor', '["email"]', NULL,
   'auth.email_verification', 'high', 0, 'info',
   unixepoch(), unixepoch());
