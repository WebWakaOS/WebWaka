-- Seed: real-estate-agency-property-listings (P2-real-estate-agency, NF-REA)
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
  'real-estate-agency-property-listings',
  'Real Estate Agency & Property Listings',
  'ESVARBON-licensed Nigerian real estate agency site with property listings, NGN pricing, book-a-viewing WhatsApp CTA, and transparent agency-fee trust signals for buyers, renters, and landlords.',
  'website',
  '1.0.0',
  'approved',
  'NF-REA',
  '.re-',
  '["home","about","services","contact"]',
  'built-in:real-estate-agency-property-listings',
  strftime('%Y-%m-%dT%H:%M:%SZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
);
