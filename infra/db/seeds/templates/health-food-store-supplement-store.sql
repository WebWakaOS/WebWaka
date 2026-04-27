-- Seed: health-food-store-supplement-store template registry entry
-- Nigeria-first: Health Food & Supplement Store Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'health-food-store-supplement-store',
  'Health Food & Supplement Store Site',
  'Nigeria-first site for supplement and health food stores. Product catalogue, nutrition advice content, NAFDAC compliance, loyalty programme.',
  'website', '1.0.0', '^1.0.0', 'health-food-store', 'health-food-store-supplement-store', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'health-food-store-supplement-store';
