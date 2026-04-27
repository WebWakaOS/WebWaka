-- Seed: food-court-canteen-site template registry entry
-- Nigeria-first: Food Court / Canteen Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'food-court-canteen-site',
  'Food Court / Canteen Site',
  'Nigeria-first site for food courts and multi-vendor canteens. Stall listings, daily menus, bulk order enquiry, dietary filters.',
  'website', '1.0.0', '^1.0.0', 'food-court', 'food-court-canteen-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'food-court-canteen-site';
