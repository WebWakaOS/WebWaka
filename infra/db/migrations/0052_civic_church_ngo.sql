-- Migration 0052: Civic verticals — Church / Faith Community + NGO
-- packages/verticals-church, verticals-ngo (M8d)
-- T3: tenant_id on all rows.

CREATE TABLE IF NOT EXISTS church_profiles (
  id              TEXT    PRIMARY KEY,
  organization_id TEXT    NOT NULL REFERENCES organizations(id),
  workspace_id    TEXT    NOT NULL REFERENCES workspaces(id),
  tenant_id       TEXT    NOT NULL,
  community_id    TEXT,            -- FK → community_spaces(id) from M7c
  it_number       TEXT,            -- IT-XXXXXXXX from CAC
  denomination    TEXT NOT NULL CHECK (denomination IN ('pentecostal','catholic','anglican','baptist','methodist','orthodox','evangelical','others')),
  founding_year   INTEGER,
  senior_pastor   TEXT,
  total_members   INTEGER NOT NULL DEFAULT 0,
  branch_count    INTEGER NOT NULL DEFAULT 1,
  status          TEXT    NOT NULL DEFAULT 'seeded' CHECK (status IN ('seeded','claimed','it_verified','community_active','active')),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_church_tenant      ON church_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_church_workspace   ON church_profiles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_church_status      ON church_profiles(status, tenant_id);

-- Tithe + offering collection (P9: integer kobo)
CREATE TABLE IF NOT EXISTS tithe_records (
  id            TEXT    PRIMARY KEY,
  workspace_id  TEXT    NOT NULL REFERENCES workspaces(id),
  tenant_id     TEXT    NOT NULL,
  member_id     TEXT    NOT NULL,  -- individual reference (P13: no PII to AI)
  amount_kobo   INTEGER NOT NULL CHECK (amount_kobo > 0),
  payment_type  TEXT    NOT NULL CHECK (payment_type IN ('tithe','offering','seed','donation','special')),
  paystack_ref  TEXT,
  recorded_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_tithe_tenant  ON tithe_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tithe_member  ON tithe_records(member_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_tithe_type    ON tithe_records(payment_type, tenant_id);

-- NGO / Non-Profit profiles
CREATE TABLE IF NOT EXISTS ngo_profiles (
  id              TEXT    PRIMARY KEY,
  organization_id TEXT    NOT NULL REFERENCES organizations(id),
  workspace_id    TEXT    NOT NULL REFERENCES workspaces(id),
  tenant_id       TEXT    NOT NULL,
  community_id    TEXT,            -- FK → community_spaces(id)
  it_number       TEXT,            -- IT-XXXXXXXX from CAC
  sector          TEXT    NOT NULL CHECK (sector IN ('education','health','environment','women','youth','disability','agriculture','legal','tech','others')),
  cac_reg_number  TEXT,
  country_partner TEXT,            -- if international NGO
  beneficiary_count INTEGER NOT NULL DEFAULT 0,
  status          TEXT    NOT NULL DEFAULT 'seeded' CHECK (status IN ('seeded','claimed','it_verified','community_active','active')),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_ngo_tenant    ON ngo_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ngo_workspace ON ngo_profiles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ngo_sector    ON ngo_profiles(sector, tenant_id);

-- NGO grant + funding records
CREATE TABLE IF NOT EXISTS ngo_funding_records (
  id            TEXT    PRIMARY KEY,
  workspace_id  TEXT    NOT NULL REFERENCES workspaces(id),
  tenant_id     TEXT    NOT NULL,
  donor_name    TEXT    NOT NULL,
  amount_kobo   INTEGER NOT NULL CHECK (amount_kobo > 0),
  currency      TEXT    NOT NULL DEFAULT 'NGN',
  purpose       TEXT,
  paystack_ref  TEXT,
  status        TEXT    NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','received','disbursed')),
  received_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_ngo_funding_tenant ON ngo_funding_records(tenant_id);
