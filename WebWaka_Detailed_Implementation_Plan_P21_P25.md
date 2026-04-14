# WebWaka Detailed Implementation Plan — Remaining Platform Gaps and Phases P21–P25

**Document Date:** 2026-04-14  
**Platform Baseline:** WebWaka OS v1.0.0 — P20 COMPLETE  
**Test Status:** 2,458 / 2,458 passing · 0 TypeScript errors · 22,208 source files  
**Author:** Comprehensive planning agent — evidence-based from codebase review + external research synthesis  
**Excluded Scope:** SSL/custom-domain for brand-runtime (Base44 Agent responsibility only)

---

## Table of Contents

1. [Executive Framing](#1-executive-framing)
2. [Current-State Evidence Map](#2-current-state-evidence-map)
3. [Remaining Immediate Issues — Detailed Planning](#3-remaining-immediate-issues--detailed-planning)
4. [P21–P25 Phase Planning](#4-p21p25-phase-planning)
5. [Recommended Sequencing](#5-recommended-sequencing)
6. [30/60/90-Day Roadmap](#6-306090-day-roadmap)
7. [PR / Workstream Slicing](#7-pr--workstream-slicing)
8. [Stakeholder Decision Register](#8-stakeholder-decision-register)
9. [Overtaken-by-Events Register](#9-overtaken-by-events-register)
10. [Action Matrix](#10-action-matrix)

---

## 1. Executive Framing

### What This Plan Covers

This document plans implementation for:
- **10 remaining platform gaps** identified in the P20 QA audit
- **Phases P21–P25** covering bank-transfer payments, AI SuperAgent production, analytics dashboards, multi-currency, and B2B marketplace

### What This Plan Explicitly Excludes

- SSL/custom-domain configuration for brand-runtime — this is Base44 Agent territory
- P20 bug fixes (BUG-01 through BUG-07) — already implemented and tested
- USSD shortcode NCC registration — human-admin action documented separately

### Platform Baseline Assumed

| Property | Value |
|---|---|
| Phase | P20 COMPLETE |
| Tests | 2,458 passing, 0 failures |
| TypeScript errors | 0 |
| Cloudflare Workers | 9 |
| React PWA | 1 (workspace-app) |
| Packages | 203+ (159 vertical packages) |
| Migrations | 233 (0001–0233) |
| Governance checks | 11/11 PASS |
| Auth | JWT HS256, multi-device sessions, workspace invitations, email verification column |
| Money | Integer kobo (NGN only, migration 0226 has currency_code DEFAULT 'NGN') |
| AI | SuperAgent with HITL service (no expiry CRON), 17/159 verticals configured |

### What Must Not Be Re-Architected

The following is **fully operational** and must be preserved as-is:
- All 11 governance CI checks and their rules
- Integer kobo monetary invariant (P9) — all future currencies will follow same pattern
- Provider-neutral AI abstraction via @webwaka/ai-abstraction
- JWT + jti session revocation pattern
- T3 tenant isolation from auth context only
- Hono v4 on Cloudflare Workers for all API surfaces
- D1 SQLite as primary database with pnpm monorepo workspace structure

---

## 2. Current-State Evidence Map

### 2.1 Remaining Immediate Issues — Evidence

| Issue | Fully Implemented | Partially Implemented | Not Implemented | Human-Action Required |
|---|---|---|---|---|
| Email verification enforcement | Column (0233), routes (send-verification, verify-email), token handling | — | Dashboard warning banner, grace-period entitlement gate, paid-feature block, API middleware enforcement | — |
| Vertical AI config completeness | 17 verticals configured | — | 142 verticals missing from VERTICAL_AI_CONFIGS | — |
| Changeset publishing | changeset CLI installed, config.json (access: "restricted", baseBranch: "staging") | — | npm token/OIDC, publish workflow, npm org package scope verification | npm org setup, npm token secret in GitHub |
| Projections CRON scheduling | projections/index.ts routes, wrangler.toml staging+production D1 bindings | scheduled comment in docs | No `[triggers]` in wrangler.toml, no `scheduled` export in index.ts | — |
| OpenAPI spec completeness | login, refresh, logout endpoints | Most P18/P19 routes | P20 routes: invite, sessions, verify-email, accept-invite entirely absent | — |
| i18n locale completeness | 5 locales: en, ha, yo, ig, pcm (~55 keys each) | Partial coverage of UI | P20 UI strings, verification banner, invite flow, session management entirely absent. `fr` locale does NOT exist despite audit summary mention | — |
| Database index audit | billing_history (workspace, status, paystack_ref), invitations (workspace+tenant, email+workspace, expires_at), sessions (jti), users (email, email_verified) | entities/profiles partial | Compound (tenant_id, workspace_id) on entities/profiles not verified; analytics aggregation indexes | — |
| HITL queue worker | HitlService class: submit, review, list, expireStale, countPending | expireStale works per-tenant | No cross-tenant expiry CRON, no scheduled export, no admin notification channel | — |
| k6 CI integration | 3 k6 files: billing.k6.js, geography.k6.js, negotiation.k6.js + README | README documents usage | Not in any CI workflow | — |
| Canary deployment automation | deploy-canary.yml: manual trigger, 10%→50%→100% progression | 30-min health gates | Error rate gate is "manual check required in Cloudflare Dashboard" — not automated | Cloudflare error-rate metric API access |

### 2.2 Phase Areas — Evidence

| Phase | Status |
|---|---|
| P21 — Bank Transfer as Default Payment | `payment_method TEXT -- cash\|card\|transfer` in migration 0049, no bank transfer FSM, no proof-of-payment, no confirmation or reconciliation workflow |
| P22 — AI SuperAgent Production | SpendControls, HitlService, NdprRegister, ComplianceFilter all implemented. HITL CRON missing. Spend reset job missing. |
| P23 — Analytics Dashboard | `super_admin` analytics exist (3 routes). Tenant-facing analytics = 0. Partner revenue dashboards = 0. |
| P24 — Multi-currency | migration 0226 adds `currency_code DEFAULT 'NGN'`. No FX table, no conversion logic, no display currency separation from transaction currency |
| P25 — B2B Marketplace | Public discovery exists (apps/public-discovery). Negotiation engine exists (@webwaka/negotiation). Entity-to-entity commerce, B2B procurement, invoicing, fulfillment = 0 |

---

## 3. Remaining Immediate Issues — Detailed Planning

---

### Issue 1: Email Verification Enforcement

#### Problem Statement

`email_verified_at` was added in migration 0233. The `/auth/send-verification` and `/auth/verify-email` routes are fully implemented. However, the enforcement layer — dashboard warning, grace period, and paid-feature block — has **zero implementation**. Unverified users have identical access to verified users.

#### Why It Matters

Unverified emails: (1) allow fake accounts to accumulate platform resources, (2) expose the platform to spam/abuse on invite flows, (3) break email-based NDPR compliance (you must be able to reach the user), and (4) weaken AI consent validity (consent must be tied to a verified contact).

#### Current WebWaka Evidence (Code)

- `users.email_verified_at INTEGER` — migration 0233
- `GET /auth/me` returns `emailVerifiedAt` field (verified from grep)
- `POST /auth/send-verification` — throttled 5/5min per user, writes KV token
- `GET /auth/verify-email?token=...` — consumes token, sets `email_verified_at = unixepoch()`
- `apps/workspace-app/src/pages/Dashboard.tsx` — **no verification banner rendered**
- `apps/api/src/middleware/billing-enforcement.ts` — **no check on email_verified_at**
- `apps/api/src/middleware/auth.ts` — **no check on email_verified_at**
- `apps/api/src/middleware/entitlement.ts` — **no email verification gate**

#### Best-Practice Research Synthesis

Industry patterns (Stripe, Intercom, Notion, Linear) converge on three consistent behaviors:

1. **Immediate non-blocking warning** — users see a persistent banner immediately after registration until verified. Dismissible per session but not permanently.
2. **Grace window (5–14 days typical, 7 is standard)** — full access continues. The clock starts from `created_at`, not from any arbitrary reset date.
3. **Post-grace gating** — only paid/write features are blocked. Read-only and free-tier discovery access remains. Payment upgrade is always allowed (users must be able to pay to get unblocked).
4. **Resend flow** — the resend button must be rate-limited (done), show countdown to next allowed resend, and the verification email must be re-sent to the email on record (not a new one).
5. **Exceptions** — admin-invited users who set their password via `POST /auth/accept-invite` and then verify email should be treated differently: the invite flow is admin-vouched, so a shorter grace (48h) is appropriate.
6. **Never block**: login/logout, billing, payment routes, health endpoints, read-only discovery, the send-verification route itself.

The enforcement should be in **middleware** (not per-route) to guarantee no drift, and must check the `email_verified_at` field on the authenticated user on every request, with DB results cached in-request (not re-fetched per-route).

#### Recommended Target Design

**A. API Middleware — `email-verification-enforcement.ts`**

New middleware, applied after `authMiddleware`, before `billingEnforcementMiddleware`.

```
Logic:
1. Skip if no auth context (unauthenticated routes).
2. Skip for EXEMPT_PATHS (health, /auth/*, /billing/*, /payments/*).
3. Load user's email_verified_at from DB (or auth context if extended there).
4. If email_verified_at IS NOT NULL → allow, set header X-Email-Verified: true.
5. If email_verified_at IS NULL:
   a. Compute days since user created_at.
   b. If days < 7 (GRACE_PERIOD_DAYS) → allow all, set headers:
      X-Email-Verified: false
      X-Email-Grace-Days-Remaining: {N}
   c. If days >= 7 AND request is a write (non-GET/HEAD/OPTIONS) on paid-feature routes:
      → Return 403 with code: EMAIL_UNVERIFIED, message: "Please verify your email to continue."
   d. Read-only requests → always allowed even post-grace.
```

**Paid-feature routes subject to enforcement:** All routes except: /health, /auth/*, /billing/status, /billing/reactivate, /payments/*, /onboarding/*, /geography/*, /discovery/*, /public/*, /openapi.json, /docs.

**B. Auth Context Extension**

Extend `c.get('auth')` to include `emailVerifiedAt: number | null` so middleware and routes can check without an extra DB call. The auth middleware already fetches the user row — add `email_verified_at` to the SELECT.

**C. Dashboard Warning Banner**

In `apps/workspace-app/src/pages/Dashboard.tsx`:
- Check `user.emailVerifiedAt` from auth context
- If null: render persistent top-of-page banner with:
  - Message: "Please verify your email — {N} days remaining before some features are locked."
  - "Resend verification email" button (calls `POST /auth/send-verification`)
  - Countdown to grace expiry (computed client-side from `user.createdAt`)
  - Dismissible per session via sessionStorage flag (NOT permanently dismissible)

**D. `GET /auth/me` Extension**

Return two new fields: `emailVerifiedAt`, `graceExpiresAt` (= `createdAt + 7 days`). Frontend can compute urgency without server calls.

**E. Settings.tsx (Security tab)**

Show verification status in the Security tab. If unverified, show button + status message. If verified, show "Email verified on {date}."

#### Affected Files

| File | Change |
|---|---|
| `apps/api/src/middleware/email-verification-enforcement.ts` | NEW — enforcement middleware |
| `apps/api/src/middleware/auth.ts` | Add `email_verified_at` to SELECT + `c.set('auth', ...)` |
| `apps/api/src/middleware/index.ts` | Register new middleware |
| `apps/api/src/router.ts` | Apply new middleware to route groups |
| `apps/api/src/routes/auth-routes.ts` | Extend `/auth/me` response with `emailVerifiedAt`, `graceExpiresAt` |
| `apps/api/src/routes/auth-routes.test.ts` | New tests for grace period logic, blocking behavior, exempt paths |
| `apps/workspace-app/src/pages/Dashboard.tsx` | Add verification banner component |
| `apps/workspace-app/src/pages/Settings.tsx` | Add verification status to Security tab |
| `apps/workspace-app/src/lib/api.ts` | Extend user type with `emailVerifiedAt`, `graceExpiresAt` |
| `packages/i18n/src/locales/en.ts` + others | Add i18n keys: `banner_verify_email`, `banner_days_remaining`, `action_resend_verification`, `status_email_verified`, `status_email_unverified` |

#### Database Impact

No new migrations required. `email_verified_at` and `created_at` are already on `users`. The middleware performs a single-row SELECT by `userId + tenantId` (indexed).

**Potential optimization:** Cache `email_verified_at` in the auth JWT payload for users who have verified. Not strictly necessary at MVP but avoids the extra SELECT on every request for verified users.

#### API Impact

- All write routes: new 403 `EMAIL_UNVERIFIED` error code post grace period
- `GET /auth/me`: two new response fields
- Response headers on all requests: `X-Email-Verified`, `X-Email-Grace-Days-Remaining`

#### Frontend/PWA Impact

- Dashboard: banner component (renders on every page load if unverified)
- Settings: Security tab status
- Offline behavior: grace state should be cached in localStorage for offline-first — if offline for 7+ days, the app should show a soft warning but not block (server enforces on reconnect)

#### Governance/Security/Compliance Impact

- **NDPR**: strengthens AI consent validity by ensuring email contact is verified before AI consent can be submitted. The `aiConsentGate` should additionally check `emailVerifiedAt`.
- **SEC**: email verification as an identity anchor is a security hardening measure

#### Migration Strategy

1. Existing users: their `email_verified_at` is NULL. Grace period is computed from `created_at`. Users created before the enforcement deployment get the full 7 days from enforcement date (not from registration) — computed as: `MAX(created_at + 7d, enforcement_deploy_date + 7d)`. This requires a temporary `enforcement_date` constant in middleware.
2. Alternatively: Run a one-time migration script to set `email_verified_at = created_at` for existing active users (treating them as grandfathered). **FOUNDER DECISION REQUIRED** on which approach.

#### Acceptance Criteria

- [ ] Unverified user < 7 days: all routes pass, headers `X-Email-Verified: false`, `X-Email-Grace-Days-Remaining: N`
- [ ] Unverified user ≥ 7 days: GET routes pass, POST/PATCH/DELETE routes return 403 EMAIL_UNVERIFIED
- [ ] Verified user: no headers, full access
- [ ] `/auth/send-verification`, `/auth/verify-email`, `/billing/*`, `/payments/*`, `/health`, `/auth/*`: always exempt
- [ ] Dashboard banner renders with correct days remaining
- [ ] Resend button triggers verification email, shows throttle state
- [ ] 0 TypeScript errors, 2458+ tests pass

#### Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Existing users blocked on day 1 | Grandfather all pre-deployment users with extended grace or auto-verify |
| False positives blocking legitimate users | Comprehensive exempt path list; GET always allowed; billing routes always exempt |
| Race condition on grace period computation | Use DB `created_at` as source of truth, never client time |
| resend throttle bypass | KV throttle already in place (VERIFY_THROTTLE_TTL = 300s) |

#### Founder Decisions Required

1. Should existing users be grandfathered (auto-verified) or given a 7-day window from enforcement date?
2. Should invited users (accepted via `accept-invite`) have a shorter grace period (48h)?
3. Should verification be required before AI consent can be submitted?

---

### Issue 2: Vertical AI Config Completeness

#### Problem Statement

`VERTICAL_AI_CONFIGS` in `packages/superagent/src/vertical-ai-config.ts` contains entries for **17 verticals only**: politician, political-party, motor-park, mass-transit, rideshare, haulage, church, mosque, school, hospital, pharmacy, market, pos-business, cooperative, ngo, farm, artisan.

The remaining **142 verticals** are entirely absent. When `getVerticalAiConfig(slug)` is called for an unconfigured vertical, it returns `null`. The AI advisory route (`GET /{slug}/:id/ai-advisory`) likely falls through to a default behavior or throws — depending on how the route is implemented. There is a risk of silent fail-open if null is not guarded.

#### Why It Matters

- Any vertical whose config is missing could either (a) silently block AI advisory access, or (b) fail-open and allow unapproved capabilities — both are wrong
- P13 (autonomy level declared per vertical) is a platform invariant — unconfigured verticals violate it
- SuperAgent billing attribution relies on `primaryPillar` — unconfigured verticals produce incorrect billing analytics
- Governance check `check-vertical-registry.ts` may not cover this gap (it checks route/package consistency, not AI config completeness)

#### Current WebWaka Evidence

From code review:
```typescript
export function getVerticalAiConfig(slug: string): VerticalAiConfig | null {
  return VERTICAL_AI_CONFIGS[slug] ?? null;
}
```
And usage in superagent.ts checks the config. If null is returned, the route likely returns a generic response or uses a default autonomy level — this needs explicit safe-default handling.

#### Best-Practice Research Synthesis

AI capability registries (AWS Bedrock guardrails, Anthropic model cards, OpenAI usage policies) consistently use **fail-closed as the safe default**: if a capability registry entry is missing, the request is rejected, not silently permitted. This is the correct approach for a NDPR-compliant, HITL-required platform.

Safe-default pattern:
```
DEFAULT_VERTICAL_AI_CONFIG = {
  allowedCapabilities: [],
  autonomy_level: 0,
  aiUseCases: [],
  primaryPillar: 1 (default),
}
```
A missing config should NOT produce an error — it should produce the safe default. This is the difference between fail-closed (block capabilities) and fail-error (throw 500). The correct behavior is **fail-safe-closed**: serve the default config with zero capabilities, log the miss, and allow the advisory endpoint to return an empty-capabilities response rather than an error.

#### Recommended Target Design

**Step 1: Add safe default export**

```typescript
export const DEFAULT_VERTICAL_AI_CONFIG: VerticalAiConfig = {
  slug: '__default__',
  primaryPillar: 1,
  allowedCapabilities: [],
  aiUseCases: [],
};

export function getVerticalAiConfig(slug: string): VerticalAiConfig {
  return VERTICAL_AI_CONFIGS[slug] ?? { ...DEFAULT_VERTICAL_AI_CONFIG, slug };
}
```

The function signature changes from `VerticalAiConfig | null` to `VerticalAiConfig` (never null). All call sites that guard against null can be simplified.

**Step 2: Add a governance check**

Add `scripts/governance-checks/check-ai-vertical-config.ts` that:
- Reads the 159 registered vertical slugs from `packages/verticals-*/package.json` (or a registry file)
- Checks each slug against `VERTICAL_AI_CONFIGS`
- Reports missing entries (warning, not error — because default is safe)
- Flags any vertical with `allowedCapabilities.length > 0` AND `autonomy_level = 0` as a misconfiguration

**Step 3: Generate configs for all 142 missing verticals**

Using the vertical category data, generate appropriate configs. Categories map to:

| Category | Primary Pillar | Safe Default Capabilities |
|---|---|---|
| Commerce/Retail | 1 | listing_enhancer, review_summary |
| Food/Agriculture | 1 | demand_planning, sales_forecast |
| Transport/Logistics | 1 | demand_planning, scheduling_assistant |
| Health | 1 | None (sensitive sector — autonomy 0, HITL required) |
| Professional Services | 1 | bio_generator, listing_enhancer |
| Education | 1 | listing_enhancer |
| Civic/Political | 1 | content_moderation, translation |
| Financial | 1 | None (sensitive sector) |
| Creator/Media | 2 | brand_copywriter, bio_generator, seo_meta_ai |
| Real Estate | 1 | listing_enhancer, bio_generator |
| Energy/Infrastructure | 1 | None (sensitive sector) |

All missing verticals start at `autonomy_level: 0` (suggestion only, no auto-publish).

**Step 4: Codegen script**

Create `scripts/codegen/generate-vertical-ai-configs.ts` that reads the vertical registry and emits TypeScript config entries for all unconfigured slugs with safe defaults. This produces a diff that can be reviewed before merging.

#### Affected Files

| File | Change |
|---|---|
| `packages/superagent/src/vertical-ai-config.ts` | Add 142 entries + DEFAULT_VERTICAL_AI_CONFIG + safe null-free getVerticalAiConfig |
| `scripts/governance-checks/check-ai-vertical-config.ts` | NEW — AI config completeness check |
| `scripts/codegen/generate-vertical-ai-configs.ts` | NEW — config generator |
| `.github/workflows/governance-check.yml` | Add new check step |
| `packages/superagent/src/vertical-ai-config.test.ts` | Tests for default safety, all 159 slugs return a config |

#### Acceptance Criteria

- [ ] `getVerticalAiConfig(slug)` never returns null for any slug
- [ ] All 159 verticals have an entry (generated or handcrafted)
- [ ] All newly generated entries have `autonomy_level: 0` and `allowedCapabilities: []`
- [ ] Sensitive verticals (clinic, pharmacy, law-firm, insurance-agent, bureau-de-change, mobile-money-agent) have zero capabilities and HITL level 3 flagged in config
- [ ] New governance check passes for all 159 verticals
- [ ] 0 TypeScript errors

---

### Issue 3: Changeset Publishing

#### Problem Statement

The monorepo uses `@changesets/cli` with `config.json` configured as `access: "restricted"` and `baseBranch: "staging"`. The `changeset:publish` script is referenced in the root `package.json` but **no npm authentication is configured** in GitHub Actions, no npm organization/scope is established, and no publish workflow exists.

#### Current WebWaka Evidence

`.changeset/config.json`:
```json
{
  "access": "restricted",
  "baseBranch": "staging",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

`access: "restricted"` means packages publish as private npm packages (paid npm organization required). The `changelog` field uses the default `@changesets/cli/changelog`.

`pnpm-workspace.yaml` has `packages/*` and `packages/core/*` — these are the publishable scopes.

#### Best-Practice Research Synthesis

For pnpm monorepos with changesets, the standard production-ready pattern is:

1. **Changeset PR workflow** — `changeset:version` creates a "Release PR" automatically via GitHub Action. When the Release PR is merged to staging, `changeset:publish` runs.
2. **npm OIDC / Trusted Publishing** — npm now supports OpenID Connect tokens from GitHub Actions, eliminating the need for stored `NPM_TOKEN` secrets. This is the recommended approach for new setups.
3. **Private packages** — `access: restricted` requires an npm org or GitHub Packages. GitHub Packages (registry: `https://npm.pkg.github.com`) is a simpler starting point for a private monorepo already on GitHub — no separate npm organization required.
4. **Internal dependency versioning** — `updateInternalDependencies: "patch"` is correct for a monorepo where packages depend on each other with caret ranges.
5. **Fixed vs independent versioning** — WebWaka OS should use **independent** versioning (each package has its own version) since verticals evolve at different rates. The current `fixed: []` in config confirms this is the intent.

#### Recommended Target Design

**Phase A: GitHub Packages (immediate, zero cost)**

Use GitHub Packages as the private npm registry. All `@webwaka/*` packages publish to `npm.pkg.github.com` under the `WebWakaOS` org. This requires:
- Add `"publishConfig": { "registry": "https://npm.pkg.github.com", "access": "restricted" }` to each package's `package.json`
- GitHub Actions workflow uses `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}` — no additional secrets needed for same-org packages

**Phase B: Release PR Workflow**

```yaml
# .github/workflows/release-pr.yml
name: Release PR
on:
  push:
    branches: [staging]
jobs:
  release-pr:
    uses: changesets/action@v1
    with:
      publish: pnpm changeset:publish
      version: pnpm changeset:version
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

This workflow creates/updates a "Version Packages" PR automatically. When the PR is merged, it publishes.

**Phase C: Scope gating**

Not all packages need to be published. External-facing packages: `@webwaka/types`, `@webwaka/auth`, `@webwaka/core`, `@webwaka/entitlements`, `@webwaka/entities`, `@webwaka/geography`, `@webwaka/i18n`, `@webwaka/design-system`. Internal-only packages (worker apps, vertical implementations) should be marked `"private": true` in their `package.json` to prevent accidental publishing.

#### Affected Files

| File | Change |
|---|---|
| `packages/*/package.json` (external-facing only) | Add `publishConfig.registry` + ensure scope `@webwaka/` |
| `packages/verticals-*/package.json` | Mark as `"private": true` |
| `apps/*/package.json` | Mark as `"private": true` |
| `.changeset/config.json` | Set `"access": "restricted"` (already correct) |
| `.github/workflows/release-pr.yml` | NEW — Release PR automation |
| `.npmrc` (root) | Add `@webwaka:registry=https://npm.pkg.github.com` |

#### Founder Decisions Required

1. Should packages publish to GitHub Packages or public npm? (GitHub Packages is free for private within the org; public npm requires verification)
2. Which packages are intended for external consumption vs internal only?
3. Is there a future intent to allow third-party developers to install `@webwaka/types` etc.?

---

### Issue 4: Event Sourcing Projections Scheduling

#### Problem Statement

`apps/projections/src/index.ts` exports a Hono app with:
- `GET /health`
- `POST /rebuild/search` (requires INTER_SERVICE_SECRET)
- `POST /rebuild/analytics` (stub for M7)
- `GET /events/:aggregate/:id`

The `wrangler.toml` has **no `[triggers]` section**. There is **no `scheduled` export**. Therefore the projections worker can only be triggered via HTTP (inter-service call) — it has no automatic rebuild capability.

The comment in the source says "triggered via a Scheduled Worker (cron)" but this is not implemented.

#### Current WebWaka Evidence

`apps/projections/wrangler.toml` (full file reviewed):
- No `[triggers]` or `[[triggers.crons]]` section
- `INTER_SERVICE_SECRET` documented as required

`apps/projections/src/index.ts`:
- `export default app` — no `export default { fetch, scheduled }` pattern

#### Best-Practice Research Synthesis

Cloudflare Workers scheduled triggers documentation confirms:

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> { ... },
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> { ... }
};
```

And `wrangler.toml`:
```toml
[triggers]
crons = ["*/30 * * * *"]  # every 30 minutes
```

Key architectural considerations:
1. **Idempotence** — the `rebuildSearchIndexFromEvents` function must be safe to run multiple times on the same data. If using event-log offsets, the last processed event ID should be tracked in a `projection_checkpoints` table.
2. **Replay safety** — for a full rebuild, the search_index FTS5 table is dropped and rebuilt. This is safe for scheduled rebuilds but must be atomic.
3. **Incremental vs full rebuild** — a full rebuild every 30 min is expensive at scale. An incremental approach (process only events since last checkpoint) is production-grade.
4. **Failure handling** — if the scheduled job fails, the next run should pick up where it left off (idempotent checkpoint-based approach).

#### Recommended Target Design

**Step 1: Refactor index.ts to dual-export pattern**

```typescript
const scheduled: ExportedHandlerScheduledHandler<Env> = async (event, env, ctx) => {
  const db = env.DB as unknown as D1Like;
  ctx.waitUntil(rebuildSearchIndexFromEvents(db).then(result => {
    if (result.errors.length > 0) {
      console.error('[projections] scheduled rebuild errors:', result.errors);
    } else {
      console.log('[projections] scheduled rebuild complete:', result);
    }
  }));
};

export default { fetch: app.fetch, scheduled };
```

**Step 2: Add triggers to wrangler.toml**

```toml
[triggers]
crons = ["*/30 * * * *"]

[env.staging.triggers]
crons = ["*/30 * * * *"]

[env.production.triggers]
crons = ["*/15 * * * *"]  # More frequent in production
```

**Step 3: Add projection_checkpoints table (migration 0234)**

```sql
CREATE TABLE IF NOT EXISTS projection_checkpoints (
  id          TEXT NOT NULL PRIMARY KEY,
  projection  TEXT NOT NULL UNIQUE,
  last_event_id TEXT,
  last_run_at INTEGER NOT NULL DEFAULT (unixepoch()),
  run_count   INTEGER NOT NULL DEFAULT 0,
  last_error  TEXT
);
```

This enables incremental processing.

**Step 4: Add HITL expiry to scheduled handler**

The HITL expiry job (Issue 8) should also run in the projections CRON rather than a separate worker, since both are maintenance-level background jobs. See Issue 8.

#### Affected Files

| File | Change |
|---|---|
| `apps/projections/src/index.ts` | Add `scheduled` handler, refactor to dual-export |
| `apps/projections/wrangler.toml` | Add `[triggers]` with cron schedule |
| `infra/db/migrations/0234_projection_checkpoints.sql` | NEW — projection checkpoint table |
| `infra/db/migrations/0234_projection_checkpoints.rollback.sql` | NEW — rollback |
| `packages/events/src/projections/` | Enhance to support incremental processing |

#### Acceptance Criteria

- [ ] `wrangler dev` triggers scheduled handler correctly
- [ ] CRON fires on schedule in staging
- [ ] Rebuild is idempotent (running twice produces same result)
- [ ] `projection_checkpoints` row updated after each run
- [ ] INTER_SERVICE_SECRET continues to gate HTTP endpoints
- [ ] CI smoke test calls `/health` on projections worker

---

### Issue 5: OpenAPI Spec Completeness

#### Problem Statement

`docs/openapi/v1.yaml` currently documents: `/health`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/platform/analytics/*`, `/identity/*`, `/templates/*`, `/partners/*`, `/superagent/*` and several more.

**Entirely absent from the spec:** All P20 routes:
- `POST /auth/invite`
- `GET /auth/invite/pending`
- `DELETE /auth/invite/:id`
- `POST /auth/accept-invite`
- `GET /auth/sessions`
- `DELETE /auth/sessions` (revoke all)
- `DELETE /auth/sessions/:id`
- `POST /auth/send-verification`
- `GET /auth/verify-email`

Also absent or incomplete: `GET /auth/me`, `PATCH /auth/profile`, `POST /auth/register`, `POST /auth/change-password`, `POST /auth/forgot-password`, `POST /auth/reset-password`, most vertical routes, community routes, social routes, sync routes, POS routes, negotiation routes.

The Redocly CLI lint (`openapi-lint` CI job) validates spec syntax but does NOT check that all API routes are represented.

#### Why It Matters

Without a complete OpenAPI spec: (1) third-party integrators cannot build against the API, (2) contract testing against the spec is impossible, (3) Swagger UI served at `/docs` is misleading (shows partial API).

#### Best-Practice Research Synthesis

Preventing spec drift — three proven approaches:

1. **Code-first (type generation)** — generate OpenAPI from TypeScript types or JSDoc annotations. Tools: `hono-openapi`, `zod-openapi`. Most reliable but requires retrofit of all routes.
2. **Spec-first + route validation** — write spec first, then validate that each route in the spec returns the correct shape. Tools: `dredd`, `schemathesis`. Catches drift but requires spec maintenance discipline.
3. **CI drift detection** — a governance script that compares registered routes in `router.ts` against paths defined in `v1.yaml`. Fails CI when a registered route is undocumented.

For WebWaka, option 3 (governance check for drift) is the lowest-friction path, combined with a one-time manual completion of the spec for P20 routes.

For long-term: `hono-openapi` (or `@hono/zod-openapi`) should be evaluated for code-first generation. Given the scale (50+ route groups), code-first would eliminate manual spec maintenance.

#### Recommended Target Design

**Immediate (Phase A):** Add all P20 routes to v1.yaml manually. This is the fastest path and unblocks `/docs`.

**Governance (Phase B):** Add `scripts/governance-checks/check-openapi-coverage.ts` that:
- Parses `apps/api/src/router.ts` to extract all registered route prefixes
- Reads `docs/openapi/v1.yaml` to extract all documented path prefixes
- Fails CI if any registered prefix is completely undocumented

**Long-term (Phase C, feature-flagged):** Evaluate migration to `@hono/zod-openapi` for code-first spec generation. This requires route-by-route refactoring. Do not block immediate work on this.

#### P20 Routes to Add to v1.yaml

```yaml
paths:
  /auth/invite:
    post: ...  # Invite workspace member (admin only)
  /auth/invite/pending:
    get: ...   # List pending invitations
  /auth/invite/{id}:
    delete: ... # Revoke invitation
  /auth/accept-invite:
    post: ...  # Accept invitation token (public)
  /auth/sessions:
    get: ...   # List active sessions
    delete: ... # Revoke all sessions
  /auth/sessions/{id}:
    delete: ... # Revoke specific session
  /auth/send-verification:
    post: ...  # Send email verification
  /auth/verify-email:
    get: ...   # Consume verification token (public, ?token=)
```

#### Affected Files

| File | Change |
|---|---|
| `docs/openapi/v1.yaml` | Add P20 routes + missing P18/P19 routes (PATCH /auth/profile, POST /auth/change-password, etc.) |
| `scripts/governance-checks/check-openapi-coverage.ts` | NEW — route coverage check |
| `.github/workflows/ci.yml` | Add new governance check to governance job |

#### Acceptance Criteria

- [ ] All P20 routes documented in v1.yaml
- [ ] Redocly CLI lint passes (`openapi-lint` CI job)
- [ ] New coverage governance check passes for all registered route groups
- [ ] `/docs` Swagger UI shows all P20 routes with correct request/response schemas
- [ ] 0 TypeScript errors

---

### Issue 6: i18n Locale Completeness

#### Problem Statement

The `@webwaka/i18n` package supports **5 locales** (en, ha, yo, ig, pcm). The English base locale (`en.ts`) has **~55 keys**. These keys cover page titles, navigation, common actions, status messages, search, auth labels, and errors.

**Missing from all locales:**
- P20 UI strings: email verification banner, invite flow, session management, "days remaining" messaging
- Vertical-specific labels, FSM state names, product category labels
- Billing status messages (grace period, suspended, terminated)
- AI advisory labels, consent flow strings
- Error codes (EMAIL_UNVERIFIED, BILLING_SUSPENDED, etc.)
- Any wallet/WakaCU credit UI strings

**Missing locale:** `fr` (French) — referenced in the earlier audit summary but does NOT exist in the codebase. The code has `en, ha, yo, ig, pcm`. Côte d'Ivoire support (P24) requires French.

**Important correction to earlier audit:** The audit metadata listed `fr (French)` as a supported locale. This was **incorrect**. The actual supported locales are `en, ha, yo, ig, pcm`. `fr` is not implemented.

#### Best-Practice Research Synthesis

i18n coverage audit methodology:

1. **Key exhaustion test** — write a test that: (a) finds all `.t('key')` call sites in source code, (b) extracts all keys, (c) verifies every extracted key exists in `en.ts`. This prevents key drift.
2. **Coverage matrix** — for each non-English locale, compute `coverage = (keys_present / total_en_keys) * 100`. Industry standard for "good enough for launch": 80%+.
3. **Missing key detection** — a TypeScript build-time approach: since `createI18n` returns a typed function with `key: I18nKeys`, any key call that doesn't match the English key set is a compile error. This means **key additions must always be added to `en.ts` first**.
4. **Fallback strategy** — the current implementation falls back to English for missing keys. This is correct. The fallback string should be visible in dev but hidden in production (no "key not found" crashes).
5. **Dynamic keys** — if locale keys include dynamic content (e.g., `{count} days remaining`), variable substitution must be tested. The current `createI18n` supports `{key}` interpolation.

#### Recommended Target Design

**Step 1: Expand en.ts key set**

Add all missing P20 keys to `en.ts`:
```typescript
// P20 verification
banner_verify_email: 'Please verify your email address.',
banner_verify_days_remaining: '{days} days remaining before some features are limited.',
banner_verify_expired: 'Your email verification grace period has expired.',
action_resend_verification: 'Resend verification email',
status_email_verified: 'Email verified',
status_email_unverified: 'Email not verified',
action_revoke_session: 'Sign out this device',
action_revoke_all_sessions: 'Sign out all other devices',
label_sessions: 'Active sessions',
label_last_seen: 'Last seen',
label_device: 'Device',
// Billing
billing_grace_period: 'Your subscription is in grace period. Renew to keep full access.',
billing_suspended: 'Account suspended. Please renew your subscription.',
billing_days_until_renewal: '{days} days until renewal',
// AI
ai_consent_required: 'AI features require your consent. Review and agree to continue.',
ai_advisory_unavailable: 'AI advisory not available for this business type.',
```

**Step 2: Add key coverage governance test**

`packages/i18n/src/locales.test.ts`:
- Import all 5 locale objects
- Assert every key in `en` exists in each locale OR falls back gracefully
- Report coverage percentage per locale

**Step 3: Translate new P20 keys to ha, yo, ig, pcm**

This is partially a human task (native speaker review required for accuracy), but a machine-translated starter draft can be generated and flagged for review.

**Step 4: Add `fr.ts` (stub for P24)**

Create `packages/i18n/src/locales/fr.ts` as a stub with full key set translated to French. Add `'fr'` to `SUPPORTED_LOCALES`. Required for Côte d'Ivoire support in P24.

**Step 5: Add key-usage governance check**

`scripts/governance-checks/check-i18n-keys.ts`:
- Scan all `.tsx` files in workspace-app for `t('...')` calls
- Verify every called key exists in `en.ts`
- Fail CI if a key is used that doesn't exist in en.ts

#### Affected Files

| File | Change |
|---|---|
| `packages/i18n/src/locales/en.ts` | Add ~25 new keys for P20 + billing + AI |
| `packages/i18n/src/locales/ha.ts` | Add translations for new keys |
| `packages/i18n/src/locales/yo.ts` | Add translations for new keys |
| `packages/i18n/src/locales/ig.ts` | Add translations for new keys |
| `packages/i18n/src/locales/pcm.ts` | Add translations for new keys |
| `packages/i18n/src/locales/fr.ts` | NEW — French locale stub (for P24) |
| `packages/i18n/src/index.ts` | Add `'fr'` to SUPPORTED_LOCALES, LOCALE_LABELS |
| `packages/i18n/src/index.test.ts` | Expand tests, add coverage matrix |
| `scripts/governance-checks/check-i18n-keys.ts` | NEW |

#### Founder Decisions Required

1. Should `fr` be added now as a stub (recommended) or deferred to P24?
2. Are the Hausa/Yoruba/Igbo/Pidgin translations currently in the codebase reviewed by native speakers, or are they machine-translated?

---

### Issue 7: Database Index Audit

#### Problem Statement

A compound index audit is needed for high-frequency query paths involving `tenant_id` and `workspace_id`. The billing enforcement middleware (reviewed) runs `SELECT ... FROM subscriptions WHERE workspace_id = ? AND tenant_id = ?` on every authenticated non-exempt request. The auth middleware selects `FROM users WHERE email = ?` on every login.

Without proper compound indexes, these queries degrade from O(log n) to O(n) at scale.

#### Current WebWaka Evidence (from migrations)

**Confirmed indexes:**
- `billing_history(workspace_id)`, `billing_history(status)`, `billing_history(paystack_ref)` (migration 0011)
- `invitations(workspace_id, tenant_id)`, `invitations(email, workspace_id)`, `invitations(expires_at)` (migration 0231)
- `sessions(jti)` (migration 0232)
- `users(email_verified_at) WHERE email_verified_at IS NOT NULL` (migration 0233)

**Not confirmed (need audit):**
- `subscriptions(workspace_id, tenant_id)` — billing enforcement queries this on every auth'd request
- `entities(tenant_id, workspace_id)` — entity listing queries
- `profiles(tenant_id, workspace_id)` — discovery queries
- `event_log(aggregate_id, aggregate_type)` — projection rebuilds scan this
- `ai_hitl_queue(tenant_id, status, expires_at)` — HITL expiry job scans this

#### Best-Practice Research Synthesis for SQLite/D1

SQLite and Cloudflare D1 (SQLite under the hood) have the same indexing rules:

1. **Multi-column query patterns** — for `WHERE tenant_id = ? AND workspace_id = ?`, a compound index `(tenant_id, workspace_id)` is far better than two separate single-column indexes, because SQLite can only use one index per query.
2. **Leading column selectivity** — `tenant_id` should be the leading column in compound indexes because it has higher cardinality at platform level (many tenants vs few workspaces per tenant). Exception: if most queries are workspace-scoped, leading with `workspace_id` is better.
3. **Covering indexes** — for high-frequency reads that only need a subset of columns, a covering index (including all SELECT columns) eliminates the table row lookup entirely.
4. **Partial indexes** — SQLite supports `WHERE` clauses on indexes. Example: `idx_sessions_active ON sessions(user_id) WHERE revoked_at IS NULL`. Dramatically reduces index size for status-filtered queries.
5. **D1-specific** — D1 uses HTTP for queries (no persistent connection), so query latency is dominated by network round trips, not index scans. However at scale, full table scans still cause 502/timeout errors when table size grows.

#### Recommended Index Additions (Migration 0235)

```sql
-- Subscriptions: billing enforcement queries this on every authenticated request
CREATE INDEX IF NOT EXISTS idx_subscriptions_workspace_tenant
  ON subscriptions(workspace_id, tenant_id);

-- Entities: high-frequency listing query (GET /entities?workspace=...)
CREATE INDEX IF NOT EXISTS idx_entities_tenant_workspace
  ON entities(tenant_id, workspace_id);

-- Profiles: discovery queries (GET /discovery?state=&lga=&ward=)
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_status
  ON profiles(tenant_id, status);

-- Event log: projection rebuild scans (incremental processing)
CREATE INDEX IF NOT EXISTS idx_event_log_aggregate
  ON event_log(aggregate_type, aggregate_id, created_at);

-- Sessions: active session lookup (revoke-all, session listing)
CREATE INDEX IF NOT EXISTS idx_sessions_user_active
  ON sessions(user_id, tenant_id) WHERE revoked_at IS NULL;

-- AI HITL queue: expiry job scans pending items globally
CREATE INDEX IF NOT EXISTS idx_hitl_status_expires
  ON ai_hitl_queue(status, expires_at) WHERE status = 'pending';

-- AI usage events: billing aggregation queries
CREATE INDEX IF NOT EXISTS idx_ai_usage_tenant_created
  ON ai_usage_events(tenant_id, created_at);
```

#### Affected Files

| File | Change |
|---|---|
| `infra/db/migrations/0235_performance_indexes.sql` | NEW — all compound indexes above |
| `infra/db/migrations/0235_performance_indexes.rollback.sql` | NEW — DROP INDEX statements |

#### Acceptance Criteria

- [ ] All indexes created without migration errors
- [ ] Rollback script verified (DROP INDEX for all)
- [ ] Billing enforcement query verified via EXPLAIN QUERY PLAN (uses index)
- [ ] Entity listing query verified via EXPLAIN QUERY PLAN
- [ ] Governance check for rollback scripts passes (CI-003)

---

### Issue 8: HITL Queue Worker

#### Problem Statement

`packages/superagent/src/hitl-service.ts` implements:
- `submit(input)` — creates HITL queue item
- `review(input)` — admin approval/rejection
- `list(tenantId, opts)` — paginated listing
- `expireStale(tenantId)` — marks expired items for a single tenant
- `countPending(tenantId)` — count pending items

The `expireStale` method requires a **tenant ID** — it only processes one tenant at a time. There is **no mechanism for cross-tenant expiry sweeps**. The HITL expiry job must scan all tenants, which requires a different approach.

#### Why It Matters

HITL Level 3 items (72h window, regulatory) that are never reviewed expire silently. Without an expiry sweep, the `ai_hitl_queue` table grows unbounded with stale `pending` rows. Regulatory review items that expire may trigger compliance obligations (notify operator, escalate to regulator). The non-payment of this technical debt becomes a compliance liability.

#### Recommended Target Design

**Approach: CRON in projections Worker (not a new worker)**

Adding HITL expiry to the projections Worker CRON (Issue 4) avoids deploying another Worker. The projections Worker already has DB access and INTER_SERVICE_SECRET.

**Add to `packages/superagent/src/hitl-service.ts`:**

```typescript
async expireAllStale(db: D1Like): Promise<{ expired: number; escalated: number }> {
  const now = new Date().toISOString();
  
  // Mark all expired pending items
  const result = await db.prepare(
    `UPDATE ai_hitl_queue SET status = 'expired', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
     WHERE status = 'pending' AND expires_at < ?`
  ).bind(now).run();
  
  const expired = result.meta?.changes ?? 0;
  
  // Log events for all newly expired items
  const expiredItems = await db.prepare(
    `SELECT id, tenant_id, hitl_level FROM ai_hitl_queue
     WHERE status = 'expired' AND updated_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 minute')`
  ).all<{ id: string; tenant_id: string; hitl_level: number }>();
  
  let escalated = 0;
  for (const item of expiredItems.results) {
    if (item.hitl_level === 3) {
      // Regulatory expiry — escalate (write to escalation_events table)
      escalated++;
      // TODO P22: Send notification to tenant admin
    }
  }
  
  return { expired, escalated };
}
```

**CRON handler in `apps/projections/src/index.ts`:**

```typescript
import { expireAllStaleHitlItems } from '@webwaka/superagent';

const scheduled = async (event: ScheduledEvent, env: Env, ctx: ExecutionContext) => {
  const db = env.DB as unknown as D1Like;
  ctx.waitUntil(Promise.all([
    rebuildSearchIndexFromEvents(db),
    expireAllStaleHitlItems(db),
    resetMonthlyBudgets(db),  // AI spend controls monthly reset
  ]).catch(err => console.error('[projections] scheduled error:', err)));
};
```

**New migration (0236) — `hitl_escalations` table:**

```sql
CREATE TABLE IF NOT EXISTS hitl_escalations (
  id           TEXT NOT NULL PRIMARY KEY,
  queue_item_id TEXT NOT NULL,
  tenant_id    TEXT NOT NULL,
  escalation_type TEXT NOT NULL,  -- 'expired_regulatory'
  resolved_at  INTEGER,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_hitl_escalations_tenant
  ON hitl_escalations(tenant_id, created_at);
```

#### Affected Files

| File | Change |
|---|---|
| `packages/superagent/src/hitl-service.ts` | Add `expireAllStale` (no tenantId required) |
| `packages/superagent/src/hitl-service.test.ts` | Add tests for cross-tenant expiry |
| `apps/projections/src/index.ts` | Add HITL expiry + budget reset to scheduled handler |
| `infra/db/migrations/0236_hitl_escalations.sql` | NEW |
| `infra/db/migrations/0236_hitl_escalations.rollback.sql` | NEW |

#### Acceptance Criteria

- [ ] CRON runs expiry sweep across all tenants
- [ ] Level 3 expired items create escalation_events rows
- [ ] Monthly AI spend budgets reset on schedule
- [ ] expireAllStale is idempotent (running twice is safe)
- [ ] Tests pass for all scenarios

---

### Issue 9: k6 Load Test CI Integration

#### Problem Statement

`tests/k6/` contains three production-quality test files:
- `billing.k6.js` — thresholds: p(95) < 200ms, error rate < 1%, RPS > 50
- `geography.k6.js` — geography hierarchy endpoints
- `negotiation.k6.js` — negotiation engine endpoints

None are referenced in any GitHub Actions workflow.

#### Best-Practice Research Synthesis

k6 CI integration patterns:

1. **Never block PR merges on full load tests** — load tests run on a live staging environment and can take minutes. They should run asynchronously, not as PR gates.
2. **Smoke tests on every deploy** — a "smoke" variant (1–2 VUs, 30s) that validates API availability and basic response time. Safe for PR gating.
3. **Full load tests on schedule** — run weekly or nightly against staging, with results stored as artifacts. Threshold failures send alerts but don't block deploys.
4. **Environment isolation** — k6 needs a running API. The current CI environment runs unit tests (no live server). Load tests must target staging.
5. **k6 Cloud vs self-hosted** — Grafana k6 Cloud offers free tier (50 VU-hours/month) for CI integration. Self-hosted with `k6 run` requires a machine with outbound network access.

#### Recommended Target Design

**Phase A: Smoke integration (PR-safe)**

Add a `load-smoke` job to `ci.yml` that runs after `smoke` succeeds:

```yaml
load-smoke:
  name: Load Smoke (k6)
  runs-on: ubuntu-latest
  needs: [smoke]
  if: github.event_name == 'push' && github.ref == 'refs/heads/staging'
  steps:
    - uses: actions/checkout@v4
    - uses: grafana/setup-k6-action@v1
    - name: Run billing k6 smoke (2 VUs, 30s)
      env:
        BASE_URL: ${{ secrets.STAGING_API_URL }}
        AUTH_TOKEN: ${{ secrets.STAGING_SMOKE_TOKEN }}
      run: k6 run --vus 2 --duration 30s tests/k6/billing.k6.js
```

This runs only on push to staging (not on PRs) against the staging API.

**Phase B: Scheduled full load test**

```yaml
# .github/workflows/load-test.yml
name: Load Tests
on:
  schedule:
    - cron: '0 3 * * *'  # 3am daily
  workflow_dispatch:
jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: grafana/setup-k6-action@v1
      - name: Full billing load test
        run: k6 run --out json=results/billing-$(date +%Y%m%d).json tests/k6/billing.k6.js
      - uses: actions/upload-artifact@v4
        with:
          name: k6-results-${{ github.run_id }}
          path: results/
```

#### Affected Files

| File | Change |
|---|---|
| `.github/workflows/ci.yml` | Add `load-smoke` job (push to staging only) |
| `.github/workflows/load-test.yml` | NEW — scheduled load test workflow |
| `tests/k6/billing.k6.js` | Add `export const options` smoke variant (exported separately or via env var) |

#### Required Secrets

- `STAGING_API_URL` — staging API base URL
- `STAGING_SMOKE_TOKEN` — a long-lived service account JWT for staging load tests (human action required to generate and store)

#### Founder Decisions Required

1. Should full load tests run nightly or weekly?
2. Should k6 Cloud be used for distributed load? (Grafana k6 Cloud free tier is 50 VU-hours/month)
3. Should threshold failures alert via Slack/email?

---

### Issue 10: Canary Deployment Automation

#### Problem Statement

`deploy-canary.yml` is triggered manually (`workflow_dispatch`). It implements:
- `deploy-canary-10` — deploy at 10% traffic
- `health-gate-10` — wait 30 min, check `/health`
- `promote-canary-50` — widen to 50%
- `health-gate-50` — wait 30 min
- `promote-canary-100` — full rollout

The error rate gate at both health-gate steps contains this text: `"Error rate gate: manual check required in Cloudflare Dashboard"` — not automated.

#### Best-Practice Research Synthesis

Canary automation best practices:

1. **Automated error rate gates** — use Cloudflare Workers Analytics Engine or the Cloudflare API to query 5xx rate for a specific worker version. Threshold: < 0.5% error rate in 15-minute window.
2. **Automatic rollback** — if health gate fails, the workflow should automatically roll back to the previous stable version.
3. **Feature flags over traffic splitting** — for new features that don't affect all endpoints, feature flags (LaunchDarkly, Cloudflare Workers KV-based) are safer than traffic percentage splits.
4. **Staging-first discipline** — automatic canary makes sense only if staging is a reliable proxy for production traffic patterns. If staging is light, automatic canary on staging merge may produce false confidence.
5. **Manual approval at 100%** — even with automated gates at 10% and 50%, the final 100% promotion should require a manual GitHub Actions approval environment to prevent accidental full rollouts.

#### Recommended Target Design

**Not recommended: Fully automatic canary triggered by staging merge**

Given the current infrastructure (no error rate API automation, staging traffic ≠ production traffic patterns), automatic canary promotion on every staging push would create noise and false confidence. The current manual trigger is appropriate for now.

**Recommended: Automate the error rate gate only**

Replace the "manual check required" note with actual Cloudflare API calls:

```bash
# Query Cloudflare Worker Analytics for version-specific error rate
CF_ANALYTICS=$(curl -s \
  "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/workers/analytics/query" \
  -H "Authorization: Bearer $CF_ANALYTICS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"SELECT sum(requests), sum(errors) FROM workers_analytics WHERE scriptName = \"webwaka-api\" AND timestamp > NOW() - INTERVAL 15 MINUTE"}')
ERROR_RATE=$(echo $CF_ANALYTICS | jq -r '.result.data[0].errors / .result.data[0].requests')
if (( $(echo "$ERROR_RATE > 0.005" | bc -l) )); then
  echo "Error rate $ERROR_RATE exceeds 0.5% threshold. Rolling back."
  npx wrangler versions deploy --name webwaka-api --version-percentage "$STABLE_VERSION"=100
  exit 1
fi
```

**Add automatic rollback step** to each health gate job:

```yaml
- name: Rollback on failure
  if: failure()
  run: |
    npx wrangler versions deploy \
      --name webwaka-api \
      --version-percentage "$STABLE_VERSION"=100
    echo "Rolled back to stable version"
```

**Add required approval for 100% promotion:**

```yaml
promote-canary-100:
  environment: production-canary-100  # requires GitHub Environment approval
```

#### Affected Files

| File | Change |
|---|---|
| `.github/workflows/deploy-canary.yml` | Automate error rate gate using CF API, add rollback step, add approval gate for 100% |

#### Required Secrets

- `CLOUDFLARE_ANALYTICS_TOKEN` — separate read-only analytics token (not the deploy token)
- `STABLE_VERSION` — the current stable version ID (passed from previous deploy outputs)

#### Founder Decisions Required

1. Should canary deployment be triggered automatically on staging merge, or remain manually triggered?
2. What is the acceptable error rate threshold for canary promotion? (Proposed: 0.5%)
3. Which team members should be required approvers for 100% canary promotion?

---

## 4. P21–P25 Phase Planning

---

### P21 — Offline Bank Transfer as Default Payment Method

> **IMPORTANT:** The prior roadmap listed P21 as "USSD Advanced Features." This is **overtaken by events**. The confirmed current direction is: offline bank transfer as the default payment method across the entire platform. See [Section 9](#9-overtaken-by-events-register) for the formal register entry.

#### What This Phase Means in WebWaka Terms

Every tenant (from free to enterprise), every vertical (bakery to law-firm), and every user can complete commercial transactions via bank transfer. The bank transfer flow:
1. Buyer generates a payment reference and receives seller's bank details
2. Buyer makes bank transfer (can be offline — USSD bank transfer, mobile banking in low-connectivity)
3. Seller confirms receipt (marks as "confirmed") — or automatic confirmation via Paystack webhook for Paystack Virtual Accounts
4. Platform records the confirmed transaction, updates inventory/orders, and closes the commercial loop

This is **not** about replacing Paystack card payments — it is about making bank transfer the **default path** rather than an exception.

#### Why It Fits

Nigeria's payment reality: 65%+ of B2B transactions are via bank transfer. The `payment_method TEXT -- cash|card|transfer` field already exists in POS transactions (migration 0049). The offline-first architecture means the confirmation step can be queued and replayed.

#### Prerequisites and Dependencies

- P20 COMPLETE (auth, sessions, invitations all stable) ✅
- Paystack integration exists (`@webwaka/payments`) ✅
- POS float ledger exists ✅
- Offline sync queue exists (`@webwaka/offline-sync`) ✅
- Issue 7 (DB indexes) should be done first (bank transfer creates high-frequency read queries on transactions) ⚠️

#### Feature Decomposition

**P21-A: Bank Transfer Data Model**

New migration 0237_bank_transfer_orders:
```sql
CREATE TABLE IF NOT EXISTS bank_transfer_orders (
  id              TEXT NOT NULL PRIMARY KEY,
  workspace_id    TEXT NOT NULL,
  tenant_id       TEXT NOT NULL,
  buyer_id        TEXT,           -- NULL for walk-in buyers
  seller_entity_id TEXT NOT NULL,
  amount_kobo     INTEGER NOT NULL,
  currency_code   TEXT NOT NULL DEFAULT 'NGN',
  reference       TEXT NOT NULL UNIQUE,
  -- Paystack Virtual Account or manual bank details
  bank_name       TEXT,
  account_number  TEXT,
  account_name    TEXT,
  -- FSM states: pending | proof_submitted | confirmed | rejected | expired
  status          TEXT NOT NULL DEFAULT 'pending',
  -- Proof of payment
  proof_url       TEXT,           -- R2 URL of proof-of-payment image/PDF
  proof_submitted_at INTEGER,
  confirmed_at    INTEGER,
  confirmed_by    TEXT,           -- userId who confirmed
  rejection_reason TEXT,
  expires_at      INTEGER NOT NULL, -- 48h from creation default
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_bank_transfer_workspace
  ON bank_transfer_orders(workspace_id, tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_bank_transfer_reference
  ON bank_transfer_orders(reference);
CREATE INDEX IF NOT EXISTS idx_bank_transfer_expires
  ON bank_transfer_orders(expires_at) WHERE status = 'pending';
```

Rollback: DROP TABLE bank_transfer_orders; DROP INDEX ...

**P21-B: Bank Transfer FSM (5 states)**

```
pending → proof_submitted → confirmed → [settled]
       ↘ expired (via CRON if not confirmed within 48h)
       ← rejected (from proof_submitted, by seller)
```

Package: `packages/payments/src/bank-transfer-fsm.ts`

**P21-C: Paystack Virtual Account Integration**

Paystack offers "Dedicated NUBAN" — a unique bank account per transaction. When a buyer initiates a bank transfer order, the API can optionally provision a Paystack Dedicated NUBAN and return account details. When the buyer sends exactly the required amount, Paystack sends a webhook, and the order is automatically confirmed.

This is the premium path (requires Paystack NUBAN provisioning approval from Paystack). The manual path (seller shares their own bank account + buyer uploads proof) works without Paystack cooperation.

Route: `POST /bank-transfer/create` — creates order, optionally provisions NUBAN
Route: `POST /bank-transfer/:id/submit-proof` — buyer uploads proof (multipart/R2)
Route: `POST /bank-transfer/:id/confirm` — seller confirms manually
Route: `POST /bank-transfer/:id/reject` — seller rejects
Route: `GET /bank-transfer/workspace/:workspaceId` — list transfer orders
Route: `GET /bank-transfer/:id` — get order details
Route: `POST /payments/webhook/paystack` — extend existing webhook handler to process NUBAN auto-confirmation

**P21-D: Proof of Payment Upload**

Buyers upload proof images (bank debit alert screenshot, transfer receipt). These upload to R2 via multipart. The R2 URL is stored in `bank_transfer_orders.proof_url`.

Fraud control: the platform does NOT validate proof images automatically (out of scope for MVP). The seller is responsible for manual verification. Future AI capability: `proof_ocr_validator` can be added to SuperAgent config.

**P21-E: Offline Confirmation Flow**

The confirmation action (`POST /bank-transfer/:id/confirm`) is:
- Queueable via the offline sync system — if the seller is offline, the confirmation is queued and replayed when connectivity returns
- Idempotent — double-confirming is a no-op

**P21-F: Default Payment Method Setting**

Add `default_payment_method` to `workspaces` table:
```sql
ALTER TABLE workspaces ADD COLUMN default_payment_method TEXT NOT NULL DEFAULT 'bank_transfer';
```

The workspace settings page shows a payment method preference toggle: `bank_transfer | card | cash`. When the workspace has `bank_transfer` as default, the POS and order flows pre-select bank transfer.

**P21-G: CRON Expiry**

Expired bank transfer orders (48h default, configurable per workspace) are swept by the projections CRON. Expired orders trigger inventory release (if items were pre-reserved).

**P21-H: Fraud Controls**

- Rate limit: max 10 pending bank transfer orders per workspace at any time
- Amount limits: workspace-configurable maximum amount per transfer (free tier: ₦500k/transfer)
- Audit log: all confirmation events are audit-logged
- Dispute period: confirmed orders enter a 24h dispute window before settlement (funds not yet credited to wallet)

#### Data Model / Migration Changes

| Migration | Content |
|---|---|
| 0237 | `bank_transfer_orders` table |
| 0238 | `workspaces.default_payment_method` column |
| 0239 | `bank_transfer_disputes` table (optional, for P21-H) |

#### Route/API/Worker/Package Impact

| Component | Impact |
|---|---|
| `apps/api/src/routes/bank-transfer.ts` | NEW — all bank transfer routes |
| `apps/api/src/routes/bank-transfer.test.ts` | NEW |
| `packages/payments/src/bank-transfer-fsm.ts` | NEW |
| `packages/payments/src/bank-transfer.ts` | NEW — Paystack NUBAN + manual flows |
| `apps/api/src/routes/payments.ts` | Extend webhook handler for NUBAN confirmation |
| `apps/api/src/router.ts` | Mount `/bank-transfer` routes |
| `apps/workspace-app/src/pages/` | NEW: BankTransfer.tsx, TransferOrders.tsx |
| `packages/offline-sync/` | Extend sync queue to include bank-transfer confirmation actions |

#### Cross-Vertical Implications

Bank transfer orders are **vertical-agnostic** — any vertical (bakery, pharmacy, law-firm) can generate a bank transfer order. The vertical's product/order model links to `bank_transfer_orders.id` as `payment_reference`. All 159 verticals benefit without per-vertical changes.

#### Entitlements / Billing Implications

| Plan | Bank Transfer Features |
|---|---|
| free | Basic manual bank transfer (own account, manual confirmation), max ₦100k/transfer |
| starter | Same + proof upload |
| growth | Same + Paystack NUBAN (auto-confirmation) |
| enterprise | Same + bulk orders, higher limits, dispute API |

Add `PlatformLayer.BankTransfer` to entitlements package.

#### Security/Compliance Implications

- **NDPR**: Bank account details (account number, account name) are not PII under NDPR but are sensitive financial data. They must not be logged unmasked.
- **CBN**: Bank transfer confirmation is not a licensed payment service — it is record-keeping. The platform is not acting as a payment processor. However, any escrow-like hold of funds (dispute period) may require CBN review. **FOUNDER LEGAL REVIEW REQUIRED.**
- **Fraud**: The proof-of-payment image upload creates a fraud surface. Screenshots can be edited. Platform policy must clearly state that confirmation is seller's responsibility.

#### QA Strategy

- Unit tests for FSM transitions (all valid + invalid)
- Integration tests for create → proof_submit → confirm flow
- Integration tests for create → expiry via CRON
- E2E: full browser flow for bank transfer order on bakery vertical
- Contract test for Paystack NUBAN provisioning API

#### Milestone Breakdown

| Milestone | Deliverable |
|---|---|
| P21-M1 | Migration 0237, BankTransferFSM, basic routes (create, confirm, list), unit tests |
| P21-M2 | Proof of payment upload (R2), submit-proof route, reject flow |
| P21-M3 | Paystack NUBAN integration + webhook auto-confirmation |
| P21-M4 | Workspace default payment method setting, frontend order flow |
| P21-M5 | CRON expiry, fraud controls, audit log, E2E tests |

#### Definition of Done

- [ ] Bank transfer orders can be created, submitted, confirmed, rejected, and expired
- [ ] Proof of payment uploads to R2 and URL stored
- [ ] Paystack webhook auto-confirms NUBAN payments (staging)
- [ ] Default payment method configurable per workspace
- [ ] All CRON expiry runs idempotently
- [ ] Zero monetary float errors (all amounts integer kobo)
- [ ] Offline confirmation queues and replays correctly
- [ ] Legal review of dispute/escrow behavior completed

---

### P22 — AI SuperAgent Production (HITL + Spend Controls Live)

#### What This Phase Means

- HITL queue is processed by the projections CRON (implemented in Issue 8)
- Spend controls are enforced at call time (budget checks gate AI requests)
- Monthly budget resets run on schedule
- Admin notification for HITL Level 3 escalations
- Partner pool allocations affect AI routing
- The `autonomy_level` config for each vertical's AI is honored (currently declared but not enforced at the rate-limiting layer)

#### Prerequisites

- Issue 4 (Projections CRON) — REQUIRED before P22
- Issue 8 (HITL expiry CRON) — REQUIRED before P22
- Issue 2 (Vertical AI config completeness) — REQUIRED before P22 (all 159 verticals must have configs)
- Email verification enforcement (Issue 1) — REQUIRED before P22 (AI consent must be tied to verified email)

#### Feature Decomposition

**P22-A: SpendControls enforcement at call time**

Currently `SpendControls.checkBudget(tenantId, userId, ...)` exists but may not be called before AI invocation. The SuperAgent route (`POST /superagent/chat`) must:
1. Call `SpendControls.checkBudget()` before adapter resolution
2. Return 429 with `WakaCU_BUDGET_EXCEEDED` if budget is depleted
3. After successful AI call, call `SpendControls.recordSpend()` to debit the budget

**P22-B: Monthly reset CRON**

`SpendControls.resetMonthlyBudgets()` — already implemented. Must be called from projections CRON on the 1st of each month. Add calendar trigger:
```toml
[triggers]
crons = ["*/30 * * * *", "0 0 1 * *"]  # every 30min + monthly reset
```

**P22-C: HITL Level 3 admin notification**

When a HITL Level 3 item expires without review, the `hitl_escalations` table gets a row. A notification must reach the tenant admin via:
- Email (via existing `email-service.ts` Resend integration)
- In-app badge count on the dashboard (via `GET /superagent/hitl/count`)

**P22-D: Autonomy level enforcement**

The SuperAgent route must check `verticalAiConfig.autonomy_level`:
- Level 0: return advisory text only, no writes
- Level 1: return suggestion, human must confirm
- Level 2: create draft (write to DB with `status = 'draft'`)
- Level 3: auto-publish (write with `status = 'active'`)

Currently the route executes AI and returns text regardless of autonomy level. The write-capable levels (2, 3) require checking entitlement (growth/enterprise plan) and HITL config.

**P22-E: Partner pool depletion alerts**

When a partner's WakaCU pool drops below 20%, log an alert and (optionally) notify the partner admin.

#### Data Model Changes

| Migration | Content |
|---|---|
| 0240 | `ai_spend_events` table (fine-grained spend tracking per request) |
| 0241 | `ai_notification_queue` table (for email/in-app notification delivery) |

#### QA Strategy

- Unit tests: SpendControls.checkBudget blocks when over limit
- Integration test: full POST /superagent/chat flow with spend deduction
- CRON test: monthly reset zeroes current_month_spent_wc for all active budgets
- HITL L3 expiry: creates escalation_events row + notification_queue row

---

### P23 — Analytics Dashboard

#### What This Phase Means

Currently, analytics exist only for `super_admin` (platform-wide aggregates). P23 adds:
- **Tenant-facing analytics** — the workspace operator sees their own business metrics
- **Partner revenue dashboards** — partners see their sub-tenant revenue, commission accruals, credit pool status

#### Feature Decomposition

**P23-A: Tenant analytics API**

New routes (authenticated, tenant-scoped, T3):
```
GET /analytics/tenant/summary          — orders, revenue, top products, top verticals
GET /analytics/tenant/revenue?period=  — revenue over time (day/week/month)
GET /analytics/tenant/customers        — unique customer count, repeat rate
GET /analytics/tenant/verticals        — revenue by vertical
GET /analytics/tenant/payment-methods  — split by cash/card/bank-transfer
```

All monetary values: integer kobo. All computed by querying `transactions`, `orders`, `bank_transfer_orders` scoped by `workspace_id + tenant_id`.

**P23-B: Pre-computed snapshots (performance)**

At scale, live aggregation over millions of transaction rows is too slow. The projections Worker CRON should pre-compute daily analytics snapshots into an `analytics_snapshots` table:

Migration 0242_analytics_snapshots:
```sql
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id          TEXT NOT NULL PRIMARY KEY,
  tenant_id   TEXT NOT NULL,
  workspace_id TEXT NOT NULL,
  snapshot_date TEXT NOT NULL,  -- YYYY-MM-DD
  period_type TEXT NOT NULL DEFAULT 'day',
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_revenue_kobo INTEGER NOT NULL DEFAULT 0,
  unique_customers INTEGER NOT NULL DEFAULT 0,
  top_vertical TEXT,
  computed_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_snapshot_unique
  ON analytics_snapshots(tenant_id, workspace_id, snapshot_date, period_type);
```

The analytics API reads from snapshots for historical data and falls back to live query for the current day.

**P23-C: Partner revenue dashboard**

Partners see:
```
GET /partner/analytics/revenue          — total sub-tenant revenue (partner commission basis)
GET /partner/analytics/commission       — commission accruals
GET /partner/analytics/waku-credit      — WakaCU pool usage + allocation
```

Partner analytics are computed from `partner_revenue_share` + `partner_credit_allocations` (migrations 0222, 0223).

**P23-D: Frontend dashboard**

`apps/workspace-app/src/pages/Analytics.tsx` (NEW):
- Revenue chart (line graph, week/month/quarter)
- Top products table
- Payment method pie chart
- Customer count metric card

Design: mobile-first, uses `@webwaka/design-system` tokens.

#### Entitlements

| Plan | Analytics Features |
|---|---|
| free | None (upsell prompt only) |
| starter | 30-day revenue summary |
| growth | Full historical + payment method breakdown |
| enterprise | Full + export (CSV), partner dashboard |

#### QA Strategy

- Unit tests: snapshot computation for a set of known transactions
- Integration: verify T3 isolation (tenant A cannot see tenant B analytics)
- Integration: partner analytics only shows commission from own sub-tenants
- Performance: snapshot query < 50ms response time

---

### P24 — Multi-Currency

#### What This Phase Means

The platform currently stores `currency_code DEFAULT 'NGN'` (migration 0226) on all monetary tables. P24 activates multi-currency across the entire platform, starting with:

| Currency | Market | Use Case |
|---|---|---|
| NGN | Nigeria | Existing (integer kobo) |
| GHS | Ghana | Marketplace expansion |
| KES | Kenya | Marketplace expansion |
| ZAR | South Africa | Marketplace expansion |
| CFA | Côte d'Ivoire | French West Africa (requires `fr` locale) |
| USD | International | B2B, diaspora payments, SaaS subscriptions |
| USDT | International | Stablecoin, remittance, crypto-native users |

#### Critical Architecture Decision

Multi-currency requires separating:
1. **Display currency** — what the user sees
2. **Transaction currency** — what the contract is denominated in
3. **Settlement currency** — what the seller receives
4. **Accounting/base currency** — what the platform uses for reporting (NGN remains the base)

All amounts must remain as **integers** (P9 invariant extended). New currencies use their smallest unit:
- NGN → kobo (1/100 NGN) ✅ (existing)
- GHS → pesewa (1/100 GHS)
- KES → cents (1/100 KES)
- ZAR → cents (1/100 ZAR)
- CFA → centimes (1/100 CFA) — note: CFA has two variants (XOF, XAF)
- USD → cents (1/100 USD)
- USDT → base units (1/1,000,000 USDT = 1 micro-USDT, OR store as 1/100 for simplicity)

**For USDT specifically**: storing as integer cents-equivalent (1 USDT = 100 units) is the simplest approach. However, USDT has 6 decimal places on-chain. **FOUNDER DECISION REQUIRED** on precision model for USDT.

#### Feature Decomposition

**P24-A: FX Rate Table**

Migration 0243_fx_rates:
```sql
CREATE TABLE IF NOT EXISTS fx_rates (
  id            TEXT NOT NULL PRIMARY KEY,
  base_currency TEXT NOT NULL DEFAULT 'NGN',
  quote_currency TEXT NOT NULL,
  rate          INTEGER NOT NULL,  -- rate * 1,000,000 (integer encoding of FX rate)
  rate_inverse  INTEGER NOT NULL,  -- inverse for display
  source        TEXT NOT NULL DEFAULT 'manual',  -- 'manual' | 'paystack' | 'openexchangerates'
  effective_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  expires_at    INTEGER
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_fx_rates_pair
  ON fx_rates(base_currency, quote_currency, effective_at);
```

FX rates are stored as integers scaled by 1,000,000 to avoid floats. A CRON job fetches fresh rates from a provider (Open Exchange Rates or Paystack FX API).

**P24-B: Currency-aware transaction routing**

When a buyer transacts in GHS and the seller operates in NGN, the platform:
1. Records the transaction in the buyer's currency (GHS pesewas)
2. Converts to NGN at the prevailing FX rate for settlement
3. Records both amounts and the rate used (audit trail)

**P24-C: Paystack multi-currency**

Paystack supports NGN, GHS, USD, ZAR, KES. Their API accepts `currency` parameter on `initializePayment`. The existing payment route must pass the correct currency.

For CFA and USDT, Paystack does not support them. Alternative processors needed. **FOUNDER DECISION REQUIRED** on CFA and USDT payment processors.

**P24-D: Locale routing for CFA**

Côte d'Ivoire requires the `fr` locale (Issue 6 — add `fr.ts` stub). The locale detection must also detect `fr-CI` Accept-Language header and route to `fr`.

**P24-E: Display currency preference**

Workspace settings: operator can set their preferred display currency. This does not affect transaction currency.

#### Migration Plan

| Migration | Content |
|---|---|
| 0243 | `fx_rates` table |
| 0244 | `workspace_currency_preference` column on workspaces |
| 0245 | `transactions.original_currency_code`, `transactions.original_amount` columns (dual-currency recording) |

#### Entitlements

- Multi-currency display: available to all plans
- Multi-currency transactions (non-NGN): starter+ only
- USDT settlement: enterprise only

#### Compliance Implications

- **CBN**: Operating in FX (USD, GHS, KES, ZAR) in Nigeria requires CBN FX license for financial institutions. For marketplace operators, this may be classified as FX dealing. **LEGAL REVIEW REQUIRED.**
- **NDPR**: FX transaction data is financial PII in some jurisdictions. Standard PII protection applies.

---

### P25 — B2B Marketplace

#### What This Phase Means

P25 builds a platform-level, entity-to-entity B2B discovery and commerce layer. Unlike the consumer-facing `apps/public-discovery` (geography-based business listing), the B2B marketplace enables:
- Wholesale orders between businesses (e.g., bakery orders flour from agro-input supplier)
- RFQ (Request for Quotation) with negotiation
- Bulk pricing tiers
- Entity-to-entity trust (claim verification status as trust signal)
- Invoicing and fulfillment tracking

#### Why It Fits

The existing entity model, claim FSM, negotiation engine (`@webwaka/negotiation`), relationship model (`@webwaka/relationships`), and 159 vertical profiles give WebWaka a unique advantage: every entity already has structured data, a verification status, and a relationship graph. The B2B marketplace layers commerce on top of existing trust infrastructure.

#### Prerequisites

- P21 (bank transfer as payment method) — REQUIRED (B2B typically uses bank transfer)
- P24 (multi-currency) — REQUIRED for cross-border B2B
- P22 (AI SuperAgent) — optional but enables AI matching and RFQ generation

#### Feature Decomposition

**P25-A: B2B Entity Discovery**

New endpoint for B2B discovery (separate from consumer discovery):
```
GET /marketplace/b2b/search?category=&state=&lga=&verified_only=true&vertical=
```
Returns entity profiles with: verification status, claim tier, rating, product catalog summary, payment methods accepted, minimum order value.

**P25-B: RFQ System**

```
POST /marketplace/rfq                  — buyer creates RFQ
GET  /marketplace/rfq/:id              — get RFQ status
POST /marketplace/rfq/:id/bid          — seller submits bid
POST /marketplace/rfq/:id/accept-bid   — buyer accepts a bid
POST /marketplace/rfq/:id/counter      — seller counters
POST /marketplace/rfq/:id/close        — buyer closes without accepting
```

The negotiation engine (`@webwaka/negotiation`) already implements price negotiation. The RFQ system wraps it with multi-seller context.

**P25-C: B2B Order Lifecycle**

```
RFQ accepted → Purchase Order (PO) created → Delivery confirmed → Invoice issued → Payment
```

States: `rfq_accepted → po_created → in_fulfillment → delivered → invoiced → paid`

**P25-D: B2B Invoice Generation**

Automated invoice PDF generation using Cloudflare's browser rendering or a PDF library. Invoice includes: buyer/seller entity details, line items (from PO), payment terms (bank transfer details from P21), amount in agreed currency (from P24).

**P25-E: Entity Trust Graph**

The `@webwaka/relationships` package defines entity-to-entity relationships. P25 activates:
- `SUPPLIER_OF` relationship (agro-input → bakery)
- `CUSTOMER_OF` relationship (bakery → agro-input)
- Trust score (based on claim tier × verification tier × transaction count)

**P25-F: Dispute Resolution**

Simple dispute FSM:
```
open → under_review → resolved | escalated
```
Escalated disputes surface to platform admin dashboard.

#### Data Model Changes

| Migration | Content |
|---|---|
| 0246 | `b2b_rfqs` table (RFQ with multi-seller bids) |
| 0247 | `b2b_purchase_orders` table |
| 0248 | `b2b_invoices` table |
| 0249 | `b2b_disputes` table |
| 0250 | `entity_trust_scores` materialized table |

#### Cross-Vertical Implications

B2B marketplace is vertical-aware but not vertical-specific. A bakery (vertical: bakery) can transact with an agro-input supplier (vertical: agro-input). The `entity_type` and `vertical` fields on both sides of the transaction are recorded for analytics.

B2B-relevant vertical pairs (high priority to pre-configure):
- agro-input → farm, bakery, food-processing, restaurant
- wholesale-market → market, supermarket, restaurant
- building-materials → construction
- printing-press → advertising-agency, pr-firm

#### Entitlements

| Plan | B2B Marketplace Features |
|---|---|
| free | B2B discovery only (search, view profiles) |
| starter | RFQ (send only), receive bids |
| growth | Full RFQ + PO + invoice |
| enterprise | Full + dispute resolution API + trust score API + bulk export |

#### Definition of Done

- [ ] B2B entity search returning verified profiles with trust scores
- [ ] RFQ creation, bidding, acceptance, and counter-offer flow working
- [ ] PO creation linked to accepted RFQ
- [ ] Invoice generated and downloadable
- [ ] Bank transfer payment linked to PO
- [ ] Entity-to-entity relationship created on first transaction
- [ ] Dispute creation and platform-admin review workflow

---

## 5. Recommended Sequencing

### Foundational First (Blocking Dependencies)

```
[NOW] Issue 7 (DB Indexes) → fastest win, no dependencies
[NOW] Issue 2 (Vertical AI Configs) → no dependencies, blocks P22
[NOW] Issue 4 (Projections CRON) → blocks Issue 8, P22
[NOW] Issue 3 (Changeset Publishing) → no dependencies, independent
```

### In Parallel with Foundation

```
[PARALLEL] Issue 5 (OpenAPI spec P20 routes) → no code dependencies, docs-only
[PARALLEL] Issue 6 (i18n completeness + fr stub) → no code dependencies
[PARALLEL] Issue 9 (k6 CI smoke) → CI-only change, no code dependencies
```

### After Foundation

```
[AFTER Issue 4] Issue 8 (HITL CRON) → requires projections CRON
[AFTER Issue 1 + 8] P22 (AI SuperAgent Production)
[AFTER Issue 7] P21 (Bank Transfer) → high-frequency tables need indexes first
```

### Blocked on Founder Decision

```
[DECISION REQUIRED] Issue 3 → npm vs GitHub Packages decision
[DECISION REQUIRED] Issue 1 → existing user grandfathering approach
[DECISION REQUIRED] Issue 10 → canary automation trigger policy
[DECISION REQUIRED] P24 → CFA/USDT processor selection + CBN/legal review
[DECISION REQUIRED] P25 → go/no-go on B2B marketplace timing
```

### Feature-Flagged (Not yet in default path)

```
Issue 1 enforcement → deploy with EMAIL_VERIFICATION_ENFORCEMENT_DATE env var
P22 autonomy level enforcement → feature flag per vertical
P24 non-NGN currencies → gated by entitlement + feature flag
P25 B2B marketplace → separate entry point, not in existing workspace-app nav
```

### Staging-First

```
All projections CRON changes → staging-only for 1 week before production
All HITL enforcement changes → staging-only for 1 week
Bank transfer NUBAN integration → staging with test Paystack key first
k6 load tests → staging only (never run against production)
```

### Must Remain Manual

```
Canary 100% promotion → requires manual GitHub Actions approval
npm publish → remains manual until Release PR workflow is tested
NCC *384# registration → human admin action only
Production DB migrations → human-supervised (wrangler d1 migrations apply --remote)
```

---

## 6. 30/60/90-Day Roadmap

### Days 1–30 (P21 Foundation + Issue Resolution Sprint)

**Workstream A: Database & Performance**
- Migration 0234 (projection_checkpoints)
- Migration 0235 (performance indexes — HITL, entities, subscriptions, sessions)
- Migration 0236 (hitl_escalations)
- Migration 0237 (bank_transfer_orders)
- Migration 0238 (workspace default_payment_method)

**Workstream B: Vertical AI Completeness**
- Generate and review all 142 missing vertical AI configs
- Add DEFAULT_VERTICAL_AI_CONFIG + null-safe getVerticalAiConfig
- Add governance check `check-ai-vertical-config.ts`
- Tests: 159 verticals × default config coverage

**Workstream C: Projections + HITL CRON**
- Add `scheduled` export to projections/index.ts
- Add `[triggers]` to projections wrangler.toml
- Add `expireAllStale` to hitl-service.ts
- Add budget reset to CRON handler
- Tests for all CRON behaviors

**Workstream D: OpenAPI + i18n**
- Add P20 routes to v1.yaml
- Add ~25 new keys to en.ts + all 4 other locales
- Add `fr.ts` stub (full key set, French translation)
- Add key coverage governance check

**Workstream E: Email Verification Enforcement**
- Implement `email-verification-enforcement.ts` middleware
- Extend auth.ts SELECT to include email_verified_at
- Dashboard warning banner in Dashboard.tsx
- Settings security tab verification status
- Auth context type extension

### Days 31–60 (P21 Core + P22 + CI Improvements)

**Workstream F: Bank Transfer (P21-M1 through P21-M3)**
- BankTransferFSM implementation
- All bank transfer routes + tests
- Proof of payment upload via R2
- Paystack NUBAN integration (staging)
- Workspace default payment method setting
- Frontend BankTransfer.tsx page

**Workstream G: AI SuperAgent Production (P22)**
- SpendControls enforcement at POST /superagent/chat call time
- HITL Level 3 notification routing
- Autonomy level enforcement per vertical config
- Partner pool depletion alerts
- Migration 0240, 0241

**Workstream H: CI Improvements**
- k6 smoke job in ci.yml (push to staging only)
- load-test.yml (scheduled nightly)
- Canary error rate gate automation
- Changeset release PR workflow + .npmrc + package.json publishConfig

### Days 61–90 (P23 Analytics + P21 Completion + P24 Foundation)

**Workstream I: Analytics Dashboard (P23)**
- Tenant analytics API routes (5 endpoints)
- Migration 0242 (analytics_snapshots)
- Projections CRON: daily snapshot computation
- Frontend Analytics.tsx page
- Partner revenue dashboard API
- Entitlement gating

**Workstream J: P21 Completion (M4–M5)**
- CRON expiry for bank transfer orders
- Fraud controls (rate limiting, amount caps)
- Dispute creation (basic)
- Offline confirmation queue integration
- Full E2E test suite for bank transfer flow

**Workstream K: P24 Foundation**
- FX rates table (migration 0243)
- FX rate CRON fetch (Open Exchange Rates API)
- fr.ts locale completion (French translations)
- Paystack multi-currency (NGN, GHS, USD, ZAR — Paystack-supported)
- Display currency preference in workspace settings

---

## 7. PR / Workstream Slicing

| # | Branch Name | PR Objective | Scope | Key Files | Test Requirements | Rollout Notes |
|---|---|---|---|---|---|---|
| 1 | `fix/db-performance-indexes` | Add compound indexes for high-frequency queries | Migration 0235 | `0235_performance_indexes.sql` + rollback | CI-003 rollback check must pass | Apply staging first; verify EXPLAIN QUERY PLAN |
| 2 | `fix/vertical-ai-config-completeness` | All 159 verticals have AI configs | `vertical-ai-config.ts`, governance check | `packages/superagent/src/vertical-ai-config.ts`, `check-ai-vertical-config.ts` | Tests for all 159 slugs; governance check in CI | No runtime risk — config only |
| 3 | `feat/projections-cron` | Projections worker CRON scheduling | `projections/index.ts`, `wrangler.toml`, migration 0234 | Projections entry + wrangler + migration | CRON handler unit tests; idempotency test | Staging CRON only for 1 week |
| 4 | `feat/hitl-expiry-cron` | Cross-tenant HITL expiry + budget reset | `hitl-service.ts`, `projections/index.ts`, migration 0236 | hitl-service.ts, projections/index.ts | hitl-service.test.ts; mock CRON tests | Requires PR #3 to merge first |
| 5 | `feat/email-verification-enforcement` | Email verification warning + API enforcement | Middleware, auth.ts, Dashboard.tsx, Settings.tsx | New middleware, auth.ts, workspace-app pages | 50+ new tests; no regression in 2458 | Feature-flag with env var; deploy staging 1 week first |
| 6 | `docs/openapi-p20-routes` | Add P20 routes to OpenAPI spec | v1.yaml only | `docs/openapi/v1.yaml` | Redocly lint must pass | No code change; safe to merge any time |
| 7 | `feat/i18n-completeness` | Expand locale keys, add fr.ts stub | i18n package | `packages/i18n/src/locales/*.ts` | Coverage matrix tests; all 5 locales 100% key coverage | No runtime impact |
| 8 | `feat/k6-ci-smoke` | k6 smoke job in CI (push to staging only) | `.github/workflows/ci.yml`, new load-test.yml | CI workflows | No unit test requirement (workflow-only) | Requires STAGING_API_URL + STAGING_SMOKE_TOKEN secrets |
| 9 | `feat/changeset-publish-infra` | Changeset Release PR automation + .npmrc | CI workflows, package.json files | `.npmrc`, `.github/workflows/release-pr.yml`, package.json `publishConfig` | Test Release PR creation on staging branch | Requires founder decision on npm vs GitHub Packages |
| 10 | `fix/canary-error-rate-gate` | Automate canary error rate check + rollback | deploy-canary.yml | `.github/workflows/deploy-canary.yml` | Manual workflow test on staging | Requires CLOUDFLARE_ANALYTICS_TOKEN secret |
| 11 | `feat/bank-transfer-m1` | Bank transfer order FSM + routes (P21-M1) | Migrations 0237, 0238 + routes + package | bank-transfer-fsm.ts, bank-transfer.ts, routes | FSM unit tests, route integration tests | Staging only; no Paystack NUBAN yet |
| 12 | `feat/bank-transfer-m2` | Proof of payment upload (P21-M2) | R2 upload + submit-proof route | bank-transfer.ts route extension | Upload tests (mocked R2) | Requires PR #11 |
| 13 | `feat/bank-transfer-m3` | Paystack NUBAN auto-confirmation (P21-M3) | Paystack integration + webhook extension | payments.ts webhook, @webwaka/payments | Contract test for NUBAN API | Staging Paystack key first |
| 14 | `feat/superagent-production-p22` | AI spend controls enforcement + HITL L3 notifications | superagent.ts route, SpendControls | superagent.ts, spend-controls.ts | Spend deduction tests, budget exceeded 429 tests | Requires PRs #3 + #4 + #2 |
| 15 | `feat/analytics-dashboard-p23` | Tenant analytics API + snapshot CRON | analytics.ts new routes + migrations + frontend | New analytics routes, Analytics.tsx, migration 0242 | T3 isolation tests, snapshot computation tests | Staging only for 2 weeks |
| 16 | `feat/fx-rates-p24` | FX rates table + CRON fetch (P24 foundation) | Migration 0243, FX fetch CRON | fx-rates.ts, projections/index.ts | FX rate integer encoding tests | CRON staging first |
| 17 | `feat/b2b-marketplace-p25` | B2B discovery + RFQ (P25-M1) | New routes, migrations 0246-0248 | b2b-rfq routes, rfq.ts package | RFQ FSM tests, T3 isolation | Requires P21 + P24 foundation |

---

## 8. Stakeholder Decision Register

| # | Decision | Domain | Context | Options | Blocking |
|---|---|---|---|---|---|
| D1 | Email verification: existing user grandfathering | Product | Should users created before enforcement be auto-verified or given a 7-day grace from enforcement date? | A: Auto-verify all pre-deployment users. B: Give 7-day grace from enforcement deploy date. | Issue 1 implementation |
| D2 | Invited users email verification | Product | Should workspace-invite-accepted users get a shorter grace period? | A: Same 7-day grace. B: 48h grace (admin-vouched). | Issue 1 implementation |
| D3 | AI consent requires verified email | Compliance | Should `aiConsentGate` check email_verified_at? | A: Yes (stronger compliance). B: No (blocks AI for unverified users in grace period). | Issue 1 + P22 |
| D4 | Package publishing destination | Engineering | GitHub Packages vs public npm vs private npm org | A: GitHub Packages (free, private, no setup). B: Private npm org (paid). C: Public npm (free, open). | Issue 3 |
| D5 | Which packages are external-facing | Product/Engineering | @webwaka/types, auth, core, entitlements are candidates | Founder to approve publish scope list | Issue 3 |
| D6 | Canary automation trigger | Engineering/Ops | Auto-trigger on staging merge vs remain manual | A: Auto on staging merge. B: Keep manual. | Issue 10 |
| D7 | Canary error rate threshold | Engineering/Ops | What % 5xx rate triggers rollback? | Proposed: 0.5%. Alternative: 1%. | Issue 10 |
| D8 | Bank transfer dispute/escrow policy | Legal/Product | Does the platform hold funds during dispute period? This may require CBN licensing. | A: Platform is record-keeper only (no escrow). B: Platform escrows pending dispute resolution (requires CBN). | P21 |
| D9 | Paystack NUBAN approval | Ops | Paystack NUBAN requires Paystack business approval. Has this been applied for? | Human action: contact Paystack account manager | P21-M3 |
| D10 | CFA payment processor | Finance/Product | Paystack does not support CFA (XOF/XAF). Which processor for Côte d'Ivoire? | Options: Campay, CinetPay, Wave, Orange Money | P24 |
| D11 | USDT precision model | Engineering/Finance | Store as integer cents (1 USDT = 100 units) vs micro-USDT (1M units) vs string | A: 100 units (simple, loses precision). B: 1M units (precise). C: Exclude USDT from MVP. | P24 |
| D12 | CBN FX license | Legal/Compliance | Operating in USD/GHS/KES/ZAR transactions in Nigeria may require CBN FX license | Legal review required before P24 launch | P24 |
| D13 | k6 load test frequency | Engineering/Ops | Nightly vs weekly? k6 Cloud vs self-hosted? | A: Nightly self-hosted. B: Weekly k6 Cloud. | Issue 9 |
| D14 | B2B marketplace go/no-go timing | Product | P25 is substantial. Should it begin in the P21–P24 window or be a separate roadmap? | A: Begin Q3 2026. B: Defer to Q4 2026. | P25 |
| D15 | HITL L3 notification channel | Product/Ops | Admin notifications for regulatory HITL expiry: email only, or in-app? | A: Email via Resend (existing). B: Email + in-app badge. | P22 |

---

## 9. Overtaken-by-Events Register

This section documents prior roadmap assumptions and wording that must **no longer be treated as active plan**.

| # | Prior Statement / Source | Status | Current Direction | Action Required |
|---|---|---|---|---|
| OE-1 | **P21 = "USSD Advanced Features"** — WebWaka_Audit_Metadata.json, WebWaka_Comprehensive_Master_Report.md, implementation-plan.md. Listed as P21: "USSD Advanced Features (*384# airtime, payment, profile claims)". | **OVERTAKEN BY EVENTS** | P21 is now: Offline bank transfer as default payment method across all tiers and verticals. | Update `docs/ops/implementation-plan.md`, `WebWaka_Audit_Metadata.json`, `replit.md`, any governance docs that reference the old P21. All agents/documentation must use the new P21 definition. |
| OE-2 | **`fr` locale exists** — WebWaka_Audit_Metadata.json states `"supported_locales": ["en-NG", "yo (Yoruba)", "ig (Igbo)", "ha (Hausa)", "pid (Pidgin)", "fr (French)"]` | **INCORRECT / NOT IMPLEMENTED** | `fr` does not exist in `packages/i18n/src/locales/`. The actual locales are `en, ha, yo, ig, pcm`. `pid` is an error — the correct locale code is `pcm` (Nigerian Pidgin Creole). | Correct audit documents. Add `fr.ts` as part of Issue 6 (planned in this document). Remove `pid` references; use `pcm`. |
| OE-3 | **USSD_SESSION_KV "to be provisioned"** — Audit states USSD_SESSION_KV is a "local-dev-placeholder" with production marked "NOT_YET_PROVISIONED". The old P21 plan was to do USSD advanced features, which would drive this. | **STILL REQUIRED BUT DE-PRIORITIZED** | USSD gateway still exists and needs USSD_SESSION_KV. However, P21 priority shift means USSD advanced features (the primary consumer) are deferred. Basic USSD health endpoint still needs the namespace provisioned. | Provision USSD_SESSION_KV for production (human admin action). Document as independent of the new P21 direction. |
| OE-4 | **`apps/projections` "full implementation in M7"** — The analytics rebuild stub says "Analytics rebuild queued (stub — full implementation in M7)". M7 is labeled "Community" in the milestone tracker. | **LABEL OUTDATED** | The analytics rebuild is planned for P23 (not M7). M7 completed community features. The analytics stub remains valid as a placeholder. | Update the stub comment in `apps/projections/src/index.ts` to reference P23, not M7. |
| OE-5 | **`mass-transit` vertical in VERTICAL_AI_CONFIGS** — The AI config has a `mass-transit` slug. But the 159 verticals list does not include `mass-transit` as a named package or route. `motor-park` and `transit` exist, but `mass-transit` does not appear in the vertical registry. | **POTENTIAL MISMATCH** | The `mass-transit` config entry may refer to an internal vertical name that was later renamed or merged into `transit`. | Verify in Issue 2 whether `mass-transit` should be `transit` and update slug to match the registered vertical. If no `mass-transit` vertical exists, remove or rename this config entry. |
| OE-6 | **USSD shortcode *384#** — Listed as "pending NCC registration" as a human action item. | **REMAINS PENDING (DE-PRIORITIZED WITH NEW P21)** | NCC registration is still needed for any USSD service. The new P21 (bank transfer) does not require USSD. The shortcode priority is reduced but not abandoned. | Keep NCC registration in the human action queue. No code changes needed for registration. Re-prioritize after P21 bank transfer is stable. |

---

## 10. Action Matrix

| Item | Priority | Owner | Classification | Dependencies | Effort | Risk | Sprint/Phase |
|---|---|---|---|---|---|---|---|
| DB performance indexes (migration 0235) | P0 | Replit Agent | Code + DB | None | S | Low | Immediate |
| Vertical AI config completeness (all 159) | P0 | Replit Agent | Code | None | M | Low | Immediate |
| Projections CRON scheduling | P0 | Replit Agent | Code + Config | None | S | Low | Immediate |
| HITL expiry CRON | P0 | Replit Agent | Code + DB | Projections CRON | S | Low | Immediate |
| Email verification enforcement middleware | P1 | Replit Agent | Code | D1 (existing user policy) | M | Medium | Days 1–14 |
| Email verification dashboard banner | P1 | Replit Agent | Frontend | Email enforcement middleware | S | Low | Days 1–14 |
| OpenAPI spec P20 routes | P1 | Replit Agent | Docs | None | S | Low | Days 1–7 |
| i18n locale key expansion (P20 strings) | P1 | Replit Agent | Code | None | S | Low | Days 1–14 |
| fr.ts locale stub (for P24) | P1 | Replit Agent | Code | D14 (fr locale decision) | S | Low | Days 1–14 |
| k6 CI smoke job | P1 | Replit Agent | Config/CI | STAGING_SMOKE_TOKEN secret | S | Low | Days 7–14 |
| Changeset Release PR workflow | P1 | Replit Agent + Human | Config/CI + Human | D4 (npm destination), D5 (scope) | M | Low | Days 7–21 |
| npm/GitHub Packages setup | P1 | Human (founder) | Human | D4 decision | S | Low | Days 7–21 |
| Canary error rate gate automation | P2 | Replit Agent | Config/CI | CLOUDFLARE_ANALYTICS_TOKEN | S | Low | Days 14–21 |
| USSD_SESSION_KV production provisioning | P2 | Human (ops) | Human/Infra | None | S | Low | Days 1–7 |
| NCC *384# shortcode registration | P2 | Human (founder) | Human/Ops | None | L | High | Ongoing |
| P21-M1: Bank transfer orders FSM + routes | P1 | Replit Agent | Code + DB | DB indexes done | L | Medium | Days 21–35 |
| P21-M2: Proof of payment upload (R2) | P1 | Replit Agent | Code | P21-M1 | M | Low | Days 35–42 |
| P21-M3: Paystack NUBAN integration | P1 | Replit Agent + Human | Code + Human | D9 (Paystack approval) | M | High | Days 42–56 |
| P21-M4: Frontend bank transfer flow | P1 | Replit Agent | Frontend | P21-M1+M2 | M | Low | Days 35–49 |
| P21-M5: Expiry CRON + fraud controls | P1 | Replit Agent | Code | P21-M1 | S | Low | Days 49–56 |
| P21 bank transfer legal review | P0 | Human (founder/legal) | Human | P21-M1 design | M | High | Days 1–14 (parallel) |
| Paystack NUBAN business approval | P1 | Human (ops) | Human | None | L | High | Days 1–21 (parallel) |
| P22: SpendControls enforcement at chat | P1 | Replit Agent | Code | Projections CRON, AI config | M | Medium | Days 35–49 |
| P22: HITL L3 notification (email) | P1 | Replit Agent | Code | HITL expiry CRON | S | Low | Days 35–49 |
| P22: Autonomy level enforcement | P1 | Replit Agent | Code | AI config completeness | M | Medium | Days 42–56 |
| P22: Monthly spend reset CRON | P1 | Replit Agent | Code | Projections CRON | S | Low | Days 35–42 |
| P23: Tenant analytics API routes | P2 | Replit Agent | Code | DB indexes | L | Low | Days 56–70 |
| P23: Analytics snapshots CRON | P2 | Replit Agent | Code + DB | Projections CRON | M | Low | Days 56–70 |
| P23: Analytics.tsx frontend | P2 | Replit Agent | Frontend | P23 API | M | Low | Days 63–77 |
| P23: Partner revenue dashboard API | P2 | Replit Agent | Code | P23 API | M | Low | Days 63–77 |
| P24: FX rates table + CRON | P2 | Replit Agent | Code + DB | None | M | Low | Days 63–77 |
| P24: CBN FX legal review | P0 | Human (founder/legal) | Human | None | L | High | Days 1–30 (parallel) |
| P24: CFA processor decision | P1 | Human (founder) | Human | D10 decision | M | High | Days 30–60 |
| P24: USDT precision model | P1 | Human (founder/engineering) | Human | D11 decision | S | Low | Days 30–60 |
| P24: Paystack multi-currency activation | P2 | Replit Agent | Code | FX rates + legal review | M | Medium | Days 70–84 |
| P25: B2B discovery + RFQ foundation | P3 | Replit Agent | Code + DB | P21 + P24 | XL | Medium | Days 77–90+ |
| P25: B2B go/no-go decision | P2 | Human (founder) | Human | D14 decision | S | Low | Days 30–45 |
| Update implementation-plan.md (P21 OE-1) | P1 | Replit Agent | Docs | None | S | Low | Immediate |
| Update audit docs (OE-2 fr locale, OE-5 mass-transit) | P1 | Replit Agent | Docs | None | S | Low | Immediate |
| Check VERTICAL_AI_CONFIGS for mass-transit slug validity (OE-5) | P1 | Replit Agent | Code | None | S | Low | Immediate |
| STAGING_SMOKE_TOKEN service account creation | P1 | Human (ops) | Human/Infra | None | S | Low | Days 7–14 |

**Effort classes:** S = 0.5–1 day · M = 1–3 days · L = 3–7 days · XL = 7+ days  
**Risk classes:** Low = reversible, well-understood · Medium = some irreversible risk, needs staging first · High = legal/compliance/financial exposure, requires founder approval

---

*End of WebWaka Detailed Implementation Plan — Remaining Platform Gaps and Phases P21–P25*  
*Date: 2026-04-14 | Platform: WebWaka OS v1.0.0 P20 COMPLETE | 2,458 tests passing*
