-- Seed: lga-vice-chairman-official-site template registry entry
-- Pillar 2 — P2-lga-vice-chairman-official-site (VN-POL-023, NF-POL-ELC)
-- Nigeria-First: 774 LGA vice chairmen; SIEC joint ticket; three modes.
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'lga-vice-chairman-official-site',
  'LGA Vice Chairman Official Site',
  'Nigeria-first official site for LGA vice chairmen. Three modes: campaign (joint SIEC ticket), incumbent (LGA administration support), post_office. Joint ticket identity with LGA Chairman.',
  'website', '1.0.0', '^1.0.0', 'lga-vice-chairman', 'lga-vice-chairman-official-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'lga-vice-chairman-official-site';
