# WebWaka OS — Superagent Full-Platform Audit & Deployment Readiness Prompt

**Document type:** Agent task brief  
**Prepared:** 2026-04-10  
**Repo:** `https://github.com/WebWakaDOS/webwaka-os`  
**Branch:** `main` (SHA `fc790c2` as of brief creation)  
**Agent role:** Senior Staff Engineer + Production SRE + Nigeria Compliance Lead  
**Deliverable:** `docs/reports/superagent-audit-2026-04-10.md` + `docs/plans/cloudflare-deployment-remediation-2026-04-10.md` — both committed and pushed to GitHub

> **Primary pillar(s):** All three — Pillar 1 (Ops), Pillar 2 (Branding), Pillar 3 (Marketplace) + AI (Cross-cutting). This is a full-platform audit spanning all pillars and infrastructure. See `docs/governance/3in1-platform-architecture.md` for authoritative pillar assignments.

---

## 0. Mission

You are auditing **WebWaka OS** — a governance-driven, multi-tenant, multi-vertical white-label SaaS "operating system" for Africa (Nigeria-first). The platform enables any Nigerian business vertical (160+ types, from pharmacies and hotels to orphanages and oil & gas firms) to operate through a single branded experience powered by Cloudflare Workers + Hono + D1 (TypeScript strict).

Your job is threefold:

1. **Audit** the entire codebase — architecture, types, routes, repositories, migrations, infrastructure, security, and compliance — producing a prioritised findings report
2. **Verify** the just-completed Production Remediation Plan (`docs/plans/production-remediation-plan-2026-04-10.md`) — confirm every task is actually done and working, not just code-merged
3. **Plan** the next remediation sprint — produce a concrete, executable task list with acceptance criteria for achieving 100% Cloudflare deployment readiness and user-onboarding readiness

Everything you find, verify, and plan must be **written into two documents** committed and pushed to GitHub. No verbal summaries only.

---

## 1. Platform Architecture (read this before touching any file)

### 1.1 Runtime

| Layer | Technology |
|---|---|
| Edge runtime | Cloudflare Workers (NEVER Node.js HTTP in production) |
| API framework | Hono (lightweight, CF-native) |
| Database | Cloudflare D1 (SQLite at edge) |
| KV | Cloudflare KV (caching, rate-limit counters) |
| Storage | Cloudflare R2 (media, exports) |
| Scheduler | Cloudflare Workers Cron Triggers |
| Payments | Paystack (NGN-first; all amounts INTEGER kobo — no floats EVER) |
| AI | Provider-neutral abstraction (`packages/ai-abstraction/`) |

### 1.2 Monorepo Layout

```
webwaka-os/
  apps/
    api/                    — Main Cloudflare Worker (Hono) — PRIMARY DEPLOYMENT TARGET
    brand-runtime/          — Tenant white-label Worker
    public-discovery/       — Geography marketplace Worker
    ussd-gateway/           — USSD + Telegram Worker
    platform-admin/         — Super-admin dashboard (Node.js, Replit only)
    partner-admin/          — Tenant management portal (STUB — not complete)
    admin-dashboard/        — Internal admin Worker
    projections/            — Event processor Worker
  packages/
    types/                  — @webwaka/types: canonical TS types
    core/geography/         — @webwaka/geography
    auth/                   — @webwaka/auth: JWT issue + verify
    entitlements/           — @webwaka/entitlements: layer guards L1/L2/L3
    payments/               — @webwaka/payments: Paystack integration
    negotiation/            — @webwaka/negotiation: price-lock engine
    verticals-*/            — 160+ vertical packages (one per business type)
  infra/
    db/migrations/          — 183 D1 SQL migration files (0001–0186)
  tests/
    smoke/                  — Smoke test suite (just created, needs execution)
  docs/
    governance/             — Platform invariants, TDRs, milestone tracker
    plans/                  — Remediation plans
    reports/                — Audit reports
```

### 1.3 Non-Negotiable Platform Invariants

These must never be violated. Flag any violation as CRITICAL:

