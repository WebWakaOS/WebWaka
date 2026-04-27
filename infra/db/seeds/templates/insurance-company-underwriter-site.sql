-- Seed: insurance-company-underwriter-site template registry entry
-- Nigeria-first: Insurance Company Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'insurance-company-underwriter-site',
  'Insurance Company Site',
  'Nigeria-first site for NAICOM-licensed insurance underwriters. Policy types, premium calculator, claims portal, branch/agent finder.',
  'website', '1.0.0', '^1.0.0', 'insurance-company', 'insurance-company-underwriter-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'insurance-company-underwriter-site';
