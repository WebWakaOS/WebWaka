# AI Spend Analytics API (SA-4.4 Reporting)

## What & Why
`ai_spend_events` and `ai_usage_events` accumulate per-request spend and token data
for every AI call across all tenants. The `/superagent/usage` route returns a raw
paginated list of the current user's history, and `/superagent/audit/export` returns
an anonymized data-dump. Neither provides aggregated analytics useful for platform
admins, workspace admins, or partners reviewing their AI credit consumption.

This task adds aggregation endpoints that turn the raw event data into actionable
spend intelligence: daily totals by vertical and capability, model distribution,
provider cost breakdown, and budget burn-rate projections. These endpoints power
future admin dashboards and partner billing reports.

An important constraint: all aggregation queries must be efficient against D1 (SQLite
on Cloudflare). GROUP BY on large tables without proper indexes will time out.
This task includes the necessary covering indexes as a D1 migration.

## Done looks like
- **`GET /superagent/analytics/spend`** (admin/workspace_admin only) returns:
  - `by_day`: array of `{ date, total_waku_cu, request_count, capability,
    vertical }` tuples covering the requested period (default last 30 days,
    max 90 days via `?from` and `?to` ISO date params)
  - `by_capability`: ranked list of capabilities by total WakaCU descending
  - `by_vertical`: ranked list of verticals by total WakaCU descending
  - `by_provider`: provider breakdown (model_used grouped)
  - `summary`: `{ total_waku_cu, total_requests, avg_waku_cu_per_request,
    period_start, period_end }`
  - All values are scoped to the requesting tenant (T3)
- **`GET /superagent/analytics/usage`** (admin/workspace_admin only) returns token
  consumption grouped by model and capability:
  - `by_model`: `{ model, total_tokens, request_count }` array
  - `by_capability`: `{ capability, total_tokens }` array
  - `trend`: daily `{ date, total_tokens }` for the period
- **`GET /superagent/analytics/budget-forecast`** (admin only) projects remaining
  WakaCU budget longevity based on a 7-day rolling average burn rate:
  - `current_balance_waku_cu`
  - `avg_daily_burn_waku_cu` (7-day rolling)
  - `projected_days_remaining` (null if no active budget)
  - `forecast_exhaustion_date` (ISO string or null)
- D1 migration 0392 adds covering indexes:
  - `ai_spend_events(tenant_id, created_at)` — for date-range queries
  - `ai_spend_events(tenant_id, capability, created_at)` — for capability grouping
  - `ai_spend_events(tenant_id, vertical, created_at)` — for vertical grouping
  - `ai_usage_events(tenant_id, model_used, created_at)` — for model grouping
- All monetary values in the analytics responses are WakaCU integers (not kobo)
  since WakaCU is the unit of account here (P9 applies to kobo only; WakaCU is
  a dimensionless credit unit and is also an integer)
- Response caching: analytics responses include `Cache-Control: max-age=300`
  (5-minute cache) since the data is write-heavy but read latency requirements
  are relaxed
- OpenAPI documentation for all three routes
- TypeScript: 0 errors; push to staging, CI green, merge to main

## Out of scope
- Real-time streaming analytics
- Per-user (non-admin) spend analytics (users have `/superagent/usage` for their
  own history)
- Cross-tenant platform-wide analytics (platform-admin scope is a future milestone)
- Charting or visualisation (API only; UI is out of scope)

## Steps
1. **D1 migration 0392** — Add the four covering indexes described above. Use
   `CREATE INDEX IF NOT EXISTS` syntax. Include rollback (DROP INDEX). Verify
   the index names follow the project convention.

2. **Query helper functions** — Create
   `apps/api/src/routes/superagent-analytics.ts` (or co-locate with superagent.ts if
   small enough). Write helper functions for each aggregation: `querySpendByDay()`,
   `querySpendByCapability()`, `querySpendByVertical()`, `querySpendByProvider()`,
   `queryTokensByModel()`, `queryTokensByCapability()`. Each takes `(db, tenantId,
   from, to)` and returns a typed array. Use D1's `.all()` method with parameterised
   queries.

3. **Date range validation** — Accept `?from` and `?to` as ISO date strings (YYYY-MM-DD).
   Default `from` to 30 days ago, `to` to today. Reject if range exceeds 90 days with
   400 `DATE_RANGE_TOO_LARGE`. Parse to UTC midnight timestamps for SQLite
   `strftime` comparisons.

4. **`GET /superagent/analytics/spend` route** — Admin + workspace_admin guard. Run
   all four spend queries in parallel (`Promise.all`). Assemble and return the
   response. Add `Cache-Control: max-age=300` header.

5. **`GET /superagent/analytics/usage` route** — Admin + workspace_admin guard. Run
   token queries in parallel. Return model/capability breakdown plus daily trend.
   Add cache header.

6. **`GET /superagent/analytics/budget-forecast` route** — Admin-only guard. Query
   the active budget for the tenant from `ai_spend_budgets`. Query the 7-day rolling
   average from `ai_spend_events`. Compute projected exhaustion. Handle edge cases:
   no active budget → `projected_days_remaining: null`; zero burn → `null` (budget
   will never exhaust at current rate).

7. **Role guards** — Use the same admin role check pattern already in the HITL review
   and partner-pool-report routes: `['admin', 'super_admin', 'workspace_admin']`.

8. **OpenAPI documentation** — Document all three analytics routes in
   `docs/openapi/v1.yaml` under the SuperAgent tag with full schema definitions for
   the response bodies.

9. **Integration tests** — Add tests in a new `superagent-analytics.test.ts` that
   mock the D1 `D1Like` interface and verify: correct SQL parameter binding (tenant
   scoping verified), date range rejection at 91 days, zero-data edge case returns
   empty arrays not null.

10. **Push to staging, CI green, merge to main.**

## Relevant files
- `apps/api/src/routes/superagent.ts:1192-1240`
- `packages/superagent/src/spend-controls.ts`
- `packages/superagent/src/usage-meter.ts`
- `packages/superagent/src/credit-burn.ts`
- `infra/db/migrations/0389_hitl_executed_status.sql`
- `docs/openapi/v1.yaml:1580-1680`
