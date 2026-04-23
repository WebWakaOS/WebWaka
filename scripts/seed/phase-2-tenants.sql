-- WebWaka OS QA Seed — Phase 2: Tenants, Workspaces, Memberships
-- Source: WebWaka_OS_QA_Execution_Plan.md v1.0 §3.1 Phase 2
-- Frozen baseline: WebWaka_OS_Corrected_Master_Inventory_v2.0-FROZEN
--
-- SCHEMA FIX 2026-04-23: Aligned with actual migration schemas:
--   tenants (0230): id, name, plan, status  — NO slug, NO custom_domain
--   workspaces (0003): id, tenant_id, name, owner_type (req), owner_id,
--                      subscription_plan, subscription_status
--   memberships (0003): id (req PK), workspace_id, tenant_id, user_id, role
--
-- NOTE: workspace_verticals inserts removed — D1 enforces FK on verticals(slug)
--       strictly. Vertical activations are created via API calls during test setup
--       (tests POST /workspaces/{id}/verticals/{slug}/activate).
--
-- T3: All workspace rows include tenant_id.
-- D3: Tenant plan stored in tenants.plan.

-- ─── TNT-001: tenant-a — main test tenant (starter plan) ──────────────────────
INSERT OR IGNORE INTO tenants (id, name, plan, status, created_at, updated_at)
VALUES ('10000000-0000-4000-b000-000000000001', 'Tenant A Test', 'starter', 'active',
        strftime('%s','now'), strftime('%s','now'));

INSERT OR IGNORE INTO workspaces (
  id, tenant_id, name, owner_type, owner_id,
  subscription_plan, subscription_status, created_at, updated_at
) VALUES (
  '20000000-0000-4000-c000-000000000001',
  '10000000-0000-4000-b000-000000000001',
  'Tenant A Workspace', 'individual',
  '00000000-0000-4000-a000-000000000002',
  'starter', 'active',
  strftime('%s','now'), strftime('%s','now')
);

-- ─── TNT-002: tenant-b — free plan ────────────────────────────────────────────
INSERT OR IGNORE INTO tenants (id, name, plan, status, created_at, updated_at)
VALUES ('10000000-0000-4000-b000-000000000002', 'Tenant B Test', 'free', 'active',
        strftime('%s','now'), strftime('%s','now'));

INSERT OR IGNORE INTO workspaces (
  id, tenant_id, name, owner_type, owner_id,
  subscription_plan, subscription_status, created_at, updated_at
) VALUES (
  '20000000-0000-4000-c000-000000000002',
  '10000000-0000-4000-b000-000000000002',
  'Tenant B Workspace', 'individual',
  '00000000-0000-4000-a000-000000000005',
  'free', 'active',
  strftime('%s','now'), strftime('%s','now')
);

-- ─── TNT-003: tenant-c — growth plan, restaurant ──────────────────────────────
INSERT OR IGNORE INTO tenants (id, name, plan, status, created_at, updated_at)
VALUES ('10000000-0000-4000-b000-000000000003', 'Tenant C Test', 'growth', 'active',
        strftime('%s','now'), strftime('%s','now'));

INSERT OR IGNORE INTO workspaces (
  id, tenant_id, name, owner_type, owner_id,
  subscription_plan, subscription_status, created_at, updated_at
) VALUES (
  '20000000-0000-4000-c000-000000000003',
  '10000000-0000-4000-b000-000000000003',
  'Tenant C Workspace', 'individual',
  '00000000-0000-4000-a000-000000000011',
  'growth', 'active',
  strftime('%s','now'), strftime('%s','now')
);

-- ─── TNT-004: tenant-d — growth plan, law-firm (NBA L3 HITL) ─────────────────
INSERT OR IGNORE INTO tenants (id, name, plan, status, created_at, updated_at)
VALUES ('10000000-0000-4000-b000-000000000004', 'Tenant D Law Firm Test', 'growth', 'active',
        strftime('%s','now'), strftime('%s','now'));

INSERT OR IGNORE INTO workspaces (
  id, tenant_id, name, owner_type, owner_id,
  subscription_plan, subscription_status, created_at, updated_at
) VALUES (
  '20000000-0000-4000-c000-000000000004',
  '10000000-0000-4000-b000-000000000004',
  'Tenant D Law Firm', 'organization',
  '00000000-0000-4000-a000-000000000012',
  'growth', 'active',
  strftime('%s','now'), strftime('%s','now')
);

