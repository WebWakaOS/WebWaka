-- Migration 0134: Public Relations Firm vertical (M12)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers
-- P13: client_ref_id is opaque UUID — campaign strategy never to AI

CREATE TABLE IF NOT EXISTS pr_firm_profiles (
  id                TEXT    PRIMARY KEY,
  workspace_id      TEXT    NOT NULL,
  tenant_id         TEXT    NOT NULL,
  firm_name         TEXT    NOT NULL,
  nipr_accreditation TEXT,
  cac_rc            TEXT,
  status            TEXT    NOT NULL DEFAULT 'seeded',
  created_at        INTEGER NOT NULL,
  updated_at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pr_firm_profiles_tenant ON pr_firm_profiles(tenant_id);

CREATE TABLE IF NOT EXISTS pr_campaigns (
  id              TEXT    PRIMARY KEY,
  profile_id      TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  client_ref_id   TEXT    NOT NULL,
  campaign_name   TEXT    NOT NULL,
  campaign_type   TEXT    NOT NULL, -- media/event/crisis/launch/digital
  budget_kobo     INTEGER NOT NULL,
  start_date      INTEGER NOT NULL,
  end_date        INTEGER,
  status          TEXT    NOT NULL DEFAULT 'planning', -- planning/active/completed
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pr_campaigns_tenant ON pr_campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pr_campaigns_profile ON pr_campaigns(profile_id);

CREATE TABLE IF NOT EXISTS pr_media_coverage (
  id            TEXT    PRIMARY KEY,
  profile_id    TEXT    NOT NULL,
  tenant_id     TEXT    NOT NULL,
  campaign_id   TEXT    NOT NULL,
  media_name    TEXT    NOT NULL,
  coverage_date INTEGER NOT NULL,
  clip_ref      TEXT,
  sentiment     TEXT    NOT NULL DEFAULT 'neutral', -- positive/neutral/negative
  created_at    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pr_media_coverage_tenant ON pr_media_coverage(tenant_id);

CREATE TABLE IF NOT EXISTS pr_billing (
  id              TEXT    PRIMARY KEY,
  profile_id      TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  client_ref_id   TEXT    NOT NULL,
  billing_month   TEXT    NOT NULL,
  retainer_kobo   INTEGER NOT NULL DEFAULT 0,
  ad_hoc_kobo     INTEGER NOT NULL DEFAULT 0,
  total_kobo      INTEGER NOT NULL,
  paid_kobo       INTEGER NOT NULL DEFAULT 0,
  created_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pr_billing_tenant ON pr_billing(tenant_id);
