-- Talent Agency / Model Agency Site Seed — Pillar 3 Template
-- Niche ID: P3-talent-agency-talent-agency-site
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
  'talent-agency-talent-agency-site',
  'talent-agency',
  'Talent Agency / Model Agency Site',
  'Nigeria''s finest talent — booked, managed, delivered',
  'creator',
  3,
  'NF-CRE-TAL',
  'standalone',
  ARRAY['home','about','services','contact'],
  'high',
  false,
  true,
  true,
  'NGN',
  ARRAY['APCON Compliant', 'CAC Registered', 'NDPR Compliant', 'WhatsApp Booking', 'Lagos Fashion Week Vetted'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active',
  '1.0.0',
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  template_status = EXCLUDED.template_status,
  version = EXCLUDED.version,
  updated_at = NOW();
