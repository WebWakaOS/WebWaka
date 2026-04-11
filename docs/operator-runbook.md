# WebWaka OS — Operator Runbook

**Platform:** Cloudflare Workers + D1 + KV  
**Prepared:** 2026-04-10  
**Contact:** Platform Engineering Team

This runbook covers manual steps that cannot be automated via CI/CD — either because they require human approval or because they depend on Cloudflare API tokens that were not available at implementation time.

---

## OPS-001: Enable Production Environment Protection (GitHub Manual Step)

**Why:** The `deploy-api-production` CI job deploys directly to production on every push to `main`. This must be gated behind a human approval click.

**Steps:**

1. Go to: https://github.com/WebWakaDOS/webwaka-os/settings/environments
2. Click **"production"** environment (create it if it does not exist)
3. Under **"Deployment protection rules"**, enable **"Required reviewers"**
4. Add the founder/lead engineer GitHub username as a required reviewer
5. Optionally enable **"Prevent self-review"** to require a second person
6. Click **Save protection rules**

**Effect:** After this, the `deploy-api-production` job will pause and send a Slack/email notification to the listed reviewer. The deploy only proceeds after they click "Approve" in the GitHub UI.

**Do this before the first production deploy.**

---

## DEPLOY-001: Create Missing KV Namespaces (Cloudflare CLI)

**Why:** Several Cloudflare KV namespaces may need to be created if they do not yet exist. The `wrangler.toml` files have been pre-filled with real IDs from the initial provisioning, but if any namespace was deleted or not yet created, run the following.

**Prerequisites:**
- Cloudflare API token with Workers KV permissions
- Account ID: `a5f5864b726209519e0c361f2bb90e79`

**Do NOT hardcode the API token in any file.** Set it as an environment variable:

```bash
export CLOUDFLARE_API_TOKEN="<your-api-token>"
export CLOUDFLARE_ACCOUNT_ID="a5f5864b726209519e0c361f2bb90e79"
```

**Check which namespaces already exist:**

```bash
npx wrangler kv namespace list 2>&1
```

**Create any missing namespaces:**

```bash
# Geography cache (apps/api)
npx wrangler kv namespace create "GEOGRAPHY_CACHE" --env staging
npx wrangler kv namespace create "GEOGRAPHY_CACHE" --env production

# Theme cache (apps/brand-runtime)
npx wrangler kv namespace create "THEME_CACHE" --env staging
npx wrangler kv namespace create "THEME_CACHE" --env production

# Discovery cache (apps/public-discovery)
npx wrangler kv namespace create "DISCOVERY_CACHE" --env staging
npx wrangler kv namespace create "DISCOVERY_CACHE" --env production

# USSD session state (apps/ussd-gateway)
npx wrangler kv namespace create "USSD_SESSION_KV" --env staging
npx wrangler kv namespace create "USSD_SESSION_KV" --env production

# Rate limit KV (shared across api + ussd-gateway)
npx wrangler kv namespace create "RATE_LIMIT_KV" --env staging
npx wrangler kv namespace create "RATE_LIMIT_KV" --env production
```

**After creation:** Copy the `id` values from the output and update the corresponding `wrangler.toml` files.

**Current pre-filled IDs (verify these match your Cloudflare dashboard):**

| Namespace | Environment | ID |
|---|---|---|
| GEOGRAPHY_CACHE | staging | `01df2e1e329d446ebfd1577b93554ede` |
| GEOGRAPHY_CACHE | production | `b447c8dd14e3432baaeb8bf13d8fd736` |
| RATE_LIMIT_KV | staging | `608eacac3eb941a68c716b14e84b4d10` |
| RATE_LIMIT_KV | production | `af260e847d1e400e94cf13f6ae3214eb` |
| THEME_CACHE | staging | `bd24f563762d4ebb889f09cc711a6796` |
| THEME_CACHE | production | `323d03bf6f5f4caaa28c80830f4af892` |
| DISCOVERY_CACHE | staging | `ed8e7381f64e43ca97834bc7ace0f711` |
| DISCOVERY_CACHE | production | `dffe6346937f4fc78fbb3ea521f89d02` |
| USSD_SESSION_KV | staging | `2d2b2b32beb94df989a7e3520cc3962a` |
| USSD_SESSION_KV | production | `c3f90b3b6b634983b1778964b0a92ed0` |

