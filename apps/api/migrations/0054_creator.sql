-- Migration 0054: Creator / Influencer vertical
-- packages/verticals-creator (M8e)
-- T3: tenant_id on all rows. P9: monetary amounts in integer kobo.

CREATE TABLE IF NOT EXISTS creator_profiles (
  id                TEXT    PRIMARY KEY,
  individual_id     TEXT    NOT NULL,   -- FK → individuals(id)
  workspace_id      TEXT    NOT NULL REFERENCES workspaces(id),
  tenant_id         TEXT    NOT NULL,
  social_profile_id TEXT,              -- FK → social_profiles(id) from M7d
  community_id      TEXT,              -- FK → community_spaces(id) from M7c
  niche             TEXT    NOT NULL CHECK (niche IN ('lifestyle','fashion','comedy','tech','finance','food','travel','sports','beauty','gaming','education','music','others')),
  follower_count    INTEGER NOT NULL DEFAULT 0,
  verified_brand    INTEGER NOT NULL DEFAULT 0,  -- 0/1 boolean
  monthly_rate_kobo INTEGER,           -- Brand deal rate card floor price (P9)
  status            TEXT    NOT NULL DEFAULT 'seeded' CHECK (status IN ('seeded','claimed','social_active','monetization_enabled','active')),
  created_at        INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_creator_tenant    ON creator_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_creator_workspace ON creator_profiles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_creator_niche     ON creator_profiles(niche, tenant_id);

-- Brand partnership deals
CREATE TABLE IF NOT EXISTS brand_deals (
  id              TEXT    PRIMARY KEY,
  workspace_id    TEXT    NOT NULL REFERENCES workspaces(id),
  tenant_id       TEXT    NOT NULL,
  creator_id      TEXT    NOT NULL REFERENCES creator_profiles(id),
  brand_name      TEXT    NOT NULL,
  deal_value_kobo INTEGER,             -- P9: integer kobo; null = TBD
  deliverables    TEXT,                -- JSON: [{type, deadline, platform}]
  status          TEXT    NOT NULL DEFAULT 'enquiry' CHECK (status IN ('enquiry','negotiating','confirmed','delivered','paid','cancelled')),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_brand_deals_tenant  ON brand_deals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_brand_deals_creator ON brand_deals(creator_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_brand_deals_status  ON brand_deals(status, tenant_id);
