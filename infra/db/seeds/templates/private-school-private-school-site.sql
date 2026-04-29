-- Seed: private-school-private-school-site
-- Niche ID: P3-private-school-private-school-site
-- Session: replit-agent-2026-04-26-session-C
-- Generated: 2026-04-26

INSERT INTO template_registry (
  id, slug, version, name, description, template_type, category,
  niche_id, vertical_slug, niche_family, nigeria_first_priority,
  status, regulatory_signals, created_at, updated_at
) VALUES (
  'tpl-private-school-site-001',
  'private-school-private-school-site',
  '1.0.0',
  'Private School Operator',
  'Nigeria-First website template for private nursery, primary, and secondary schools. State Ministry of Education licence, WAEC/NECO registration, term-fee NGN pricing, WhatsApp admissions enquiry.',
  'website',
  'education',
  'P3-private-school-private-school-site',
  'private-school',
  'NF-EDU-PRV',
  'critical',
  'approved',
  'State Ministry of Education licence; SUBEB registration (primary); WAEC/NECO school code (secondary); UBEC compliance; NDPR for student data',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (slug) DO UPDATE SET
  version = excluded.version,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO template_installations (
  id, workspace_id, tenant_id, template_slug, template_version,
  config_json, status, installed_at
) VALUES (
  'inst-ps-demo-001',
  'ws-demo-private-school',
  'tenant-demo-private-school',
  'private-school-private-school-site',
  '1.0.0',
  '{
    "displayName": "Greenfield Academy",
    "tagline": "Excellence. Discipline. Character. Your Child\'s Future Starts Here.",
    "description": "State Ministry of Education licensed private school offering nursery through senior secondary education. WAEC/NECO registered. 98% WAEC pass rate. Serving Lagos families since 2008.",
    "phone": "08078901234",
    "email": "admissions@greenfieldacademy.ng",
    "placeName": "GRA, Ikeja, Lagos",
    "offerings": [
      {"name": "Nursery (Ages 3–5)", "description": "Phonics, numeracy, play-based learning.", "priceKobo": 8500000},
      {"name": "Primary (Basic 1–6)", "description": "NERDC curriculum, literacy, science.", "priceKobo": 12000000},
      {"name": "Junior Secondary (JSS1–3)", "description": "WAEC BECE preparation.", "priceKobo": 18000000},
      {"name": "Senior Secondary (SS1–3)", "description": "WAEC/NECO registered. 3 streams.", "priceKobo": 22000000},
      {"name": "Boarding (Optional)", "description": "Secure on-campus, 24/7 supervision.", "priceKobo": 35000000}
    ]
  }',
  'active',
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;
