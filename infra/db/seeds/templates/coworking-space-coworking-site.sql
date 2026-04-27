-- Seed: coworking-space-coworking-site template registry entry
-- Nigeria-first: Coworking Space Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'coworking-space-coworking-site',
  'Coworking Space Site',
  'Nigeria-first site for coworking and business hub operators. Desk and office plans, amenities showcase, virtual office, tour booking.',
  'website', '1.0.0', '^1.0.0', 'coworking-space', 'coworking-space-coworking-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'coworking-space-coworking-site';
