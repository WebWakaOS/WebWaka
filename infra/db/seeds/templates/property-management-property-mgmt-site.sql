-- Seed: property-management-property-mgmt-site template registry entry
-- Nigeria-first: Property Management Company Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'property-management-property-mgmt-site',
  'Property Management Company Site',
  'Nigeria-first site for property management firms. Portfolio listings, tenant enquiry, maintenance requests, rent collection schedule.',
  'website', '1.0.0', '^1.0.0', 'property-management', 'property-management-property-mgmt-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'property-management-property-mgmt-site';
