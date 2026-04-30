-- Migration: 0417_blog_posts
-- Phase 0 finding: blog_posts table was referenced in apps/brand-runtime/src/routes/blog.ts
-- and apps/brand-runtime/src/routes/sitemap.ts with no corresponding migration file.
-- The route code had a try/catch with 'table may not exist — degrade gracefully' comment,
-- confirming the table was intended but the migration was missing.
--
-- This migration creates the canonical blog_posts table.
-- It is safe to apply to databases that already have the table (CREATE TABLE IF NOT EXISTS).
--
-- Platform Invariants:
--   T3 — tenant_id required on every row and every query
--   G23 — additive only; no existing data destroyed
--   P9 — no monetary fields
--
-- blog_posts columns match exactly what apps/brand-runtime/src/routes/blog.ts queries:
--   listing: id, slug, title, excerpt, published_at, author_name
--   detail:  id, slug, title, content, published_at, author_name, cover_image_url

CREATE TABLE IF NOT EXISTS blog_posts (
  id              TEXT    NOT NULL PRIMARY KEY,
  tenant_id       TEXT    NOT NULL,
  slug            TEXT    NOT NULL,
  title           TEXT    NOT NULL,
  excerpt         TEXT,                          -- Short summary for listing page (≤300 chars)
  content         TEXT    NOT NULL DEFAULT '',   -- Full post body (HTML subset, sanitised)
  author_name     TEXT,                          -- Display name only; no raw user_id stored
  cover_image_url TEXT,                          -- Optional cover image URL
  status          TEXT    NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'published', 'archived')),
  published_at    INTEGER,                       -- Unix timestamp; NULL if not yet published
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (tenant_id, slug)
);

-- T3: all queries must predicate on tenant_id
CREATE INDEX IF NOT EXISTS idx_blog_posts_tenant_status
  ON blog_posts(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_blog_posts_tenant_published
  ON blog_posts(tenant_id, published_at DESC)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug
  ON blog_posts(tenant_id, slug);