| Code | Rule |
|---|---|
| **P9** | All money fields are `INTEGER` in kobo. Zero floats anywhere — not in DB schema, not in TypeScript types, not in wire format |
| **T1** | Production runtime is Cloudflare Workers only. No Node.js HTTP server in production path |
| **T2** | TypeScript-first. No `any` without comment. No untyped JS in `packages/` or `apps/` |
| **T3** | `tenant_id` present on every database record and every authenticated API response |
| **P13** | No individual child data in nursery-school or orphanage vertical — only aggregate counts |
| **P14** | DM/message content encrypted with AES-GCM. Plaintext never stored |
| **P6** | Offline-first: writes queued offline, synced on reconnect |
| **T5** | No hardcoded secrets. All secrets via CF Worker Secrets (`wrangler secret put`) |

### 1.4 D1 Database IDs

| Environment | D1 ID |
|---|---|
| Staging | `cfa62668` |
| Production | `de1d0935` |

---

## 2. What Has Already Been Done (Remediation Plan 2026-04-10)

The following tasks were executed against HEAD `fc790c2`. **Verify each one is actually implemented correctly**, not just present in code:

| Task | Claimed Status | What to Verify |
|---|---|---|
| **T001** types.ts + tsconfig paths | ✅ Done | `apps/api/src/types.ts` exists; `pnpm typecheck` passes across all packages |
| **T002** MinistryRepository + OkadaKeke + MinistryMission methods | ✅ Done | All exported methods actually run without runtime errors; FSM transitions work |
| **T003** TypeScript errors → 0 | ✅ Done | `npx tsc --noEmit -p apps/api/tsconfig.json` returns 0 errors |
| **T004** HMAC price-lock tokens | ✅ Done | Token signing uses HMAC-SHA256; tampering detected and rejected at verify |
| **T005** Real Paystack workspace activation | ✅ Done | Paystack activation actually calls API; not a stub; error handled |
| **T006** Rate limiting + callback URL fix | ✅ Done | Rate limiter middleware applied globally; Paystack callback URL correct |
| **T007** Smoke tests | ✅ Partial | File `tests/smoke/api-health.smoke.ts` exists but has never been executed against a live worker |
| **T008** replit.md + migration 0186 + git push | ✅ Done | SHA `fc790c2` on origin/main |

---

## 3. Audit Scope — What You Must Check

### 3.1 TypeScript & Build Correctness

```bash
# Run these and record exact output:
npx tsc --noEmit -p apps/api/tsconfig.json 2>&1 | tail -5
pnpm typecheck 2>&1 | tail -20
pnpm build 2>&1 | tail -20
```

Check for:
- Any `as never`, `as any`, or `as unknown` casts WITHOUT an explanatory comment
- Any `// @ts-ignore` or `// @ts-nocheck` without a tracking issue number
- Interfaces with duplicate property declarations (same field name defined twice)
- Missing `export` keywords on types that route files import
- `BigInt` used where D1 expects `number`

### 3.2 Cloudflare Deployment Readiness

For each `wrangler.toml` file (`apps/api/`, `apps/brand-runtime/`, `apps/public-discovery/`, `apps/ussd-gateway/`):

```bash
grep -n "placeholder\|NAMESPACE_ID\|local-dev" apps/api/wrangler.toml
grep -n "placeholder\|NAMESPACE_ID\|local-dev" apps/brand-runtime/wrangler.toml
grep -n "placeholder\|NAMESPACE_ID\|local-dev" apps/public-discovery/wrangler.toml
grep -n "placeholder\|NAMESPACE_ID\|local-dev" apps/ussd-gateway/wrangler.toml
```

