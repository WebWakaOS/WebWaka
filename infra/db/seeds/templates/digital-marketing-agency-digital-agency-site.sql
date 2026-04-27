-- Seed: digital-marketing-agency-digital-agency-site template registry entry
-- Nigeria-first: Digital Marketing Agency Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'digital-marketing-agency-digital-agency-site',
  'Digital Marketing Agency Site',
  'Nigeria-first site for digital marketing agencies. Social media, SEO, paid ads, campaign portfolio, results case studies.',
  'website', '1.0.0', '^1.0.0', 'digital-marketing-agency', 'digital-marketing-agency-digital-agency-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'digital-marketing-agency-digital-agency-site';
