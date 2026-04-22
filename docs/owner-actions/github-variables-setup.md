# GitHub Repository Variables and Secrets Setup

**STATUS: Variables set 2026-04-22 via GitHub API (user: changerhydro, repo: WebWakaOS/WebWaka)**

Required for CI/CD workflows (`deploy-staging.yml` and `deploy-production.yml`).

## Repository Variables (Settings → Secrets and variables → Actions → Variables)

| Variable | Value |
|---|---|
| `STAGING_BASE_URL` | `https://api-staging.webwaka.com` |
| `PRODUCTION_BASE_URL` | `https://api.webwaka.com` |
| `SMOKE_TENANT_ID` | `ten_platform` |

## Repository Secrets (Settings → Secrets and variables → Actions → Secrets)

| Secret | Description |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Workers:Edit, D1:Edit, KV:Edit permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID (98174497603b3edc1ca0159402956161) |
| `JWT_SECRET` | Same JWT_SECRET as configured in the Cloudflare Worker |
| `INTER_SERVICE_SECRET` | Same INTER_SERVICE_SECRET as configured in the Worker |
| `SMOKE_API_KEY` | API key for the smoke test user (ten_platform tenant) |

## Setting via GitHub CLI

```bash
gh variable set STAGING_BASE_URL --body "https://api-staging.webwaka.com"
gh variable set PRODUCTION_BASE_URL --body "https://api.webwaka.com"
gh variable set SMOKE_TENANT_ID --body "ten_platform"

gh secret set CLOUDFLARE_API_TOKEN
gh secret set CLOUDFLARE_ACCOUNT_ID --body "98174497603b3edc1ca0159402956161"
gh secret set JWT_SECRET
gh secret set INTER_SERVICE_SECRET
gh secret set SMOKE_API_KEY
```

## Notes

- The `CLOUDFLARE_API_TOKEN` used in CI must have **edit** permissions on Workers, D1, KV, and R2.
- `SMOKE_API_KEY` should be a long-lived API key scoped to the `ten_platform` tenant (create via `/auth/api-keys`).
- DNS: `api.webwaka.com` → AAAA `100::` (proxied) already configured on Cloudflare.
- DNS: `api-staging.webwaka.com` → AAAA `100::` (proxied) — verify this exists too.

## Super-Admin Account

The platform super-admin was seeded in production D1 via migration 0377.

- Email: `admin@webwaka.com`
- Initial password: `ChangeMe!WebWaka2026`
- Tenant: `ten_platform`
- Role: `super_admin`

**Action required: Change the password immediately after first login.**

If an existing super-admin account already had the email `admin@webwaka.com`, the migration was silently ignored (INSERT OR IGNORE). Verify via: `SELECT id, email, role FROM users WHERE role='super_admin';`
