# Database Rollback Runbook — WebWaka OS
# BUG-057 | ops | 2026-04-24

This runbook covers safe rollback procedures for Cloudflare D1 migrations on WebWaka OS.
All rollback actions must be performed by an engineer with `wrangler` access and the `founder-approval`
label on the associated PR.

**Governance: docs/governance/platform-invariants.md (G23 — append-only audit log)**
**Governance: docs/governance/release-governance.md**

---

## Rollback Categories

| Type | Description | Risk |
|------|-------------|------|
| Schema-only migration | New table / column with no data | Low — DROP TABLE or DROP COLUMN |
| Additive data migration | Backfill existing rows | Medium — data restored from backup |
| Destructive migration | DROP, ALTER TYPE, or truncate | High — requires backup restore |
| Financial table change | wallets, wallet_transactions, subscriptions | Critical — 2-engineer sign-off |

---

## Pre-Rollback Checklist

Before initiating ANY rollback:

```
[ ] Incident declared in #ops-incidents Slack channel
[ ] Root cause identified (not guessing)
[ ] Rollback scope confirmed — is it schema-only or data?
[ ] Backup snapshot taken (wrangler d1 export before proceeding)
[ ] 2-engineer sign-off obtained for financial table changes
[ ] staging rollback tested first — NEVER go directly to production
[ ] Release manager notified
[ ] CONTRADICTION_SCAN.md updated with incident ID
```

---

## Step 1: Export Current State (Backup)

```bash
# Export staging DB before any rollback
wrangler d1 export webwaka-staging \
  --env staging \
  --config apps/api/wrangler.toml \
  --output backups/pre-rollback-$(date +%Y%m%d-%H%M%S).sql

# Export production DB (read-only snapshot)
wrangler d1 export webwaka-production \
  --env production \
  --config apps/api/wrangler.toml \
  --output backups/prod-pre-rollback-$(date +%Y%m%d-%H%M%S).sql
```

---

## Step 2: Identify the Migration to Rollback

```bash
# List applied migrations
wrangler d1 migrations list webwaka-staging \
  --env staging \
  --config apps/api/wrangler.toml

# Output format:
# Applied: 0001_initial.sql
# Applied: 0002_add_refresh_tokens.sql
# ...
# Applied: 0387_hitl_append_only.sql ← rollback target
```

---

## Step 3: Execute the Rollback Migration

Rollback migrations live in `apps/api/migrations/rollbacks/` and are named
`NNNN_rollback_<original_name>.sql`. They are the inverse of the forward migration.

```bash
# Apply the rollback script to staging first
wrangler d1 execute webwaka-staging \
  --env staging \
  --config apps/api/wrangler.toml \
  --remote \
  --file apps/api/migrations/rollbacks/0387_rollback_hitl_append_only.sql

# Verify the schema is correct
wrangler d1 execute webwaka-staging \
  --env staging \
  --config apps/api/wrangler.toml \
  --remote \
  --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```

---

## Step 4: Run Governance Checks After Rollback

```bash
# T3 tenant isolation check
npx tsx scripts/governance-checks/check-tenant-isolation.ts

# P9 monetary integrity check
npx tsx scripts/governance-checks/check-monetary-integrity.ts

# G23 audit log check (must still be append-only)
npx tsx scripts/governance-checks/check-rollback-scripts.ts

# Run full test suite on staging
pnpm test:e2e
```

---

## Step 5: Deploy Rollback Code (if needed)

If the migration rollback also requires a code revert (e.g. a route was removed):

```bash
# Identify the git commit for the last known-good state
git log --oneline -20

# Create a revert commit (never force-push to staging or main)
git revert <commit-sha> --no-edit

# Push to staging
git push origin staging

# Redeploy the API Worker
wrangler deploy --env staging --config apps/api/wrangler.toml
```

---

## Step 6: Production Rollback (after staging confirmed)

```bash
# ONLY after staging rollback is verified and tested
wrangler d1 execute webwaka-production \
  --env production \
  --config apps/api/wrangler.toml \
  --remote \
  --file apps/api/migrations/rollbacks/NNNN_rollback_<name>.sql

# Redeploy production Worker
wrangler deploy --env production --config apps/api/wrangler.toml

# Verify production health
curl https://api.webwaka.com/health
curl https://api.webwaka.com/version
```

---

## Step 7: Post-Rollback Validation

```bash
# Run P0 blocker tests against production
API_BASE_URL=https://api.webwaka.com pnpm test:p0-blockers

# Verify audit log integrity (G23)
wrangler d1 execute webwaka-production \
  --env production \
  --config apps/api/wrangler.toml \
  --remote \
  --command "SELECT COUNT(*) FROM audit_log WHERE created_at > unixepoch() - 3600;"
```

---

## Financial Table Rollback (Special Protocol)

For changes to `wallets`, `wallet_transactions`, `hl_wallet_transactions`, `subscriptions`:

1. **STOP** — do not proceed without 2-engineer sign-off
2. Contact finance oncall immediately
3. Take reconciliation snapshot: `SELECT SUM(balance_kobo) FROM wallets WHERE tenant_id = ?`
4. Compare with settlement_amounts in partner_settlements
5. If mismatch detected, do NOT rollback — escalate to engineering lead
6. All financial rollbacks logged in `docs/incidents/YYYY-MM-DD-financial-rollback.md`

---

## Migration Rollback Script Template

For each new forward migration `NNNN_name.sql`, create the inverse:

```sql
-- apps/api/migrations/rollbacks/NNNN_rollback_name.sql
-- Inverse of: NNNN_name.sql
-- Created: YYYY-MM-DD
-- Rollback plan: git revert <sha> (no DB state affected if run after migration)

-- Example: If forward migration added a column:
-- ALTER TABLE foo ADD COLUMN bar TEXT;
-- The rollback is:
-- ALTER TABLE foo DROP COLUMN bar;  -- SQLite 3.35+ supported in D1

-- Example: If forward migration created a table:
-- CREATE TABLE foo (id TEXT PRIMARY KEY);
-- The rollback is:
-- DROP TABLE IF EXISTS foo;
```

---

## Contacts

| Role | Contact |
|------|---------|
| Release Manager | On-call rotation via #ops-incidents |
| DB Lead | Engineering lead |
| Finance Oncall | finance-oncall@webwaka.com |
| Cloudflare Support | https://support.cloudflare.com (Enterprise SLA) |

---

*Last updated: 2026-04-24 | BUG-057 | WebWaka OS Sprint 4*
*Governance: founder-approval required for changes to this document.*
