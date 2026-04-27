-- Seed: jewellery-shop-jewellery-site template registry entry
-- Nigeria-first: Jewellery Shop Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'jewellery-shop-jewellery-site',
  'Jewellery Shop Site',
  'Nigeria-first site for jewellery shops and goldsmiths. Collection showcase, custom bespoke orders, pricing guide, hallmarking notes.',
  'website', '1.0.0', '^1.0.0', 'jewellery-shop', 'jewellery-shop-jewellery-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'jewellery-shop-jewellery-site';
