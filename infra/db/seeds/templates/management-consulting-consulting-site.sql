-- Seed: management-consulting-consulting-site template registry entry
-- Nigeria-first: Management Consulting Firm Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'management-consulting-consulting-site',
  'Management Consulting Firm Site',
  'Nigeria-first site for management consulting firms. Practice areas, case studies, team bios, thought leadership content, enquiry form.',
  'website', '1.0.0', '^1.0.0', 'management-consulting', 'management-consulting-consulting-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'management-consulting-consulting-site';
