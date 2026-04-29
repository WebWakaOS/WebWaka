-- Seed: thrift-store-thrift-store-site template registry entry
-- Nigeria-first: Thrift Store Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'thrift-store-thrift-store-site',
  'Thrift Store Site',
  'Nigeria-first site for secondhand and thrift stores. Item catalogue, drop-off programme, transparent pricing, upcoming stock drops.',
  'website', '1.0.0', '^1.0.0', 'thrift-store', 'thrift-store-thrift-store-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'thrift-store-thrift-store-site';
