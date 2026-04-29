-- Seed: senator-official-site template registry entry
-- Pillar 2 — P2-senator-official-site (VN-POL-014, NF-POL-ELC)
-- Nigeria-First: 109 senators (3 per state + FCT); INEC election; Senate committee roles.
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'senator-official-site',
  'Senator Official Site',
  'Nigeria-first official site for Nigerian senators. Three modes: campaign, incumbent (Senate committee, constituency interventions), post_office. INEC trust badge. Senatorial district framing.',
  'website', '1.0.0', '^1.0.0', 'senator', 'senator-official-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'senator-official-site';
