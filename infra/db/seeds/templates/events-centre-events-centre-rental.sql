-- Events Centre / Hall Rental Site Seed — Pillar 3 Template
-- Niche ID: P3-events-centre-events-centre-rental
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'events-centre-events-centre-rental', 'events-centre',
  'Events Centre / Hall Rental', 'Premium venue — weddings, corporate, owambes & product launches',
  'place', 3, 'NF-PLC-EVT', 'standalone',
  ARRAY['home','halls','amenities','event-types','contact'],
  'high', true, true, true, 'NGN',
  ARRAY['LASG Event Licensed','NAFDAC Catering','CAC Registered','Bonded & Insured','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
