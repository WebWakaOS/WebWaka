-- Seed: state-commissioner-official-site template registry entry
-- Pillar 2 — P2-state-commissioner-official-site (VN-POL-011, NF-POL-APT anchor)
-- Nigeria-First: ~720 commissioners across 36 states; gubernatorial appointment; HOA screening.
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'state-commissioner-official-site',
  'State Commissioner Official Site',
  'Nigeria-first official site for Nigerian state commissioners. Appointed-only modes: incumbent (ministry portfolio) + post_office. Gubernatorial appointment + HOA-screened trust badge. NF-POL-APT anchor.',
  'website', '1.0.0', '^1.0.0', 'state-commissioner', 'state-commissioner-official-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'state-commissioner-official-site';
