-- Food Processing Factory Site Seed — Pillar 3 Template
-- Niche ID: P3-food-processing-food-processing-factory
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
  'food-processing-food-processing-factory',
  'food-processing',
  'Food Processing Factory Site',
  'NAFDAC-certified Nigerian food processing — bulk B2B supply',
  'agricultural',
  3,
  'NF-AGR-PRO',
  'standalone',
  ARRAY['home','about','services','contact'],
  'high',
  true,
  true,
  true,
  'NGN',
  ARRAY['NAFDAC Certified', 'FMARD Licensed', 'SON Quality Standard', 'CAC Registered', 'WhatsApp B2B Enquiry'],
  ARRAY['bank_transfer','paystack','pos'],
  'active',
  '1.0.0',
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  template_status = EXCLUDED.template_status,
  version = EXCLUDED.version,
  updated_at = NOW();
