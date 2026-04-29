-- Seed: credit-union-sacco-site template registry entry
-- Nigeria-first: Credit Union / SACCO Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'credit-union-sacco-site',
  'Credit Union / SACCO Site',
  'Nigeria-first site for credit unions and SACCOs. Member savings and credit, cooperative share management, contribution history, loan calculator.',
  'website', '1.0.0', '^1.0.0', 'credit-union', 'credit-union-sacco-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'credit-union-sacco-site';