Check for:
- KV namespace IDs still set to placeholder strings (`STAGING_GEOGRAPHY_CACHE_KV_NAMESPACE_ID`, etc.)
- D1 database IDs correctly set (`cfa62668` for staging, `de1d0935` for production)
- All required bindings declared: `DB`, `GEOGRAPHY_CACHE`, `RATE_LIMIT_KV`, `PRICE_LOCK_SECRET`, `JWT_SECRET`, `PAYSTACK_SECRET_KEY`
- `compatibility_date` is recent (≥ 2024-06-01)
- `nodejs_compat` flag present where Node.js APIs are used (crypto, etc.)
- CRON trigger `*/15 * * * *` wired in `apps/api/wrangler.toml` for negotiation expiry
- Worker size: does `wrangler deploy --dry-run` warn about bundle size?

### 3.3 D1 Migrations

```bash
ls infra/db/migrations/ | wc -l    # Should be 183+
ls infra/db/migrations/ | sort | tail -10
```

Check for:
- Sequential numbering with no gaps (0001 through 0186)
- Money columns declared as `INTEGER` not `REAL` or `DECIMAL`
- `tenant_id TEXT NOT NULL` on every data table
- Missing indexes on `(profile_id, tenant_id)` pairs that are queried frequently
- Migrations that drop or rename columns without a paired forward migration
- Which migrations have NOT yet been applied to remote staging/production D1
- Migration 0008 (`search_entries`), 0009 (`discovery_events`), and 0181–0186 (negotiation + ministry_members) — these are listed in `wrangler.toml` as "pending" — confirm they exist and are syntactically valid SQL

### 3.4 API Routes — All 124 Vertical Routes

For each file in `apps/api/src/routes/verticals/`:

```bash
ls apps/api/src/routes/verticals/ | wc -l  # Should be ~124
```

For a sample of 20 route files (pick one from each vertical family), verify:
- Route is registered in `apps/api/src/routes/verticals/index.ts` (or equivalent aggregator)
- Auth middleware `c.get('auth')` is called before any DB operation
- `tenant_id` from auth is used in every DB query (T3)
- No float arithmetic on kobo amounts (P9)
- Error responses use structured `{ error: string }` not raw `throw`
- POST endpoints parse body with try/catch for invalid JSON
- All repo method calls match the actual repository method signatures

Check the aggregator/index:
```bash
cat apps/api/src/routes/verticals/index.ts | grep "import\|app.route" | wc -l
```
Confirm: are all 124 vertical route files actually imported and mounted?

### 3.5 Repository Pattern Consistency

For 20 sample vertical packages (`packages/verticals-*/src/*.ts`):

- Every repository class has a constructor `constructor(private db: D1Like) {}`
- `toProfile()` helper function maps all DB columns to typed fields
- `transitionStatus()` enforces FSM rules (no invalid state transitions)
- Money fields extracted from DB as `number` (D1 returns INTEGER as number in JS)
- No `parseFloat()`, `Number.parseFloat()`, `.toFixed()`, or `Math.round()` on kobo amounts

### 3.6 Packages Build

```bash
pnpm -r build 2>&1 | grep "error\|Error" | head -30
# Check each vertical package exports correctly:
cat packages/verticals-pharmacy/src/index.ts
cat packages/verticals-hotel/src/index.ts
```

Confirm:
- Each vertical package exports: `Repository class`, `FSM guard function`, all TypeScript types
- `package.json` `exports` field points to correct built paths
- No circular dependencies between packages

### 3.7 Security Audit

```bash
# Check for hardcoded secrets:
grep -r "sk_live\|sk_test\|eyJ\|Bearer " --include="*.ts" apps/ packages/ | grep -v "test\|spec\|example\|mock"

# Check for SQL injection risk:
grep -r "prepare(\`.*\${" --include="*.ts" packages/verticals-*/src/ | head -20

# Check Paystack webhook signature verification:
grep -rn "x-paystack-signature\|createHmac\|webhook" apps/api/src/ | head -10
```

Check for:
- Paystack webhook signature not verified (CRITICAL — allows fake payment events)
- JWT not validated on protected routes (CRITICAL)
- SQL built with string interpolation vs. `?` placeholders
- Rate limiter not applied to auth endpoints (brute force)
- `PRICE_LOCK_SECRET` actually loaded from `env` not hardcoded
- CORS headers missing or too permissive (`Access-Control-Allow-Origin: *`)
- Sensitive fields (JWT_SECRET, PAYSTACK_SECRET_KEY) not logged

