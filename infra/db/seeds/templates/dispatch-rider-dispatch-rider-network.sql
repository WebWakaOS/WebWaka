-- Dispatch Rider Network Seed — Pillar 2 Template
-- Niche ID: P2-dispatch-rider-dispatch-rider-network
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'dispatch-rider-dispatch-rider-network', 'dispatch-rider',
  'Dispatch Rider Network', 'Fast same-day dispatch — FRSC-compliant riders across Lagos & Abuja',
  'transport', 2, 'NF-TRN-SVC', 'standalone',
  ARRAY['home','services','pricing','contact'],
  'critical', false, true, true, 'NGN',
  ARRAY['FRSC Compliant','VIO Certified','Helmet Law Compliant','CAC Registered','WhatsApp Booking','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
