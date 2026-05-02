-- Migration 0469: Feature Flags & Runtime Configuration (Layer 5)
-- Platform-wide runtime configuration flags with hierarchical targeting.
-- Extends/supersedes pilot_feature_flags with a richer targeting model.

-- Flag definitions: the master catalog of all named config flags
CREATE TABLE IF NOT EXISTS configuration_flags (
  id             TEXT NOT NULL PRIMARY KEY,
  code           TEXT NOT NULL UNIQUE,
  name           TEXT NOT NULL,
  description    TEXT,
  category       TEXT NOT NULL DEFAULT 'feature'
                 CHECK (category IN ('feature','beta','kill_switch','ui','behavior','rollout','emergency')),
  value_type     TEXT NOT NULL DEFAULT 'boolean'
                 CHECK (value_type IN ('boolean','string','integer','json')),
  default_value  TEXT NOT NULL DEFAULT 'false',
  -- Who can toggle this flag (minimum admin level)
  min_scope      TEXT NOT NULL DEFAULT 'platform'
                 CHECK (min_scope IN ('platform','partner','tenant','workspace')),
  -- Is this flag inherited downward?
  inheritable    INTEGER NOT NULL DEFAULT 1,
  -- Kill switches block everything below when enabled
  is_kill_switch INTEGER NOT NULL DEFAULT 0,
  -- Staged rollout: percentage 0-100
  rollout_pct    INTEGER NOT NULL DEFAULT 100,
  is_active      INTEGER NOT NULL DEFAULT 1,
  notes          TEXT,
  created_by     TEXT NOT NULL,
  created_at     INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at     INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Scoped overrides: per-environment/tenant/partner/workspace/plan flag values
CREATE TABLE IF NOT EXISTS configuration_overrides (
  id             TEXT NOT NULL PRIMARY KEY,
  flag_id        TEXT NOT NULL REFERENCES configuration_flags(id) ON DELETE CASCADE,
  scope          TEXT NOT NULL CHECK (scope IN ('environment','plan','partner','tenant','workspace')),
  scope_id       TEXT NOT NULL,
  value          TEXT NOT NULL,
  reason         TEXT,
  set_by         TEXT NOT NULL,
  expires_at     INTEGER,
  is_active      INTEGER NOT NULL DEFAULT 1,
  created_at     INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at     INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (flag_id, scope, scope_id)
);

-- Flag targeting rules: only enable/disable for specific segments
CREATE TABLE IF NOT EXISTS flag_targeting_rules (
  id             TEXT NOT NULL PRIMARY KEY,
  flag_id        TEXT NOT NULL REFERENCES configuration_flags(id) ON DELETE CASCADE,
  rule_type      TEXT NOT NULL CHECK (rule_type IN ('include_tenant','exclude_tenant','include_plan','exclude_plan','include_partner','exclude_partner','rollout_pct')),
  target_value   TEXT NOT NULL,
  priority       INTEGER NOT NULL DEFAULT 0,
  created_at     INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Seed core platform flags (migrating from hardcoded env vars + WALLET_KV + pilot flags)
INSERT OR IGNORE INTO configuration_flags (id, code, name, description, category, value_type, default_value, min_scope, is_kill_switch, created_by) VALUES
  ('flag_notification_pipeline', 'notification_pipeline_enabled', 'Notification Pipeline', 'Use queue-based notification pipeline vs legacy email service', 'feature',    'boolean', 'false', 'platform', 0, 'system'),
  ('flag_wallet_transfers',      'wallet_transfers_enabled',       'Wallet Transfers',      'Enable wallet-to-wallet transfers',                              'feature',    'boolean', 'false', 'platform', 0, 'system'),
  ('flag_wallet_withdrawals',    'wallet_withdrawals_enabled',     'Wallet Withdrawals',    'Enable wallet withdrawal to bank',                              'feature',    'boolean', 'false', 'platform', 0, 'system'),
  ('flag_wallet_online_funding', 'wallet_online_funding_enabled',  'Wallet Online Funding', 'Enable Paystack-based online wallet top-up',                    'feature',    'boolean', 'false', 'platform', 0, 'system'),
  ('flag_wallet_mla_payout',     'wallet_mla_payout_enabled',      'MLA Payout',            'Enable MLA commission payout queue',                           'feature',    'boolean', 'false', 'platform', 0, 'system'),
  ('flag_ai_chat_beta',          'ai_chat_beta',                   'AI Chat Beta',          'Access to AI chat assistant (beta)',                             'beta',       'boolean', 'false', 'tenant',   0, 'system'),
  ('flag_ai_insights_beta',      'ai_insights_beta',               'AI Insights Beta',      'AI-generated business insights (beta)',                          'beta',       'boolean', 'false', 'tenant',   0, 'system'),
  ('flag_paystack_mode',         'payment_mode_paystack',          'Paystack Payment Mode', 'Use Paystack for online payments (vs bank transfer)',             'behavior',   'boolean', 'false', 'platform', 0, 'system'),
  ('flag_ussd_gateway',          'ussd_gateway_enabled',           'USSD Gateway',          'Enable USSD-based interaction gateway',                          'feature',    'boolean', 'true',  'platform', 0, 'system'),
  ('flag_maintenance_mode',      'maintenance_mode',               'Maintenance Mode',      'Platform-wide maintenance kill switch',                          'kill_switch','boolean', 'false', 'platform', 1, 'system'),
  ('flag_new_onboarding',        'new_onboarding_flow',            'New Onboarding Flow',   'Use updated onboarding UX',                                      'rollout',    'boolean', 'false', 'tenant',   0, 'system'),
  ('flag_discovery_v2',          'discovery_v2',                   'Discovery V2',          'Use improved search and discovery engine',                        'rollout',    'boolean', 'false', 'platform', 0, 'system'),
  ('flag_wakapage_v2',           'wakapage_v2',                    'WakaPage V2',           'New WakaPage profile builder',                                   'beta',       'boolean', 'false', 'tenant',   0, 'system'),
  ('flag_b2b_marketplace',       'b2b_marketplace_enabled',        'B2B Marketplace',       'Enable B2B negotiation and marketplace features',                'feature',    'boolean', 'true',  'platform', 0, 'system');

CREATE INDEX IF NOT EXISTS idx_config_flags_code       ON configuration_flags(code);
CREATE INDEX IF NOT EXISTS idx_config_overrides_flag   ON configuration_overrides(flag_id);
CREATE INDEX IF NOT EXISTS idx_config_overrides_scope  ON configuration_overrides(scope, scope_id);
CREATE INDEX IF NOT EXISTS idx_flag_targeting_flag     ON flag_targeting_rules(flag_id);
