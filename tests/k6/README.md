# WebWaka OS — k6 Load Tests

Phase 18 (P18-F) load test suite using [k6](https://k6.io/).

## Prerequisites

```bash
# Install k6 (macOS)
brew install k6

# Install k6 (Linux)
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" \
  | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6
```

## Scripts

| File | Endpoints | VUs | Duration |
|------|-----------|-----|----------|
| `billing.k6.js` | `GET /billing/status`, `GET /billing/history`, `POST /billing/change-plan` | 20–50 | 75s |
| `negotiation.k6.js` | `GET /api/v1/negotiation/policy`, `/sessions`, `/analytics`, `POST /sessions` | 15 | 30s |
| `geography.k6.js` | `GET /geography/states`, `/lgas/:state`, `/ancestry/:id`, `/discovery` | 25 | 45s |

## Running Tests

### Quick run (local development server)

```bash
# Start the API server first
node apps/platform-admin/server.js &

# Run individual test
k6 run tests/k6/billing.k6.js

# Run with custom VUs and duration
k6 run --vus 50 --duration 60s tests/k6/billing.k6.js
```

### With authentication

Most billing and negotiation endpoints require a valid JWT. Generate one in the admin dashboard or from the test suite, then pass it via `AUTH_TOKEN`:

```bash
AUTH_TOKEN="eyJhbGc..." k6 run tests/k6/billing.k6.js
```

### Against staging / production

```bash
BASE_URL=https://api.webwaka.com AUTH_TOKEN="..." k6 run tests/k6/billing.k6.js
```

### Save results for trend analysis

```bash
mkdir -p results
k6 run --out json=results/billing-$(date +%Y%m%d-%H%M).json tests/k6/billing.k6.js
```

## Thresholds

| Route | P95 target | P99 target | Error rate |
|-------|-----------|-----------|------------|
| `GET /billing/status` | < 150ms | < 300ms | < 1% |
| `GET /billing/history` | < 200ms | < 400ms | < 1% |
| `POST /billing/change-plan` | < 300ms | < 600ms | < 1% |
| `GET /api/v1/negotiation/policy` | < 200ms | < 400ms | < 1% |
| `GET /api/v1/negotiation/sessions` | < 250ms | < 600ms | < 1% |
| `GET /geography/states` | < 100ms | < 200ms | < 0.5% |
| `GET /geography/ancestry/:id` | < 150ms | < 300ms | < 0.5% |
| `GET /discovery` | < 200ms | < 400ms | < 0.5% |

The ancestry endpoint threshold (< 150ms P95) validates the **PERF-11 D1 batch() optimisation**. Pre-PERF-11 baseline was ~380ms P95 (N+1 queries); the batch() implementation should bring this under 100ms at P95 on warm D1.

## Adding to CI

Once baseline thresholds are validated in staging, add to the CI pipeline:

```yaml
# .github/workflows/load-test.yml
- name: Run billing load tests
  run: |
    k6 run --out json=results/billing.json tests/k6/billing.k6.js
  env:
    BASE_URL: ${{ secrets.STAGING_API_URL }}
    AUTH_TOKEN: ${{ secrets.K6_TEST_JWT }}
```

## Interpreting Results

- **`http_req_failed`**: Any non-2xx, non-expected-4xx response. Target < 1%.
- **`http_req_duration`**: Wall-clock time from request sent to response fully received.
- **Custom trend metrics** (e.g. `billing_status_duration_ms`): Per-route timing for granular P95/P99 tracking.
- **Scenarios**: `steady_load` tests sustained concurrency; `ramp_up` tests burst capacity and recovery.

## Route-Specific Notes

### Billing
- `GET /billing/status` is the hot path — called on every dashboard load.
- `POST /billing/change-plan` triggers `recordPlanHistory` + a DB UPDATE. Allow higher P95 (300ms).
- `GET /billing/history` uses `(? IS NULL OR workspace_id = ?)` SQL pattern — test both workspace-scoped and tenant-wide callers.

### Negotiation
- Sessions list merges seller + buyer results and deduplicates in application code — monitor for memory pressure at high VU counts.
- `POST /sessions` creates D1 rows; avoid high VU write saturation in production load tests.

### Geography
- All geography endpoints are public (no auth). High-concurrency test is safe.
- Ancestry endpoint validates PERF-11 D1 batch() — should see < 2 D1 round-trips per request.
