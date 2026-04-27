-- Seed: supervisory-councillor-official-site template registry entry
-- Pillar 2 — P2-supervisory-councillor-official-site (VN-POL-024, NF-POL-APT)
-- Nigeria-First: ~3,870 supervisory councillors; LGA Chairman appointment; NO campaign mode.
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'supervisory-councillor-official-site',
  'Supervisory Councillor Official Site',
  'Nigeria-first official site for LGA supervisory councillors (appointed by LGA Chairman). Appointed-only modes: incumbent + post_office. Portfolio department oversight identity. NF-POL-APT pattern.',
  'website', '1.0.0', '^1.0.0', 'supervisory-councillor', 'supervisory-councillor-official-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'supervisory-councillor-official-site';
