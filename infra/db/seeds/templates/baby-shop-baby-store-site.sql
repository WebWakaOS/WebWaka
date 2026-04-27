-- Seed: baby-shop-baby-store-site template registry entry
-- Nigeria-first: Baby Shop Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'baby-shop-baby-store-site',
  'Baby Shop Site',
  'Nigeria-first site for baby and maternity stores. Baby gear catalogue, new-arrival alerts, wishlist/registry, NAFDAC-compliant product notes.',
  'website', '1.0.0', '^1.0.0', 'baby-shop', 'baby-shop-baby-store-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'baby-shop-baby-store-site';
