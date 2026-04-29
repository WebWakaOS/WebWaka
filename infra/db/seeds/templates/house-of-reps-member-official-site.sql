-- Seed: house-of-reps-member-official-site template registry entry
-- Pillar 2 — P2-house-of-reps-member-official-site (VN-POL-015, NF-POL-ELC)
-- Nigeria-First: 360 HOR members; constituency-level framing; federal constituency.
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'house-of-reps-member-official-site',
  'House of Representatives Member Official Site',
  'Nigeria-first official site for House of Reps members. Three modes: campaign, incumbent (constituency projects, HOR committee), post_office. INEC trust signal. Federal constituency framing.',
  'website', '1.0.0', '^1.0.0', 'house-of-reps-member', 'house-of-reps-member-official-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'house-of-reps-member-official-site';
