# k6 Load Smoke Test — Non-Blocking Gate Explanation

## Status

The `k6 Load Smoke Test` CI job has `continue-on-error: true` in `.github/workflows/ci.yml`.

This means:
- A k6 failure **does NOT block** staging or production deployment
- k6 results appear as a warning in CI, not a gate failure
- The overall CI conclusion remains `success` even when k6 fails

## Why it's a soft gate

k6 runs performance/load assertions against the **already-deployed staging API**
(`https://api-staging.webwaka.com`). It:

1. Requires staging to be fully deployed and warmed up before running
2. Generates JWT tokens using `JWT_SECRET_STAGING` secret (may not be available in all contexts)
3. Compares against a baseline cache (`infra/k6/baseline.json`) that may not exist on first run
4. Is sensitive to transient network latency, not just code regressions

Making it a hard gate would cause spurious CI failures unrelated to code quality.

## When k6 fails

| Scenario | Action |
|----------|--------|
| New worker deploy (cold start) | Expected — worker needs 1-2 minutes to warm up |
| JWT_SECRET_STAGING not set | Configure the GitHub secret |
| No baseline cache | k6 creates one on first passing run |
| Genuine regression | Investigate via `infra/k6/results.json` artifact |
| Transient CF latency | Re-run the CI job manually |

## How to run k6 locally

```bash
# Install k6
brew install k6  # macOS

# Generate tokens (requires JWT_SECRET_STAGING)
JWT_SECRET=<secret> node infra/k6/generate-smoke-jwt.mjs

# Run against staging
k6 run \
  --env BASE_URL=https://api-staging.webwaka.com \
  --env JWT_TOKEN=<token> \
  --env SUPER_ADMIN_JWT=<super_admin_token> \
  infra/k6/smoke.js
```

## Making k6 a hard gate (future)

When the platform has stable load baselines and staging is always pre-warmed,
change `continue-on-error: false` in `.github/workflows/ci.yml` under the
`k6-smoke` job definition.
