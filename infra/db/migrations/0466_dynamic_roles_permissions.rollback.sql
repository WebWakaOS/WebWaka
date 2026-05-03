-- Rollback 0466: Dynamic Roles & Permissions
DROP TABLE IF EXISTS role_bundle_bindings;
DROP TABLE IF EXISTS role_permission_bindings;
DROP TABLE IF EXISTS custom_roles;
DROP TABLE IF EXISTS bundle_permission_bindings;
DROP TABLE IF EXISTS permission_bundles;
DROP TABLE IF EXISTS permission_definitions;
