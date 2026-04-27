-- Seed: political-appointee-official-site template registry entry
-- Pillar 2 — P2-political-appointee-official-site (VN-POL-016, NF-POL-APT)
-- Nigeria-First: SSA/SA/Technical Adviser/Board Chair; ~2000+ across Nigeria; NO campaign mode.
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'political-appointee-official-site',
  'Political Appointee Official Site',
  'Nigeria-first official site for political appointees (SSA, SA, Technical Adviser, Board Chair). Appointed-only modes: incumbent + post_office. Portfolio/function identity framing. No campaign mode.',
  'website', '1.0.0', '^1.0.0', 'political-appointee', 'political-appointee-official-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'political-appointee-official-site';
