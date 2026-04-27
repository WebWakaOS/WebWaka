-- Seed: hospital-secondary-care template registry entry
-- Nigeria-first: Hospital / Secondary Care Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'hospital-secondary-care',
  'Hospital / Secondary Care Site',
  'Nigeria-first site for MDCN-registered hospitals and secondary healthcare facilities. Departments, inpatient/outpatient, NHIA panel, consultants, bed capacity.',
  'website', '1.0.0', '^1.0.0', 'hospital', 'hospital-secondary-care', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'hospital-secondary-care';
