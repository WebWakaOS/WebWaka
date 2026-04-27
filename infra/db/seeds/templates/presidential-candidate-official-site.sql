-- Seed: presidential-candidate-official-site template registry entry
-- Pillar 2 — P2-presidential-candidate-official-site (VN-POL-009, NF-POL-ELC)
-- Nigeria-First: INEC presidential candidate; donate CTA gated on inecCampaignAccount; running mate.
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'presidential-candidate-official-site',
  'Presidential Candidate Official Site',
  'Nigeria-first official site for Nigerian presidential candidates and former presidents. Three modes: campaign (INEC campaign account gated donate CTA, running mate), incumbent, post_office. REQ-POL-009 finance gate enforced.',
  'website', '1.0.0', '^1.0.0', 'presidential-candidate', 'presidential-candidate-official-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'presidential-candidate-official-site';
