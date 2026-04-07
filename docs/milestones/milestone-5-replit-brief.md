# WebWaka OS — Milestone 5 Replit Brief

**Prepared by:** Base44 Super Agent (OpenClaw)
**Date:** 2026-04-07, 21:49 WAT
**Milestone:** 5 — Claim-First Onboarding + Workspace Activation
**Status:** ACTIVE — Founder approved Milestone 4 at 21:36 WAT today

---

## Context

Milestone 4 delivered the public discovery layer:
- `apps/api/src/routes/discovery.ts` — 5 public endpoints (search, profile, claim-intent, nearby, trending)
- `packages/search-indexing` — FTS5 type contracts + indexing scaffold
- `infra/db/migrations/0008_init_search_index.sql` — `search_entries` + `search_fts` FTS5 virtual table
- `infra/db/migrations/0009_init_discovery_events.sql` — `discovery_events` audit log
- `apps/api/src/lib/search-index.ts` — `indexIndividual`, `indexOrganization` wired on entity POST
- **171 tests, 0 failures | 12 packages typecheck clean**

Milestone 5 closes the **see → claim → operate** loop. A user who found an entity in M4 can now register, claim it, have their claim verified, activate a workspace, and see a basic back-office dashboard shell.

**No payments in M5.** Subscriptions already have a schema (migration 0004). Paystack integration is Milestone 6.

---

## Repo State You Are Starting From

**Branch:** `main`
**HEAD:** `30ad5f8`
**Baseline:** All 171 tests pass. All 12 packages typecheck clean.

**BRANCH DISCIPLINE — READ FIRST**

Create branch: `feat/milestone-5` from current `main`.
Do NOT push directly to `main`. This is a governance rule.
Open a PR: `feat/milestone-5` → `main`. Base44 will review and merge.

---

## What Must NOT Be Done in Milestone 5

- No payment integration (Paystack, Stripe, Flutterwave) — Milestone 6
- No frontend apps (no React, no Next.js, no Vite) — `apps/api` is Worker-only
- No email sending / OTP delivery — assume password-based auth only for now
- No brand surface activation — Milestone 7+
- No direct pushes to `main`
- No Express or Node.js HTTP servers
- No modifications to `packages/types`, `packages/auth`, `packages/core/*` without a TDR
- No `any` types — use `unknown` and narrow where needed

---

## Packages Already Implemented (DO NOT MODIFY without TDR)

```
packages/types/             ← @webwaka/types
packages/auth/              ← @webwaka/auth
packages/core/geography/    ← @webwaka/geography
packages/core/politics/     ← @webwaka/politics
packages/entities/          ← @webwaka/entities (M3 — full CRUD layer)
packages/entitlements/      ← @webwaka/entitlements (M3 — plan matrix + guards)
packages/relationships/     ← @webwaka/relationships (M3)
packages/search-indexing/   ← @webwaka/search-indexing (M4 — scaffold)
packages/offline-sync/      ← @webwaka/offline-sync (scaffold only)
packages/ai-abstraction/    ← @webwaka/ai (scaffold only)
```

---

## Database State You Are Starting From

Migrations already applied (0001–0009):

| Migration | Tables |
|---|---|
| 0001 | `places` |
| 0002 | `individuals`, `organizations` |
| 0003 | `workspaces`, `memberships` |
| 0004 | `subscriptions` |
| 0005 | `profiles` |
| 0006 | `political_offices`, `political_assignments` |
| 0007 | `relationships`, `political_assignments_constraint` |
| 0007a | Constraint refinement |
| 0008 | `search_entries`, `search_fts` (FTS5) |
| 0009 | `discovery_events` |

The `profiles` table already has:
- `claim_state` column with full lifecycle: `seeded → claimable → claim_pending → verified → managed → branded → monetized → delegated`
- `profiles.ts` repository with `seedProfile()`, `advanceClaimState()`, `getProfileBySubject()`

---

## What Must Be Built in Milestone 5

### Task 1 — Migration 0010: Users Table

**File:** `infra/db/migrations/0010_init_users.sql`

