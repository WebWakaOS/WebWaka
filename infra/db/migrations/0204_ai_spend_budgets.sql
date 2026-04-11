CREATE TABLE IF NOT EXISTS ai_spend_budgets (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('user', 'team', 'project', 'workspace')),
  scope_id TEXT NOT NULL,
  monthly_limit_wc INTEGER NOT NULL CHECK (monthly_limit_wc >= 0),
  current_month_spent_wc INTEGER NOT NULL DEFAULT 0,
  reset_at TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_spend_budgets_tenant ON ai_spend_budgets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_spend_budgets_scope ON ai_spend_budgets(tenant_id, scope, scope_id);
CREATE INDEX IF NOT EXISTS idx_spend_budgets_active ON ai_spend_budgets(tenant_id, is_active);
