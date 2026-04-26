-- Cold Room / Cold Storage Seed — Pillar 2 Template
-- Niche ID: P2-cold-room-cold-storage-facility
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'cold-room-cold-storage-facility', 'cold-room',
  'Cold Room / Cold Storage', 'NAFDAC-compliant cold chain storage for perishables — Nigeria-wide',
  'agricultural', 2, 'NF-AGR-SVC', 'standalone',
  ARRAY['home','services','pricing','contact'],
  'high', true, true, true, 'NGN',
  ARRAY['NAFDAC Compliant','SON Certified','NESREA Approved','CAC Registered','WhatsApp Booking','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
