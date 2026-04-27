-- Seed: cac-registration-agent-cac-agent-site template registry entry
-- Nigeria-first: CAC Registration Agent Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'cac-registration-agent-cac-agent-site',
  'CAC Registration Agent Site',
  'Nigeria-first site for CAC business name and RC number filing agents. Document checklist, service timeline, pricing, appointment booking.',
  'website', '1.0.0', '^1.0.0', 'cac-registration-agent', 'cac-registration-agent-cac-agent-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'cac-registration-agent-cac-agent-site';
