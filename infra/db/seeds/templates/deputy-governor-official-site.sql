-- Seed: deputy-governor-official-site template registry entry
-- Pillar 2 — P2-deputy-governor-official-site (VN-POL-021, NF-POL-ELC)
-- Nigeria-First: 36 deputy governors; INEC joint ticket with governor; three modes.
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'deputy-governor-official-site',
  'Deputy Governor Official Site',
  'Nigeria-first official site for state deputy governors. Three modes: campaign (joint INEC ticket framing), incumbent, post_office. Joint ticket identity — running-with display for governor name.',
  'website', '1.0.0', '^1.0.0', 'deputy-governor', 'deputy-governor-official-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'deputy-governor-official-site';
