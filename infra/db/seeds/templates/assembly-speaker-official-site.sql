-- Seed: assembly-speaker-official-site template registry entry
-- Pillar 2 — P2-assembly-speaker-official-site (VN-POL-022, NF-POL-ELC)
-- Nigeria-First: Speaker of State HOA; elected by assembly members; three modes.
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'assembly-speaker-official-site',
  'Assembly Speaker Official Site',
  'Nigeria-first official site for Speakers of State Houses of Assembly. Three modes: campaign (speakership bid), incumbent (Rt. Hon. presiding, bills/resolutions), post_office. Elected by assembly peers.',
  'website', '1.0.0', '^1.0.0', 'assembly-speaker', 'assembly-speaker-official-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'assembly-speaker-official-site';
