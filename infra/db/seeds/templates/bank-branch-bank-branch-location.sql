-- Bank Branch / ATM Location Seed — Pillar 2 Template
-- Niche ID: P2-bank-branch-bank-branch-location
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'bank-branch-bank-branch-location', 'bank-branch',
  'Bank Branch / ATM Location', 'CBN-licensed bank branch — full banking services, accessible to all Nigerians',
  'fintech', 2, 'NF-FIN-SVC', 'standalone',
  ARRAY['home','services','locations','contact'],
  'high', false, true, true, 'NGN',
  ARRAY['CBN Licensed','NDIC Insured','FIRS Compliant','NCC Certified','CAC Registered','WhatsApp Enquiry','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
