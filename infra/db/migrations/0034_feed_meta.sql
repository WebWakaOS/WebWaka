-- infra/db/migrations/0034_feed_meta.sql

CREATE TABLE IF NOT EXISTS feed_impressions (
  id              TEXT NOT NULL PRIMARY KEY,
  post_id         TEXT NOT NULL REFERENCES social_posts(id),
  viewer_id       TEXT,                     -- NULL = unauthenticated
  placement       TEXT NOT NULL DEFAULT 'organic'
                  CHECK (placement IN ('organic', 'boosted', 'explore', 'trending')),
  tenant_id       TEXT NOT NULL,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_impressions_post ON feed_impressions(post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_impressions_tenant ON feed_impressions(tenant_id);
