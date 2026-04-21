-- Migration: 0224_template_ratings
-- Description: Template ratings + reviews for MED-012 (PROD-08) — P6-B
-- Invariant: T3 (tenant_id), T4 (rating is integer 1–5)

CREATE TABLE IF NOT EXISTS template_ratings (
  id            TEXT PRIMARY KEY,
  template_slug TEXT NOT NULL,
  workspace_id  TEXT NOT NULL,
  tenant_id     TEXT NOT NULL,
  rating        INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  review_text   TEXT,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(template_slug, workspace_id)  -- one rating per workspace per template
);

CREATE INDEX IF NOT EXISTS idx_template_ratings_slug
  ON template_ratings (template_slug, rating);

CREATE INDEX IF NOT EXISTS idx_template_ratings_tenant
  ON template_ratings (tenant_id, template_slug);
