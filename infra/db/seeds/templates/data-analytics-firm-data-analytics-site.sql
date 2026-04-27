-- Seed: data-analytics-firm-data-analytics-site template registry entry
-- Nigeria-first: Data Analytics Firm Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'data-analytics-firm-data-analytics-site',
  'Data Analytics Firm Site',
  'Nigeria-first site for data analytics and BI firms. BI dashboards, data engineering services, ML modelling, client case studies.',
  'website', '1.0.0', '^1.0.0', 'data-analytics-firm', 'data-analytics-firm-data-analytics-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'data-analytics-firm-data-analytics-site';
