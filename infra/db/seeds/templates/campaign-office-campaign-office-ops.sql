-- Seed: campaign-office-campaign-office-ops
-- Niche ID: P3-campaign-office-campaign-office-ops
-- Session: replit-agent-2026-04-26-session-C
-- Generated: 2026-04-26

INSERT INTO template_registry (
  id, slug, version, name, description, template_type, category,
  niche_id, vertical_slug, niche_family, nigeria_first_priority,
  status, regulatory_signals, created_at, updated_at
) VALUES (
  'tpl-campaign-office-ops-001',
  'campaign-office-campaign-office-ops',
  '1.0.0',
  'Political Campaign Office Operations',
  'Nigeria-First website template for political campaign offices. INEC Electoral Act 2022 compliance, candidate manifesto, ward coordinator network, volunteer registration, campaign finance disclosure, WhatsApp.',
  'website',
  'politics',
  'P3-campaign-office-campaign-office-ops',
  'campaign-office',
  'NF-POL-CAM',
  'critical',
  'approved',
  'INEC Electoral Act 2022 compliance (§§87,95–105); NDPR for volunteer/donor data; no voter inducement policy',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (slug) DO UPDATE SET
  version = excluded.version,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO template_installations (
  id, workspace_id, tenant_id, template_slug, template_version,
  config_json, status, installed_at
) VALUES (
  'inst-co-demo-001',
  'ws-demo-campaign-office',
  'tenant-demo-campaign-office',
  'campaign-office-campaign-office-ops',
  '1.0.0',
  '{
    "displayName": "Emeka Okafor for Anambra Governor 2027",
    "candidateName": "Emeka Okafor",
    "tagline": "Anambra Rising — Together We Can Build the Future",
    "description": "Official campaign website for Emeka Okafor, APC candidate for Anambra State Governor 2027. INEC registered. Transparent campaign finance. Join us in transforming Anambra.",
    "phone": "08001234567",
    "email": "press@okafor2027.ng",
    "placeName": "Awka, Anambra State",
    "party": "APC",
    "position": "Anambra State Governor — 2027 Election",
    "offerings": [
      {"name": "Economy & Jobs", "description": "100,000 jobs through SME support and agribusiness.", "priceKobo": null},
      {"name": "Healthcare", "description": "Free maternal care. Operational PHCs in every ward.", "priceKobo": null},
      {"name": "Education", "description": "Teacher salaries on the 25th. 500 smart classrooms.", "priceKobo": null},
      {"name": "Security", "description": "Community policing. CCTV at all LGA headquarters.", "priceKobo": null},
      {"name": "Infrastructure", "description": "Rural roads, electricity, water — LGA scorecards.", "priceKobo": null}
    ]
  }',
  'active',
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;
