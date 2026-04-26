-- Car Wash / Auto Detailing Site Seed — Pillar 3 Template
-- Niche ID: P3-car-wash-car-wash-detailing
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug,
  vertical_slug,
  display_name,
  tagline,
  category,
  pillar,
  niche_family,
  family_role,
  pages,
  nigeria_first_priority,
  nafdac_required,
  cac_required,
  whatsapp_cta,
  currency,
  trust_signals,
  payment_methods,
  template_status,
  version,
  created_at
) VALUES (
  'car-wash-car-wash-detailing',
  'car-wash',
  'Car Wash / Auto Detailing Site',
  'Spotless every time — professional car wash & detailing',
  'commerce',
  3,
  'NF-COM-AUT',
  'variant',
  ARRAY['home','about','services','contact'],
  'medium',
  false,
  true,
  true,
  'NGN',
  ARRAY['CAC Registered', 'LASEPA Compliant', 'Eco-Friendly Products', 'Fleet Packages', 'WhatsApp Booking'],
  ARRAY['bank_transfer','paystack','pos','ussd','cash'],
  'active',
  '1.0.0',
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  template_status = EXCLUDED.template_status,
  version = EXCLUDED.version,
  updated_at = NOW();
