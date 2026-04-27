-- Seed: lga-chairman-official-site template registry entry
-- Pillar 2 — P2-lga-chairman-official-site (VN-POL-018, NF-POL-ELC)
-- Nigeria-First: 774 LGA chairmen; SIEC election; grassroots executive.
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'lga-chairman-official-site',
  'LGA Chairman Official Site',
  'Nigeria-first official site for Local Government Area chairmen. Three modes: campaign, incumbent (LGA projects, community delivery), post_office. SIEC election trust signal.',
  'website', '1.0.0', '^1.0.0', 'lga-chairman', 'lga-chairman-official-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'lga-chairman-official-site';
