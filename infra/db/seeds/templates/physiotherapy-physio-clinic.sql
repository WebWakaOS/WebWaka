-- Seed: physiotherapy-physio-clinic template registry entry
-- Nigeria-first: Physiotherapy Clinic Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'physiotherapy-physio-clinic',
  'Physiotherapy Clinic Site',
  'Nigeria-first site for physiotherapy and occupational therapy clinics. Session types, rehab programmes, home visit booking, therapist credentials.',
  'website', '1.0.0', '^1.0.0', 'physiotherapy', 'physiotherapy-physio-clinic', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'physiotherapy-physio-clinic';
