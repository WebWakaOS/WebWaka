-- Seed: law-firm-legal-practice (P2-law-firm, NF-LAW)
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
  'law-firm-legal-practice',
  'Law Firm & Legal Practice Site',
  'NBA-registered Nigerian law firm website with practice areas, confidential consultation booking CTA, professional trust signals, and SAN/NBA credentialing. Covers civil, criminal, commercial, property, matrimonial, and probate law.',
  'website',
  '1.0.0',
  'approved',
  'NF-LAW',
  '.lf-',
  '["home","about","services","contact"]',
  'built-in:law-firm-legal-practice',
  strftime('%Y-%m-%dT%H:%M:%SZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
);
