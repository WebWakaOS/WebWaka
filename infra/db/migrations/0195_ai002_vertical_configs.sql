CREATE TABLE IF NOT EXISTS ai_vertical_configs (
  id TEXT PRIMARY KEY,
  vertical_slug TEXT NOT NULL UNIQUE,
  capability_set TEXT NOT NULL DEFAULT '[]',
  max_autonomy_level INTEGER NOT NULL DEFAULT 0,
  hitl_required INTEGER NOT NULL DEFAULT 1,
  sensitive_sector INTEGER NOT NULL DEFAULT 0,
  write_boundary TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_ai_vertical_configs_slug ON ai_vertical_configs(vertical_slug);

INSERT OR IGNORE INTO ai_vertical_configs (id, vertical_slug, capability_set, max_autonomy_level, hitl_required, sensitive_sector, write_boundary) VALUES
  ('aivc-001', 'politician',         '["content_draft","profile_summary","campaign_analysis"]', 1, 1, 1, '["profiles","offerings"]'),
  ('aivc-002', 'pos-business',       '["inventory_suggest","sales_analysis","receipt_gen"]',    2, 0, 0, '["offerings","pos_transactions"]'),
  ('aivc-003', 'transport',          '["route_optimize","schedule_suggest","fare_analysis"]',   2, 0, 0, '["offerings","routes"]'),
  ('aivc-004', 'civic',              '["content_draft","community_insight","event_suggest"]',   1, 1, 1, '["profiles","offerings"]'),
  ('aivc-005', 'commerce',           '["product_describe","price_suggest","inventory_alert"]',  2, 0, 0, '["offerings"]'),
  ('aivc-006', 'auto-mechanic',      '["diagnosis_suggest","parts_lookup","quote_gen"]',        2, 0, 0, '["offerings"]'),
  ('aivc-007', 'bakery',             '["recipe_scale","menu_suggest","order_forecast"]',        2, 0, 0, '["offerings"]'),
  ('aivc-008', 'beauty-salon',       '["service_describe","booking_suggest","trend_report"]',   2, 0, 0, '["offerings"]'),
  ('aivc-009', 'bookshop',           '["book_recommend","catalog_enrich","summary_gen"]',       2, 0, 0, '["offerings"]'),
  ('aivc-010', 'catering',           '["menu_plan","portion_calc","event_quote"]',              2, 0, 0, '["offerings"]'),
  ('aivc-011', 'cleaning-service',   '["quote_gen","schedule_optimize","supply_forecast"]',     2, 0, 0, '["offerings"]'),
  ('aivc-012', 'electronics-repair', '["diagnosis_suggest","parts_lookup","repair_guide"]',     2, 0, 0, '["offerings"]'),
  ('aivc-013', 'florist',            '["arrangement_suggest","seasonal_plan","quote_gen"]',     2, 0, 0, '["offerings"]'),
  ('aivc-014', 'food-vendor',        '["menu_optimize","cost_analyze","health_compliance"]',    2, 0, 0, '["offerings"]'),
  ('aivc-015', 'restaurant-chain',   '["menu_plan","staff_schedule","inventory_forecast"]',     2, 0, 0, '["offerings"]'),
  ('aivc-016', 'pharmacy',           '["drug_interaction_check","inventory_alert"]',            1, 1, 1, '["offerings"]'),
  ('aivc-017', 'hotel',              '["rate_suggest","review_respond","occupancy_forecast"]',  2, 0, 0, '["offerings"]');
