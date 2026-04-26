-- Seed: handyman-trade-service (P2-handyman, NF-HMS)
-- Idempotent — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug,
  display_name,
  description,
  template_type,
  version,
  status,
  niche_anchor,
  css_namespace,
  supported_pages,
  render_entrypoint,
  created_at,
  updated_at
) VALUES (
  'handyman-trade-service',
  'Handyman & Home Trade Service',
  'Nigerian handyman and artisan service site covering plumbing, electrical, painting, carpentry, tiling, POP ceiling, and generator servicing. Features WhatsApp book-a-job CTA, COREN compliance badge, and "we bring our tools" trust signal.',
  'website',
  '1.0.0',
  'approved',
  'NF-HMS',
  '.hm-',
  '["home","about","services","contact"]',
  'built-in:handyman-trade-service',
  strftime('%Y-%m-%dT%H:%M:%SZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
);
