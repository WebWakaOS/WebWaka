-- Seed: resort-resort-site template registry entry
-- Nigeria-first: Resort & Leisure Park Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'resort-resort-site',
  'Resort & Leisure Park Site',
  'Nigeria-first site for resorts and leisure parks. Room and villa types, leisure facilities, event packages, online booking.',
  'website', '1.0.0', '^1.0.0', 'resort', 'resort-resort-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'resort-resort-site';
