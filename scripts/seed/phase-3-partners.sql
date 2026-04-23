-- WebWaka OS QA Seed — Phase 3: Partners
-- Source: WebWaka_OS_QA_Execution_Plan.md v1.0 §3.1 Phase 3
-- Frozen baseline: WebWaka_OS_Corrected_Master_Inventory_v2.0-FROZEN
--
-- SCHEMA FIX 2026-04-23: Aligned with actual migration schemas:
--   partners (0200): id, tenant_id, workspace_id, company_name, contact_email,
--                    status, max_sub_partners, onboarded_at
--   sub_partners (0201): id, partner_id, tenant_id, workspace_id,
--                        delegation_agreement_ref, status, created_by
--
-- PTN-001 = top-level partner → partners table
-- PTN-002 = sub-partner (child of PTN-001) → sub_partners table
--
-- Seed ID → UUID mapping:
--   PTN-001 = 30000000-0000-4000-d000-000000000001
--   PTN-002 = 30000000-0000-4000-d000-000000000002

-- PTN-001: TestPartner Africa — top-level partner
-- Required before: TC-PR001–TC-PR008, TC-AC009, TC-AC010
INSERT OR IGNORE INTO partners (
  id, tenant_id, workspace_id,
  company_name, contact_email,
  status, max_sub_partners,
  created_at, updated_at
) VALUES (
  '30000000-0000-4000-d000-000000000001',
  '10000000-0000-4000-b000-000000000001',
  '20000000-0000-4000-c000-000000000001',
  'TestPartner Africa',
  'partner@testpartner-africa.test',
  'active',
  10,
  datetime('now'),
  datetime('now')
);

-- PTN-002: SubTestPartner — sub-partner, child of PTN-001
-- Required for TC-PR005 (sub-partner creation) and TC-AC010
INSERT OR IGNORE INTO sub_partners (
  id, partner_id, tenant_id, workspace_id,
  status, created_by,
  created_at, updated_at
) VALUES (
  '30000000-0000-4000-d000-000000000002',
  '30000000-0000-4000-d000-000000000001',
  '10000000-0000-4000-b000-000000000001',
  '20000000-0000-4000-c000-000000000001',
  'active',
  '00000000-0000-4000-a000-000000000006',
  datetime('now'),
  datetime('now')
);
