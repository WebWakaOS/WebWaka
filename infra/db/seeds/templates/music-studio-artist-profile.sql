-- Seed: music-studio-artist-profile (P2-music-studio, NF-MUS)
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
  'music-studio-artist-profile',
  'Music Studio & Artist Profile',
  'COSON-registered Nigerian music studio site with service listings (NGN hourly/session rates), WhatsApp book-studio-time CTA, professional-equipment and in-house-producer trust signals, beat licensing note, and streaming/Instagram links. Covers Afrobeats, gospel, highlife, hip-hop, and jingles.',
  'website',
  '1.0.0',
  'approved',
  'NF-MUS',
  '.ms-',
  '["home","about","services","contact"]',
  'built-in:music-studio-artist-profile',
  strftime('%Y-%m-%dT%H:%M:%SZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
);
