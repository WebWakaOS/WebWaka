-- Rollback: 0417_blog_posts
-- D1/SQLite: DROP TABLE is safe here as this table did not previously exist
-- (confirmed: no prior migration created blog_posts).
-- All rollback operations are idempotent.

DROP INDEX IF EXISTS idx_blog_posts_slug;
DROP INDEX IF EXISTS idx_blog_posts_tenant_published;
DROP INDEX IF EXISTS idx_blog_posts_tenant_status;
DROP TABLE IF EXISTS blog_posts;
