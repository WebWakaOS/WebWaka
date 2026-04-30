# CI/CD Secrets & Variables Checklist

**Status:** REVIEW REQUIRED  
**Last updated:** 2026-04-30  
**Ref:** AI-TRANSFORMATION-IMPLEMENTATION-PLAN.md Phase 0, Task 0.8

## Required GitHub Repository Secrets

| Secret | Workflow | Purpose | Status |
|--------|----------|---------|--------|
| `SMOKE_API_KEY` | deploy-staging.yml, deploy-production.yml | Authenticate post-deploy smoke tests (branding, discovery) | ⚠️ Verify |
| `STAGING_SMOKE_JWT` | ci.yml (k6-smoke job) | Authenticated k6 load test requests | ⚠️ Verify |
| `STAGING_SMOKE_SUPER_ADMIN_JWT` | ci.yml (k6-smoke job) | Super-admin k6 load test requests | ⚠️ Verify |
| `CLOUDFLARE_API_TOKEN` | deploy-staging.yml, deploy-production.yml | Wrangler deploys to Cloudflare | ⚠️ Verify |
| `CLOUDFLARE_ACCOUNT_ID` | deploy-staging.yml | Wrangler account targeting | ⚠️ Verify |

## Required GitHub Repository Variables

| Variable | Workflow | Purpose |
|----------|----------|---------|
| `STAGING_BASE_URL` | deploy-staging.yml | Target URL for staging smoke tests |
| `SMOKE_TENANT_ID` | deploy-staging.yml | Tenant ID used by smoke tests |
| `SMOKE_WORKSPACE_ID` | deploy-staging.yml | Workspace ID used by E2E tests |
| `STAGING_DISCOVERY_URL` | deploy-staging.yml | Public discovery service URL |

## How to Provision SMOKE_API_KEY

The `SMOKE_API_KEY` is a service-level API key used by automated smoke tests to authenticate
against the deployed WebWaka API without requiring a user JWT.

### Generation Steps:

1. Log in to the WebWaka platform admin dashboard as `super_admin`
2. Navigate to **Settings → API Keys → Service Keys**
3. Create a new key with:
   - **Name:** `ci-smoke-test`
   - **Scopes:** `read:health`, `read:discovery`, `read:public`, `read:verticals`
   - **Tenant:** The smoke test tenant (`SMOKE_TENANT_ID`)
4. Copy the generated key
5. In GitHub: **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `SMOKE_API_KEY`
   - Value: (paste the key)

### Current Behavior (Without Secret)

The smoke test steps have `continue-on-error: true`, meaning:
- ✅ CI pipeline does NOT block on missing secrets
- ⚠️ Smoke test failures surface as warnings (orange ⚠️) in GitHub Actions
- ⚠️ Once secrets are provisioned, remove `continue-on-error: true` to enforce as a hard gate

## Verification Command

Run locally to simulate the smoke test:
```bash
SMOKE_BASE_URL=https://api-staging.webwaka.com \
SMOKE_TENANT_ID=<your-tenant-id> \
SMOKE_API_KEY=<your-key> \
pnpm --filter smoke run smoke:staging
```
