-- WebWaka OS QA Seed — Phase 3: Partners
-- Source: WebWaka_OS_QA_Execution_Plan.md v1.0 §3.1 Phase 3
-- Frozen baseline: WebWaka_OS_Corrected_Master_Inventory_v2.0-FROZEN
--
-- Partners are white-label resellers of WebWaka OS.
-- PTN-001 is a top-level partner. PTN-002 is a sub-partner (child of PTN-001).
-- White-label depth is stored to enforce TC-WL007 constraints.
--
-- Seed ID → UUID mapping:
--   PTN-001 = 30000000-0000-4000-d000-000000000001
--   PTN-002 = 30000000-0000-4000-d000-000000000002

-- PTN-001: TestPartner Africa — top-level partner
-- Required before: TC-PR001–PR008, TC-AC009, TC-AC010
INSERT OR IGNORE INTO partners (
  id, name, slug, parent_id, white_label_depth,
  waka_cu_balance, status, owner_user_id,
  created_at, updated_at
) VALUES (
  '30000000-0000-4000-d000-000000000001',
  'TestPartner Africa',
  'testpartner-africa',
  NULL,
  2,
  500000,
  'active',
  '00000000-0000-4000-a000-000000000006',
  strftime('%s','now'),
  strftime('%s','now')
);

-- PTN-002: SubTestPartner — sub-partner, child of PTN-001
-- Required for TC-PR005 (sub-partner creation) and TC-AC010
INSERT OR IGNORE INTO partners (
  id, name, slug, parent_id, white_label_depth,
  waka_cu_balance, status, owner_user_id,
  created_at, updated_at
) VALUES (
  '30000000-0000-4000-d000-000000000002',
  'SubTestPartner',
  'subtestpartner',
  '30000000-0000-4000-d000-000000000001',
  1,
  0,
  'active',
  '00000000-0000-4000-a000-000000000007',
  strftime('%s','now'),
  strftime('%s','now')
);
