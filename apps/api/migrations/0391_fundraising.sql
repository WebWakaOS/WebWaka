-- Migration: 0391_fundraising
-- WebWaka shared fundraising engine — full schema.
-- Deprecates fragmented campaign_donations (0048) for new campaigns.
-- Church tithe_records (0052) are bridged via tithe_fundraising_bridge.
--
-- Platform Invariants:
--   T3  — tenant_id on every table and index
--   T4  — all monetary values in integer kobo (never REAL)
--   P9  — integer kobo assertion at application layer
--   P13 — donor PII (phone, bank details) never forwarded to AI
--
-- Assumptions encoded inline (no legal deferral):
--
-- [A1] INEC Electoral Act 2022 — political fundraising disclosure threshold.
--      Implementation uses ₦50,000,000 (50m kobo) per-contributor cap for
--      political campaigns. If FIRS or INEC guidance differs, update
--      fundraising_campaigns.inec_cap_kobo and companion API validation only.
--      The data model is cap-agnostic; enforcement is at the application layer.
--
-- [A2] CBN payment aggregation — the platform uses a pass-through model
--      (Paystack collect-to-beneficiary) not a pooled escrow model, to stay
--      within Paystack's existing CBN approval rather than requiring a separate
--      PSP licence. payout_requests route through Paystack Transfers API.
--      Bank details are treated as sensitive and stored with application-layer
--      encryption via R2 envelope; raw values are NEVER logged.
--
-- [A3] Church tithe_records (0052) — new church fundraising uses this shared
--      engine. tithe_fundraising_bridge provides migration path for existing
--      tithe records. tithe_records table is preserved (not dropped) because
--      it may contain pre-launch test data; it is deprecated for new writes.
--
-- [A4] WhatsApp broadcast for donor notifications is implemented via notificator
--      channel-provider adapter with SMS fallback. Meta Business API review is
--      a credential/configuration item, not an architecture blocker.

