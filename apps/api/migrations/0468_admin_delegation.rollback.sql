-- Rollback 0468: Admin Delegation
DROP TABLE IF EXISTS delegation_approval_queue;
DROP TABLE IF EXISTS delegation_capabilities;
DROP TABLE IF EXISTS admin_delegation_policies;
