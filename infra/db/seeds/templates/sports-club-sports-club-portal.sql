-- Sports Club / Amateur League Portal Seed — Pillar 3 Template
-- Niche ID: P3-sports-club-sports-club-portal
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'sports-club-sports-club-portal', 'sports-club',
  'Sports Club / Amateur League', 'Football, basketball & athletics — join our Nigerian community',
  'civic', 3, 'NF-CIV-SPT', 'standalone',
  ARRAY['home','sports','fixtures','join','contact'],
  'high', false, true, true, 'NGN',
  ARRAY['NFF Affiliated','CAC Registered','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
