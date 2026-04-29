-- Building Materials Supplier Seed — Pillar 3 Template
-- Niche ID: P3-hair-salon-hair-salon-site
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
  'hair-salon-hair-salon-site',
  'hair-salon',
  'Hair Salon / Barbing Salon',
  'Your style destination — braiding, weaves, relaxer & cuts',
  'commerce',
  3,
  'NF-COM-BEA',
  'standalone',
  ARRAY['home','about','services','contact'],
  'critical',
  true,
  true,
  true,
  'NGN',
  ARRAY['NAFDAC-approved products', 'CAC Registered', 'WhatsApp CTA', 'NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active',
  '1.0.0',
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  template_status = EXCLUDED.template_status,
  version = EXCLUDED.version,
  updated_at = NOW();
