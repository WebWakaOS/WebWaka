-- Seed: community-health-community-health-site
-- Niche ID: P3-community-health-community-health-site
-- Session: replit-agent-2026-04-26-session-C
-- Generated: 2026-04-26

INSERT INTO template_registry (
  id, slug, version, name, description, template_type, category,
  niche_id, vertical_slug, niche_family, nigeria_first_priority,
  status, regulatory_signals, created_at, updated_at
) VALUES (
  'tpl-community-health-site-001',
  'community-health-community-health-site',
  '1.0.0',
  'Community Health Worker Network',
  'Nigeria-First website template for community health worker networks (CHOs, CHEWs, VHWs). NPHCDA partner, BHCPF-funded services, donor transparency, WhatsApp citizen contact, MDCN supervised.',
  'website',
  'health',
  'P3-community-health-community-health-site',
  'community-health',
  'NF-HLT-PHC',
  'critical',
  'approved',
  'NPHCDA registration; CHODANP membership; MDCN supervising physician; CAC NGO registration; NDPR patient data policy',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (slug) DO UPDATE SET
  version = excluded.version,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO template_installations (
  id, workspace_id, tenant_id, template_slug, template_version,
  config_json, status, installed_at
) VALUES (
  'inst-ch-demo-001',
  'ws-demo-community-health',
  'tenant-demo-community-health',
  'community-health-community-health-site',
  '1.0.0',
  '{
    "displayName": "Akwa Ibom PHC Network",
    "tagline": "Bringing Quality Healthcare to Every Community in Akwa Ibom",
    "description": "NPHCDA-registered community health network deploying 50+ CHOs, CHEWs, and VHWs across 15 LGAs in Akwa Ibom State. BHCPF-funded immunisation, antenatal, and malaria services.",
    "phone": "08089012345",
    "email": "info@akwaibomphc.ng",
    "placeName": "Uyo, Akwa Ibom State",
    "offerings": [
      {"name": "Immunisation (EPI)", "description": "BCG, OPV, DPT, Hep B, Yellow Fever, Measles.", "priceKobo": null},
      {"name": "Antenatal Care", "description": "Pregnancy monitoring, birth preparedness.", "priceKobo": null},
      {"name": "Malaria Prevention", "description": "LLIN distribution, RDT testing, ACT treatment.", "priceKobo": null},
      {"name": "Family Planning", "description": "Contraceptives, LARC referral.", "priceKobo": null},
      {"name": "Nutrition Screening", "description": "MUAC measurement, SAM/MAM referral.", "priceKobo": null}
    ]
  }',
  'active',
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;
