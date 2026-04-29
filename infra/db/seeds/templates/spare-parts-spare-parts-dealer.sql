-- Spare Parts Dealer Site Seed — Pillar 3 Template
-- Niche ID: P3-spare-parts-spare-parts-dealer
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
  'spare-parts-spare-parts-dealer',
  'spare-parts',
  'Spare Parts Dealer (Ladipo / Nnewi) Site',
  'Genuine & quality auto spare parts — Ladipo and Nnewi sourced',
  'commerce',
  3,
  'NF-COM-AUT',
  'variant',
  ARRAY['home','about','services','contact'],
  'critical',
  false,
  true,
  true,
  'NGN',
  ARRAY['SON Certified Parts', 'CAC Registered', 'Ladipo / Nnewi Sourced', 'WhatsApp Parts Enquiry', 'Anti-Counterfeit'],
  ARRAY['bank_transfer','paystack','pos','ussd','cash'],
  'active',
  '1.0.0',
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  template_status = EXCLUDED.template_status,
  version = EXCLUDED.version,
  updated_at = NOW();
