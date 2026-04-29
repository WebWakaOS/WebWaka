-- Seed: electrical-fittings-electrical-fittings-dealer
-- Niche ID: P3-electrical-fittings-electrical-fittings-dealer
-- Session: replit-agent-2026-04-26-session-C
-- Generated: 2026-04-26

INSERT INTO template_registry (
  id, slug, version, name, description, template_type, category,
  niche_id, vertical_slug, niche_family, nigeria_first_priority,
  status, regulatory_signals, created_at, updated_at
) VALUES (
  'tpl-electrical-fittings-dealer-001',
  'electrical-fittings-electrical-fittings-dealer',
  '1.0.0',
  'Electrical Fittings Dealer',
  'Nigeria-First website template for electrical fittings dealers supplying cables, circuit breakers, inverters, solar equipment, and accessories. SON-certified products, WhatsApp ordering, NGN pricing.',
  'website',
  'commerce',
  'P3-electrical-fittings-electrical-fittings-dealer',
  'electrical-fittings',
  'NF-COM-HRD',
  'high',
  'approved',
  'SON Conformity Assessment; CAC registration; NERC compliance; brand authorised dealership (Schneider, Havells, Clipsal)',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (slug) DO UPDATE SET
  version = excluded.version,
  updated_at = CURRENT_TIMESTAMP;

-- Demo workspace seed
INSERT INTO template_installations (
  id, workspace_id, tenant_id, template_slug, template_version,
  config_json, status, installed_at
) VALUES (
  'inst-ef-demo-001',
  'ws-demo-electrical-fittings',
  'tenant-demo-electrical-fittings',
  'electrical-fittings-electrical-fittings-dealer',
  '1.0.0',
  '{
    "displayName": "PowerLine Electrical Supplies",
    "tagline": "Quality Electrical Fittings for Every Project",
    "description": "Authorised dealers in cables, circuit breakers, inverters, and solar equipment. SON-certified products. Serving contractors and self-builders across Nigeria.",
    "phone": "08023456789",
    "email": "info@powerlineelectrical.ng",
    "placeName": "Trade Fair Complex, Lagos",
    "offerings": [
      {"name": "Cables & Wires", "description": "1mm–25mm armoured and flexible cables. Nexans, Tower.", "priceKobo": 350000},
      {"name": "Circuit Breakers & DBs", "description": "Schneider Electric, Havells MCBs and distribution boards.", "priceKobo": 200000},
      {"name": "Inverters & Solar", "description": "Luminous, Sukam, Felicity Solar — 1kVA to 20kVA.", "priceKobo": 8500000},
      {"name": "Sockets & Switches", "description": "Clipsal, Schneider UK-standard sockets and switches.", "priceKobo": 80000}
    ]
  }',
  'active',
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;
