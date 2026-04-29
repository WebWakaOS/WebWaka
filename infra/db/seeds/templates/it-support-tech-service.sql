-- Seed: it-support-tech-service (P2-it-support, NF-ITS)
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
  'it-support-tech-service',
  'IT Support & Tech Service Provider',
  'CAC-registered Nigerian IT support company site featuring laptop repair, CCTV, networking, POS setup, cloud services with WhatsApp help CTA, same-day response trust signal, and on-site support note for SMEs and government offices.',
  'website',
  '1.0.0',
  'approved',
  'NF-ITS',
  '.it-',
  '["home","about","services","contact"]',
  'built-in:it-support-tech-service',
  strftime('%Y-%m-%dT%H:%M:%SZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
);
