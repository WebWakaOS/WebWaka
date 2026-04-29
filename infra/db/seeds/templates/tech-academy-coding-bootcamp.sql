-- Seed: tech-academy-coding-bootcamp template registry entry
-- Nigeria-first: Tech Academy / Coding Bootcamp Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'tech-academy-coding-bootcamp',
  'Tech Academy / Coding Bootcamp Site',
  'Nigeria-first site for technology and coding academies. Cohort-based course listings, alumni network, job placement rate, bootcamp schedule.',
  'website', '1.0.0', '^1.0.0', 'tech-academy', 'tech-academy-coding-bootcamp', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'tech-academy-coding-bootcamp';
