-- WebWaka OS QA Seed — Phase 9: Subscriptions + POS Products + POS Sales
-- Correct column names matched to actual D1 schema.
-- Safe to run on staging and production (INSERT OR IGNORE).

-- ─── SUBSCRIPTIONS ─────────────────────────────────────────────────────────

INSERT OR IGNORE INTO subscriptions (
  id, workspace_id, tenant_id,
  plan, status, enforcement_status, currency_code,
  current_period_start, current_period_end,
  cancel_at_period_end, created_at, updated_at
) VALUES
  ('sub-00000000-0000-4000-d000-000000000001',
   '20000000-0000-4000-c000-000000000001',
   '10000000-0000-4000-b000-000000000001',
   'growth', 'active', 'none', 'NGN',
   CAST(strftime('%s','now','-30 days') AS INTEGER),
   CAST(strftime('%s','now','+335 days') AS INTEGER),
   0,
   CAST(strftime('%s','now','-30 days') AS INTEGER),
   CAST(strftime('%s','now') AS INTEGER)),

  ('sub-00000000-0000-4000-d000-000000000002',
   '20000000-0000-4000-c000-000000000002',
   '10000000-0000-4000-b000-000000000002',
   'starter', 'active', 'none', 'NGN',
   CAST(strftime('%s','now','-15 days') AS INTEGER),
   CAST(strftime('%s','now','+350 days') AS INTEGER),
   0,
   CAST(strftime('%s','now','-15 days') AS INTEGER),
   CAST(strftime('%s','now') AS INTEGER)),

  ('sub-00000000-0000-4000-d000-000000000003',
   '20000000-0000-4000-c000-000000000003',
   '10000000-0000-4000-b000-000000000003',
   'free', 'active', 'none', 'NGN',
   CAST(strftime('%s','now','-60 days') AS INTEGER),
   CAST(strftime('%s','now','+305 days') AS INTEGER),
   0,
   CAST(strftime('%s','now','-60 days') AS INTEGER),
   CAST(strftime('%s','now') AS INTEGER)),

  ('sub-00000000-0000-4000-d000-000000000004',
   '20000000-0000-4000-c000-000000000004',
   '10000000-0000-4000-b000-000000000004',
   'growth', 'active', 'none', 'NGN',
   CAST(strftime('%s','now','-10 days') AS INTEGER),
   CAST(strftime('%s','now','+355 days') AS INTEGER),
   0,
   CAST(strftime('%s','now','-10 days') AS INTEGER),
   CAST(strftime('%s','now') AS INTEGER)),

  ('sub-00000000-0000-4000-d000-000000000005',
   '20000000-0000-4000-c000-000000000005',
   '10000000-0000-4000-b000-000000000005',
   'starter', 'active', 'none', 'NGN',
   CAST(strftime('%s','now','-5 days') AS INTEGER),
   CAST(strftime('%s','now','+360 days') AS INTEGER),
   0,
   CAST(strftime('%s','now','-5 days') AS INTEGER),
   CAST(strftime('%s','now') AS INTEGER));

-- ─── POS PRODUCTS — Tenant A (Palm Oil Mill) ───────────────────────────────

INSERT OR IGNORE INTO pos_products (
  id, workspace_id, tenant_id,
  name, sku, price_kobo,
  category, stock_qty, active,
  created_at, updated_at
) VALUES
  ('prod-a-001','20000000-0000-4000-c000-000000000001','10000000-0000-4000-b000-000000000001',
   'Refined Palm Oil','litre',350000,'Palm Oil',120,1,
   CAST(strftime('%s','now','-30 days') AS INTEGER), CAST(strftime('%s','now') AS INTEGER)),
  ('prod-a-002','20000000-0000-4000-c000-000000000001','10000000-0000-4000-b000-000000000001',
   'Palm Kernel Oil','litre',280000,'Palm Oil',85,1,
   CAST(strftime('%s','now','-28 days') AS INTEGER), CAST(strftime('%s','now') AS INTEGER)),
  ('prod-a-003','20000000-0000-4000-c000-000000000001','10000000-0000-4000-b000-000000000001',
   'Crude Palm Oil (5L)','can',1500000,'Palm Oil',40,1,
   CAST(strftime('%s','now','-25 days') AS INTEGER), CAST(strftime('%s','now') AS INTEGER)),
  ('prod-a-004','20000000-0000-4000-c000-000000000001','10000000-0000-4000-b000-000000000001',
   'Palm Olein','litre',320000,'Palm Oil',60,1,
   CAST(strftime('%s','now','-20 days') AS INTEGER), CAST(strftime('%s','now') AS INTEGER)),
  ('prod-a-005','20000000-0000-4000-c000-000000000001','10000000-0000-4000-b000-000000000001',
   'Palm Stearin','kg',250000,'Palm Oil',200,1,
   CAST(strftime('%s','now','-15 days') AS INTEGER), CAST(strftime('%s','now') AS INTEGER)),
  ('prod-a-006','20000000-0000-4000-c000-000000000001','10000000-0000-4000-b000-000000000001',
   'Processed Kernel Cake','kg',80000,'By-Products',500,1,
   CAST(strftime('%s','now','-10 days') AS INTEGER), CAST(strftime('%s','now') AS INTEGER)),
  ('prod-a-007','20000000-0000-4000-c000-000000000001','10000000-0000-4000-b000-000000000001',
   'Fresh Fruit Bunch (FFB)','bunch',12000,'Raw Material',1000,1,
   CAST(strftime('%s','now','-8 days') AS INTEGER), CAST(strftime('%s','now') AS INTEGER)),
  ('prod-a-008','20000000-0000-4000-c000-000000000001','10000000-0000-4000-b000-000000000001',
   'Palm Fatty Acid Distillate','kg',180000,'By-Products',300,0,
   CAST(strftime('%s','now','-5 days') AS INTEGER), CAST(strftime('%s','now') AS INTEGER));

