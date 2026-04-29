-- Seed: architecture-firm-architecture-site template registry entry
-- Nigeria-first: Architecture Firm Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'architecture-firm-architecture-site',
  'Architecture Firm Site',
  'Nigeria-first site for ARCON-registered architecture and interior design firms. Project portfolio, 3D render gallery, client enquiry, team bios.',
  'website', '1.0.0', '^1.0.0', 'architecture-firm', 'architecture-firm-architecture-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'architecture-firm-architecture-site';
