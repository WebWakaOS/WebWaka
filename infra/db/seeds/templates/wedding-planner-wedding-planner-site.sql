-- Seed: wedding-planner-wedding-planner-site
-- Niche ID: P3-wedding-planner-wedding-planner-site
-- Session: replit-agent-2026-04-26-session-C
-- Generated: 2026-04-26

INSERT INTO template_registry (
  id, slug, version, name, description, template_type, category,
  niche_id, vertical_slug, niche_family, nigeria_first_priority,
  status, regulatory_signals, created_at, updated_at
) VALUES (
  'tpl-wedding-planner-site-001',
  'wedding-planner-wedding-planner-site',
  '1.0.0',
  'Wedding Planner / Celebrant',
  'Nigeria-First website template for wedding planners coordinating traditional, white, and court Nigerian weddings. CPPE-certified, multi-day Nigerian wedding context, WhatsApp enquiry, NGN package pricing.',
  'website',
  'professional',
  'P3-wedding-planner-wedding-planner-site',
  'wedding-planner',
  'NF-PRO-EVT',
  'critical',
  'approved',
  'CPPE membership; CAC business registration; LASG event permit compliance; NDPR for couple data',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (slug) DO UPDATE SET
  version = excluded.version,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO template_installations (
  id, workspace_id, tenant_id, template_slug, template_version,
  config_json, status, installed_at
) VALUES (
  'inst-wp-demo-001',
  'ws-demo-wedding-planner',
  'tenant-demo-wedding-planner',
  'wedding-planner-wedding-planner-site',
  '1.0.0',
  '{
    "displayName": "Azeezat Events & Weddings",
    "tagline": "Your Perfect Nigerian Wedding — Beautifully Planned, Flawlessly Executed",
    "description": "CPPE-certified wedding planners specialising in Yoruba, Igbo, and Hausa traditional weddings, white weddings, and diaspora destination events across Lagos, Abuja, and beyond.",
    "phone": "08067890123",
    "email": "hello@azeezatevents.ng",
    "placeName": "Lagos",
    "offerings": [
      {"name": "Essential Package", "description": "Day-of coordination, vendor liaison, timeline.", "priceKobo": 35000000},
      {"name": "Classic Package", "description": "3-month full planning, traditional + white wedding.", "priceKobo": 80000000},
      {"name": "Luxury Package", "description": "6-month full service, diaspora coordination.", "priceKobo": 250000000},
      {"name": "Traditional Only", "description": "Wine carrying, kolanut, aso-ebi coordination.", "priceKobo": 25000000},
      {"name": "Day-of Coordination", "description": "You plan, we execute on the day.", "priceKobo": 15000000}
    ]
  }',
  'active',
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;
