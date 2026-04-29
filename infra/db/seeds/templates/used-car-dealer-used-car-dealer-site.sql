-- Building Materials Supplier Seed — Pillar 3 Template
-- Niche ID: P3-used-car-dealer-used-car-dealer-site
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
  'used-car-dealer-used-car-dealer-site',
  'used-car-dealer',
  'Used Car Dealer / Auto Trader',
  'Trusted Tokunbo cars — NCS cleared, FRSC certified',
  'commerce',
  3,
  'NF-COM-AUT',
  'anchor',
  ARRAY['home','about','services','contact'],
  'critical',
  false,
  true,
  true,
  'NGN',
  ARRAY['CAC Registered', 'WhatsApp CTA', 'NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active',
  '1.0.0',
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  template_status = EXCLUDED.template_status,
  version = EXCLUDED.version,
  updated_at = NOW();
