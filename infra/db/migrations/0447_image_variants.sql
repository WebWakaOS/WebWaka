-- Migration 0447 — Low-Bandwidth Image Pipeline: image_variants
-- Phase 3 (E23): R2 variant URL registry for group logos, campaign covers, event images.
-- Actual resize processing is async (Cloudflare Image Resizing, Phase 6).
-- This table stores the URL registry and processing status.
--
-- Platform Invariants:
--   T3  — tenant_id on all records
--   AC-FUNC-03 — rollback in infra/db/migrations/rollback/0447_rollback.sql

CREATE TABLE IF NOT EXISTS image_variants (
  id                TEXT    NOT NULL PRIMARY KEY,
  tenant_id         TEXT    NOT NULL,
  entity_type       TEXT    NOT NULL CHECK (entity_type IN ('group', 'campaign', 'event', 'workspace', 'individual')),
  entity_id         TEXT    NOT NULL,
  original_url      TEXT    NOT NULL,
  thumbnail_url     TEXT,                                    -- 100px × 100px (< 100KB, M13 gate)
  card_url          TEXT,                                    -- 400px wide
  full_url          TEXT,                                    -- 1200px wide
  status            TEXT    NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'processing', 'ready', 'failed')),
  processed_at      INTEGER,                                 -- Unix epoch seconds
  created_at        INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (entity_type, entity_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_image_variants_entity
  ON image_variants (entity_type, entity_id, tenant_id);

CREATE INDEX IF NOT EXISTS idx_image_variants_tenant_status
  ON image_variants (tenant_id, status);
