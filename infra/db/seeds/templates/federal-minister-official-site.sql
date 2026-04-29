-- Seed: federal-minister-official-site template registry entry
-- Pillar 2 — P2-federal-minister-official-site (VN-POL-012, NF-POL-APT)
-- Nigeria-First: ~48 federal ministers; presidential appointment; Senate screening.
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'federal-minister-official-site',
  'Federal Minister Official Site',
  'Nigeria-first official site for Nigerian federal ministers. Appointed-only modes: incumbent (ministry portfolio) + post_office. Presidential appointment + Senate-screened trust badge.',
  'website', '1.0.0', '^1.0.0', 'federal-minister', 'federal-minister-official-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'federal-minister-official-site';
