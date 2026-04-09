-- Migration 0108 — Campaign Office vertical (M8b)
-- Platform Invariants: T3 (tenant_id NOT NULL), P9 (monetary in kobo)
-- AI: L3 HITL MANDATORY — no AI output without human review
-- INEC Electoral Act 2022 compliance

CREATE TABLE IF NOT EXISTS campaign_office_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  candidate_name TEXT NOT NULL,
  party TEXT,
  office_sought TEXT NOT NULL DEFAULT 'rep',
  inec_filing_ref TEXT,
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_campaign_office_profiles_tenant ON campaign_office_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaign_office_profiles_workspace ON campaign_office_profiles(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS campaign_budget (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'logistics',
  budget_kobo INTEGER NOT NULL CHECK(budget_kobo >= 0),
  spent_kobo INTEGER NOT NULL DEFAULT 0 CHECK(spent_kobo >= 0),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_campaign_budget_tenant ON campaign_budget(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaign_budget_profile ON campaign_budget(profile_id, tenant_id);

CREATE TABLE IF NOT EXISTS campaign_donors (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  donor_name TEXT NOT NULL,
  donor_phone TEXT,
  amount_kobo INTEGER NOT NULL CHECK(amount_kobo > 0),
  donation_date INTEGER,
  inec_disclosure_required INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_campaign_donors_tenant ON campaign_donors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaign_donors_profile ON campaign_donors(profile_id, tenant_id);

CREATE TABLE IF NOT EXISTS campaign_volunteers (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  volunteer_phone TEXT,
  volunteer_name TEXT NOT NULL,
  lga TEXT,
  ward TEXT,
  role TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_campaign_volunteers_tenant ON campaign_volunteers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaign_volunteers_profile ON campaign_volunteers(profile_id, tenant_id);

CREATE TABLE IF NOT EXISTS campaign_events (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'rally',
  location TEXT,
  lga TEXT,
  event_date INTEGER,
  estimated_attendance INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_campaign_events_tenant ON campaign_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaign_events_profile ON campaign_events(profile_id, tenant_id);
