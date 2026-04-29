-- Vegetable Garden / Urban Horticulture Site Seed — Pillar 3 Template
-- Niche ID: P3-vegetable-garden-urban-veg-garden
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
  'vegetable-garden-urban-veg-garden',
  'vegetable-garden',
  'Vegetable Garden / Urban Horticulture Site',
  'Farm-fresh Nigerian vegetables — household delivery & B2B supply',
  'agricultural',
  3,
  'NF-AGR-HRT',
  'standalone',
  ARRAY['home','about','services','contact'],
  'medium',
  false,
  true,
  true,
  'NGN',
  ARRAY['FMARD Registered', 'CAC Registered', 'Chemical-Free Growing', 'Hotel & Restaurant Supply', 'WhatsApp Order'],
  ARRAY['bank_transfer','paystack','cash'],
  'active',
  '1.0.0',
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  template_status = EXCLUDED.template_status,
  version = EXCLUDED.version,
  updated_at = NOW();
