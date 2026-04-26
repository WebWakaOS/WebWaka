-- Restaurant Menu & Ordering Site Seed — Pillar 3 Template
-- Niche ID: P3-restaurant-restaurant-menu-site
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
  'restaurant-restaurant-menu-site',
  'restaurant',
  'Restaurant Menu & Ordering Site',
  'Authentic Nigerian cuisine served fresh — order now via WhatsApp',
  'food-beverage',
  3,
  'NF-FOD-QSR',
  'anchor',
  ARRAY['home','about','services','contact'],
  'high',
  true,
  true,
  true,
  'NGN',
  ARRAY['NAFDAC Registered', 'CAC Registered', 'Hygiene Certified', 'WhatsApp Ordering', 'NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd','cash'],
  'active',
  '1.0.0',
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  template_status = EXCLUDED.template_status,
  version = EXCLUDED.version,
  updated_at = NOW();
