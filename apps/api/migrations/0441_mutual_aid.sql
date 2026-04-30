-- Migration 0441 — Mutual Aid Requests
-- Phase 2: Value Movement sub-type — Mutual Aid (FR-VM-16)
-- Creates mutual_aid_requests (member requests aid from group) and
-- mutual_aid_votes (group members vote approve/reject)
--
-- Platform Invariants:
--   T3  — tenant_id on all records
--   P9  — amount_kobo is INTEGER
--   P10 — ndpr_consented required on request creation

CREATE TABLE IF NOT EXISTS mutual_aid_requests (
  id               TEXT PRIMARY KEY,
  tenant_id        TEXT NOT NULL,
  workspace_id     TEXT NOT NULL,
  group_id         TEXT NOT NULL,
  requester_id     TEXT NOT NULL,
  title            TEXT NOT NULL,
  description      TEXT NOT NULL,
  amount_kobo      INTEGER NOT NULL CHECK (amount_kobo > 0),   -- P9
  currency_code    TEXT NOT NULL DEFAULT 'NGN',
  ndpr_consented   INTEGER NOT NULL DEFAULT 0 CHECK (ndpr_consented IN (0,1)), -- P10
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (
                     status IN ('pending','voting','approved','disbursed','rejected','cancelled')
                   ),
  votes_required   INTEGER NOT NULL DEFAULT 3,                 -- quorum
  votes_approve    INTEGER NOT NULL DEFAULT 0,
  votes_reject     INTEGER NOT NULL DEFAULT 0,
  approved_by      TEXT,
  approved_at      INTEGER,
  disbursed_at     INTEGER,
  disbursement_ref TEXT,
  rejected_reason  TEXT,
  created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at       INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_mutual_aid_requests_tenant_group
  ON mutual_aid_requests (tenant_id, group_id);

CREATE INDEX IF NOT EXISTS idx_mutual_aid_requests_requester
  ON mutual_aid_requests (tenant_id, requester_id);

-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS mutual_aid_votes (
  id           TEXT PRIMARY KEY,
  tenant_id    TEXT NOT NULL,
  request_id   TEXT NOT NULL REFERENCES mutual_aid_requests(id),
  voter_id     TEXT NOT NULL,
  decision     TEXT NOT NULL CHECK (decision IN ('approve','reject')),
  note         TEXT,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mutual_aid_votes_unique
  ON mutual_aid_votes (tenant_id, request_id, voter_id);

CREATE INDEX IF NOT EXISTS idx_mutual_aid_votes_request
  ON mutual_aid_votes (tenant_id, request_id);
