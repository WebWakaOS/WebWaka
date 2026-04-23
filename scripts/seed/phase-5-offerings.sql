-- WebWaka OS QA Seed — Phase 5: Offerings, Templates, RFQ/BID/PO
-- Source: WebWaka_OS_QA_Execution_Plan.md v1.0 §3.1 Phase 5
-- Frozen baseline: WebWaka_OS_Corrected_Master_Inventory_v2.0-FROZEN
--
-- SCHEMA FIX 2026-04-23: Aligned with actual migration schemas:
--   offerings (0198a): id, tenant_id, workspace_id, name, description, price_kobo,
--     sort_order, is_published (0/1), category, created_at, updated_at
--     NOTE: no 'status' column; no 'vertical_slug' — use 'category' instead
--   template_registry (0206): id, slug, display_name, description, template_type,
--     version, platform_compat, compatible_verticals (JSON), manifest_json,
--     author_tenant_id, status, is_free, price_kobo, install_count
--   b2b_rfqs (0246): id, tenant_id, workspace_id, buyer_entity_id (not buyer_user_id),
--     category (req), title, description, quantity, unit, status, expires_at (req)
--   b2b_rfq_bids (0246): id, rfq_id, tenant_id, seller_entity_id,
--     bid_amount_kobo (not amount_kobo), status
--   b2b_purchase_orders (0247): id, rfq_id, bid_id, tenant_id, buyer_entity_id,
--     seller_entity_id, amount_kobo, payment_method, status
--     VALID statuses: rfq_accepted|po_created|in_fulfillment|delivered|invoiced|paid|disputed|cancelled
--     NOTE: table is b2b_purchase_orders (not purchase_orders)
--
-- P9: All price fields are integer kobo.
-- T3: All rows include tenant_id + workspace_id.

-- ─────────────────────────────────────────────────────────────────
-- Offerings
-- is_published: 1 = active/visible, 0 = draft/inactive
-- category replaces vertical_slug
-- ─────────────────────────────────────────────────────────────────

-- OFF-001: Chin Chin — active, TNT-001 bakery
INSERT OR IGNORE INTO offerings (
  id, workspace_id, tenant_id, name,
  price_kobo, is_published, category,
  created_at, updated_at
) VALUES (
  '60000000-0000-4000-a001-000000000001',
  '20000000-0000-4000-c000-000000000001',
  '10000000-0000-4000-b000-000000000001',
  'Chin Chin',
  50000, 1, 'bakery',
  datetime('now'), datetime('now')
);

-- OFF-002: Puff Puff — active, TNT-001 bakery
INSERT OR IGNORE INTO offerings (
  id, workspace_id, tenant_id, name,
  price_kobo, is_published, category,
  created_at, updated_at
) VALUES (
  '60000000-0000-4000-a001-000000000002',
  '20000000-0000-4000-c000-000000000001',
  '10000000-0000-4000-b000-000000000001',
  'Puff Puff',
  30000, 1, 'bakery',
  datetime('now'), datetime('now')
);

-- OFF-003: Draft Item — unpublished (is_published=0), tests inactive filtering
INSERT OR IGNORE INTO offerings (
  id, workspace_id, tenant_id, name,
  price_kobo, is_published, category,
  created_at, updated_at
) VALUES (
  '60000000-0000-4000-a001-000000000003',
  '20000000-0000-4000-c000-000000000001',
  '10000000-0000-4000-b000-000000000001',
  'Draft Item',
  100000, 0, 'bakery',
  datetime('now'), datetime('now')
);

-- PROD-001: Jollof Rice — active, TNT-003 restaurant (brand-runtime shop tests)
INSERT OR IGNORE INTO offerings (
  id, workspace_id, tenant_id, name,
  price_kobo, is_published, category,
  created_at, updated_at
) VALUES (
  '60000000-0000-4000-a001-000000000011',
  '20000000-0000-4000-c000-000000000003',
  '10000000-0000-4000-b000-000000000003',
  'Jollof Rice',
  150000, 1, 'restaurant',
  datetime('now'), datetime('now')
);

