-- Seed: house-of-assembly-member-official-site template registry entry
-- Pillar 2 — P2-house-of-assembly-member-official-site (VN-POL-016, NF-POL-ELC)
-- Nigeria-First: ~993 HOAS members across 36 states; constituency-level framing.
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'house-of-assembly-member-official-site',
  'House of Assembly Member Official Site',
  'Nigeria-first official site for state House of Assembly members. Three modes: campaign, incumbent (constituency projects, HOAS committee), post_office. INEC trust signal. State constituency framing.',
  'website', '1.0.0', '^1.0.0', 'house-of-assembly-member', 'house-of-assembly-member-official-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'house-of-assembly-member-official-site';
