-- Seed: university-higher-education template registry entry
-- Nigeria-first: University / Higher Education Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'university-higher-education',
  'University / Higher Education Site',
  'Nigeria-first site for universities and polytechnics. Faculty and course catalogue, JAMB/WAEC cut-offs, NUC accreditation, admission portal.',
  'website', '1.0.0', '^1.0.0', 'university', 'university-higher-education', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'university-higher-education';