### 3.8 Payment Flow End-to-End

```bash
cat apps/api/src/routes/payments.ts
cat packages/payments/src/paystack.ts 2>/dev/null || find . -name "paystack*" -not -path "*/node_modules/*"
```

Verify:
- Workspace activation actually calls Paystack `POST /subaccount` with correct `settlement_bank`, `account_number`, `percentage_charge`
- Paystack callback URL set correctly per environment (not hardcoded localhost)
- Webhook signature verified using HMAC-SHA256 of raw body with `PAYSTACK_SECRET_KEY`
- Payment success correctly updates workspace `status` in D1
- No float arithmetic on `amount` field (Paystack returns kobo as integer)
- Refund flow exists or is explicitly marked as not-implemented

### 3.9 Rate Limiting

```bash
cat apps/api/src/middleware/rate-limit.ts 2>/dev/null || grep -rn "rateLimit\|rate_limit" apps/api/src/ | head -10
```

Verify:
- Rate limiter is applied to ALL routes (global middleware), not just specific endpoints
- KV counter key includes `tenant_id` to prevent cross-tenant interference
- TTL/window set appropriately (e.g., 100 req/min per tenant)
- 429 response includes `Retry-After` header
- Rate limiter gracefully degrades if KV is unavailable (don't block all traffic)

### 3.10 CRON Job — Negotiation Expiry

```bash
grep -n "scheduled\|cron" apps/api/src/index.ts | head -10
cat apps/api/src/index.ts | grep "export default"
```

Verify:
- Worker `export default` includes `scheduled` handler (not just `fetch`)
- Negotiation expiry job actually queries expired sessions and updates status
- CRON errors are caught and logged, not silently swallowed

### 3.11 USSD Gateway

```bash
cat apps/ussd-gateway/src/index.ts | head -40
```

Verify:
- USSD handler correctly parses Africa's Talking POST body
- Session state managed per phone number (not per request)
- *384# menu structure is functional
- Airtime top-up flow uses correct kobo amounts

### 3.12 Compliance (Nigeria-Specific)

- **NDPR**: Data subject rights endpoint exists (`DELETE /api/v1/me` or equivalent)
- **Nursery/Orphanage P13**: No individual child names, ages, or identifiers in any API response — only aggregate counts
- **Campaign office / Constituency office / Polling unit**: L3 HITL AI gates enforced (no AI suggestion without human-in-the-loop)
- **Rehab centre**: All AI features gated (most sensitive vertical — NDLEA)
- **Bureau de Change**: FX rates stored as `INTEGER` (kobo or cent × 100) — no REAL columns
- **DM encryption P14**: `community` and `social` packages (if any routes remain) encrypt messages before storage

### 3.13 Smoke Test Executability

```bash
# Can the smoke tests actually run?
cat tests/smoke/api-health.smoke.ts | head -20
npx tsx tests/smoke/api-health.smoke.ts --help 2>&1 | head -5
# Is tsx available?
which tsx || npx tsx --version
```

Verify that the smoke tests:
- Can be run with `BASE_URL=<url> npx tsx tests/smoke/api-health.smoke.ts`
- Import no Node.js-only modules that don't exist in CF Workers context
- Have a runnable entry point (no import errors from missing packages)

### 3.14 CI/CD Pipeline

```bash
cat .github/workflows/ci.yml
cat .github/workflows/deploy-staging.yml 2>/dev/null
cat .github/workflows/deploy-production.yml 2>/dev/null
```

Check for:
- `pnpm typecheck` in CI (must pass before merge)
- `pnpm test` in CI
- `pnpm lint` in CI
- Staging deploy triggered on push to `staging` branch
- Production deploy triggered on push to `main` OR manual approval
- `wrangler deploy` uses correct `--env staging` / `--env production` flags
- `CLOUDFLARE_API_TOKEN` secret set in GitHub Actions secrets
- D1 migrations applied in deploy pipeline (`wrangler d1 migrations apply --remote`)
- Smoke tests run AFTER deploy (not before)

---

## 4. Specific Files to Read Carefully

Read each of these files in full before writing your report:

```
apps/api/src/index.ts                          # Worker entry point + route mounting
apps/api/src/env.ts                            # All Cloudflare bindings
apps/api/wrangler.toml                         # Deployment config
apps/api/src/middleware/auth.ts                # JWT auth middleware
apps/api/src/middleware/rate-limit.ts          # Rate limiting (if exists)
apps/api/src/routes/verticals/index.ts         # Vertical route aggregator
apps/api/src/routes/payments.ts               # Paystack integration routes
packages/negotiation/src/price-lock.ts        # HMAC price-lock implementation
packages/payments/src/paystack.ts             # Paystack API client
infra/db/migrations/0001_init.sql             # First migration (baseline)
infra/db/migrations/0186_ministry_members.sql # Latest migration
docs/governance/platform-invariants.md        # Non-negotiable rules
docs/plans/production-remediation-plan-2026-04-10.md  # Prior plan
```

---

## 5. Output Requirements

### 5.1 Audit Report — `docs/reports/superagent-audit-2026-04-10.md`

Structure:

```markdown
# WebWaka OS — Superagent Audit Report
**Date:** [date]
**Auditor:** Base44 Superagent
**Repo SHA:** [sha]

## Executive Summary
[2-paragraph overview of platform health and deployment readiness percentage]

## Verification Results (Prior Remediation Plan T001–T008)
| Task | Claimed ✅ | Verified ✅/❌ | Notes |
...

## Findings by Severity

### CRITICAL (blocks deployment / risks user data)
[numbered list, each with: file, line, description, risk, fix]

### HIGH (degrades reliability or compliance)
[same format]

### MEDIUM (tech debt or incomplete features)
[same format]

### LOW (polish, optimization)
[same format]

## Platform Invariant Violations
[Table of P9/T1/T2/T3/P13/P14 violations with file + line]

## Cloudflare Deployment Blockers
[Ordered list of everything that will cause `wrangler deploy` to fail or produce a broken worker]

## Missing Pending Migrations
[List of migrations in wrangler.toml comments that have not been applied to staging/production]

## Security Vulnerabilities
[OWASP-style list with severity and remediation]
```

### 5.2 Remediation Plan — `docs/plans/cloudflare-deployment-remediation-2026-04-10.md`

Structure:

```markdown
# WebWaka OS — Cloudflare Deployment Remediation Plan
**Created:** [date]
**Target:** Platform live on Cloudflare Workers — 0 critical findings — users onboarding
**Success Criteria:** `wrangler deploy --env production` succeeds; smoke tests green; first user creates workspace without error

## Phase 1: Deployment Blockers (do these first — Day 1-2)
For each task:
- **ID:** DEPLOY-001
- **Title:** [action verb + what]
- **Priority:** BLOCKER
- **Est:** [time]
- **Files:** [list]
- **Dependencies:** []
- **Acceptance Criteria:**
  - [ ] Specific, testable condition
- **Implementation Steps:**
  1. Numbered steps an engineer can follow exactly
- **Verification Command:**
  ```bash
  [exact shell command that proves the fix worked]
  ```

## Phase 2: Security & Compliance (before first real user)

## Phase 3: Reliability & Observability (Week 1 post-launch)

## Phase 4: Polish & Completion (ongoing)
```

---

## 6. Execution Order

Run your audit in this order to build context progressively:

1. `git log --oneline -10` — understand recent changes
2. `npx tsc --noEmit -p apps/api/tsconfig.json 2>&1 | tail -3` — baseline type check
3. `pnpm test 2>&1 | tail -20` — baseline test run
4. Read `apps/api/src/index.ts` in full — understand what's mounted
5. Read `apps/api/wrangler.toml` in full — understand deployment config
6. Check all 4 `wrangler.toml` files for placeholder IDs
7. Audit 20 sampled vertical route files and their corresponding repo packages
8. Check all migration files for P9 violations (REAL/DECIMAL columns)
9. Security grep passes (hardcoded secrets, SQL injection, webhook sig)
10. Check CI/CD pipeline files
11. Write the audit report
12. Write the remediation plan
13. `git add -A && git commit -m "docs(audit): superagent full-platform audit + deployment remediation plan 2026-04-10"`
14. `git remote set-url origin "https://${GITHUB_PERSONAL_ACCESS_TOKEN}@github.com/WebWakaDOS/webwaka-os.git" && git push origin main && git remote set-url origin "https://github.com/WebWakaDOS/webwaka-os.git"`

---

## 7. Hard Rules for the Agent

1. **Do not modify any application code** during the audit phase. Fix nothing until the audit report is written and approved.
2. **Every finding must have a file path and line number** (or line range). No vague findings.
3. **Every remediation task must have a verification command** — a shell command that proves the fix worked.
4. **P9 violations are always CRITICAL** — any float arithmetic on money is a data integrity risk.
5. **T3 violations are always HIGH** — missing tenant_id means cross-tenant data leakage is possible.
6. **Paystack webhook without signature verification is always CRITICAL** — allows fake payment injection.
7. **Do not skip the git push** — the output documents must be on GitHub before the task is complete.
8. If you encounter a CRITICAL finding that represents an active security risk (e.g., a live secret committed), stop and report immediately without continuing the audit.
9. **Count every vertical route file** — if fewer than 120 are mounted in the aggregator, that is a HIGH finding (silent 404s for businesses).
10. Report your deployment readiness as a percentage (0–100%) at the top of the audit report based on: TypeScript clean (20%), migrations applied (20%), wrangler.toml complete (15%), security (20%), routes mounted (15%), tests passing (10%).

---

## 8. Environment & Credentials

The following are available as environment variables/secrets in this Replit:

- `GITHUB_PERSONAL_ACCESS_TOKEN` — GitHub PAT with `repo` scope for WebWakaDOS/webwaka-os
- `CLOUDFLARE_API_TOKEN` — may be available; check with `echo $CLOUDFLARE_API_TOKEN | wc -c`
- All other CF secrets must be provisioned via `wrangler secret put` — do not hardcode them

**GitHub remote:** `https://github.com/WebWakaDOS/webwaka-os`  
**D1 Staging:** `cfa62668` (name: `webwaka-main`)  
**D1 Production:** `de1d0935` (name: `webwaka-main`)

---

## 9. Success Definition

The audit + remediation plan task is complete when:

- [ ] `docs/reports/superagent-audit-2026-04-10.md` exists on `origin/main` with a deployment readiness % and at least one finding per severity level (if found)
- [ ] `docs/plans/cloudflare-deployment-remediation-2026-04-10.md` exists on `origin/main` with Phase 1 tasks fully specified (file, steps, verification command)
- [ ] Both documents committed in one commit: `docs(audit): superagent full-platform audit + deployment remediation plan 2026-04-10`
- [ ] The commit is pushed to `https://github.com/WebWakaDOS/webwaka-os.git` on `main`
- [ ] The report honestly reflects what was found — do not suppress findings to make the platform look better

---

## 10. Context: Why This Matters

WebWaka OS is designed to serve Nigerian SMEs — laundries, pharmacies, schools, orphanages, hospitals, cooperatives — who currently have no affordable digital operating system. The first 10,000 users are Nigerian business owners who will trust the platform with their revenue, their staff payroll (kobo-precise), their customer data, and in some cases their regulatory compliance.

A float instead of an integer in the payment flow is not a bug — it is a broken promise to a pharmacist in Kano who trusted the platform with her business. A missing tenant_id check is not tech debt — it is a data breach. A wrangler.toml with placeholder KV IDs is not an oversight — it means the platform cannot go live and those users wait.

Audit rigorously. Plan concretely. Push the output. That is the mission.
