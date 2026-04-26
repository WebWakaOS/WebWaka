-- Seed: supermarket-grocery-store (P2-supermarket, NF-GRC)
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
  'supermarket-grocery-store',
  'Supermarket & Grocery Store',
  'NAFDAC-compliant Nigerian supermarket site with product category listings, WhatsApp order-for-delivery CTA, no-expired-products trust signal, and home delivery note for neighbourhood stores and FMCG retailers.',
  'website',
  '1.0.0',
  'approved',
  'NF-GRC',
  '.sm-',
  '["home","about","services","contact"]',
  'built-in:supermarket-grocery-store',
  strftime('%Y-%m-%dT%H:%M:%SZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
);