-- ─── TNT-005: tenant-e — enterprise plan, polling unit (INEC) ────────────────
INSERT OR IGNORE INTO tenants (id, name, plan, status, created_at, updated_at)
VALUES ('10000000-0000-4000-b000-000000000005', 'Tenant E Polling Unit Test', 'enterprise', 'active',
        strftime('%s','now'), strftime('%s','now'));

INSERT OR IGNORE INTO workspaces (
  id, tenant_id, name, owner_type, owner_id,
  subscription_plan, subscription_status, created_at, updated_at
) VALUES (
  '20000000-0000-4000-c000-000000000005',
  '10000000-0000-4000-b000-000000000005',
  'Tenant E Polling Unit', 'organization',
  '00000000-0000-4000-a000-000000000013',
  'enterprise', 'active',
  strftime('%s','now'), strftime('%s','now')
);

-- ─── TNT-006: tenant-f — starter plan, church + cooperative ──────────────────
INSERT OR IGNORE INTO tenants (id, name, plan, status, created_at, updated_at)
VALUES ('10000000-0000-4000-b000-000000000006', 'Tenant F Church Test', 'starter', 'active',
        strftime('%s','now'), strftime('%s','now'));

INSERT OR IGNORE INTO workspaces (
  id, tenant_id, name, owner_type, owner_id,
  subscription_plan, subscription_status, created_at, updated_at
) VALUES (
  '20000000-0000-4000-c000-000000000006',
  '10000000-0000-4000-b000-000000000006',
  'Tenant F Church', 'organization',
  '00000000-0000-4000-a000-000000000001',
  'starter', 'active',
  strftime('%s','now'), strftime('%s','now')
);

-- ─── TNT-007: tenant-g — growth plan, hire-purchase (CBN FSM) ────────────────
INSERT OR IGNORE INTO tenants (id, name, plan, status, created_at, updated_at)
VALUES ('10000000-0000-4000-b000-000000000007', 'Tenant G Hire Purchase Test', 'growth', 'active',
        strftime('%s','now'), strftime('%s','now'));

INSERT OR IGNORE INTO workspaces (
  id, tenant_id, name, owner_type, owner_id,
  subscription_plan, subscription_status, created_at, updated_at
) VALUES (
  '20000000-0000-4000-c000-000000000007',
  '10000000-0000-4000-b000-000000000007',
  'Tenant G Hire Purchase', 'organization',
  '00000000-0000-4000-a000-000000000001',
  'growth', 'active',
  strftime('%s','now'), strftime('%s','now')
);

-- ─── Memberships for TNT-001 workspace ────────────────────────────────────────
-- USR-003 (admin), USR-004 (cashier), USR-009 (USSD member), USR-010 (B2B buyer)
-- workspaces inserted above so FK workspace_id → workspaces.id is satisfied

INSERT OR IGNORE INTO memberships (
  id, workspace_id, tenant_id, user_id, role, created_at, updated_at
) VALUES (
  'mb000000-0000-4000-0003-000000000001',
  '20000000-0000-4000-c000-000000000001',
  '10000000-0000-4000-b000-000000000001',
  '00000000-0000-4000-a000-000000000003',
  'admin',
  strftime('%s','now'), strftime('%s','now')
);

INSERT OR IGNORE INTO memberships (
  id, workspace_id, tenant_id, user_id, role, created_at, updated_at
) VALUES (
  'mb000000-0000-4000-0004-000000000001',
  '20000000-0000-4000-c000-000000000001',
  '10000000-0000-4000-b000-000000000001',
  '00000000-0000-4000-a000-000000000004',
  'cashier',
  strftime('%s','now'), strftime('%s','now')
);

INSERT OR IGNORE INTO memberships (
  id, workspace_id, tenant_id, user_id, role, created_at, updated_at
) VALUES (
  'mb000000-0000-4000-0009-000000000001',
  '20000000-0000-4000-c000-000000000001',
  '10000000-0000-4000-b000-000000000001',
  '00000000-0000-4000-a000-000000000009',
  'member',
  strftime('%s','now'), strftime('%s','now')
);

INSERT OR IGNORE INTO memberships (
  id, workspace_id, tenant_id, user_id, role, created_at, updated_at
) VALUES (
  'mb000000-0000-4000-0010-000000000001',
  '20000000-0000-4000-c000-000000000001',
  '10000000-0000-4000-b000-000000000001',
  '00000000-0000-4000-a000-000000000010',
  'member',
  strftime('%s','now'), strftime('%s','now')
);
