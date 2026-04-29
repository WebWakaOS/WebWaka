-- Seed: electronics-store-electronics-retail template registry entry
-- Nigeria-first: Electronics Store Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'electronics-store-electronics-retail',
  'Electronics Store Site',
  'Nigeria-first site for electronics and mobile phone stores. Product catalogue, warranty information, repair service booking, brand showcase.',
  'website', '1.0.0', '^1.0.0', 'electronics-store', 'electronics-store-electronics-retail', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'electronics-store-electronics-retail';
