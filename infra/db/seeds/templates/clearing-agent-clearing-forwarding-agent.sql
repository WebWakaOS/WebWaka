-- Clearing & Forwarding Agent Seed — Pillar 2 Template
-- Niche ID: P2-clearing-agent-clearing-forwarding-agent
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'clearing-agent-clearing-forwarding-agent', 'clearing-agent',
  'Clearing & Forwarding Agent', 'CRFFN-licensed cargo clearing — ports, airports & land borders',
  'transport', 2, 'NF-TRN-SVC', 'standalone',
  ARRAY['home','services','contact'],
  'high', false, true, true, 'NGN',
  ARRAY['CRFFN Licensed','NCS-ACI Certified','CAC Registered','WhatsApp Enquiry','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
