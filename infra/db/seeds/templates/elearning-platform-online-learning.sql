-- Seed: elearning-platform-online-learning template registry entry
-- Nigeria-first: E-Learning Platform Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'elearning-platform-online-learning',
  'E-Learning Platform Site',
  'Nigeria-first site for e-learning and online education platforms. Course catalogue, cohort management, certificate issuance, instructor profiles.',
  'website', '1.0.0', '^1.0.0', 'elearning-platform', 'elearning-platform-online-learning', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'elearning-platform-online-learning';
