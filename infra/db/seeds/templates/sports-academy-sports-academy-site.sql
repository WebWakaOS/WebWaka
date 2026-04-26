-- Sports Academy Seed — Pillar 2 Template
-- Niche ID: P2-sports-academy-sports-academy-site
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'sports-academy-sports-academy-site', 'sports-academy',
  'Sports Academy', 'NFF/CBB-affiliated sports training — develop champions in Nigeria',
  'health', 2, 'NF-HLT-SVC', 'standalone',
  ARRAY['home','programmes','coaches','contact'],
  'medium', false, true, true, 'NGN',
  ARRAY['NFF Affiliated','AAFAN Member','NSCDC Cleared','CAC Registered','WhatsApp Enrolment','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
