-- Seed: cosmetics-shop-cosmetics-retail template registry entry
-- Nigeria-first: Cosmetics & Beauty Retail Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'cosmetics-shop-cosmetics-retail',
  'Cosmetics & Beauty Retail Site',
  'Nigeria-first site for perfume and cosmetics retailers. Product range, skin-tone matching tool, NAFDAC compliance notes, loyalty programme.',
  'website', '1.0.0', '^1.0.0', 'cosmetics-shop', 'cosmetics-shop-cosmetics-retail', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'cosmetics-shop-cosmetics-retail';
