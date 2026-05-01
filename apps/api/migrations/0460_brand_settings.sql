-- Wave 2: Brand settings table
-- Stores theme, logo, custom domain, social links, SEO per workspace

CREATE TABLE IF NOT EXISTS brand_settings (
  id              TEXT    PRIMARY KEY,
  tenant_id       TEXT    NOT NULL,
  workspace_id    TEXT    NOT NULL UNIQUE,
  theme_key       TEXT    NOT NULL DEFAULT 'waka_blue',
  primary_color   TEXT,
  logo_url        TEXT,
  custom_domain   TEXT,
  social_whatsapp TEXT,
  social_instagram TEXT,
  social_twitter  TEXT,
  social_facebook TEXT,
  social_tiktok   TEXT,
  social_youtube  TEXT,
  seo_title       TEXT,
  seo_description TEXT,
  seo_keywords    TEXT,
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_brand_settings_tenant ON brand_settings (tenant_id, workspace_id);
