-- Seed: fish-market-fish-market-site
-- Niche ID: P3-fish-market-fish-market-site
-- Session: replit-agent-2026-04-26-session-C
-- Generated: 2026-04-26

INSERT INTO template_registry (
  id, slug, version, name, description, template_type, category,
  niche_id, vertical_slug, niche_family, nigeria_first_priority,
  status, regulatory_signals, created_at, updated_at
) VALUES (
  'tpl-fish-market-site-001',
  'fish-market-fish-market-site',
  '1.0.0',
  'Fish Market / Fishmonger',
  'Nigeria-First website template for fish markets and fishmongers. NAFDAC food safety, cold chain compliance, fresh/smoked/stockfish/frozen supply, WhatsApp orders, NGN pricing per kg/carton.',
  'website',
  'agricultural',
  'P3-fish-market-fish-market-site',
  'fish-market',
  'NF-AGR-MKT',
  'critical',
  'approved',
  'NAFDAC food safety compliance; FMARD fisheries licence; NIMASA maritime compliance; SON cold chain standards',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (slug) DO UPDATE SET
  version = excluded.version,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO template_installations (
  id, workspace_id, tenant_id, template_slug, template_version,
  config_json, status, installed_at
) VALUES (
  'inst-fm-demo-001',
  'ws-demo-fish-market',
  'tenant-demo-fish-market',
  'fish-market-fish-market-site',
  '1.0.0',
  '{
    "displayName": "Apongbon Fish Traders",
    "tagline": "Fresh Fish from Lagos Waters to Your Table",
    "description": "NAFDAC-compliant fish market supplying fresh catfish, smoked mackerel, stockfish, and frozen tilapia to restaurants, hotels, caterers, and households across Lagos.",
    "phone": "08056789012",
    "email": "orders@apongbonfish.ng",
    "placeName": "Apongbon Fish Market, Lagos",
    "offerings": [
      {"name": "Fresh Catfish (Eja Aro)", "description": "Live and fresh, slaughter service available.", "priceKobo": 450000},
      {"name": "Smoked Mackerel (Titus)", "description": "Cold-chain maintained. Bulk for restaurants.", "priceKobo": 320000},
      {"name": "Stockfish (Okporoko)", "description": "Premium Norwegian stockfish, whole and cut.", "priceKobo": 850000},
      {"name": "Frozen Tilapia", "description": "IQF 20kg cartons, NAFDAC-compliant.", "priceKobo": 4500000},
      {"name": "Bonga Fish (Shawa)", "description": "Smoked and dried, bulk and retail.", "priceKobo": 280000}
    ]
  }',
  'active',
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;