-- ─── POS PRODUCTS — Tenant B (General Commerce) ────────────────────────────

INSERT OR IGNORE INTO pos_products (
  id, workspace_id, tenant_id,
  name, sku, price_kobo,
  category, stock_qty, active,
  created_at, updated_at
) VALUES
  ('prod-b-001','20000000-0000-4000-c000-000000000002','10000000-0000-4000-b000-000000000002',
   'Indomie Noodles (Carton)','carton',750000,'Food Staples',50,1,
   CAST(strftime('%s','now','-20 days') AS INTEGER), CAST(strftime('%s','now') AS INTEGER)),
  ('prod-b-002','20000000-0000-4000-c000-000000000002','10000000-0000-4000-b000-000000000002',
   'Rice (50kg bag)','bag',8500000,'Grains',30,1,
   CAST(strftime('%s','now','-18 days') AS INTEGER), CAST(strftime('%s','now') AS INTEGER)),
  ('prod-b-003','20000000-0000-4000-c000-000000000002','10000000-0000-4000-b000-000000000002',
   'Groundnut Oil (5L)','bottle',950000,'Oils',25,1,
   CAST(strftime('%s','now','-15 days') AS INTEGER), CAST(strftime('%s','now') AS INTEGER)),
  ('prod-b-004','20000000-0000-4000-c000-000000000002','10000000-0000-4000-b000-000000000002',
   'Peak Milk (400g)','tin',350000,'Dairy',80,1,
   CAST(strftime('%s','now','-10 days') AS INTEGER), CAST(strftime('%s','now') AS INTEGER)),
  ('prod-b-005','20000000-0000-4000-c000-000000000002','10000000-0000-4000-b000-000000000002',
   'Milo (500g)','tin',280000,'Beverages',60,1,
   CAST(strftime('%s','now','-8 days') AS INTEGER), CAST(strftime('%s','now') AS INTEGER)),
  ('prod-b-006','20000000-0000-4000-c000-000000000002','10000000-0000-4000-b000-000000000002',
   'Semovita (2kg)','pack',190000,'Food Staples',45,1,
   CAST(strftime('%s','now','-5 days') AS INTEGER), CAST(strftime('%s','now') AS INTEGER));

-- ─── POS SALES — Tenant A (to populate dashboard recent sales) ─────────────

INSERT OR IGNORE INTO pos_sales (
  id, workspace_id, tenant_id,
  cashier_id, payment_method, total_kobo,
  items_json, created_at
) VALUES
  ('sale-a-001','20000000-0000-4000-c000-000000000001','10000000-0000-4000-b000-000000000001',
   '00000000-0000-4000-a000-000000000003',
   'cash', 1128750,
   '[{"product_id":"prod-a-001","qty":3,"price_kobo":350000}]',
   CAST(strftime('%s','now','-2 hours') AS INTEGER)),
  ('sale-a-002','20000000-0000-4000-c000-000000000001','10000000-0000-4000-b000-000000000001',
   '00000000-0000-4000-a000-000000000003',
   'transfer', 3010000,
   '[{"product_id":"prod-a-003","qty":2,"price_kobo":1500000}]',
   CAST(strftime('%s','now','-4 hours') AS INTEGER)),
  ('sale-a-003','20000000-0000-4000-c000-000000000001','10000000-0000-4000-b000-000000000001',
   '00000000-0000-4000-a000-000000000003',
   'cash', 376250,
   '[{"product_id":"prod-a-002","qty":1,"price_kobo":280000}]',
   CAST(strftime('%s','now','-6 hours') AS INTEGER)),
  ('sale-a-004','20000000-0000-4000-c000-000000000001','10000000-0000-4000-b000-000000000001',
   '00000000-0000-4000-a000-000000000003',
   'card', 1881250,
   '[{"product_id":"prod-a-004","qty":5,"price_kobo":320000}]',
   CAST(strftime('%s','now','-1 days') AS INTEGER)),
  ('sale-a-005','20000000-0000-4000-c000-000000000001','10000000-0000-4000-b000-000000000001',
   '00000000-0000-4000-a000-000000000003',
   'cash', 1032000,
   '[{"product_id":"prod-a-001","qty":2,"price_kobo":350000},{"product_id":"prod-a-006","qty":3,"price_kobo":80000}]',
   CAST(strftime('%s','now','-1 days') AS INTEGER));
