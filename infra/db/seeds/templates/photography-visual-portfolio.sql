-- Seed: photography-visual-portfolio (P2-photography, NF-PHO)
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
  'photography-visual-portfolio',
  'Photography & Visual Portfolio',
  'CAC-registered Nigerian photography studio site with session packages (NGN rates), WhatsApp book-a-session CTA, photos-in-48-hours trust signal, Instagram/portfolio links, and on-site event photography note. Covers weddings, portraits, products, corporate, and real estate.',
  'website',
  '1.0.0',
  'approved',
  'NF-PHO',
  '.pv-',
  '["home","about","services","contact"]',
  'built-in:photography-visual-portfolio',
  strftime('%Y-%m-%dT%H:%M:%SZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
);
