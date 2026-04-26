-- Pharmacy Chain / Drugstore Seed — Pillar 2 Template
-- Niche ID: P2-pharmacy-chain-pharmacy-chain-drugstore
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'pharmacy-chain-pharmacy-chain-drugstore', 'pharmacy-chain',
  'Pharmacy Chain / Drugstore', 'PCN-licensed pharmacy chain — safe medicines, nationwide branches',
  'health', 2, 'NF-HLT-SVC', 'standalone',
  ARRAY['home','products','locations','contact'],
  'high', true, true, true, 'NGN',
  ARRAY['PCN Licensed','NAFDAC Compliant','HEFAMAA Approved','NPhA Member','CAC Registered','WhatsApp Prescription','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
