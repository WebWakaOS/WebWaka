-- Seed: bakery-confectionery (P2-bakery, NF-BAK)
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
  'bakery-confectionery',
  'Bakery & Confectionery',
  'NAFDAC-certified Nigerian bakery site for birthday cakes, bread, pastries, small chops, and custom orders. Features WhatsApp pre-order CTA, 24-hour advance notice for custom cakes, made-fresh-daily trust signal, and Instagram portfolio link.',
  'website',
  '1.0.0',
  'approved',
  'NF-BAK',
  '.bk-',
  '["home","about","services","contact"]',
  'built-in:bakery-confectionery',
  strftime('%Y-%m-%dT%H:%M:%SZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
);
