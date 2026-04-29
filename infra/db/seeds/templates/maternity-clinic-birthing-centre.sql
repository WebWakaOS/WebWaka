-- Seed: maternity-clinic-birthing-centre template registry entry
-- Nigeria-first: Maternity Clinic / Birthing Centre Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'maternity-clinic-birthing-centre',
  'Maternity Clinic / Birthing Centre Site',
  'Nigeria-first site for maternity clinics and birthing centres. Antenatal care packages, delivery options, postnatal follow-up, NHIA status.',
  'website', '1.0.0', '^1.0.0', 'maternity-clinic', 'maternity-clinic-birthing-centre', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'maternity-clinic-birthing-centre';
