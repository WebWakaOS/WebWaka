-- 0377_super_admin_seed.sql
-- Phase S14 Owner Actions: Seed the platform super-admin user account.
--
-- Initial password: ChangeMe!WebWaka2026
-- MANDATORY: Change this password immediately after first login via:
--   PATCH /auth/change-password  (authenticated)
--   or via D1 console: UPDATE users SET password_hash = ? WHERE id = 'usr_super_admin_platform';
--
-- The email is set to a placeholder — update before first login:
--   UPDATE users SET email = 'your@email.com' WHERE id = 'usr_super_admin_platform';
--
-- Tenant: ten_platform (WebWaka OS — enterprise)
-- Workspace: wsp_platform

INSERT OR IGNORE INTO users (
  id,
  email,
  password_hash,
  full_name,
  workspace_id,
  tenant_id,
  role,
  kyc_status,
  kyc_tier,
  created_at,
  updated_at
) VALUES (
  'usr_super_admin_platform',
  'admin@webwaka.com',
  'V2ViV2FrYUFkbWluMjAyNg==:cB9o9VJNfgAYQYRl8j842JMq1vnu7Hm7s4hFSWt9A4M=',
  'WebWaka Platform Admin',
  'wsp_platform',
  'ten_platform',
  'super_admin',
  'verified',
  't3',
  strftime('%s', '2026-04-22'),
  strftime('%s', '2026-04-22')
);
