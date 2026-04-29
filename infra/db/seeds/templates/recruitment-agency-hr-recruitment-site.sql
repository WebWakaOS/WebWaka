-- Seed: recruitment-agency-hr-recruitment-site template registry entry
-- Nigeria-first: Recruitment & HR Agency Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'recruitment-agency-hr-recruitment-site',
  'Recruitment & HR Agency Site',
  'Nigeria-first site for HR and recruitment agencies. Active job listings, CV submission, employer partnership tiers, placement success metrics.',
  'website', '1.0.0', '^1.0.0', 'recruitment-agency', 'recruitment-agency-hr-recruitment-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'recruitment-agency-hr-recruitment-site';
