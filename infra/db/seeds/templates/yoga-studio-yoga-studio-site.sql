-- Seed: yoga-studio-yoga-studio-site template registry entry
-- Nigeria-first: Yoga Studio Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'yoga-studio-yoga-studio-site',
  'Yoga Studio Site',
  'Nigeria-first site for yoga, pilates, and meditation studios. Class schedule, instructor profiles, membership plans, trial class booking.',
  'website', '1.0.0', '^1.0.0', 'yoga-studio', 'yoga-studio-yoga-studio-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'yoga-studio-yoga-studio-site';
