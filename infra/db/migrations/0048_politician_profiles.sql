-- Migration 0048: Politician vertical profiles
-- packages/verticals-politician (M8b)
-- T3: tenant_id on all rows; indexed for scoped queries.

CREATE TABLE IF NOT EXISTS politician_profiles (
  id               TEXT PRIMARY KEY,
  individual_id    TEXT NOT NULL REFERENCES individuals(id),
  workspace_id     TEXT NOT NULL REFERENCES workspaces(id),
  tenant_id        TEXT NOT NULL,
  office_type      TEXT NOT NULL,   -- councilor|lga_chairman|state_assembly|hor|senator|governor|president
  jurisdiction_id  TEXT NOT NULL,
  party_id         TEXT,            -- FK → organizations (party); null = independent
  nin_verified     INTEGER NOT NULL DEFAULT 0,
  inec_filing_ref  TEXT,
  term_start       INTEGER,
  term_end         INTEGER,
  status           TEXT NOT NULL DEFAULT 'seeded',  -- FSM state
  created_at       INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_politician_tenant        ON politician_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_politician_office        ON politician_profiles(office_type);
CREATE INDEX IF NOT EXISTS idx_politician_jurisdiction  ON politician_profiles(jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_politician_workspace     ON politician_profiles(workspace_id);

-- Campaign donations (owned by CampaignRepository in verticals-politician)
-- P9: amount_kobo is always an integer (never decimal).
-- P13: donor_phone is stored locally only; never forwarded to AI usage events.
-- T3: tenant_id on every row; all queries scoped.
CREATE TABLE IF NOT EXISTS campaign_donations (
  id            TEXT    PRIMARY KEY,
  workspace_id  TEXT    NOT NULL REFERENCES workspaces(id),
  tenant_id     TEXT    NOT NULL,
  donor_phone   TEXT    NOT NULL,
  amount_kobo   INTEGER NOT NULL CHECK (amount_kobo > 0),
  paystack_ref  TEXT,                             -- populated on confirmDonation
  status        TEXT    NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_campaign_donations_tenant     ON campaign_donations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaign_donations_workspace  ON campaign_donations(workspace_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaign_donations_status     ON campaign_donations(status, tenant_id);
