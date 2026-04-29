-- Seed: ward-councillor-official-site template registry entry
-- Pillar 2 — P2-ward-councillor-official-site (VN-POL-017, NF-POL-ELC)
-- Nigeria-First: ~8,809 ward councillors; SIEC election; LGA legislative council.
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'ward-councillor-official-site',
  'Ward Councillor Official Site',
  'Nigeria-first official site for SIEC-elected ward councillors. Three modes: campaign, incumbent (LGA legislative council, ward motions), post_office. Differentiates from ward-rep (service delivery) — councillor is legislative.',
  'website', '1.0.0', '^1.0.0', 'ward-councillor', 'ward-councillor-official-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'ward-councillor-official-site';
