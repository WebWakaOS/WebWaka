-- Migration 0053: Cooperative Society vertical
-- packages/verticals-cooperative (M8d)
-- T3: tenant_id on all rows. P9: all amounts in integer kobo.

CREATE TABLE IF NOT EXISTS cooperative_members (
  id              TEXT    PRIMARY KEY,
  workspace_id    TEXT    NOT NULL REFERENCES workspaces(id),
  tenant_id       TEXT    NOT NULL,
  user_id         TEXT    NOT NULL,   -- individual reference
  member_number   TEXT    NOT NULL,
  shares_count    INTEGER NOT NULL DEFAULT 0,
  status          TEXT    NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','exited')),
  joined_at       INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_coop_member_num    ON cooperative_members(member_number, tenant_id);
CREATE INDEX        IF NOT EXISTS idx_coop_member_tenant ON cooperative_members(tenant_id);
CREATE INDEX        IF NOT EXISTS idx_coop_member_user   ON cooperative_members(user_id, tenant_id);

CREATE TABLE IF NOT EXISTS cooperative_contributions (
  id            TEXT    PRIMARY KEY,
  workspace_id  TEXT    NOT NULL REFERENCES workspaces(id),
  tenant_id     TEXT    NOT NULL,
  member_id     TEXT    NOT NULL REFERENCES cooperative_members(id),
  amount_kobo   INTEGER NOT NULL CHECK (amount_kobo > 0),
  cycle_month   TEXT    NOT NULL,   -- YYYY-MM
  paystack_ref  TEXT,
  status        TEXT    NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','missed')),
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_coop_contrib_tenant ON cooperative_contributions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_coop_contrib_member ON cooperative_contributions(member_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_coop_contrib_cycle  ON cooperative_contributions(cycle_month, tenant_id);

CREATE TABLE IF NOT EXISTS cooperative_loans (
  id              TEXT    PRIMARY KEY,
  workspace_id    TEXT    NOT NULL REFERENCES workspaces(id),
  tenant_id       TEXT    NOT NULL,
  member_id       TEXT    NOT NULL REFERENCES cooperative_members(id),
  amount_kobo     INTEGER NOT NULL CHECK (amount_kobo > 0),
  interest_rate   INTEGER NOT NULL,   -- basis points (500 = 5%)
  duration_months INTEGER NOT NULL CHECK (duration_months > 0),
  guarantor_id    TEXT,               -- member_id of guarantor
  status          TEXT    NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','active','repaid','defaulted')),
  approved_at     INTEGER,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_coop_loan_tenant ON cooperative_loans(tenant_id);
CREATE INDEX IF NOT EXISTS idx_coop_loan_member ON cooperative_loans(member_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_coop_loan_status ON cooperative_loans(status, tenant_id);
