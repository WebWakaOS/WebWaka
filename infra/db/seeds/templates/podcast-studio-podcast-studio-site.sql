-- Podcast Studio / Audio Platform Site Seed — Pillar 3 Template
-- Niche ID: P3-podcast-studio-podcast-studio-site
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
  'podcast-studio-podcast-studio-site',
  'podcast-studio',
  'Podcast Studio / Audio Platform Site',
  'Record, distribute & grow your Nigerian podcast',
  'creator',
  3,
  'NF-CRE-POD',
  'standalone',
  ARRAY['home','about','services','contact'],
  'medium',
  false,
  true,
  true,
  'NGN',
  ARRAY['CAC Registered', 'NBC Compliant', 'Boomplay Partner', 'Spotify Africa Distributed', 'WhatsApp Booking'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active',
  '1.0.0',
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  template_status = EXCLUDED.template_status,
  version = EXCLUDED.version,
  updated_at = NOW();
