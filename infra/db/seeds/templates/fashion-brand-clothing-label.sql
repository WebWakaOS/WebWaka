-- Seed: fashion-brand-clothing-label (P2-fashion-brand, NF-FSH)
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
  'fashion-brand-clothing-label',
  'Fashion Brand & Clothing Label',
  'CAC-registered Nigerian fashion brand site with collection listings (NGN prices), WhatsApp shop-the-collection CTA, Made-in-Nigeria trust badge, Instagram portfolio link, custom orders, and nationwide shipping note. Covers Ankara, Adire, Aso-Oke, and contemporary styles.',
  'website',
  '1.0.0',
  'approved',
  'NF-FSH',
  '.fb-',
  '["home","about","services","contact"]',
  'built-in:fashion-brand-clothing-label',
  strftime('%Y-%m-%dT%H:%M:%SZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
);