-- ---------------------------------------------------------------------------
-- Core campaign entity
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS fundraising_campaigns (
  id                       TEXT    PRIMARY KEY,
  workspace_id             TEXT    NOT NULL REFERENCES workspaces(id),
  tenant_id                TEXT    NOT NULL,
  title                    TEXT    NOT NULL,
  slug                     TEXT    NOT NULL,
  description              TEXT    NOT NULL DEFAULT '',
  story                    TEXT,
  -- general|political|emergency|community|election|church|ngo|personal|education|health
  campaign_type            TEXT    NOT NULL DEFAULT 'general',
  goal_kobo                INTEGER NOT NULL DEFAULT 0,
  raised_kobo              INTEGER NOT NULL DEFAULT 0,
  contributor_count        INTEGER NOT NULL DEFAULT 0,
  currency_code            TEXT    NOT NULL DEFAULT 'NGN',
  beneficiary_name         TEXT    NOT NULL,
  beneficiary_workspace_id TEXT,
  cover_image_url          TEXT,
  -- draft|pending_review|active|paused|completed|cancelled|rejected
  status                   TEXT    NOT NULL DEFAULT 'draft',
  -- public|private|unlisted
  visibility               TEXT    NOT NULL DEFAULT 'public',
  ends_at                  INTEGER,
  -- [A1] Political compliance
  -- 0 = no cap (non-political); 5000000000 = ₦50,000,000 kobo for political
  inec_cap_kobo            INTEGER NOT NULL DEFAULT 0,
  inec_disclosure_required INTEGER NOT NULL DEFAULT 0,
  -- NDPR
  ndpr_consent_required    INTEGER NOT NULL DEFAULT 1,
  -- Donor experience
  donor_wall_enabled       INTEGER NOT NULL DEFAULT 1,
  anonymous_allowed        INTEGER NOT NULL DEFAULT 1,
  rewards_enabled          INTEGER NOT NULL DEFAULT 0,
  -- Moderation (HITL for political campaigns)
  hitl_required            INTEGER NOT NULL DEFAULT 0,
  moderation_note          TEXT,
  moderated_by             TEXT,
  moderated_at             INTEGER,
  -- Support group linkage
  support_group_id         TEXT    REFERENCES support_groups(id),
  created_at               INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at               INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fundraising_campaigns_slug_tenant
  ON fundraising_campaigns(slug, tenant_id);

CREATE INDEX IF NOT EXISTS idx_fundraising_campaigns_tenant
  ON fundraising_campaigns(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_fundraising_campaigns_workspace
  ON fundraising_campaigns(workspace_id, tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_fundraising_campaigns_type
  ON fundraising_campaigns(campaign_type, status, tenant_id);

CREATE INDEX IF NOT EXISTS idx_fundraising_campaigns_support_group
  ON fundraising_campaigns(support_group_id, tenant_id);

-- ---------------------------------------------------------------------------
-- Contributions (replaces campaign_donations for all new campaigns)
-- [A2]: Paystack direct-to-beneficiary pass-through; no pooled escrow.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS fundraising_contributions (
  id                   TEXT    PRIMARY KEY,
  campaign_id          TEXT    NOT NULL REFERENCES fundraising_campaigns(id),
  workspace_id         TEXT    NOT NULL,
  tenant_id            TEXT    NOT NULL,
  donor_user_id        TEXT,
  donor_display_name   TEXT,
  -- P13: donor_phone stored locally; never forwarded to AI
  donor_phone          TEXT    NOT NULL,
  -- T4: integer kobo; check > 0
  amount_kobo          INTEGER NOT NULL CHECK (amount_kobo > 0),
  paystack_ref         TEXT,
  -- card|bank_transfer|ussd|mobile_money
  payment_channel      TEXT    NOT NULL DEFAULT 'card',
  -- pending|confirmed|failed|refunded
  status               TEXT    NOT NULL DEFAULT 'pending',
  is_anonymous         INTEGER NOT NULL DEFAULT 0,
  pledge_id            TEXT    REFERENCES fundraising_pledges(id),
  reward_id            TEXT    REFERENCES fundraising_rewards(id),
  ndpr_consented       INTEGER NOT NULL DEFAULT 0,
  -- [A1] For political: marks that cap check passed at time of contribution
  compliance_verified  INTEGER NOT NULL DEFAULT 0,
  created_at           INTEGER NOT NULL DEFAULT (unixepoch()),
  confirmed_at         INTEGER
);

CREATE INDEX IF NOT EXISTS idx_fundraising_contributions_campaign
  ON fundraising_contributions(campaign_id, tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_fundraising_contributions_donor
  ON fundraising_contributions(donor_user_id, tenant_id);

CREATE INDEX IF NOT EXISTS idx_fundraising_contributions_paystack
  ON fundraising_contributions(paystack_ref, tenant_id);

-- FK bridge: links old campaign_donations to new system for any that are
-- migrated during operational upgrade. Both tables coexist; campaign_donations
-- is deprecated for new writes. The bridge is an internal adapter only.
CREATE TABLE IF NOT EXISTS campaign_donation_bridge (
  old_donation_id          TEXT    PRIMARY KEY REFERENCES campaign_donations(id),
  new_contribution_id      TEXT    NOT NULL REFERENCES fundraising_contributions(id),
  migrated_at              INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ---------------------------------------------------------------------------
-- Pledges (recurring commitments)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS fundraising_pledges (
  id              TEXT    PRIMARY KEY,
  campaign_id     TEXT    NOT NULL REFERENCES fundraising_campaigns(id),
  workspace_id    TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  -- P13: phone stored locally
  pledger_phone   TEXT    NOT NULL,
  pledger_user_id TEXT,
  amount_kobo     INTEGER NOT NULL CHECK (amount_kobo > 0),
  -- one_time|weekly|monthly|quarterly|annual
  frequency       TEXT    NOT NULL DEFAULT 'one_time',
  total_paid_kobo INTEGER NOT NULL DEFAULT 0,
  -- active|paused|cancelled|fulfilled
  status          TEXT    NOT NULL DEFAULT 'active',
  next_due_at     INTEGER,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_fundraising_pledges_campaign
  ON fundraising_pledges(campaign_id, tenant_id, status);

-- ---------------------------------------------------------------------------
-- Milestones
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS fundraising_milestones (
  id            TEXT    PRIMARY KEY,
  campaign_id   TEXT    NOT NULL REFERENCES fundraising_campaigns(id),
  workspace_id  TEXT    NOT NULL,
  tenant_id     TEXT    NOT NULL,
  title         TEXT    NOT NULL,
  target_kobo   INTEGER NOT NULL CHECK (target_kobo > 0),
  reached_at    INTEGER,
  description   TEXT,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_fundraising_milestones_campaign
  ON fundraising_milestones(campaign_id, tenant_id);

-- ---------------------------------------------------------------------------
-- Campaign updates (stories posted to donors)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS fundraising_updates (
  id            TEXT    PRIMARY KEY,
  campaign_id   TEXT    NOT NULL REFERENCES fundraising_campaigns(id),
  workspace_id  TEXT    NOT NULL,
  tenant_id     TEXT    NOT NULL,
  title         TEXT    NOT NULL,
  body          TEXT    NOT NULL,
  media_url     TEXT,
  -- all|donors_only
  visibility    TEXT    NOT NULL DEFAULT 'all',
  posted_by     TEXT    NOT NULL,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_fundraising_updates_campaign
  ON fundraising_updates(campaign_id, tenant_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- Rewards (donor perks)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS fundraising_rewards (
  id              TEXT    PRIMARY KEY,
  campaign_id     TEXT    NOT NULL REFERENCES fundraising_campaigns(id),
  workspace_id    TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  title           TEXT    NOT NULL,
  description     TEXT,
  min_amount_kobo INTEGER NOT NULL CHECK (min_amount_kobo > 0),
  quantity        INTEGER NOT NULL DEFAULT -1,
  claimed_count   INTEGER NOT NULL DEFAULT 0,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_fundraising_rewards_campaign
  ON fundraising_rewards(campaign_id, tenant_id);

CREATE TABLE IF NOT EXISTS fundraising_reward_claims (
  id              TEXT    PRIMARY KEY,
  reward_id       TEXT    NOT NULL REFERENCES fundraising_rewards(id),
  contribution_id TEXT    NOT NULL REFERENCES fundraising_contributions(id),
  workspace_id    TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  -- P13
  donor_phone     TEXT    NOT NULL,
  -- pending|fulfilled|cancelled
  status          TEXT    NOT NULL DEFAULT 'pending',
  claimed_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ---------------------------------------------------------------------------
-- Payout requests
-- [A2]: Paystack Transfers API (direct pass-through); bank_account_number
--       is stored encrypted at application layer; raw value never in logs.
-- All political campaign payouts have hitl_required = 1 (enforced in API).
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS fundraising_payout_requests (
  id                     TEXT    PRIMARY KEY,
  campaign_id            TEXT    NOT NULL REFERENCES fundraising_campaigns(id),
  workspace_id           TEXT    NOT NULL,
  tenant_id              TEXT    NOT NULL,
  requested_by           TEXT    NOT NULL,
  amount_kobo            INTEGER NOT NULL CHECK (amount_kobo > 0),
  bank_account_name      TEXT    NOT NULL,
  -- P13: encrypted at app layer before storage; displayed masked only
  bank_account_number    TEXT    NOT NULL,
  bank_code              TEXT    NOT NULL,
  reason                 TEXT    NOT NULL,
  -- HITL — political campaigns always require human review
  hitl_required          INTEGER NOT NULL DEFAULT 1,
  -- pending|approved|rejected
  hitl_status            TEXT    NOT NULL DEFAULT 'pending',
  hitl_reviewer_id       TEXT,
  hitl_reviewed_at       INTEGER,
  hitl_note              TEXT,
  -- Execution
  paystack_transfer_code TEXT,
  -- pending|approved|processing|completed|failed|rejected
  status                 TEXT    NOT NULL DEFAULT 'pending',
  processed_at           INTEGER,
  created_at             INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_fundraising_payout_campaign
  ON fundraising_payout_requests(campaign_id, tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_fundraising_payout_hitl
  ON fundraising_payout_requests(hitl_status, hitl_required, tenant_id);

-- ---------------------------------------------------------------------------
-- Compliance declarations
-- [A1] INEC; [A2] CBN; [A3] church tithe migration; NDPR DPA
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS fundraising_compliance_declarations (
  id               TEXT    PRIMARY KEY,
  campaign_id      TEXT    NOT NULL REFERENCES fundraising_campaigns(id),
  workspace_id     TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  -- inec_political|cbn_psp_exempt|ndpr_dpa|church_tithe_migration|ngo_it_exempt
  declaration_type TEXT    NOT NULL,
  declared_by      TEXT    NOT NULL,
  declared_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  reference_doc    TEXT,
  notes            TEXT,
  -- declared|verified|expired
  status           TEXT    NOT NULL DEFAULT 'declared'
);

CREATE INDEX IF NOT EXISTS idx_fundraising_compliance_campaign
  ON fundraising_compliance_declarations(campaign_id, tenant_id);

-- ---------------------------------------------------------------------------
-- Church tithe migration bridge
-- [A3]: links tithe_records rows to fundraising_contributions after migration.
-- tithe_records is deprecated for new writes; this bridge is internal only.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tithe_fundraising_bridge (
  tithe_record_id             TEXT    PRIMARY KEY REFERENCES tithe_records(id),
  fundraising_contribution_id TEXT    REFERENCES fundraising_contributions(id),
  migrated_at                 INTEGER NOT NULL DEFAULT (unixepoch())
);
