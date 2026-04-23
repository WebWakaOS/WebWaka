-- WebWaka OS QA Seed — Phase 2: Tenants, Workspaces, Vertical Activations
-- Source: WebWaka_OS_QA_Execution_Plan.md v1.0 §3.1 Phase 2
-- Frozen baseline: WebWaka_OS_Corrected_Master_Inventory_v2.0-FROZEN
--
-- T8: Slug is immutable once set. Do not UPDATE slug after initial INSERT.
-- T3: All workspace rows include tenant_id.
-- D3: Tenant plan is stored in the tenants table and enforced by billing-enforcement middleware.
--
-- Seed ID → UUID mapping:
--   TNT-001 = 10000000-0000-4000-b000-000000000001
--   TNT-002 = 10000000-0000-4000-b000-000000000002
--   ... (sequence continues)

-- TNT-001: tenant-a — main test tenant (starter plan, bakery + hair-salon verticals)
INSERT OR IGNORE INTO tenants (
  id, name, slug, plan, custom_domain, status, created_at, updated_at
) VALUES (
  '10000000-0000-4000-b000-000000000001',
  'Tenant A Test',
  'tenant-a',
  'starter',
  NULL,
  'active',
  strftime('%s','now'),
  strftime('%s','now')
);

-- Workspace for TNT-001, owned by USR-002
INSERT OR IGNORE INTO workspaces (
  id, tenant_id, name, owner_id, plan, status, created_at, updated_at
) VALUES (
  '20000000-0000-4000-c000-000000000001',
  '10000000-0000-4000-b000-000000000001',
  'Tenant A Workspace',
  '00000000-0000-4000-a000-000000000002',
  'starter',
  'active',
  strftime('%s','now'),
  strftime('%s','now')
);

