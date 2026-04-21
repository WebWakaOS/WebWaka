-- Migration 0198: Create contact_submissions table for brand-runtime contact forms
-- Platform Invariant: T3 — tenant_id scopes all rows
-- Phase 3 — P3IN1-001

CREATE TABLE IF NOT EXISTS contact_submissions (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL,
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  email       TEXT,
  message     TEXT NOT NULL,
  is_read     INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (tenant_id) REFERENCES organizations(id)
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_tenant
  ON contact_submissions(tenant_id, created_at DESC);
