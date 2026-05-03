-- Rollback 0465: Dynamic Entitlement Definitions
DROP TABLE IF EXISTS workspace_entitlement_overrides;
DROP TABLE IF EXISTS package_entitlement_bindings;
DROP TABLE IF EXISTS entitlement_definitions;
