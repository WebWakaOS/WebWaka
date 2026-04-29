-- Migration: 0421_wakapage_leads
-- Phase 1 — WakaPage entities: structured lead capture records.
--
-- Leads are originated from WakaPage contact_form and cta_button blocks.
-- Do NOT use @webwaka/contact for this — leads are a distinct concern from
-- channel-level contact management.
--
-- NDPR compliance:
--   - phone and email store user-provided data; both are optional and nullable.
--   - A DSAR request can identify leads by tenant_id + (email or phone).
--   - leads.id is the data-subject handle for deletion requests.
--   - No cross-tenant access permitted (T3).
--
-- Platform Invariants:
--   T3 — tenant_id on every row; every query MUST predicate on tenant_id
--   G23 — additive only
--   P9  — no monetary fields
--
-- Dependencies: wakapage_pages (0419)

CREATE TABLE IF NOT EXISTS wakapage_leads (
  id              TEXT    NOT NULL PRIMARY KEY,
  tenant_id       TEXT    NOT NULL,
  page_id         TEXT    NOT NULL
                  REFERENCES wakapage_pages(id) ON DELETE CASCADE,
  source_block_id TEXT,          -- FK to wakapage_blocks.id (nullable: block may be deleted)
  source_block_type TEXT,        -- denormalised block_type for audit/analytics
  name            TEXT,          -- NDPR: user-provided; deletable on DSAR
  phone           TEXT,          -- NDPR: user-provided; deletable on DSAR
  email           TEXT,          -- NDPR: user-provided; deletable on DSAR
  message         TEXT,          -- NDPR: user-provided; deletable on DSAR
  metadata_json   TEXT NOT NULL DEFAULT '{}', -- UTM params, referrer etc (no PII)
  status          TEXT NOT NULL DEFAULT 'new'
                  CHECK (status IN ('new','contacted','converted','dismissed')),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_wakapage_leads_tenant_page
  ON wakapage_leads(tenant_id, page_id);

CREATE INDEX IF NOT EXISTS idx_wakapage_leads_tenant_status
  ON wakapage_leads(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_wakapage_leads_created_at
  ON wakapage_leads(tenant_id, created_at DESC);
