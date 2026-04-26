-- Seed: cassava-miller-cassava-miller-site
-- Niche ID: P3-cassava-miller-cassava-miller-site
-- Session: replit-agent-2026-04-26-session-C
-- Generated: 2026-04-26

INSERT INTO template_registry (
  id, slug, version, name, description, template_type, category,
  niche_id, vertical_slug, niche_family, nigeria_first_priority,
  status, regulatory_signals, created_at, updated_at
) VALUES (
  'tpl-cassava-miller-site-001',
  'cassava-miller-cassava-miller-site',
  '1.0.0',
  'Cassava Miller & Garri Producer',
  'Nigeria-First website template for cassava millers, garri producers, and grain processors. NAFDAC registration, SON quality mark, WhatsApp orders, NGN pricing per 25kg/50kg bags.',
  'website',
  'agricultural',
  'P3-cassava-miller-cassava-miller-site',
  'cassava-miller',
  'NF-AGR-PRO',
  'critical',
  'approved',
  'NAFDAC food processing registration; SON quality mark; FMARD agro-processing licence; NESREA environmental compliance',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (slug) DO UPDATE SET
  version = excluded.version,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO template_installations (
  id, workspace_id, tenant_id, template_slug, template_version,
  config_json, status, installed_at
) VALUES (
  'inst-cm-demo-001',
  'ws-demo-cassava-miller',
  'tenant-demo-cassava-miller',
  'cassava-miller-cassava-miller-site',
  '1.0.0',
  '{
    "displayName": "Benue Fresh Mills",
    "tagline": "Farm-Fresh Garri & Cassava Products from Benue State",
    "description": "NAFDAC-registered cassava miller supplying white garri, yellow garri, cassava flour, and fufu to distributors, restaurants, and households across Nigeria. Toll milling also available.",
    "phone": "08034567890",
    "email": "orders@benuefreshmills.ng",
    "placeName": "Gboko, Benue State",
    "offerings": [
      {"name": "White Garri (Ijebu)", "description": "Fine crispy garri, NAFDAC certified. Per 25kg bag.", "priceKobo": 1800000},
      {"name": "Yellow Garri", "description": "Palm-oil enriched, premium quality. Per 25kg bag.", "priceKobo": 2000000},
      {"name": "Cassava Flour", "description": "High-quality flour for swallow and baking. Per 25kg.", "priceKobo": 2200000},
      {"name": "Fufu (Cassava)", "description": "Fermented cassava fufu, hygienically packed.", "priceKobo": 150000},
      {"name": "Corn Flour (Tuwo)", "description": "Freshly milled for tuwo and corn dishes.", "priceKobo": 1600000},
      {"name": "Toll Milling", "description": "Bring your cassava/maize, we process it.", "priceKobo": 150000}
    ]
  }',
  'active',
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;
