-- Migration 0216: AI plan monthly quotas (MON-03)
-- (Platform Invariant P9 — all WakaCU amounts are INTEGER)
--
-- Maps subscription plan name → monthly WakaCU allowance.
-- Used by GET /superagent/usage/quota to show tenants how much AI budget
-- their plan includes and how much they have consumed this month.
--
-- quota_waku_cu = 0 means unlimited (enterprise plans with negotiated contracts).
-- Quotas are soft limits — enforced by SpendControls.checkBudget which reads
-- wc_wallets.spend_cap_monthly_wc. This table is the canonical source of truth
-- for plan-level defaults; SpendControls reads it on tenant onboarding.

CREATE TABLE IF NOT EXISTS ai_plan_quotas (
  plan             TEXT PRIMARY KEY,
  quota_waku_cu    INTEGER NOT NULL DEFAULT 0 CHECK (quota_waku_cu >= 0),
  description      TEXT NOT NULL,
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed plan quotas (values in WakaCU; 1 WakaCU = 1,000 input + 500 output tokens)
INSERT OR IGNORE INTO ai_plan_quotas (plan, quota_waku_cu, description) VALUES
  ('free',         500,     'Free tier — 500 WC/month (~0.5M input tokens)'),
  ('starter',      5000,    'Starter plan — 5,000 WC/month (~5M input tokens)'),
  ('professional', 50000,   'Professional plan — 50,000 WC/month (~50M input tokens)'),
  ('business',     250000,  'Business plan — 250,000 WC/month (~250M input tokens)'),
  ('enterprise',   0,       'Enterprise plan — unlimited (0 = no cap; negotiated contract)');
