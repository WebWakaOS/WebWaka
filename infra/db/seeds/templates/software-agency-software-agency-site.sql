-- Seed: software-agency-software-agency-site template registry entry
-- Nigeria-first: Software Agency Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'software-agency-software-agency-site',
  'Software Agency Site',
  'Nigeria-first site for software and app development agencies. Project portfolio, service stack, team profiles, discovery call booking.',
  'website', '1.0.0', '^1.0.0', 'software-agency', 'software-agency-software-agency-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'software-agency-software-agency-site';
