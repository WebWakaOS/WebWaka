-- Waste Management & Recycling Seed — Pillar 2 Template
-- Niche ID: P2-waste-management-waste-management-recycler
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'waste-management-waste-management-recycler', 'waste-management',
  'Waste Management & Recycling', 'NESREA-certified waste collection & recycling — cleaner Nigeria',
  'civic', 2, 'NF-CIV-ORG', 'standalone',
  ARRAY['home','services','recycling','contact'],
  'medium', false, true, true, 'NGN',
  ARRAY['NESREA Certified','LAWMA Partner','State EPA Approved','CAC Registered','WhatsApp Booking','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
