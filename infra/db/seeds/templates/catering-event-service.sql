-- Seed: catering-event-service (P2-catering, NF-CAT)
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
  'catering-event-service',
  'Catering & Event Food Service',
  'NAFDAC-compliant Nigerian event catering site with package listings (per-head NGN pricing), WhatsApp get-a-quote CTA, chafing-dishes-and-staff included trust signal, and minimum-guest-count note for weddings, corporate events, and parties.',
  'website',
  '1.0.0',
  'approved',
  'NF-CAT',
  '.ct-',
  '["home","about","services","contact"]',
  'built-in:catering-event-service',
  strftime('%Y-%m-%dT%H:%M:%SZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
);
