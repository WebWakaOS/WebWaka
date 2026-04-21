-- 0230: Create tenants table for multi-tenant admin dashboards (P19-F)
--
-- Replaces the implicit string-only tenant_id pattern with a real lookup table.
-- Existing tenant_id columns in workspaces/users remain TEXT strings.
-- No FK constraints are added to existing tables since SQLite ALTER TABLE
-- does not support ADD CONSTRAINT — tenant isolation is enforced at the
-- application layer (T3 invariant) as before.
--
-- New registrations (POST /auth/register) insert a tenants row as part of
-- the registration batch so every new tenant has a corresponding record.

CREATE TABLE IF NOT EXISTS tenants (
  id          TEXT    NOT NULL PRIMARY KEY,
  name        TEXT    NOT NULL,
  plan        TEXT    NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'growth', 'enterprise')),
  status      TEXT    NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_plan   ON tenants(plan);
