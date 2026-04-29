-- Water Treatment & Borehole Seed — Pillar 2 Template
-- Niche ID: P2-water-treatment-water-treatment-borehole
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'water-treatment-water-treatment-borehole', 'water-treatment',
  'Water Treatment & Borehole', 'NAFDAC-compliant water treatment & borehole drilling services',
  'place', 2, 'NF-PLC-SVC', 'standalone',
  ARRAY['home','services','contact'],
  'high', true, true, true, 'NGN',
  ARRAY['NAFDAC Compliant','NESREA Approved','WAN Member','SON Certified','CAC Registered','WhatsApp Quote','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
