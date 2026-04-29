-- Seed: mental-health-counselling-centre template registry entry
-- Nigeria-first: Mental Health & Counselling Centre Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'mental-health-counselling-centre',
  'Mental Health & Counselling Centre Site',
  'Nigeria-first site for mental health and counselling services. Therapist profiles, teletherapy booking, session pricing, confidentiality assurance.',
  'website', '1.0.0', '^1.0.0', 'mental-health', 'mental-health-counselling-centre', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'mental-health-counselling-centre';
