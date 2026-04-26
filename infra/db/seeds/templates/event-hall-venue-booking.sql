-- Seed: event-hall-venue-booking (P2-event-hall, NF-EVH)
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
  'event-hall-venue-booking',
  'Event Hall & Venue Booking',
  'FTAN-licensed Nigerian event hall site with capacity tiers, NGN hall rates, WhatsApp book-venue CTA, 24-hour generator and full-AC trust signals. Covers weddings, corporate events, birthdays, naming ceremonies, and conferences.',
  'website',
  '1.0.0',
  'approved',
  'NF-EVH',
  '.eh-',
  '["home","about","services","contact"]',
  'built-in:event-hall-venue-booking',
  strftime('%Y-%m-%dT%H:%M:%SZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
);
