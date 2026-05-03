-- Rollback 0467: User Groups and Per-User Overrides
DROP TABLE IF EXISTS user_role_assignments;
DROP TABLE IF EXISTS user_permission_overrides;
DROP TABLE IF EXISTS group_permission_bindings;
DROP TABLE IF EXISTS group_role_bindings;
DROP TABLE IF EXISTS group_memberships;
DROP TABLE IF EXISTS user_groups;
