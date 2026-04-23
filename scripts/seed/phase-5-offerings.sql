-- WebWaka OS QA Seed — Phase 5: Offerings, Templates, RFQ/BID/PO
-- Source: WebWaka_OS_QA_Execution_Plan.md v1.0 §3.1 Phase 5
-- Frozen baseline: WebWaka_OS_Corrected_Master_Inventory_v2.0-FROZEN
--
-- P9: All price fields are integer kobo.
-- T3: All offering rows include tenant_id + workspace_id.
-- Template purchase: TPL-001 seeded in template_registry for TC-TM003, TC-TM004.
-- B2B: RFQ-001, BID-001, PO-001 provide stable state for TC-B001–TC-B004.
--
-- Seed ID → UUID mapping:
--   OFF-001 = 60000000-0000-4000-a001-000000000001
--   OFF-002 = 60000000-0000-4000-a001-000000000002
--   OFF-003 = 60000000-0000-4000-a001-000000000003
--   PROD-001 = 60000000-0000-4000-a001-000000000011
--   PROD-002 = 60000000-0000-4000-a001-000000000012
--   TPL-001  = 70000000-0000-4000-a002-000000000001
--   RFQ-001  = 80000000-0000-4000-a003-000000000001
--   BID-001  = 80000000-0000-4000-a003-000000000011
--   PO-001   = 80000000-0000-4000-a003-000000000021

-- OFF-001: Chin Chin — active offering for TNT-001 (bakery)
INSERT OR IGNORE INTO offerings (
  id, workspace_id, tenant_id, name,
  price_kobo, status, vertical_slug,
  created_at, updated_at
) VALUES (
  '60000000-0000-4000-a001-000000000001',
  '20000000-0000-4000-c000-000000000001',
  '10000000-0000-4000-b000-000000000001',
  'Chin Chin',
  50000,
  'active',
  'bakery',
  strftime('%s','now'),
  strftime('%s','now')
);

-- OFF-002: Puff Puff — active offering for TNT-001 (bakery)
INSERT OR IGNORE INTO offerings (
  id, workspace_id, tenant_id, name,
  price_kobo, status, vertical_slug,
  created_at, updated_at
) VALUES (
  '60000000-0000-4000-a001-000000000002',
  '20000000-0000-4000-c000-000000000001',
  '10000000-0000-4000-b000-000000000001',
  'Puff Puff',
  30000,
  'active',
  'bakery',
  strftime('%s','now'),
  strftime('%s','now')
);

-- OFF-003: Draft Item — inactive offering for TNT-001 (tests inactive filtering)
INSERT OR IGNORE INTO offerings (
  id, workspace_id, tenant_id, name,
  price_kobo, status, vertical_slug,
  created_at, updated_at
) VALUES (
  '60000000-0000-4000-a001-000000000003',
  '20000000-0000-4000-c000-000000000001',
  '10000000-0000-4000-b000-000000000001',
  'Draft Item',
  100000,
  'inactive',
  'bakery',
  strftime('%s','now'),
  strftime('%s','now')
);

-- PROD-001: Jollof Rice — active offering for TNT-003 (restaurant), used by brand-runtime shop tests
INSERT OR IGNORE INTO offerings (
  id, workspace_id, tenant_id, name,
  price_kobo, status, vertical_slug,
  created_at, updated_at
) VALUES (
  '60000000-0000-4000-a001-000000000011',
  '20000000-0000-4000-c000-000000000003',
  '10000000-0000-4000-b000-000000000003',
  'Jollof Rice',
  150000,
  'active',
  'restaurant',
  strftime('%s','now'),
  strftime('%s','now')
);

-- PROD-002: Suya Combo — active offering for TNT-003 (restaurant)
INSERT OR IGNORE INTO offerings (
  id, workspace_id, tenant_id, name,
  price_kobo, status, vertical_slug,
  created_at, updated_at
) VALUES (
  '60000000-0000-4000-a001-000000000012',
  '20000000-0000-4000-c000-000000000003',
  '10000000-0000-4000-b000-000000000003',
  'Suya Combo',
  200000,
  'active',
  'restaurant',
  strftime('%s','now'),
  strftime('%s','now')
);

-- TPL-001: Bakery Pro Template — published in template registry
-- Required for TC-TM003 (template install T3), TC-TM004 (70/30 revenue split)
-- Revenue split: 70% to template creator, 30% to platform (WebWaka)
-- price_kobo = 5,000,000 (₦50,000)
INSERT OR IGNORE INTO template_registry (
  id, name, slug, vertical_slug,
  price_kobo, status, creator_workspace_id, creator_tenant_id,
  created_at, updated_at
) VALUES (
  '70000000-0000-4000-a002-000000000001',
  'Bakery Pro Template',
  'bakery-pro-template',
  'bakery',
  5000000,
  'published',
  '20000000-0000-4000-c000-000000000001',
  '10000000-0000-4000-b000-000000000001',
  strftime('%s','now'),
  strftime('%s','now')
);

-- RFQ-001: Open B2B Request for Quotation (flour supply) — buyer is USR-010 in TNT-001
-- Required for TC-B001, TC-B003, TC-B004
INSERT OR IGNORE INTO b2b_rfqs (
  id, workspace_id, tenant_id, buyer_user_id,
  title, description, quantity, unit, status,
  created_at, updated_at
) VALUES (
  '80000000-0000-4000-a003-000000000001',
  '20000000-0000-4000-c000-000000000001',
  '10000000-0000-4000-b000-000000000001',
  '00000000-0000-4000-a000-000000000010',
  'Flour Supply',
  'Need 500kg of high-grade wheat flour for bakery operations',
  500,
  'kg',
  'open',
  strftime('%s','now'),
  strftime('%s','now')
);

-- BID-001: Pending bid on RFQ-001 — seller is USR-011 in TNT-003
-- Required for TC-B004 (bid acceptance creates PO)
INSERT OR IGNORE INTO b2b_bids (
  id, rfq_id, seller_workspace_id, seller_tenant_id, seller_user_id,
  amount_kobo, delivery_days, status,
  created_at, updated_at
) VALUES (
  '80000000-0000-4000-a003-000000000011',
  '80000000-0000-4000-a003-000000000001',
  '20000000-0000-4000-c000-000000000003',
  '10000000-0000-4000-b000-000000000003',
  '00000000-0000-4000-a000-000000000011',
  2500000,
  7,
  'pending',
  strftime('%s','now'),
  strftime('%s','now')
);

-- PO-001: Purchase Order created from BID-001 — pending delivery
-- Required for TC-B005 (delivery marking), TC-B006 (invoice)
INSERT OR IGNORE INTO purchase_orders (
  id, rfq_id, bid_id,
  buyer_workspace_id, buyer_tenant_id,
  seller_workspace_id, seller_tenant_id,
  amount_kobo, status,
  created_at, updated_at
) VALUES (
  '80000000-0000-4000-a003-000000000021',
  '80000000-0000-4000-a003-000000000001',
  '80000000-0000-4000-a003-000000000011',
  '20000000-0000-4000-c000-000000000001',
  '10000000-0000-4000-b000-000000000001',
  '20000000-0000-4000-c000-000000000003',
  '10000000-0000-4000-b000-000000000003',
  2500000,
  'pending_delivery',
  strftime('%s','now'),
  strftime('%s','now')
);
