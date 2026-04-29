-- Seed: diagnostic-lab-medical-laboratory template registry entry
-- Nigeria-first: Medical Diagnostic Lab Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'diagnostic-lab-medical-laboratory',
  'Medical Diagnostic Lab Site',
  'Nigeria-first site for MLSCN-accredited medical and diagnostic laboratories. Test menu, result turnaround times, home sample collection booking, NHIA panel status.',
  'website', '1.0.0', '^1.0.0', 'diagnostic-lab', 'diagnostic-lab-medical-laboratory', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'diagnostic-lab-medical-laboratory';