---

## DEPLOY-005: Apply All Migrations to Staging D1

**Why:** Migrations must be applied to the remote D1 staging database before deploying.

**Prerequisites:** DEPLOY-002 complete (correct `database_name` in `wrangler.toml`).

```bash
export CLOUDFLARE_API_TOKEN="<your-api-token>"
export CLOUDFLARE_ACCOUNT_ID="a5f5864b726209519e0c361f2bb90e79"

# Apply all migrations to staging D1
npx wrangler d1 migrations apply webwaka-os-staging \
  --env staging \
  --config apps/api/wrangler.toml \
  --remote 2>&1

# Verify the 8 critical tables exist
npx wrangler d1 execute webwaka-os-staging --env staging --remote \
  --command "SELECT name FROM sqlite_master WHERE type='table' AND name IN (
    'search_entries', 'discovery_events', 'vendor_pricing_policies',
    'listing_price_overrides', 'negotiation_sessions', 'negotiation_offers',
    'negotiation_audit_log', 'ministry_members'
  ) ORDER BY name;"
```

Must return 8 rows. Do NOT apply to production until staging smoke tests pass.

---

## Secrets: Set via Wrangler Secret Put

All secrets must be set per environment. Never commit secrets to git.

```bash
export CLOUDFLARE_API_TOKEN="<your-api-token>"

# Staging (repeat with --env production for production):
npx wrangler secret put JWT_SECRET --env staging --config apps/api/wrangler.toml
npx wrangler secret put PAYSTACK_SECRET_KEY --env staging --config apps/api/wrangler.toml
npx wrangler secret put PREMBLY_API_KEY --env staging --config apps/api/wrangler.toml
npx wrangler secret put TERMII_API_KEY --env staging --config apps/api/wrangler.toml
npx wrangler secret put WHATSAPP_ACCESS_TOKEN --env staging --config apps/api/wrangler.toml
npx wrangler secret put WHATSAPP_PHONE_NUMBER_ID --env staging --config apps/api/wrangler.toml
npx wrangler secret put TELEGRAM_BOT_TOKEN --env staging --config apps/api/wrangler.toml
npx wrangler secret put LOG_PII_SALT --env staging --config apps/api/wrangler.toml
npx wrangler secret put DM_MASTER_KEY --env staging --config apps/api/wrangler.toml
npx wrangler secret put PRICE_LOCK_SECRET --env staging --config apps/api/wrangler.toml
```

---

## Smoke Tests: Running Manually

```bash
# Against staging
SMOKE_API_KEY=<your-key> BASE_URL=https://api-staging.webwaka.ng \
  pnpm --filter smoke run smoke:staging

# Against production (only after staging passes)
SMOKE_API_KEY=<your-key> BASE_URL=https://api.webwaka.ng \
  pnpm --filter smoke run smoke:production
```

---

## CRITICAL: Token Rotation Required

The Cloudflare API token committed to `docs/production-remediation-plan-2026-04-10.md` is **compromised** (it was pushed to a public GitHub repository in plain text).

**Immediate action required:**
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Find and **revoke** the compromised token immediately
3. Create a new token with: Workers KV Read+Write, D1 Read+Write, Workers Deploy permissions
4. Update the `CLOUDFLARE_API_TOKEN` secret at:
   https://github.com/WebWakaDOS/webwaka-os/settings/secrets/actions
5. Never commit API tokens to git — always use `wrangler secret put` or GitHub Secrets

---

*End of Operator Runbook — WebWaka OS — 2026-04-10*
