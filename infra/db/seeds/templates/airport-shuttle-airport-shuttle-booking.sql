-- Airport Shuttle Booking Site Seed — Pillar 3 Template
-- Niche ID: P3-airport-shuttle-airport-shuttle-booking
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'airport-shuttle-airport-shuttle-booking', 'airport-shuttle',
  'Airport Shuttle Service', 'Reliable airport transfers — MMIA, Abuja, Port Harcourt',
  'transport', 3, 'NF-TRP-AIR', 'standalone',
  ARRAY['home','routes','fleet','booking','contact'],
  'high', false, true, true, 'NGN',
  ARRAY['LASG MVAA Compliant','FRSC Roadworthy','CAC Registered','WhatsApp Booking','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