-- PROD-002: Suya Combo — active, TNT-003 restaurant
INSERT OR IGNORE INTO offerings (
  id, workspace_id, tenant_id, name,
  price_kobo, is_published, category,
  created_at, updated_at
) VALUES (
  '60000000-0000-4000-a001-000000000012',
  '20000000-0000-4000-c000-000000000003',
  '10000000-0000-4000-b000-000000000003',
  'Suya Combo',
  200000, 1, 'restaurant',
  datetime('now'), datetime('now')
);

-- ─────────────────────────────────────────────────────────────────
-- Template Registry
-- Required for TC-TM003 (template install T3), TC-TM004 (70/30 revenue split)
-- ─────────────────────────────────────────────────────────────────

-- TPL-001: Bakery Pro Template — published
INSERT OR IGNORE INTO template_registry (
  id, slug, display_name, description,
  template_type, version, platform_compat,
  compatible_verticals, manifest_json,
  author_tenant_id, status,
  is_free, price_kobo, install_count,
  created_at, updated_at
) VALUES (
  '70000000-0000-4000-a002-000000000001',
  'bakery-pro-template',
  'Bakery Pro Template',
  'Professional bakery management template with order tracking and inventory.',
  'vertical-blueprint',
  '1.0',
  '1.0.0',
  '["bakery"]',
  '{}',
  '10000000-0000-4000-b000-000000000001',
  'approved',
  0,
  5000000,
  0,
  strftime('%s','now'),
  strftime('%s','now')
);

-- ─────────────────────────────────────────────────────────────────
-- B2B RFQ / Bids / Purchase Orders
-- ─────────────────────────────────────────────────────────────────

-- RFQ-001: Open B2B Request for Quotation (flour supply)
-- buyer_entity_id = USR-010 workspace membership in TNT-001
-- Required for TC-B001, TC-B003, TC-B004
INSERT OR IGNORE INTO b2b_rfqs (
  id, workspace_id, tenant_id, buyer_entity_id,
  category, title, description,
  quantity, unit, status,
  expires_at, created_at, updated_at
) VALUES (
  '80000000-0000-4000-a003-000000000001',
  '20000000-0000-4000-c000-000000000001',
  '10000000-0000-4000-b000-000000000001',
  '00000000-0000-4000-a000-000000000010',
  'bakery',
  'Flour Supply',
  'Need 500kg of high-grade wheat flour for bakery operations',
  500, 'kg', 'open',
  strftime('%s', datetime('now', '+30 days')),
  strftime('%s','now'), strftime('%s','now')
);

-- BID-001: Pending bid on RFQ-001 by TNT-003 seller
-- Table: b2b_rfq_bids (not b2b_bids)
-- seller_entity_id = USR-011's workspace in TNT-003
-- Required for TC-B004 (bid acceptance creates PO)
INSERT OR IGNORE INTO b2b_rfq_bids (
  id, rfq_id, tenant_id, seller_entity_id,
  bid_amount_kobo, status,
  created_at, updated_at
) VALUES (
  '80000000-0000-4000-a003-000000000011',
  '80000000-0000-4000-a003-000000000001',
  '10000000-0000-4000-b000-000000000003',
  '20000000-0000-4000-c000-000000000003',
  2500000, 'submitted',
  strftime('%s','now'), strftime('%s','now')
);

-- PO-001: Purchase Order from BID-001
-- Table: b2b_purchase_orders (not purchase_orders)
-- Status: po_created (not pending_delivery — that value is not in CHECK constraint)
-- Required for TC-B005 (delivery marking), TC-B006 (invoice)
INSERT OR IGNORE INTO b2b_purchase_orders (
  id, rfq_id, bid_id,
  tenant_id, buyer_entity_id, seller_entity_id,
  amount_kobo, status,
  created_at, updated_at
) VALUES (
  '80000000-0000-4000-a003-000000000021',
  '80000000-0000-4000-a003-000000000001',
  '80000000-0000-4000-a003-000000000011',
  '10000000-0000-4000-b000-000000000001',
  '20000000-0000-4000-c000-000000000001',
  '20000000-0000-4000-c000-000000000003',
  2500000, 'po_created',
  strftime('%s','now'), strftime('%s','now')
);