```sql
-- users table — platform-level identity (not workspace-scoped)
CREATE TABLE IF NOT EXISTS users (
  id            TEXT NOT NULL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,       -- PBKDF2: "base64salt:base64hash"
  full_name     TEXT,
  phone         TEXT,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

Note: The existing `/auth/login` route already queries a `users` table. This migration formalises it. The column names MUST match what auth-routes.ts expects: `id`, `email`, `password_hash`, `workspace_id`, `tenant_id`, `role`.

Wait — the auth route queries `workspace_id`, `tenant_id`, `role` from users. This means the users table needs those columns OR the auth route must JOIN to memberships. The correct approach (per TDR-0008 and T3) is to add `workspace_id`, `tenant_id`, `role` to the users table as **default/fallback** context. A user can belong to multiple workspaces via `memberships` — the users row reflects their primary/default workspace context.

Full schema:
```sql
CREATE TABLE IF NOT EXISTS users (
  id              TEXT NOT NULL PRIMARY KEY,
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,       -- PBKDF2: "base64salt:base64hash"
  full_name       TEXT,
  phone           TEXT,
  workspace_id    TEXT REFERENCES workspaces(id),
  tenant_id       TEXT,
  role            TEXT NOT NULL DEFAULT 'member'
                  CHECK (role IN ('super_admin', 'admin', 'manager', 'agent', 'cashier', 'member')),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
```

---

### Task 2 — Migration 0011: Claim Requests Table

**File:** `infra/db/migrations/0011_init_claim_requests.sql`

This table tracks the full claim audit trail — every transition from `claim_pending` onwards must have a claim request record. Separate from the lightweight `discovery_events` (M4) which only captures intent.

```sql
CREATE TABLE IF NOT EXISTS claim_requests (
  id              TEXT NOT NULL PRIMARY KEY,
  profile_id      TEXT NOT NULL REFERENCES profiles(id),
  claimant_user_id TEXT NOT NULL REFERENCES users(id),
  subject_type    TEXT NOT NULL,
  subject_id      TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  -- Claimant attestation text (free text, stored as submitted)
  attestation     TEXT,
  -- Internal reviewer notes (admin only, never exposed in public API)
  reviewer_notes  TEXT,
  reviewed_by     TEXT REFERENCES users(id),
  reviewed_at     INTEGER,
  ip_hash         TEXT,               -- SHA-256 of submitting IP (security-baseline.md §5)
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_claim_requests_profile_id ON claim_requests(profile_id);
CREATE INDEX IF NOT EXISTS idx_claim_requests_claimant_user_id ON claim_requests(claimant_user_id);
CREATE INDEX IF NOT EXISTS idx_claim_requests_status ON claim_requests(status);
```

---

### Task 3 — Auth: Registration Endpoint

**File:** `apps/api/src/routes/auth-routes.ts` (extend existing file)

Add `POST /auth/register`:

**Request body (Zod-validated):**
```typescript
{
  email: string;       // required, valid email format
  password: string;    // required, min 8 chars
  full_name?: string;
  phone?: string;
}
```

**Behaviour:**
1. Validate with Zod — 400 on invalid
2. Check for existing user by email — 409 if already exists (`{ error: "Email already registered." }`)
3. Hash password: PBKDF2 SHA-256, 100,000 iterations, random 16-byte salt — same pattern as `/auth/login` verification
4. Generate user ID using the ID generation pattern from `@webwaka/entities` (see `packages/entities/src/ids.ts`)
5. INSERT into `users` — `workspace_id` and `tenant_id` are NULL until workspace is created
6. Return `201` with `{ id, email, full_name }` — never echo `password_hash`

**No JWT issued on register** — user must separately call `/auth/login` after registering.

---

### Task 4 — Claim Routes

**File:** `apps/api/src/routes/claim-routes.ts` (new file)

All claim routes require a valid JWT (auth middleware must be applied in `index.ts`).

#### 4a. `POST /claim/submit`

Submit a claim against a profile. Advances the profile from `claimable` → `claim_pending`.

**Request body (Zod-validated):**
```typescript
{
  profile_id: string;    // required — must exist, must be in 'claimable' state
  attestation?: string;  // optional free-text justification
}
```

**Behaviour:**
1. Auth required — 401 if no JWT
2. Fetch profile by `profile_id` — 404 if not found
3. Check `claim_state === 'claimable'` — 409 if not: `{ error: "Profile is not in a claimable state.", current_state: "<state>" }`
4. Hash submitting IP (`CF-Connecting-IP` || `X-Forwarded-For`) with SHA-256 — store as `ip_hash`
5. INSERT into `claim_requests` with `status = 'pending'`
6. Call `advanceClaimState(db, profile_id, 'claim_pending')` from `packages/entities/src/repository/profiles.ts`
7. Return `201` with `{ claim_request_id, profile_id, status: 'pending' }`

**Edge cases:**
- If `advanceClaimState` throws `InvalidClaimTransitionError` — return 409
- If the authenticated user already has a pending claim request for this profile — return 409: `{ error: "You already have a pending claim for this profile." }`

#### 4b. `GET /claim/my-claims`

List all claim requests submitted by the authenticated user.

**Response:**
```typescript
{
  data: Array<{
    id: string;
    profile_id: string;
    subject_type: string;
    subject_id: string;
    status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
    attestation: string | null;
    created_at: string;
    reviewed_at: string | null;
  }>
}
```

Note: Never include `reviewer_notes` or `reviewed_by` in this response (admin-only fields).

#### 4c. `POST /claim/withdraw/:claim_request_id`

Withdraw a pending claim.

**Behaviour:**
1. Auth required
2. Fetch claim request — 404 if not found
3. Verify `claimant_user_id === auth.userId` — 403 if not
4. Check `status === 'pending'` — 409 if already reviewed/withdrawn
5. UPDATE claim request `status = 'withdrawn'`
6. Revert profile: call `advanceClaimState(db, profile_id, 'claimable')` — restore to claimable
7. Return `200` with `{ claim_request_id, status: 'withdrawn' }`

#### 4d. `POST /claim/approve/:claim_request_id` (admin only)

Approve a claim. Requires `role === 'admin'` or `role === 'super_admin'`.

**Behaviour:**
1. Auth required + `requireRole(['admin', 'super_admin'])` check
2. Fetch claim request — 404 if not found
3. Check `status === 'pending'` — 409 otherwise
4. UPDATE claim request: `status = 'approved'`, `reviewed_by = auth.userId`, `reviewed_at = unixepoch()`
5. Advance profile: `advanceClaimState(db, profile_id, 'verified', auth.userId)`
6. Return `200` with `{ claim_request_id, status: 'approved', profile_id }`

#### 4e. `POST /claim/reject/:claim_request_id` (admin only)

Reject a claim. Requires `role === 'admin'` or `role === 'super_admin'`.

**Request body:**
```typescript
{ reviewer_notes?: string }
```

**Behaviour:**
1. Auth required + role check
2. Fetch claim request — 404 if not found
3. Check `status === 'pending'` — 409 otherwise
4. UPDATE claim request: `status = 'rejected'`, `reviewed_by`, `reviewed_at`, `reviewer_notes`
5. Revert profile: `advanceClaimState(db, profile_id, 'claimable')`
6. Return `200` with `{ claim_request_id, status: 'rejected', profile_id }`

---

### Task 5 — Workspace Routes

**File:** `apps/api/src/routes/workspace-routes.ts` (new file)

All workspace routes require auth.

#### 5a. `POST /workspaces` — Create workspace

Only a user whose profile is in `verified` state can activate a workspace. This is the key lifecycle gate.

**Request body (Zod-validated):**
```typescript
{
  name: string;                               // required, 2–100 chars
  owner_type: 'individual' | 'organization'; // required
  owner_id: string;                           // required — entity ID
  profile_id: string;                         // required — must be verified claim
}
```

**Behaviour:**
1. Auth required
2. Fetch profile by `profile_id` — 404 if not found
3. Check `claim_state === 'verified'` — 409 if not: `{ error: "Workspace activation requires a verified claim.", current_state: "<state>" }`
4. Check that no workspace already exists for this `owner_type` + `owner_id` + `tenant_id` — 409 if duplicate
5. Generate workspace ID
6. INSERT into `workspaces`: `tenant_id = auth.tenantId` (if set) else generate a new `tenant_id` = `tenant:${workspaceId}` (this is the tenant boundary for a new claimant — until they have a tenant_id from an existing org, the workspace IS the tenant)
7. INSERT into `subscriptions`: `plan = 'free'`, `status = 'active'`, `current_period_start = unixepoch()`, `current_period_end = unixepoch() + 31536000` (1 year free tier)
8. INSERT into `memberships`: the creating user is `role = 'admin'`
9. UPDATE `users` set `workspace_id = workspaceId`, `tenant_id = tenantId`, `role = 'admin'`
10. Advance profile: `advanceClaimState(db, profile_id, 'managed')`
11. Return `201` with:
```typescript
{
  workspace: { id, name, owner_type, owner_id, subscription_plan, active_layers, tenant_id },
  subscription: { id, plan, status, current_period_end },
  membership: { id, role }
}
```

**IMPORTANT — Tenant isolation (T3):** The `tenant_id` is the root isolation key. Every subsequent query by this user must be scoped to this `tenant_id`. The workspace creation is the moment a new tenant boundary is established for a fresh claimant.

#### 5b. `GET /workspaces/mine` — Get my workspace

Return the authenticated user's workspace (scoped by `auth.workspaceId`).

**Behaviour:**
1. Auth required
2. Fetch workspace by `auth.workspaceId` — 404 if not found
3. Fetch active subscription for workspace
4. Fetch memberships count
5. Return:
```typescript
{
  workspace: { id, name, owner_type, owner_id, subscription_plan, active_layers, tenant_id, created_at },
  subscription: { plan, status, current_period_end },
  member_count: number
}
```

Never return `tenant_id` in any public-facing response. It's internal only and must be present only in JWT payload and internal DB queries (T3).

Wait — `tenant_id` IS returned in workspace detail (it's authenticated). But it MUST NOT be returned in any discovery or public endpoint. Workspace detail is an authenticated owner view, so `tenant_id` in the workspace response is acceptable.

#### 5c. `GET /workspaces/mine/entitlements` — Get my entitlements

**Behaviour:**
1. Auth required
2. Fetch workspace + subscription
3. Call `evaluate()` from `@webwaka/entitlements` with the workspace's plan
4. Return the full `PlanConfig` object for their current plan

---

### Task 6 — Wire New Routes in `apps/api/src/index.ts`

```typescript
import { claimRoutes } from './routes/claim-routes.js';
import { workspaceRoutes } from './routes/workspace-routes.js';

// All claim and workspace routes require auth
app.use('/claim/*', authMiddleware);
app.route('/claim', claimRoutes);

app.use('/workspaces/*', authMiddleware);
app.route('/workspaces', workspaceRoutes);
```

Update the JSDoc route map comment at the top of `index.ts` to include the new routes.

Update `apps/api/wrangler.toml` — add a comment noting migrations 0010 and 0011 must be applied.

---

### Task 7 — Update `replit.md`

Add to the "Routes" section:
```
POST /auth/register         — register a new user (no auth)
POST /claim/submit          — submit a claim request (auth required)
GET  /claim/my-claims       — list my claim requests (auth required)
POST /claim/withdraw/:id    — withdraw a pending claim (auth required)
POST /claim/approve/:id     — approve a claim (admin required)
POST /claim/reject/:id      — reject a claim (admin required)
POST /workspaces            — create and activate a workspace (auth required)
GET  /workspaces/mine       — get my workspace (auth required)
GET  /workspaces/mine/entitlements — get my plan entitlements (auth required)
```

Add to the "Migrations" section: `0010_init_users`, `0011_init_claim_requests`.

---

## Tests — Required Coverage

Minimum **25 new tests** across `apps/api/src/routes/`.

### File: `apps/api/src/routes/claim-routes.test.ts` (new)

At minimum, test:
- `POST /auth/register` — happy path (201, no password_hash in response)
- `POST /auth/register` — duplicate email → 409
- `POST /auth/register` — missing fields → 400
- `POST /claim/submit` — no auth → 401
- `POST /claim/submit` — profile not found → 404
- `POST /claim/submit` — profile not in claimable state → 409
- `POST /claim/submit` — happy path → 201, claim_request created, profile advanced to claim_pending
- `POST /claim/submit` — duplicate claim by same user → 409
- `GET /claim/my-claims` — no auth → 401
- `GET /claim/my-claims` — returns only caller's claims
- `POST /claim/withdraw/:id` — not owner → 403
- `POST /claim/withdraw/:id` — happy path → 200, profile reverted to claimable
- `POST /claim/approve/:id` — non-admin → 403
- `POST /claim/approve/:id` — happy path → 200, profile advanced to verified
- `POST /claim/reject/:id` — happy path → 200, profile reverted to claimable

### File: `apps/api/src/routes/workspace-routes.test.ts` (new)

At minimum, test:
- `POST /workspaces` — no auth → 401
- `POST /workspaces` — profile not verified → 409
- `POST /workspaces` — happy path → 201, workspace + subscription + membership created, profile → managed
- `POST /workspaces` — duplicate workspace for same entity → 409
- `GET /workspaces/mine` — no auth → 401
- `GET /workspaces/mine` — happy path → 200 with workspace + subscription + member_count
- `GET /workspaces/mine/entitlements` — happy path → 200 with free plan config (maxUsers: 3, maxPlaces: 1, layers: ["discovery"])
- `GET /workspaces/mine` — workspace not found → 404

**Mock pattern:** Follow `discovery.test.ts` mock style — mock `c.env.DB` with a D1Like object. Each test that requires auth should inject a mock `auth` context via `c.set('auth', {...})`.

**Total after M5:** 171 (M4 baseline) + 25+ (M5) = **196+ tests**

---

## Helper: `requireRole()` in auth middleware

The `apps/api/src/middleware/auth.ts` currently sets `c.set('auth', context)`. Ensure there is a `requireRole` helper available:

```typescript
// In middleware/auth.ts (or a new lib/guards.ts) — add if not already present:
export function requireRole(roles: Role[], c: Context): boolean {
  const auth = c.get('auth');
  return auth !== undefined && roles.includes(auth.role);
}
```

Use this in `claim/approve` and `claim/reject` — return 403 if role check fails.

---

## Helper: ID Generation

All new IDs must follow the existing pattern. Check `packages/entities/src/ids.ts` and use the same approach. Do not use `crypto.randomUUID()` raw — use the existing `generateId` helpers or create a `generateUserId()`, `generateClaimRequestId()`, `generateWorkspaceId()` following the same naming convention.

---

## Env Bindings

No new env bindings are needed. The existing `DB`, `JWT_SECRET`, and `ENVIRONMENT` cover everything in M5.

If rate limiting is applied to `/auth/register`, use `RATE_LIMIT_KV` which is already provisioned (see `infra/cloudflare/environments.md`). Add `RATE_LIMIT_KV: KVNamespace` to `env.ts` if not already present.

---

## Governance Compliance Checklist

Before opening the PR, verify:

- [ ] All DB queries on tenant-scoped tables include `tenant_id` predicate (T3)
- [ ] No monetary values stored as floats (T4) — subscriptions use `current_period_start/end` as INTEGER seconds, not decimal
- [ ] All entitlement checks use `@webwaka/entitlements` (T5)
- [ ] No hardcoded plan checks in business logic
- [ ] `ip_hash` uses SHA-256 via `crypto.subtle.digest` — never stores raw IP (security-baseline.md §5)
- [ ] `reviewer_notes` never appears in public API responses
- [ ] `password_hash` never appears in any API response
- [ ] `tenant_id` never appears in discovery or public endpoints
- [ ] All request bodies validated with Zod before processing (security-baseline.md §4)
- [ ] No `any` types — TypeScript strict
- [ ] No new package added without updating `pnpm-lock.yaml`
- [ ] `replit.md` updated with new routes and migrations
- [ ] 25+ new tests covering all routes and edge cases

---

## Expected Deliverables

| Deliverable | Type |
|---|---|
| `infra/db/migrations/0010_init_users.sql` | New migration |
| `infra/db/migrations/0011_init_claim_requests.sql` | New migration |
| `apps/api/src/routes/auth-routes.ts` | Modified (add `POST /auth/register`) |
| `apps/api/src/routes/claim-routes.ts` | New file |
| `apps/api/src/routes/workspace-routes.ts` | New file |
| `apps/api/src/routes/claim-routes.test.ts` | New test file |
| `apps/api/src/routes/workspace-routes.test.ts` | New test file |
| `apps/api/src/index.ts` | Modified (wire new routes) |
| `apps/api/src/env.ts` | Modified (add `RATE_LIMIT_KV` if missing) |
| `apps/api/wrangler.toml` | Modified (migration notes) |
| `replit.md` | Modified (routes + migrations) |
| `pnpm-lock.yaml` | Updated if any new deps added |

---

## Definition of Done

- [ ] Branch: `feat/milestone-5`
- [ ] PR: `feat/milestone-5` → `main` opened
- [ ] All 196+ tests pass (`pnpm -r run test`)
- [ ] All 12 packages typecheck clean (`pnpm -r run typecheck`)
- [ ] All new routes return correct status codes for all test cases
- [ ] Claim lifecycle is fully auditable via `claim_requests` table
- [ ] Workspace creation gates on verified claim state
- [ ] Free tier subscription created automatically on workspace activation
- [ ] No governance violations (see checklist above)
- [ ] `replit.md` updated

---

*Brief authored by Base44 Super Agent (OpenClaw) — QA agent for WebWaka OS.*
*Questions about this brief: tag @Base44 in the PR or issue.*
