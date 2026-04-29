-- Record Label / Music Publisher Site Seed — Pillar 3 Template
-- Niche ID: P3-recording-label-record-label-site
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
  'recording-label-record-label-site',
  'recording-label',
  'Record Label / Music Publisher Site',
  'Afrobeats, Amapiano & beyond — Nigeria''s next wave starts here',
  'creator',
  3,
  'NF-CRE-MUS',
  'standalone',
  ARRAY['home','about','services','contact'],
  'high',
  false,
  true,
  true,
  'NGN',
  ARRAY['COSON Registered', 'CAC Registered', 'NDPR Compliant', 'WhatsApp A&R Contact', 'Streaming Distribution'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active',
  '1.0.0',
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  template_status = EXCLUDED.template_status,
  version = EXCLUDED.version,
  updated_at = NOW();
