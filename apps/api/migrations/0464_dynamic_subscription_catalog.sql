-- Migration 0464: Dynamic Subscription Catalog (Layer 1)
-- Replaces hardcoded PLAN_CONFIGS with runtime-managed subscription packages.
-- All pricing stored as kobo (Platform Invariant T4).

-- Core package catalog
CREATE TABLE IF NOT EXISTS subscription_packages (
  id                   TEXT NOT NULL PRIMARY KEY,
  slug                 TEXT NOT NULL UNIQUE,
  name                 TEXT NOT NULL,
  description          TEXT,
  status               TEXT NOT NULL DEFAULT 'active'
                       CHECK (status IN ('active','inactive','archived','draft')),
  is_public            INTEGER NOT NULL DEFAULT 1,
  sort_order           INTEGER NOT NULL DEFAULT 0,
  -- Targeting: null = global (any partner/tenant may use)
  partner_id           TEXT,
  target_audience      TEXT NOT NULL DEFAULT 'tenant'
                       CHECK (target_audience IN ('tenant','partner','sub_partner','all')),
  -- Grandfathering: when a new version supersedes this package
  superseded_by        TEXT REFERENCES subscription_packages(id),
  version              INTEGER NOT NULL DEFAULT 1,
  -- Default assignment rules
  is_default           INTEGER NOT NULL DEFAULT 0,
  -- Metadata
  metadata             TEXT NOT NULL DEFAULT '{}',
  created_by           TEXT NOT NULL,
  created_at           INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at           INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Billing intervals (monthly, quarterly, annually, lifetime, etc.)
CREATE TABLE IF NOT EXISTS billing_intervals (
  id                   TEXT NOT NULL PRIMARY KEY,
  code                 TEXT NOT NULL UNIQUE,
  label                TEXT NOT NULL,
  description          TEXT,
  interval_days        INTEGER,
  is_recurring         INTEGER NOT NULL DEFAULT 1,
  is_trial             INTEGER NOT NULL DEFAULT 0,
  trial_days           INTEGER,
  sort_order           INTEGER NOT NULL DEFAULT 0,
  created_at           INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Package pricing per billing interval
CREATE TABLE IF NOT EXISTS package_pricing (
  id                    TEXT NOT NULL PRIMARY KEY,
  package_id            TEXT NOT NULL REFERENCES subscription_packages(id) ON DELETE CASCADE,
  billing_interval_id   TEXT NOT NULL REFERENCES billing_intervals(id),
  -- Price in kobo (₦ × 100) — Platform Invariant T4
  price_kobo            INTEGER NOT NULL DEFAULT 0,
  currency              TEXT NOT NULL DEFAULT 'NGN',
  -- Effective date range for time-based pricing
  effective_from        INTEGER NOT NULL DEFAULT (unixepoch()),
  effective_until       INTEGER,
  -- Trial override: overrides billing_interval trial_days for this package+interval
  trial_days_override   INTEGER,
  is_active             INTEGER NOT NULL DEFAULT 1,
  paystack_plan_code    TEXT,
  metadata              TEXT NOT NULL DEFAULT '{}',
  created_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (package_id, billing_interval_id, effective_from)
);

-- Package targeting rules (which partners/tenants/plans see/get which packages)
CREATE TABLE IF NOT EXISTS package_targeting_rules (
  id             TEXT NOT NULL PRIMARY KEY,
  package_id     TEXT NOT NULL REFERENCES subscription_packages(id) ON DELETE CASCADE,
  rule_type      TEXT NOT NULL CHECK (rule_type IN ('include_partner','exclude_partner','include_tenant','exclude_tenant','min_plan','max_plan')),
  target_value   TEXT NOT NULL,
  created_at     INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Package version lineage (for migration path support)
CREATE TABLE IF NOT EXISTS package_version_history (
  id              TEXT NOT NULL PRIMARY KEY,
  package_id      TEXT NOT NULL REFERENCES subscription_packages(id),
  version         INTEGER NOT NULL,
  snapshot_json   TEXT NOT NULL,
  changed_by      TEXT NOT NULL,
  change_reason   TEXT,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Seed default billing intervals
INSERT OR IGNORE INTO billing_intervals (id, code, label, description, interval_days, is_recurring, is_trial, trial_days, sort_order) VALUES
  ('bi_trial',    'trial',    'Free Trial',  'Time-limited trial period',  NULL, 0, 1, 14, 0),
  ('bi_monthly',  'monthly',  'Monthly',     'Billed every 30 days',       30,   1, 0, NULL, 10),
  ('bi_quarterly','quarterly','Quarterly',   'Billed every 90 days',       90,   1, 0, NULL, 20),
  ('bi_annually', 'annually', 'Annual',      'Billed every 365 days',      365,  1, 0, NULL, 30),
  ('bi_lifetime', 'lifetime', 'Lifetime',    'One-time payment, no expiry',NULL,  0, 0, NULL, 40),
  ('bi_custom',   'custom',   'Custom',      'Custom billing arrangement', NULL,  0, 0, NULL, 50);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscription_packages_slug   ON subscription_packages(slug);
CREATE INDEX IF NOT EXISTS idx_subscription_packages_status ON subscription_packages(status);
CREATE INDEX IF NOT EXISTS idx_package_pricing_package      ON package_pricing(package_id);
CREATE INDEX IF NOT EXISTS idx_package_targeting_package    ON package_targeting_rules(package_id);
