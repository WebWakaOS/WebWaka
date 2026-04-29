-- Seed: generator-dealer-generator-dealer-service
-- Niche ID: P3-generator-dealer-generator-dealer-service
-- Session: replit-agent-2026-04-26-session-C
-- Generated: 2026-04-26

INSERT INTO template_registry (
  id, slug, version, name, description, template_type, category,
  niche_id, vertical_slug, niche_family, nigeria_first_priority,
  status, regulatory_signals, created_at, updated_at
) VALUES (
  'tpl-generator-dealer-service-001',
  'generator-dealer-generator-dealer-service',
  '1.0.0',
  'Generator Sales & Service Centre',
  'Nigeria-First website template for generator dealers and service centres. NEPA/DISCO context, Honda/Mikano/Perkins brands, 24/7 emergency service, WhatsApp, NGN pricing by kVA.',
  'website',
  'commerce',
  'P3-generator-dealer-generator-dealer-service',
  'generator-dealer',
  'NF-COM-ELE',
  'critical',
  'approved',
  'SON Conformity Assessment; CAC registration; authorised Honda/Mikano/Perkins dealership; DPR fuel handling permit; EPA/LASEPA emissions',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (slug) DO UPDATE SET
  version = excluded.version,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO template_installations (
  id, workspace_id, tenant_id, template_slug, template_version,
  config_json, status, installed_at
) VALUES (
  'inst-gd-demo-001',
  'ws-demo-generator-dealer',
  'tenant-demo-generator-dealer',
  'generator-dealer-generator-dealer-service',
  '1.0.0',
  '{
    "displayName": "PowerGen Nigeria",
    "tagline": "When NEPA Fails, We Don\'t — Generators for Every Need",
    "description": "Authorised dealers for Honda, Mikano, and Perkins generators. Sales, installation, and 24/7 emergency servicing for homes, churches, estates, and industries across Nigeria.",
    "phone": "08045678901",
    "email": "info@powergennigeria.ng",
    "placeName": "Mushin, Lagos",
    "offerings": [
      {"name": "1kVA–5kVA Portable", "description": "Honda EM/EB, Tiger, Sumec Firman.", "priceKobo": 19500000},
      {"name": "6kVA–20kVA Medium", "description": "Elemax, Lutian — for businesses.", "priceKobo": 75000000},
      {"name": "21kVA–60kVA Industrial", "description": "Mikano, Perkins — churches, estates.", "priceKobo": 450000000},
      {"name": "Generator Repair", "description": "Full overhaul, AVR, carb, fuel pump.", "priceKobo": 1500000},
      {"name": "Maintenance Contract", "description": "Monthly SLA + 24/7 emergency cover.", "priceKobo": 5000000}
    ]
  }',
  'active',
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;