-- TNT-001 vertical activations: bakery + hair-salon
-- NOTE: correct slug is 'hair-salon' (NOT 'barber-shop' — see TC-SLUG001 and inventory correction #37)
INSERT OR IGNORE INTO workspace_verticals (workspace_id, vertical_slug, activated_at)
VALUES ('20000000-0000-4000-c000-000000000001', 'bakery', strftime('%s','now'));
INSERT OR IGNORE INTO workspace_verticals (workspace_id, vertical_slug, activated_at)
VALUES ('20000000-0000-4000-c000-000000000001', 'hair-salon', strftime('%s','now'));

-- TNT-002: tenant-b — free plan tenant (offer/invite/place limit tests)
INSERT OR IGNORE INTO tenants (
  id, name, slug, plan, custom_domain, status, created_at, updated_at
) VALUES (
  '10000000-0000-4000-b000-000000000002',
  'Tenant B Test',
  'tenant-b',
  'free',
  NULL,
  'active',
  strftime('%s','now'),
  strftime('%s','now')
);

INSERT OR IGNORE INTO workspaces (
  id, tenant_id, name, owner_id, plan, status, created_at, updated_at
) VALUES (
  '20000000-0000-4000-c000-000000000002',
  '10000000-0000-4000-b000-000000000002',
  'Tenant B Workspace',
  '00000000-0000-4000-a000-000000000005',
  'free',
  'active',
  strftime('%s','now'),
  strftime('%s','now')
);

INSERT OR IGNORE INTO workspace_verticals (workspace_id, vertical_slug, activated_at)
VALUES ('20000000-0000-4000-c000-000000000002', 'hair-salon', strftime('%s','now'));

-- TNT-003: tenant-c — growth plan, restaurant vertical, custom domain + shop tests
INSERT OR IGNORE INTO tenants (
  id, name, slug, plan, custom_domain, status, created_at, updated_at
) VALUES (
  '10000000-0000-4000-b000-000000000003',
  'Tenant C Test',
  'tenant-c',
  'growth',
  'shop.tenant-c.test',
  'active',
  strftime('%s','now'),
  strftime('%s','now')
);

INSERT OR IGNORE INTO workspaces (
  id, tenant_id, name, owner_id, plan, status, created_at, updated_at
) VALUES (
  '20000000-0000-4000-c000-000000000003',
  '10000000-0000-4000-b000-000000000003',
  'Tenant C Workspace',
  '00000000-0000-4000-a000-000000000011',
  'growth',
  'active',
  strftime('%s','now'),
  strftime('%s','now')
);

INSERT OR IGNORE INTO workspace_verticals (workspace_id, vertical_slug, activated_at)
VALUES ('20000000-0000-4000-c000-000000000003', 'restaurant', strftime('%s','now'));

-- TNT-004: tenant-d — growth plan, law-firm vertical (NBA L3 HITL tests)
-- Required before: TC-HR001, TC-HR002
INSERT OR IGNORE INTO tenants (
  id, name, slug, plan, custom_domain, status, created_at, updated_at
) VALUES (
  '10000000-0000-4000-b000-000000000004',
  'Tenant D Law Firm Test',
  'tenant-d',
  'growth',
  NULL,
  'active',
  strftime('%s','now'),
  strftime('%s','now')
);

INSERT OR IGNORE INTO workspaces (
  id, tenant_id, name, owner_id, plan, status, created_at, updated_at
) VALUES (
  '20000000-0000-4000-c000-000000000004',
  '10000000-0000-4000-b000-000000000004',
  'Tenant D Law Firm',
  '00000000-0000-4000-a000-000000000012',
  'growth',
  'active',
  strftime('%s','now'),
  strftime('%s','now')
);

INSERT OR IGNORE INTO workspace_verticals (workspace_id, vertical_slug, activated_at)
VALUES ('20000000-0000-4000-c000-000000000004', 'law-firm', strftime('%s','now'));

-- TNT-005: tenant-e — enterprise plan, polling-unit + government-agency verticals (INEC compliance)
-- Required before: TC-HR005 (no voter PII)
INSERT OR IGNORE INTO tenants (
  id, name, slug, plan, custom_domain, status, created_at, updated_at
) VALUES (
  '10000000-0000-4000-b000-000000000005',
  'Tenant E Polling Unit Test',
  'tenant-e',
  'enterprise',
  NULL,
  'active',
  strftime('%s','now'),
  strftime('%s','now')
);

INSERT OR IGNORE INTO workspaces (
  id, tenant_id, name, owner_id, plan, status, created_at, updated_at
) VALUES (
  '20000000-0000-4000-c000-000000000005',
  '10000000-0000-4000-b000-000000000005',
  'Tenant E Polling Unit',
  '00000000-0000-4000-a000-000000000013',
  'enterprise',
  'active',
  strftime('%s','now'),
  strftime('%s','now')
);

INSERT OR IGNORE INTO workspace_verticals (workspace_id, vertical_slug, activated_at)
VALUES ('20000000-0000-4000-c000-000000000005', 'polling-unit', strftime('%s','now'));
INSERT OR IGNORE INTO workspace_verticals (workspace_id, vertical_slug, activated_at)
VALUES ('20000000-0000-4000-c000-000000000005', 'government-agency', strftime('%s','now'));

-- TNT-006: tenant-f — starter plan, church + cooperative verticals
INSERT OR IGNORE INTO tenants (
  id, name, slug, plan, custom_domain, status, created_at, updated_at
) VALUES (
  '10000000-0000-4000-b000-000000000006',
  'Tenant F Church Test',
  'tenant-f',
  'starter',
  NULL,
  'active',
  strftime('%s','now'),
  strftime('%s','now')
);

INSERT OR IGNORE INTO workspaces (
  id, tenant_id, name, owner_id, plan, status, created_at, updated_at
) VALUES (
  '20000000-0000-4000-c000-000000000006',
  '10000000-0000-4000-b000-000000000006',
  'Tenant F Church',
  NULL,
  'starter',
  'active',
  strftime('%s','now'),
  strftime('%s','now')
);

INSERT OR IGNORE INTO workspace_verticals (workspace_id, vertical_slug, activated_at)
VALUES ('20000000-0000-4000-c000-000000000006', 'church', strftime('%s','now'));
INSERT OR IGNORE INTO workspace_verticals (workspace_id, vertical_slug, activated_at)
VALUES ('20000000-0000-4000-c000-000000000006', 'cooperative', strftime('%s','now'));

-- TNT-007: tenant-g — growth plan, hire-purchase vertical (CBN hire-purchase FSM tests)
INSERT OR IGNORE INTO tenants (
  id, name, slug, plan, custom_domain, status, created_at, updated_at
) VALUES (
  '10000000-0000-4000-b000-000000000007',
  'Tenant G Hire Purchase Test',
  'tenant-g',
  'growth',
  NULL,
  'active',
  strftime('%s','now'),
  strftime('%s','now')
);

INSERT OR IGNORE INTO workspaces (
  id, tenant_id, name, owner_id, plan, status, created_at, updated_at
) VALUES (
  '20000000-0000-4000-c000-000000000007',
  '10000000-0000-4000-b000-000000000007',
  'Tenant G Hire Purchase',
  NULL,
  'growth',
  'active',
  strftime('%s','now'),
  strftime('%s','now')
);

INSERT OR IGNORE INTO workspace_verticals (workspace_id, vertical_slug, activated_at)
VALUES ('20000000-0000-4000-c000-000000000007', 'hire-purchase', strftime('%s','now'));

-- Assign USR-003 (admin) and USR-004 (cashier) to TNT-001 workspace
INSERT OR IGNORE INTO workspace_members (
  workspace_id, user_id, role, joined_at
) VALUES (
  '20000000-0000-4000-c000-000000000001',
  '00000000-0000-4000-a000-000000000003',
  'admin',
  strftime('%s','now')
);

INSERT OR IGNORE INTO workspace_members (
  workspace_id, user_id, role, joined_at
) VALUES (
  '20000000-0000-4000-c000-000000000001',
  '00000000-0000-4000-a000-000000000004',
  'cashier',
  strftime('%s','now')
);

-- Assign USR-009 (USSD user) to TNT-001 workspace
INSERT OR IGNORE INTO workspace_members (
  workspace_id, user_id, role, joined_at
) VALUES (
  '20000000-0000-4000-c000-000000000001',
  '00000000-0000-4000-a000-000000000009',
  'member',
  strftime('%s','now')
);

-- Assign USR-010 (buyer) to TNT-001 workspace
INSERT OR IGNORE INTO workspace_members (
  workspace_id, user_id, role, joined_at
) VALUES (
  '20000000-0000-4000-c000-000000000001',
  '00000000-0000-4000-a000-000000000010',
  'member',
  strftime('%s','now')
);
