-- Seed: hotel-hospitality-booking (P2-hotel-hospitality-booking, NF-HOS)
-- Idempotent — safe to re-run. Uses INSERT OR IGNORE.

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
  'hotel-hospitality-booking',
  'Hotel & Guesthouse Booking Site',
  'FTAN-licensed hospitality website for Nigerian hotels, transit hotels, family guesthouses, and conference hotels. Features room type listings with NGN rates, WhatsApp room booking CTA, 24-hour reception and generator trust signals.',
  'website',
  '1.0.0',
  'approved',
  'NF-HOS',
  '.ho-',
  '["home","about","services","contact"]',
  'built-in:hotel-hospitality-booking',
  strftime('%Y-%m-%dT%H:%M:%SZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
);
