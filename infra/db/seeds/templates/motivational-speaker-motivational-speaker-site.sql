-- Motivational Speaker / Training Firm Site Seed — Pillar 3 Template
-- Niche ID: P3-motivational-speaker-motivational-speaker-site
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
  'motivational-speaker-motivational-speaker-site',
  'motivational-speaker',
  'Motivational Speaker / Training Firm Site',
  'Inspiring Nigerian leaders — keynotes, training & transformation',
  'creator',
  3,
  'NF-CRE-SPK',
  'standalone',
  ARRAY['home','about','services','contact'],
  'medium',
  false,
  true,
  true,
  'NGN',
  ARRAY['CIPM Member', 'CAC Registered', 'NITAD Certified', 'NDPR Compliant', 'WhatsApp Booking'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active',
  '1.0.0',
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  template_status = EXCLUDED.template_status,
  version = EXCLUDED.version,
  updated_at = NOW();
