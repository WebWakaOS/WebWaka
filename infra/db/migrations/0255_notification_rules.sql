-- Migration: 0255_notification_rules
-- Description: Create notification_rule table — event-to-audience-to-channel routing.
--   Rules are evaluated by NotificationService.raise() to determine which channels,
--   template families, and audience types to use for each event.
--
-- Platform-level rules (tenant_id IS NULL) serve as defaults for all tenants.
-- Tenant-specific rules override platform defaults.
--
-- Phase 2 (N-021): Rule engine implementation reads from this table.
-- Phase 1 (N-015): Platform default rules seeded in 0269_seed_notification_rules.sql.

CREATE TABLE IF NOT EXISTS notification_rule (
  id              TEXT PRIMARY KEY,           -- 'rule_' + uuid
  tenant_id       TEXT,                       -- NULL = platform default rule
  event_key       TEXT NOT NULL,              -- matches notification_event.event_key
  rule_name       TEXT NOT NULL,
  enabled         INTEGER NOT NULL DEFAULT 1
    CHECK (enabled IN (0, 1)),
  audience_type   TEXT NOT NULL               -- who receives the notification
    CHECK (audience_type IN (
      'actor', 'subject', 'workspace_admins', 'tenant_admins',
      'all_members', 'super_admins', 'partner_admins', 'custom'
    )),
  audience_filter TEXT,                       -- JSON: custom audience resolution params
  channels        TEXT NOT NULL,             -- JSON array: ['email','sms','push','in_app']
  channel_fallback TEXT,                     -- JSON: fallback chain e.g. ['sms','in_app']
  template_family TEXT NOT NULL,             -- matches notification_template.template_family
  priority        TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  digest_eligible INTEGER NOT NULL DEFAULT 0  -- 1 = can be batched in digest window
    CHECK (digest_eligible IN (0, 1)),
  min_severity    TEXT NOT NULL DEFAULT 'info'
    CHECK (min_severity IN ('info', 'warning', 'critical')),
  feature_flag    TEXT,                       -- optional feature flag gate
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_notif_rule_event_key
  ON notification_rule(event_key);

CREATE INDEX IF NOT EXISTS idx_notif_rule_tenant_event
  ON notification_rule(tenant_id, event_key)
  WHERE tenant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notif_rule_platform_event
  ON notification_rule(event_key)
  WHERE tenant_id IS NULL;
