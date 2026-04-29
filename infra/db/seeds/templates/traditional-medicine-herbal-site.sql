-- Seed: traditional-medicine-herbal-site template registry entry
-- Nigeria-first: Traditional Medicine / Herbal Store Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'traditional-medicine-herbal-site',
  'Traditional Medicine / Herbal Store Site',
  'Nigeria-first site for traditional medicine practitioners and herbal stores. Herbal product catalogue, NAFDAC compliance notes, consultation booking.',
  'website', '1.0.0', '^1.0.0', 'traditional-medicine', 'traditional-medicine-herbal-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'traditional-medicine-herbal-site';
