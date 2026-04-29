-- Seed: student-hostel-hostel-site template registry entry
-- Nigeria-first: Student Hostel Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'student-hostel-hostel-site',
  'Student Hostel Site',
  'Nigeria-first site for student hostel operators. Room availability, hostel rules, payment plans, proximity to campus.',
  'website', '1.0.0', '^1.0.0', 'student-hostel', 'student-hostel-hostel-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'student-hostel-hostel-site';
