-- Seed: lga-office-lga-council-portal
-- Niche ID: P3-lga-office-lga-council-portal
-- Session: replit-agent-2026-04-26-session-C
-- Generated: 2026-04-26

INSERT INTO template_registry (
  id, slug, version, name, description, template_type, category,
  niche_id, vertical_slug, niche_family, nigeria_first_priority,
  status, regulatory_signals, created_at, updated_at
) VALUES (
  'tpl-lga-council-portal-001',
  'lga-office-lga-council-portal',
  '1.0.0',
  'LGA Council Portal',
  'Nigeria-First website template for Local Government Area councils. ALGON member, FOIA 2011 compliance, council services directory, tenders, budget transparency, citizen WhatsApp contact, Remita payments.',
  'website',
  'politics',
  'P3-lga-office-lga-council-portal',
  'lga-office',
  'NF-POL-LGA',
  'critical',
  'approved',
  'ALGON membership; FOIA 2011 compliance; Code of Conduct Bureau filings; FIRS council tax mandate; NDPR resident data policy; Remita payment',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (slug) DO UPDATE SET
  version = excluded.version,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO template_installations (
  id, workspace_id, tenant_id, template_slug, template_version,
  config_json, status, installed_at
) VALUES (
  'inst-lg-demo-001',
  'ws-demo-lga-office',
  'tenant-demo-lga-office',
  'lga-office-lga-council-portal',
  '1.0.0',
  '{
    "displayName": "Ikeja Local Government Council",
    "lgaName": "Ikeja",
    "chairmanName": "Hon. Adebayo Tijani",
    "state": "Lagos",
    "description": "Official digital portal of Ikeja Local Government Council. Providing transparent, citizen-centred governance in line with ALGON standards, FOIA 2011 obligations, and Open Government Partnership principles.",
    "phone": "07012345678",
    "email": "secretariat@ikejalgc.lag.gov.ng",
    "placeName": "Ikeja, Lagos State",
    "offerings": [
      {"name": "Birth Registration", "description": "Register births within Ikeja LGA. 3 working days.", "priceKobo": 250000},
      {"name": "Death Registration", "description": "Death certificates issued within 5 working days.", "priceKobo": 200000},
      {"name": "Market Levy", "description": "Daily/monthly market stall levy payment via Remita.", "priceKobo": null},
      {"name": "Refuse Collection", "description": "Weekly residential and commercial schedule.", "priceKobo": null},
      {"name": "FOI Request", "description": "Freedom of Information — 7-day statutory response.", "priceKobo": null}
    ]
  }',
  'active',
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;
