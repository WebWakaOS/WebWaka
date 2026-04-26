-- Seed: professional-association-prof-assoc-portal
-- Niche ID: P3-professional-association-prof-assoc-portal
-- Session: replit-agent-2026-04-26-session-C
-- Generated: 2026-04-26

INSERT INTO template_registry (
  id, slug, version, name, description, template_type, category,
  niche_id, vertical_slug, niche_family, nigeria_first_priority,
  status, regulatory_signals, created_at, updated_at
) VALUES (
  'tpl-prof-assoc-portal-001',
  'professional-association-prof-assoc-portal',
  '1.0.0',
  'Professional Association Portal',
  'Nigeria-First website template for professional associations and regulatory bodies (NBA, NMA, ICAN, COREN, etc.). Federal gazette registration, member verification, CPD calendar, NGN subscription fees.',
  'website',
  'civic',
  'P3-professional-association-prof-assoc-portal',
  'professional-association',
  'NF-CIV-PRO',
  'critical',
  'approved',
  'Federal Government gazette registration; ministry oversight; professional practice act compliance; NDPR member data policy',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (slug) DO UPDATE SET
  version = excluded.version,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO template_installations (
  id, workspace_id, tenant_id, template_slug, template_version,
  config_json, status, installed_at
) VALUES (
  'inst-pa-demo-001',
  'ws-demo-professional-association',
  'tenant-demo-professional-association',
  'professional-association-prof-assoc-portal',
  '1.0.0',
  '{
    "displayName": "Nigerian Society of Engineers — Lagos Branch",
    "tagline": "Regulating Engineering Practice. Elevating the Profession.",
    "description": "The foremost body for engineering regulation and professional development in Nigeria. Federal government gazetted. COREN-affiliated. Serving licensed engineers across Lagos and the Southwest.",
    "phone": "08090123456",
    "email": "secretariat@nse-lagos.ng",
    "placeName": "Victoria Island, Lagos",
    "gazetteNumber": "FGN Gazette Vol. 47 No. 23",
    "offerings": [
      {"name": "Student Affiliate", "description": "Student ID, newsletters, chapter events.", "priceKobo": 1500000},
      {"name": "Graduate Member", "description": "Practising certificate, CPD, directory.", "priceKobo": 3500000},
      {"name": "Full Member (MNSE)", "description": "Voting rights, committee eligibility.", "priceKobo": 6000000},
      {"name": "Fellow (FNSE)", "description": "FNSE post-nominal, conference fee waiver.", "priceKobo": 9000000},
      {"name": "Corporate Member", "description": "5 named staff, conference table, website logo.", "priceKobo": 15000000}
    ]
  }',
  'active',
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;
