-- Seed: bar-lounge-bar-lounge-site template registry entry
-- Nigeria-first: Bar & Lounge Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'bar-lounge-bar-lounge-site',
  'Bar & Lounge Site',
  'Nigeria-first site for bars, lounges, and nightclubs. Drink menu, event nights, table reservation, age-gate compliance.',
  'website', '1.0.0', '^1.0.0', 'bar-lounge', 'bar-lounge-bar-lounge-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'bar-lounge-bar-lounge-site';
