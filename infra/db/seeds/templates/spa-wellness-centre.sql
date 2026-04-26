-- Seed: Spa / Wellness Centre Template
-- Niche ID: P32
-- Vertical: spa
-- Research brief: docs/templates/research/spa-wellness-centre-brief.md
-- Platform invariants: T4 (kobo), P13 (no client health data), P2 (Nigeria First)
-- Trust badges: NASC registration + state health permit

INSERT OR IGNORE INTO template_registry (
  id, slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, manifest_json, status, is_free, price_kobo, created_at, updated_at
) VALUES (
  lower(hex(randomblob(16))),
  'spa-wellness-centre',
  'Spa & Wellness Centre',
  'Nigerian spa and wellness centre website. Displays spa type (day/hotel/mobile), treatment menu with prices in NGN, NASC registration badge, state health permit badge, certified therapist badge, WhatsApp appointment booking. Luxury aesthetic with warm earth tones.',
  'website',
  '1.0.0',
  '>=1.0.1',
  '["spa"]',
  '{"name":"spa-wellness-centre","version":"1.0.0","platform_compat":">=1.0.1","template_type":"website","compatible_verticals":["spa"],"rollback_strategy":"soft_delete","nigeria_first":true,"features":["spa_type_badge","treatment_menu_kobo","nasc_badge","state_permit_badge","therapist_cert_badge","whatsapp_booking_cta","home_service_flag"]}',
  'approved',
  1,
  0,
  unixepoch(),
  unixepoch()
);
