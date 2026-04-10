# WebWaka Negotiable Pricing — Implementation Plan

**Version:** 1.0  
**Date:** 2026-04-10  
**Source:** `docs/strategy/negotiable-pricing-strategy.md`  
**Classification:** Internal Engineering

---

## Guiding Principles

1. **Negotiation is a pricing capability, not a marketplace type.** It sits alongside payment method, delivery method, and tax treatment — all optional modifiers on a price that is, by default, fixed.
2. **Fixed pricing is never degraded.** Every existing route, repository, and vertical table is untouched. Negotiation is purely additive.
3. **All money is INTEGER kobo.** No REAL, FLOAT, NUMERIC, or DOUBLE columns anywhere in this system. Discounts are expressed in INTEGER basis points (bps). 100 bps = 1%.
4. **Polymorphic listing reference.** Sessions reference listings as `(listing_type TEXT, listing_id TEXT)` — no per-vertical foreign keys.
5. **Tenant-scoped everywhere.** Every new table carries `tenant_id`. Every query filters by it.
6. **Audit-first.** Every price event writes an immutable `negotiation_audit_log` row.
7. **Seller opt-in strictly enforced.** A buyer cannot open a session on a listing whose effective `pricing_mode` is `'fixed'`.
8. **Disabled verticals are a hard gate.** The engine refuses to create sessions for the blocked vertical list (pharmacy-chain, food-vendor, bakery, petrol-station, internet-cafe, govt-school, orphanage, okada-keke, laundry, laundry-service, beauty-salon, optician).

---

## Phase 1: Core Data Model (Est: 3 days)

### Task 1.1: Migration 0181 — `vendor_pricing_policies`
**Priority:** P0  
**Est:** 2h  
**Dependencies:** []  
**Acceptance Criteria:**
- [ ] File `infra/db/migrations/0181_negotiation_vendor_policies.sql` created and idempotent (`CREATE TABLE IF NOT EXISTS`, `CREATE … INDEX IF NOT EXISTS`).
- [ ] Table has: `id TEXT PRIMARY KEY`, `workspace_id TEXT NOT NULL REFERENCES workspaces(id)`, `tenant_id TEXT NOT NULL`, `default_pricing_mode TEXT NOT NULL DEFAULT 'fixed' CHECK (default_pricing_mode IN ('fixed','negotiable','hybrid'))`, `min_price_kobo INTEGER`, `max_discount_bps INTEGER NOT NULL DEFAULT 1500`, `max_offer_rounds INTEGER NOT NULL DEFAULT 3`, `offer_expiry_hours INTEGER NOT NULL DEFAULT 48`, `auto_accept_threshold_bps INTEGER`, `eligible_buyer_kyc_tier INTEGER NOT NULL DEFAULT 1`, `wholesale_min_qty INTEGER`, `created_at INTEGER NOT NULL DEFAULT (unixepoch())`, `updated_at INTEGER NOT NULL DEFAULT (unixepoch())`.
- [ ] Unique index on `(workspace_id, tenant_id)`.
- [ ] Non-unique index on `tenant_id`.
- [ ] No REAL, FLOAT, or NUMERIC column types anywhere in the file.

**QA Verification:**
1. Run migration on empty D1 DB → table and both indexes present in `sqlite_master`.
2. Insert a row with `default_pricing_mode = 'auction'` → CHECK constraint violation returned.
3. Insert two rows with the same `(workspace_id, tenant_id)` → UNIQUE constraint violation returned.
4. Insert with `min_price_kobo = 99.5` (SQLite coerces) → verify stored value is INTEGER `99` via `typeof()`.

**Files:**
- `infra/db/migrations/0181_negotiation_vendor_policies.sql`

---

### Task 1.2: Migration 0182 — `listing_price_overrides`
**Priority:** P0  
**Est:** 2h  
**Dependencies:** [1.1]  
**Acceptance Criteria:**
- [ ] File `infra/db/migrations/0182_negotiation_listing_overrides.sql` created.
- [ ] Columns: `id TEXT PRIMARY KEY`, `workspace_id TEXT NOT NULL REFERENCES workspaces(id)`, `tenant_id TEXT NOT NULL`, `listing_type TEXT NOT NULL`, `listing_id TEXT NOT NULL`, `pricing_mode TEXT NOT NULL CHECK (pricing_mode IN ('fixed','negotiable','hybrid'))`, `listed_price_kobo INTEGER NOT NULL`, `min_price_kobo INTEGER`, `max_discount_bps INTEGER`, `max_offer_rounds INTEGER`, `offer_expiry_hours INTEGER`, `auto_accept_threshold_bps INTEGER`, `valid_until INTEGER`, `created_at INTEGER NOT NULL DEFAULT (unixepoch())`, `updated_at INTEGER NOT NULL DEFAULT (unixepoch())`.
- [ ] Unique index on `(listing_type, listing_id, tenant_id)` — one pricing override per listing.
- [ ] Index on `(workspace_id, tenant_id)`.
- [ ] Index on `tenant_id`.
- [ ] No float types.

**QA Verification:**
1. Insert a row then insert an identical `(listing_type, listing_id, tenant_id)` → UNIQUE violation.
2. Insert with `pricing_mode = 'auction'` → CHECK violation.
3. Verify `listed_price_kobo` stored as INTEGER by checking `typeof(listed_price_kobo)` = `'integer'`.
4. Insert row with `valid_until = NULL` → accepted (nullable column confirmed).

**Files:**
- `infra/db/migrations/0182_negotiation_listing_overrides.sql`

---

### Task 1.3: Migration 0183 — `negotiation_sessions`
**Priority:** P0  
**Est:** 3h  
**Dependencies:** [1.1, 1.2]  
**Acceptance Criteria:**
- [ ] File `infra/db/migrations/0183_negotiation_sessions.sql` created.
- [ ] Columns: `id TEXT PRIMARY KEY`, `tenant_id TEXT NOT NULL`, `listing_type TEXT NOT NULL`, `listing_id TEXT NOT NULL`, `seller_workspace_id TEXT NOT NULL REFERENCES workspaces(id)`, `buyer_ref_id TEXT NOT NULL`, `session_type TEXT NOT NULL DEFAULT 'offer' CHECK (session_type IN ('offer','bulk_rfq','service_quote'))`, `status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','accepted','declined','expired','cancelled'))`, `listed_price_kobo INTEGER NOT NULL`, `initial_offer_kobo INTEGER NOT NULL`, `final_price_kobo INTEGER`, `rounds_used INTEGER NOT NULL DEFAULT 0`, `max_rounds INTEGER NOT NULL`, `expires_at INTEGER NOT NULL`, `quantity INTEGER NOT NULL DEFAULT 1`, `notes TEXT`, `created_at INTEGER NOT NULL DEFAULT (unixepoch())`, `updated_at INTEGER NOT NULL DEFAULT (unixepoch())`.
- [ ] `final_price_kobo` is nullable (set only on `status = 'accepted'`).
- [ ] Index on `(seller_workspace_id, tenant_id, status)`.
- [ ] Index on `(buyer_ref_id, tenant_id, status)`.
- [ ] Index on `(listing_type, listing_id, tenant_id, status)`.
- [ ] Index on `(expires_at, status)` — used by expiry CRON.
- [ ] No float types.

**QA Verification:**
1. Insert session with `status = 'paid'` → CHECK violation.
2. Insert session with `session_type = 'auction'` → CHECK violation.
3. Verify `(expires_at, status)` index present via `sqlite_master` check.
4. Insert two open sessions for the same buyer + listing in the same tenant → succeeds (no unique constraint — deduplication is enforced at application layer, not DB).
5. Verify `initial_offer_kobo` and `listed_price_kobo` stored as INTEGER.

**Files:**
- `infra/db/migrations/0183_negotiation_sessions.sql`

---

### Task 1.4: Migration 0184 — `negotiation_offers`
**Priority:** P0  
**Est:** 2h  
**Dependencies:** [1.3]  
**Acceptance Criteria:**
- [ ] File `infra/db/migrations/0184_negotiation_offers.sql` created.
- [ ] Columns: `id TEXT PRIMARY KEY`, `session_id TEXT NOT NULL REFERENCES negotiation_sessions(id)`, `tenant_id TEXT NOT NULL`, `round INTEGER NOT NULL`, `offered_by TEXT NOT NULL CHECK (offered_by IN ('buyer','seller'))`, `amount_kobo INTEGER NOT NULL CHECK (amount_kobo > 0)`, `message TEXT`, `status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','countered','declined','expired'))`, `created_at INTEGER NOT NULL DEFAULT (unixepoch())`, `responded_at INTEGER`.
- [ ] `responded_at` is nullable.
- [ ] Index on `(session_id, round)`.
- [ ] Index on `(tenant_id, status)`.
- [ ] `amount_kobo > 0` constraint prevents zero-kobo offers.

**QA Verification:**
1. Insert offer with `amount_kobo = 0` → CHECK violation from `amount_kobo > 0`.
2. Insert offer with `offered_by = 'platform'` → CHECK violation.
3. Insert offer with `responded_at = NULL` → accepted.
4. Insert with `status = 'withdrawn'` → CHECK violation.
5. Confirm `amount_kobo` stored as INTEGER.

**Files:**
- `infra/db/migrations/0184_negotiation_offers.sql`

---

### Task 1.5: Migration 0185 — `negotiation_audit_log`
**Priority:** P0  
**Est:** 2h  
**Dependencies:** [1.3]  
**Acceptance Criteria:**
- [ ] File `infra/db/migrations/0185_negotiation_audit_log.sql` created.
- [ ] Columns: `id TEXT PRIMARY KEY`, `tenant_id TEXT NOT NULL`, `session_id TEXT NOT NULL REFERENCES negotiation_sessions(id)`, `event_type TEXT NOT NULL`, `actor_type TEXT NOT NULL CHECK (actor_type IN ('buyer','seller','system'))`, `actor_ref_id TEXT NOT NULL`, `amount_kobo INTEGER`, `metadata TEXT NOT NULL DEFAULT '{}'`, `created_at INTEGER NOT NULL DEFAULT (unixepoch())`.
- [ ] `amount_kobo` nullable (only present for price events).
- [ ] No `updated_at` — log is append-only, never updated.
- [ ] No `DELETE` trigger or cascade — rows are permanent.
- [ ] Index on `(session_id, created_at)`.
- [ ] Index on `(tenant_id, event_type, created_at)`.

**QA Verification:**
1. Insert with `actor_type = 'admin'` → CHECK violation.
2. Insert with `amount_kobo = NULL` → accepted.
3. Confirm no `updated_at` column in `sqlite_master`.
4. Insert valid row → `SELECT COUNT(*) FROM negotiation_audit_log` returns 1.
5. Index on `(tenant_id, event_type, created_at)` confirmed present.

**Files:**
- `infra/db/migrations/0185_negotiation_audit_log.sql`

---

### Task 1.6: `@webwaka/negotiation` Package Scaffold
**Priority:** P0  
**Est:** 2h  
**Dependencies:** [1.1–1.5]  
**Acceptance Criteria:**
- [ ] Directory `packages/negotiation/` created with standard monorepo structure.
- [ ] `package.json` name: `@webwaka/negotiation`; `main`: `./dist/index.js`; `types`: `./dist/index.d.ts`.
- [ ] `tsconfig.json` extends `../../tsconfig.base.json`; `strict: true`.
- [ ] `src/index.ts` exports: `NegotiationRepository`, `NegotiationEngine`, `GuardrailEvaluator`, `NegotiationTypes` (re-export).
- [ ] `src/types.ts` exports all domain types (see Task 1.7).
- [ ] `pnpm install` completes without error from workspace root.
- [ ] `tsc --noEmit` passes with zero errors.

**QA Verification:**
1. `ls packages/negotiation/src/` → shows `index.ts`, `types.ts`, `repository.ts`, `engine.ts`, `guardrails.ts`.
2. `pnpm --filter @webwaka/negotiation build` exits 0.
3. Import `@webwaka/negotiation` from `apps/api/src/index.ts` → no TypeScript error.

**Files:**
- `packages/negotiation/package.json`
- `packages/negotiation/tsconfig.json`
- `packages/negotiation/src/index.ts`

---

### Task 1.7: `types.ts` — All Domain Types
**Priority:** P0  
**Est:** 3h  
**Dependencies:** [1.6]  
**Acceptance Criteria:**
- [ ] `PricingMode` = `'fixed' | 'negotiable' | 'hybrid'` (const union, not enum).
- [ ] `SessionType` = `'offer' | 'bulk_rfq' | 'service_quote'`.
- [ ] `SessionStatus` = `'open' | 'accepted' | 'declined' | 'expired' | 'cancelled'`.
- [ ] `OfferStatus` = `'pending' | 'accepted' | 'countered' | 'declined' | 'expired'`.
- [ ] `OfferedBy` = `'buyer' | 'seller'`.
- [ ] `ActorType` = `'buyer' | 'seller' | 'system'`.
- [ ] `AuditEventType` = `'session_opened' | 'offer_submitted' | 'countered' | 'accepted' | 'declined' | 'expired' | 'cancelled' | 'auto_accepted'`.
- [ ] `VendorPricingPolicy` interface: all fields from migration 0181; kobo fields typed `number` (integer); `min_price_kobo` and `auto_accept_threshold_bps` typed `number | null`.
- [ ] `ListingPriceOverride` interface: all fields from migration 0182; nullable fields correctly `| null`.
- [ ] `NegotiationSession` interface: all fields from migration 0183; `final_price_kobo: number | null`.
- [ ] `NegotiationOffer` interface: all fields from migration 0184.
- [ ] `NegotiationAuditEntry` interface: all fields from migration 0185; `amount_kobo: number | null`.
- [ ] `GuardrailsConfig` interface: resolved guardrails after policy + override merge; all fields non-null (defaults applied).
- [ ] `CreateSessionInput` DTO: fields required to open a session (listing_type, listing_id, buyer_ref_id, session_type, initial_offer_kobo, quantity?, notes?).
- [ ] `SubmitOfferInput` DTO: (session_id, offered_by, amount_kobo, message?).
- [ ] No `any` type. No `as never` casts. No type assertions used to suppress errors.

**QA Verification:**
1. `tsc --noEmit` on the package with `strict: true` → zero errors.
2. Assign `pricing_mode: 'auction'` to a `PricingMode` typed variable → TypeScript error (correct).
3. Assign `amount_kobo: 99.5` to a `NegotiationOffer` → TypeScript accepts (it's a `number`; integer enforcement is at DB and engine layers).
4. Confirm `VendorPricingPolicy.min_price_kobo` is `number | null` — not `number`.

**Files:**
- `packages/negotiation/src/types.ts`

---

## Phase 2: Seller Controls (Est: 2 days)

### Task 2.1: `GuardrailEvaluator` — Policy Resolution + Arithmetic
**Priority:** P0  
**Est:** 4h  
**Dependencies:** [1.7]  
**Acceptance Criteria:**
- [ ] `resolveGuardrails(policy: VendorPricingPolicy, override: ListingPriceOverride | null): GuardrailsConfig` — listing-level fields take precedence over vendor-level fields when non-null.
- [ ] `effectivePricingMode(policy, override)` returns listing's `pricing_mode` if override exists, else policy's `default_pricing_mode`.
- [ ] `isOfferBelowFloor(offerKobo: number, guardrails: GuardrailsConfig): boolean` — returns true if `offerKobo < guardrails.min_price_kobo` (when min_price_kobo is not null).
- [ ] `isOfferExceedsMaxDiscount(offerKobo: number, listedPriceKobo: number, guardrails: GuardrailsConfig): boolean` — integer bps: `discountBps = Math.floor((listedPriceKobo - offerKobo) * 10000 / listedPriceKobo)` — true if `discountBps > guardrails.max_discount_bps`.
- [ ] `shouldAutoAccept(offerKobo: number, listedPriceKobo: number, thresholdBps: number | null): boolean` — returns false if threshold is null; otherwise: `minAutoAccept = Math.floor(listedPriceKobo * (10000 - thresholdBps) / 10000)` — true if `offerKobo >= minAutoAccept`. All integer arithmetic.
- [ ] `computeExpiresAt(nowUnix: number, expiryHours: number): number` — `nowUnix + expiryHours * 3600`. No floats.
- [ ] All arithmetic uses `Math.floor` (no `Math.round`) to always favour the seller.
- [ ] All functions are pure (no side effects, no DB access).

**QA Verification:**
1. `resolveGuardrails(policy={max_discount_bps:1500}, override={max_discount_bps:2000})` → returns `max_discount_bps = 2000` (override wins).
2. `resolveGuardrails(policy={max_discount_bps:1500}, override={max_discount_bps:null})` → returns `max_discount_bps = 1500` (fallback to policy).
3. `shouldAutoAccept(3900000, 4200000, 1000)` → floor = `Math.floor(4200000 * 9000 / 10000)` = `3780000` → `3900000 >= 3780000` → `true`.
4. `shouldAutoAccept(3700000, 4200000, 1000)` → `3700000 < 3780000` → `false`.
5. `isOfferExceedsMaxDiscount(2000000, 4200000, {max_discount_bps:1500})` → discount = `Math.floor((4200000-2000000)*10000/4200000)` = 5238 bps → exceeds 1500 → `true`.
6. No floating-point values appear in any intermediate calculation (verify by inserting `console.assert(Number.isInteger(result))` calls in unit test).

**Files:**
- `packages/negotiation/src/guardrails.ts`

---

### Task 2.2: `NegotiationRepository` — Vendor Policy CRUD
**Priority:** P0  
**Est:** 3h  
**Dependencies:** [1.6, 1.7]  
**Acceptance Criteria:**
- [ ] `upsertVendorPolicy(db, input): Promise<VendorPricingPolicy>` — INSERT OR REPLACE; generates `id` as `nanoid()`; sets `updated_at = unixepoch()`.
- [ ] `getVendorPolicy(db, workspaceId, tenantId): Promise<VendorPricingPolicy | null>` — returns null if not found.
- [ ] `upsertListingOverride(db, input): Promise<ListingPriceOverride>` — INSERT OR REPLACE on `(listing_type, listing_id, tenant_id)`.
- [ ] `getListingOverride(db, listingType, listingId, tenantId): Promise<ListingPriceOverride | null>`.
- [ ] `deleteListingOverride(db, listingType, listingId, tenantId, workspaceId): Promise<void>` — only deletes if `workspace_id` matches (ownership check).
- [ ] `effectivePricingMode(db, workspaceId, listingType, listingId, tenantId): Promise<PricingMode>` — reads policy + override, delegates to `GuardrailEvaluator.effectivePricingMode`.
- [ ] All queries filtered by `tenant_id`.
- [ ] No raw SQL string interpolation of user input — all parameters via D1 `?` bindings.

**QA Verification:**
1. Upsert policy twice with same `(workspace_id, tenant_id)` → second call updates; row count stays 1.
2. `getVendorPolicy` for unknown workspace → returns `null` (no throw).
3. `deleteListingOverride` with wrong `workspaceId` → row is NOT deleted (ownership enforced).
4. `effectivePricingMode` when override is `null` → returns vendor policy's `default_pricing_mode`.
5. `effectivePricingMode` when override has `pricing_mode = 'hybrid'` → returns `'hybrid'` regardless of vendor policy.

**Files:**
- `packages/negotiation/src/repository.ts`

---

### Task 2.3: `NegotiationRepository` — Session + Offer + Audit CRUD
**Priority:** P0  
**Est:** 4h  
**Dependencies:** [2.2]  
**Acceptance Criteria:**
- [ ] `createSession(db, input, guardrails): Promise<NegotiationSession>` — generates `id`, `expires_at`, copies `max_rounds` from guardrails; validates `initial_offer_kobo > 0`; sets `status = 'open'`, `rounds_used = 0`.
- [ ] `getSession(db, id, tenantId): Promise<NegotiationSession | null>`.
- [ ] `listSessionsForSeller(db, sellerWorkspaceId, tenantId, status?): Promise<NegotiationSession[]>`.
- [ ] `listSessionsForBuyer(db, buyerRefId, tenantId, status?): Promise<NegotiationSession[]>`.
- [ ] `updateSessionStatus(db, id, tenantId, status, finalPriceKobo?): Promise<void>` — sets `updated_at`; sets `final_price_kobo` when status = `'accepted'`.
- [ ] `incrementRoundsUsed(db, id, tenantId): Promise<number>` — returns new `rounds_used`.
- [ ] `createOffer(db, input): Promise<NegotiationOffer>` — inserts offer row; sets `round` = current `rounds_used + 1`.
- [ ] `getLatestOffer(db, sessionId, tenantId): Promise<NegotiationOffer | null>`.
- [ ] `updateOfferStatus(db, id, tenantId, status, respondedAt): Promise<void>`.
- [ ] `writeAuditEntry(db, entry): Promise<void>` — inserts to `negotiation_audit_log`; never throws (catches and logs internally, never propagates — audit failure must not fail a business action).
- [ ] `expireOpenSessions(db, tenantId?): Promise<number>` — returns count of sessions updated; `WHERE status = 'open' AND expires_at < unixepoch()`.

**QA Verification:**
1. `createSession` with `initial_offer_kobo = 0` → throws validation error before DB call.
2. `listSessionsForSeller` with `status = 'open'` filter → only returns open sessions for that workspace.
3. `updateSessionStatus` to `'accepted'` without `finalPriceKobo` → throws (final price required).
4. `writeAuditEntry` — simulate DB error → function does NOT throw; calling code continues normally.
5. `expireOpenSessions` → updates only rows where `status = 'open' AND expires_at < now`.

**Files:**
- `packages/negotiation/src/repository.ts` (continued)

---

## Phase 3: Negotiation Engine (Est: 3 days)

### Task 3.1: `NegotiationEngine` — Blocked Verticals Registry
**Priority:** P0  
**Est:** 1h  
**Dependencies:** [1.7]  
**Acceptance Criteria:**
- [ ] `NEGOTIATION_BLOCKED_VERTICALS` exported constant (readonly Set or frozen array):
  `pharmacy_chain`, `food_vendor`, `bakery`, `petrol_station`, `internet_cafe`, `govt_school`, `orphanage`, `okada_keke`, `laundry`, `laundry_service`, `beauty_salon`, `optician`.
- [ ] `isNegotiationBlocked(listingType: string): boolean` — true if `listingType` is in the set.
- [ ] `listing_type` values use underscore convention (matching DB column values), not kebab-case package names.
- [ ] The list is a compile-time constant — not configurable at runtime for MVP.

**QA Verification:**
1. `isNegotiationBlocked('pharmacy_chain')` → `true`.
2. `isNegotiationBlocked('spare_part')` → `false`.
3. `isNegotiationBlocked('orphanage')` → `true`.
4. `isNegotiationBlocked('used_car')` → `false`.
5. The constant is `Object.isFrozen()` === true (or a `Set` — both prevent accidental mutation).

**Files:**
- `packages/negotiation/src/engine.ts`

---

### Task 3.2: `NegotiationEngine` — Open Session Gate
**Priority:** P0  
**Est:** 3h  
**Dependencies:** [3.1, 2.1, 2.2]  
**Acceptance Criteria:**
- [ ] `openSession(db, input: CreateSessionInput, buyerKycTier: number): Promise<NegotiationSession>`:
  1. Call `isNegotiationBlocked(input.listing_type)` → throw `NegotiationBlockedError` if blocked.
  2. Load seller's `VendorPricingPolicy` via `getVendorPolicy`.
  3. Load `ListingPriceOverride` via `getListingOverride`.
  4. Resolve `effectivePricingMode` → throw `NegotiationNotEnabledError` if `'fixed'`.
  5. Resolve `guardrails` via `resolveGuardrails`.
  6. Check `buyerKycTier >= guardrails.eligible_buyer_kyc_tier` → throw `InsufficientKycError` if not.
  7. Check for existing open session for same `(buyer_ref_id, listing_id, listing_type, tenant_id)` → throw `DuplicateSessionError` if found.
  8. Check `isOfferBelowFloor` → throw `OfferBelowFloorError` (auto-reject, does not consume a round).
  9. Check `isOfferExceedsMaxDiscount` → throw `OfferExceedsDiscountError` (auto-reject).
  10. Check `shouldAutoAccept` → if true, create session + immediately set `status = 'accepted'`, `final_price_kobo = initial_offer_kobo`, write audit `auto_accepted`.
  11. Otherwise, create session with `status = 'open'`, write audit `session_opened`.
  12. Return created session.
- [ ] All errors are typed (distinct classes, not string throws).
- [ ] Audit entry written for every terminal path (auto-reject paths write no audit — the session was never created).

**QA Verification:**
1. Blocked vertical → `NegotiationBlockedError` thrown before any DB read.
2. Listing effective mode is `'fixed'` → `NegotiationNotEnabledError`.
3. Buyer KYC tier 1, guardrails require tier 2 → `InsufficientKycError`.
4. Duplicate open session → `DuplicateSessionError`.
5. Offer below floor → `OfferBelowFloorError`; no session row in DB.
6. Auto-accept threshold met → session created with `status = 'accepted'`; audit row with `event_type = 'auto_accepted'`.
7. Normal open → session `status = 'open'`; audit row `event_type = 'session_opened'`.

**Files:**
- `packages/negotiation/src/engine.ts`

---

### Task 3.3: `NegotiationEngine` — Submit Offer / Counteroffer FSM
**Priority:** P0  
**Est:** 5h  
**Dependencies:** [3.2]  
**Acceptance Criteria:**
- [ ] `submitOffer(db, input: SubmitOfferInput, actorWorkspaceId: string): Promise<NegotiationOffer>`:
  1. Load session. Throw `SessionNotFoundError` if null.
  2. Throw `SessionClosedError` if `session.status !== 'open'`.
  3. Verify `actorWorkspaceId` is authorized: if `offered_by = 'seller'`, actor must be `session.seller_workspace_id`. If `offered_by = 'buyer'`, actor must match `session.buyer_ref_id` (or a workspace linked to that buyer).
  4. Check `session.rounds_used >= session.max_rounds` → throw `MaxRoundsExceededError`, set session to `'declined'`, write audit.
  5. Validate `amount_kobo > 0`.
  6. Validate `amount_kobo` is an integer: `Number.isInteger(amount_kobo)`.
  7. Load guardrails; if `offered_by = 'buyer'`: check floor, check max discount.
  8. Mark the previous latest offer as `'countered'` (if exists).
  9. Increment `rounds_used` on session.
  10. Insert new `NegotiationOffer` row with `status = 'pending'`.
  11. Check `shouldAutoAccept` → if true and `offered_by = 'buyer'`: auto-accept (transition session to `'accepted'`, set `final_price_kobo`).
  12. Write audit `countered` or `offer_submitted` + optionally `auto_accepted`.
  13. Return new offer.
- [ ] FSM transitions enforced: `open → (offer submitted) → open | accepted`.
- [ ] Seller's counteroffer is never auto-accepted by this function (auto-accept only applies to buyer offers).

**QA Verification:**
1. Submit offer on an `'accepted'` session → `SessionClosedError`.
2. Submit offer when `rounds_used = max_rounds` → `MaxRoundsExceededError`; session status → `'declined'`.
3. Buyer submits offer below floor → `OfferBelowFloorError`; `rounds_used` unchanged; previous offer stays `'pending'`.
4. Valid buyer offer on 2-round-remaining session → `rounds_used` incremented to new value; previous offer marked `'countered'`; new offer `'pending'`.
5. Buyer offer above auto-accept threshold → session → `'accepted'`; `final_price_kobo` set; audit `auto_accepted` written.
6. `amount_kobo = 99.9` → throws (not integer).
7. Seller counteroffer above threshold → NOT auto-accepted; session remains `'open'`.

**Files:**
- `packages/negotiation/src/engine.ts`

---

### Task 3.4: `NegotiationEngine` — Accept / Decline / Cancel
**Priority:** P0  
**Est:** 3h  
**Dependencies:** [3.3]  
**Acceptance Criteria:**
- [ ] `acceptOffer(db, sessionId, tenantId, actorWorkspaceId): Promise<NegotiationSession>`:
  - Load session; validate `status = 'open'`.
  - Validate actor is authorized (seller accepts buyer's offer; buyer accepts seller's counteroffer).
  - Load latest offer; set its status to `'accepted'`.
  - Set `session.status = 'accepted'`, `session.final_price_kobo = latest_offer.amount_kobo`.
  - Write audit `accepted`.
  - Return updated session.
- [ ] `declineSession(db, sessionId, tenantId, actorWorkspaceId): Promise<void>`:
  - Validate `status = 'open'`.
  - Validate actor is authorized (either party can decline).
  - Set `session.status = 'declined'`.
  - Mark latest pending offer as `'declined'`.
  - Write audit `declined`.
- [ ] `cancelSession(db, sessionId, tenantId, buyerRefId): Promise<void>`:
  - Validate `status = 'open'`.
  - Validate caller is the buyer.
  - Set `session.status = 'cancelled'`.
  - Write audit `cancelled`.
- [ ] No session can transition from `'accepted'`, `'declined'`, `'expired'`, or `'cancelled'` — all throw `SessionClosedError`.

**QA Verification:**
1. Accept a session that is already `'accepted'` → `SessionClosedError`.
2. Decline a session as the seller → status → `'declined'`; latest offer → `'declined'`; audit written.
3. Cancel a session as buyer → status → `'cancelled'`; audit `cancelled` written.
4. Cancel a session as the seller → `UnauthorizedError` (only buyer can cancel).
5. `acceptOffer` on a session with no pending offer (all offers already responded to) → throws `NoOpenOfferError`.

**Files:**
- `packages/negotiation/src/engine.ts`

---

### Task 3.5: Price-Lock Token Generation
**Priority:** P0  
**Est:** 2h  
**Dependencies:** [3.4]  
**Acceptance Criteria:**
- [ ] `generatePriceLockToken(session: NegotiationSession): string` — returns a URL-safe base64-encoded JSON string containing `{ session_id, final_price_kobo, tenant_id, issued_at }`.
- [ ] `verifyPriceLockToken(token: string, tenantId: string): { session_id: string; final_price_kobo: number }` — parses and validates: correct tenant, `final_price_kobo` is a positive integer, `issued_at` within 24 hours.
- [ ] Throws `InvalidPriceLockError` if token is malformed, expired, or wrong tenant.
- [ ] `final_price_kobo` in the token is always an INTEGER (guard: `Number.isInteger` check in `generatePriceLockToken`).
- [ ] Token is NOT cryptographically signed in MVP (signing added in Phase 7 hardening). Document this limitation explicitly with a `// TODO: sign with HMAC-SHA256` comment.

**QA Verification:**
1. Generate token from accepted session → `verifyPriceLockToken` returns matching `final_price_kobo`.
2. Token with `issued_at` 25 hours ago → `InvalidPriceLockError`.
3. Token with wrong `tenant_id` → `InvalidPriceLockError`.
4. Corrupted token string → `InvalidPriceLockError` (no unhandled JSON parse error).
5. `final_price_kobo` in returned object is always an integer.

**Files:**
- `packages/negotiation/src/price-lock.ts`
- `packages/negotiation/src/index.ts` (re-export `generatePriceLockToken`, `verifyPriceLockToken`)

---

## Phase 4: API Layer (Est: 3 days)

### Task 4.1: Negotiation Router Scaffold
**Priority:** P0  
**Est:** 2h  
**Dependencies:** [Phase 3 complete]  
**Acceptance Criteria:**
- [ ] File `apps/api/src/routes/negotiation.ts` created.
- [ ] Exports a `Hono` app instance named `negotiationRouter`.
- [ ] All routes prefixed `/` (mounted at `/api/v1/negotiation` in `apps/api/src/index.ts`).
- [ ] `apps/api/src/index.ts` updated: `app.use('/api/v1/negotiation/*', authMiddleware)` guard added (single wildcard guard, same pattern as verticals).
- [ ] `app.route('/api/v1/negotiation', negotiationRouter)` added to `index.ts`.
- [ ] Router compiles with `tsc --noEmit` zero errors.

**QA Verification:**
1. `GET /api/v1/negotiation/health` (test stub route) without auth → 401.
2. `GET /api/v1/negotiation/health` with valid auth → 200.
3. `tsc --noEmit` on `apps/api` → zero errors.

**Files:**
- `apps/api/src/routes/negotiation.ts`
- `apps/api/src/index.ts`

---

### Task 4.2: Seller Policy Endpoints
**Priority:** P0  
**Est:** 3h  
**Dependencies:** [4.1]  
**Acceptance Criteria:**
- [ ] `GET /policy` — returns caller's `VendorPricingPolicy` or 404 if not configured yet.
- [ ] `PUT /policy` — upsert; validates body; responds 200 with updated policy.
- [ ] Input validation: `default_pricing_mode` must be `'fixed'|'negotiable'|'hybrid'`; `max_discount_bps` must be INTEGER 0–10000; `max_offer_rounds` must be INTEGER 1–10; `offer_expiry_hours` must be INTEGER 1–720; `auto_accept_threshold_bps` must be INTEGER 0–10000 or null; `eligible_buyer_kyc_tier` must be INTEGER 1–3.
- [ ] Responds 422 with structured error body if any field fails validation.
- [ ] `workspace_id` and `tenant_id` are read from auth context — never from request body.
- [ ] Response serializes `min_price_kobo` as integer (not string).

**QA Verification:**
1. `PUT /policy` with `max_discount_bps = 15000` (>10000) → 422.
2. `PUT /policy` with `default_pricing_mode = 'auction'` → 422.
3. `GET /policy` before any PUT → 404.
4. `PUT /policy` valid body → 200; `GET /policy` → returns same data.
5. `PUT /policy` with `min_price_kobo` in request body attempting to set `workspace_id` → field ignored; workspace_id comes from auth.

**Files:**
- `apps/api/src/routes/negotiation.ts`

---

### Task 4.3: Listing Mode Endpoints
**Priority:** P0  
**Est:** 3h  
**Dependencies:** [4.2]  
**Acceptance Criteria:**
- [ ] `POST /listings/:type/:id/mode` — upsert `listing_price_overrides`; validates that caller's workspace owns the listing (look up `workspace_id` of the listing in the relevant vertical table using the polymorphic `listing_type`).
- [ ] `GET /listings/:type/:id/mode` — returns effective pricing mode (policy + override merged). Available to any authenticated caller (buyer can check before making an offer).
- [ ] `DELETE /listings/:type/:id/mode` — removes override; listing reverts to vendor policy default. Only callable by the seller workspace.
- [ ] Responds 404 if `listing_id` does not exist in the expected vertical table for the given `listing_type`.
- [ ] Responds 422 if `listing_type` is in `NEGOTIATION_BLOCKED_VERTICALS`.
- [ ] `listed_price_kobo` is automatically snapshotted from the current listing's price field (not provided by the client).

**QA Verification:**
1. `POST /listings/spare_part/:id/mode` with `pricing_mode = 'negotiable'` by the listing owner → 200.
2. `GET /listings/spare_part/:id/mode` by a different authenticated user → 200 (read is public within tenant).
3. `DELETE /listings/spare_part/:id/mode` by a different workspace → 403.
4. `POST /listings/pharmacy_chain/:id/mode` → 422 with `negotiation_blocked` error code.
5. `POST /listings/spare_part/nonexistent-id/mode` → 404.

**Files:**
- `apps/api/src/routes/negotiation.ts`

---

### Task 4.4: Session Lifecycle Endpoints
**Priority:** P0  
**Est:** 5h  
**Dependencies:** [4.3]  
**Acceptance Criteria:**
- [ ] `POST /sessions` — open a new negotiation session; calls `NegotiationEngine.openSession`. Returns 201 + session. Returns 422 with typed error codes for all engine errors (`negotiation_blocked`, `mode_is_fixed`, `insufficient_kyc`, `duplicate_session`, `offer_below_floor`, `offer_exceeds_discount`).
- [ ] `GET /sessions` — list sessions for the authenticated caller. Sellers see their workspace's sessions; buyers see sessions where `buyer_ref_id` matches. Optional `?status=open` filter.
- [ ] `GET /sessions/:id` — get session detail. Caller must be seller or buyer of the session. 403 otherwise.
- [ ] `POST /sessions/:id/offer` — submit offer or counteroffer; calls `NegotiationEngine.submitOffer`. Returns 200 + offer. Returns 422 for engine errors.
- [ ] `POST /sessions/:id/accept` — accept; calls `NegotiationEngine.acceptOffer`. Returns 200 + session with `price_lock_token` field added.
- [ ] `POST /sessions/:id/decline` — decline; calls `NegotiationEngine.declineSession`. Returns 200.
- [ ] `POST /sessions/:id/cancel` — cancel (buyer only); calls `NegotiationEngine.cancelSession`. Returns 200.
- [ ] `GET /sessions/:id/history` — returns ordered array of `NegotiationOffer` rows for the session. Seller and buyer of the session can access. `min_price_kobo` is NEVER included in any response (private to seller only in guardrails).

**QA Verification:**
1. `POST /sessions` on blocked vertical → 422 `negotiation_blocked`.
2. `POST /sessions` on fixed-mode listing → 422 `mode_is_fixed`.
3. `POST /sessions` valid → 201; `GET /sessions/:id` by buyer → 200.
4. `GET /sessions/:id` by unrelated authenticated user → 403.
5. `POST /sessions/:id/offer` → 200; `GET /sessions/:id/history` → array length 1.
6. `POST /sessions/:id/accept` → 200; response includes `price_lock_token`; `final_price_kobo` present.
7. `POST /sessions/:id/offer` after accept → 422 `session_closed`.
8. `min_price_kobo` does NOT appear anywhere in any API response body (grep check).

**Files:**
- `apps/api/src/routes/negotiation.ts`

---

### Task 4.5: Analytics Endpoint
**Priority:** P1  
**Est:** 3h  
**Dependencies:** [4.4]  
**Acceptance Criteria:**
- [ ] `GET /analytics` — seller-only endpoint (403 if called by buyer role).
- [ ] Returns for the caller's workspace:
  - `total_sessions`: INTEGER — total sessions opened.
  - `open_sessions`: INTEGER — currently open.
  - `accepted_sessions`: INTEGER.
  - `declined_sessions`: INTEGER.
  - `expired_sessions`: INTEGER.
  - `acceptance_rate_bps`: INTEGER — `Math.floor(accepted / total * 10000)`.
  - `avg_discount_depth_bps`: INTEGER — mean of `Math.floor((listed - final) * 10000 / listed)` across accepted sessions.
  - `avg_rounds_to_close`: INTEGER — mean `rounds_used` on closed sessions (rounded down).
- [ ] Optional `?from_unix=` and `?to_unix=` query params for time-range filtering.
- [ ] All values are integers. No floats in response.
- [ ] 0-division guarded: if `total_sessions = 0`, return all metrics as 0.

**QA Verification:**
1. No sessions → all values 0 (no division-by-zero error).
2. 2 accepted sessions, 1 declined → `acceptance_rate_bps = Math.floor(2/3*10000) = 6666`.
3. Response body contains no floating-point values (all fields pass `Number.isInteger` check).
4. `?from_unix=0&to_unix=9999` → returns empty dataset for future date range.
5. Buyer-role caller → 403.

**Files:**
- `apps/api/src/routes/negotiation.ts`

---

## Phase 5: Core UX (Est: 4 days)

### Task 5.1: Seller Pricing Policy UI — Workspace Settings Panel
**Priority:** P1  
**Est:** 6h  
**Dependencies:** [4.2]  
**Acceptance Criteria:**
- [ ] "Pricing Policy" section added to the workspace settings page.
- [ ] Three-option radio group: `Fixed Only` | `Accept Offers` | `Always Open to Offers`.
- [ ] When "Accept Offers" or "Always Open to Offers" is selected, guardrail fields expand:
  - Minimum price input (kobo integer, displays in Naira with `₦` prefix, converts to kobo before submission).
  - Max discount % input (integer; converts to bps: `value * 100` before submission).
  - Offer rounds (integer 1–10; defaults to 3).
  - Offer expiry hours (integer; defaults to 48).
  - Auto-accept threshold % (optional; converts to bps).
- [ ] Kobo ↔ Naira conversion is UI-only. DB stores integer kobo. No float stored anywhere.
- [ ] "Save Policy" button calls `PUT /api/v1/negotiation/policy`.
- [ ] On success: show confirmation toast.
- [ ] On 422: show field-level error messages.
- [ ] Fixed-pricing sellers see a locked state ("Fixed Only — buyers cannot make offers on your listings").

**QA Verification:**
1. Enter `₦4,500` in min price → verify API receives `min_price_kobo = 450000` (not 4500 or 4500.0).
2. Enter `15` in max discount % → API receives `max_discount_bps = 1500`.
3. Save with `default_pricing_mode = 'auction'` → impossible (no radio option for it; UI only shows valid values).
4. API returns 422 → error message appears under the relevant field.
5. Reload page after save → settings reflect saved values (loaded from `GET /policy`).

**Files:**
- `apps/platform-admin/` or relevant frontend package (workspace settings component)

---

### Task 5.2: Per-Listing Pricing Mode Toggle
**Priority:** P1  
**Est:** 5h  
**Dependencies:** [4.3, 5.1]  
**Acceptance Criteria:**
- [ ] Pricing mode selector (Fixed / Negotiable / Hybrid) shown on listing create/edit form.
- [ ] Default reflects vendor policy's `default_pricing_mode`.
- [ ] "Override vendor defaults for this item" expandable panel reveals listing-level guardrail fields.
- [ ] Guardrail fields pre-filled from vendor policy; seller can override any field.
- [ ] If listing type is in blocked list → pricing mode selector is hidden; mode is implicitly `fixed`; a read-only note says "Negotiation is not available for this listing type."
- [ ] On save, calls `POST /api/v1/negotiation/listings/:type/:id/mode`.

**QA Verification:**
1. Listing type `pharmacy_chain` → pricing mode selector hidden; note visible.
2. Listing type `spare_part` → all three modes selectable.
3. Select `negotiable` + save → `GET /listings/spare_part/:id/mode` returns `negotiable`.
4. Override `max_discount_bps` to `2000` → API receives `2000`; parent vendor policy unchanged.
5. Delete override (revert to vendor default) → `DELETE /listings/:type/:id/mode` called; effective mode reverts.

**Files:**
- Frontend listing create/edit component

---

### Task 5.3: Seller Offers Dashboard Tab
**Priority:** P1  
**Est:** 6h  
**Dependencies:** [4.4, 5.1]  
**Acceptance Criteria:**
- [ ] "Offers" tab in seller workspace dashboard.
- [ ] Tabs: `Open (N)` | `Accepted` | `Declined` | `Expired`.
- [ ] Each offer card shows: item name, listing type badge, listed price (₦), buyer's current offer (₦), time received, time remaining until expiry (live countdown).
- [ ] Actions per open offer: `[Accept ₦X]` button, `[Counter]` button, `[Decline]` button.
- [ ] Accepting directly calls `POST /sessions/:id/accept` → shows price-lock confirmation modal.
- [ ] Declining calls `POST /sessions/:id/decline`.
- [ ] `[Counter]` opens a counteroffer drawer (Task 5.4).
- [ ] Min price is never displayed to seller in this dashboard (it is private configuration, not a per-offer display).
- [ ] Dashboard auto-refreshes open sessions every 60 seconds.

**QA Verification:**
1. Open session for a used_car listing appears in "Open" tab.
2. Accept → session moves to "Accepted" tab; price-lock modal appears with correct `final_price_kobo` in ₦.
3. Decline → session moves to "Declined" tab.
4. Expired session (past `expires_at`) → appears in "Expired" tab (not "Open").
5. No `min_price_kobo` value visible anywhere on the dashboard.

**Files:**
- Frontend seller dashboard component

---

### Task 5.4: Counteroffer Drawer
**Priority:** P1  
**Est:** 4h  
**Dependencies:** [5.3]  
**Acceptance Criteria:**
- [ ] Drawer opens from the "Counter" action on an offer card.
- [ ] Displays: buyer's current offer (₦), asking price (₦), rounds remaining.
- [ ] Seller enters counteroffer in ₦ → converted to kobo on submit (`value * 100`).
- [ ] Optional "Note to buyer" text field (max 500 chars).
- [ ] Submit calls `POST /sessions/:id/offer` with `offered_by = 'seller'`.
- [ ] On success: drawer closes; offer card updates to "Awaiting buyer response."
- [ ] If `rounds_used` would hit `max_rounds` on this counteroffer, UI warns: "This is your last counteroffer round."
- [ ] Counteroffer below listed price validated only client-side as a UX hint — the engine enforces the real guardrails.

**QA Verification:**
1. Enter ₦4,000,000 counteroffer → API receives `amount_kobo = 400000000`.
2. `rounds_used = max_rounds - 1` → "last round" warning shown.
3. Submit → drawer closes; offer card shows "Awaiting buyer response."
4. Note > 500 chars → submission blocked client-side with character count.

**Files:**
- Frontend counteroffer drawer component

---

### Task 5.5: Buyer Discovery — Listing Badges and Pricing Filter
**Priority:** P1  
**Est:** 4h  
**Dependencies:** [4.3]  
**Acceptance Criteria:**
- [ ] Listings with `pricing_mode = 'negotiable'` show a `NEGOTIABLE` badge.
- [ ] Listings with `pricing_mode = 'hybrid'` show a `MAKE OFFER` badge alongside `[Buy Now]` button.
- [ ] Listings with `pricing_mode = 'fixed'` show no badge (default state).
- [ ] Catalog/search list view supports filter: `Pricing: All | Fixed | Negotiable`.
- [ ] Badge and filter UI reads effective mode from `GET /listings/:type/:id/mode` (or from enriched catalog response).
- [ ] Badge is a visual indicator only — does not replace or hide the listed price.
- [ ] Filter is client-side for MVP if listing data is loaded in bulk; server-side pagination filter is Phase 3.

**QA Verification:**
1. Negotiable listing → `NEGOTIABLE` badge visible next to price.
2. Fixed listing → no badge; only buy button.
3. Hybrid listing → `MAKE OFFER` badge + `Buy Now` both present.
4. Filter to "Fixed" → negotiable listings disappear from view.
5. Badge does not show the seller's minimum price (private guardrail).

**Files:**
- Frontend listing card component

---

### Task 5.6: Buyer Offer Submission Form
**Priority:** P1  
**Est:** 5h  
**Dependencies:** [4.4, 5.5]  
**Acceptance Criteria:**
- [ ] On a `negotiable` or `hybrid` listing, "Make an Offer" section visible below the price.
- [ ] Input: offer amount in ₦ (converted to kobo on submit).
- [ ] Optional message to seller (max 500 chars).
- [ ] Info note: "Offer expires in Xh if seller does not respond" (X from session guardrails or listing default).
- [ ] Info note: "You can make up to Y offers on this listing" (Y = `max_offer_rounds`).
- [ ] Submit calls `POST /api/v1/negotiation/sessions` with `session_type = 'offer'`.
- [ ] 422 `offer_below_floor` → show "Offer is below the minimum price for this listing. Please increase your offer." (no floor amount disclosed).
- [ ] 422 `duplicate_session` → show "You already have an open offer on this listing."
- [ ] 422 `mode_is_fixed` → show "This listing no longer accepts offers." (race condition guard).
- [ ] On success (201): show "Offer submitted. We'll notify you when the seller responds."

**QA Verification:**
1. Submit ₦3,700,000 → API receives `initial_offer_kobo = 370000000`.
2. Submit below floor → error shown; no amount revealed.
3. Submit duplicate → correct error shown.
4. Successful submit → confirmation message; no floor amount disclosed in any response body.

**Files:**
- Frontend listing detail offer component

---

### Task 5.7: Buyer Counteroffer Notification + Response UI
**Priority:** P1  
**Est:** 5h  
**Dependencies:** [5.6]  
**Acceptance Criteria:**
- [ ] Buyer receives in-app notification when seller counters.
- [ ] Notification links to buyer's "My Offers" view.
- [ ] "My Offers" page: shows open sessions, seller counteroffers, accepted/declined sessions.
- [ ] For an open session with a pending seller counteroffer: shows seller's counter amount (₦), seller's note, original buyer offer (₦), rounds remaining.
- [ ] Actions: `[Accept ₦X]` | `[Counter Again]` | `[Decline]`.
- [ ] Accept → `POST /sessions/:id/accept` → success modal with price-lock details → redirected to checkout.
- [ ] Counter Again → offer entry form for buyer → `POST /sessions/:id/offer` with `offered_by = 'buyer'`.
- [ ] Decline → `POST /sessions/:id/decline`.
- [ ] Seller's min_price is never shown to buyer at any point.

**QA Verification:**
1. Seller counters → buyer notification appears.
2. Accept → redirected to checkout with correct `final_price_kobo`.
3. "Counter Again" → submit new buyer offer → session `rounds_used` incremented.
4. Buyer declines → session → `'declined'`; disappears from "Open" offers.
5. Grep all frontend component files: `min_price` must NOT appear in any render output.

**Files:**
- Frontend buyer offers page component

---

## Phase 6: Vertical Integration (Est: 2 days)

### Task 6.1: `used-car-dealer` — Migrate Informal Negotiation
**Priority:** P0  
**Est:** 4h  
**Dependencies:** [Phase 4 complete]  
**Acceptance Criteria:**
- [ ] `apps/api/src/routes/verticals/used-car-dealer.ts` is NOT modified to add negotiation logic (negotiation is now the shared engine, not per-vertical code).
- [ ] The `listing_type` value used in negotiation sessions for used cars is `'used_car'` (matches the vertical's catalog table entity name, documented in `packages/negotiation/src/engine.ts` as a comment).
- [ ] A data migration script (not a new SQL migration file, but a seeding guide in `docs/plans/`) explains: for existing rows where `status = 'negotiating'` and `offer_price_kobo IS NOT NULL`, how to backfill a `negotiation_session` row with `status = 'open'` and a `negotiation_offer` row with `offered_by = 'buyer'`, `amount_kobo = offer_price_kobo`.
- [ ] `POST /api/v1/negotiation/listings/used_car/:id/mode` with `pricing_mode = 'negotiable'` succeeds for a valid used car listing.
- [ ] `POST /api/v1/negotiation/sessions` with `listing_type = 'used_car'` succeeds.
- [ ] All existing used-car-dealer endpoints continue to pass their existing tests (no regressions).

**QA Verification:**
1. `POST /negotiation/sessions` with `listing_type = 'used_car'`, valid offer → 201.
2. Existing `GET /api/v1/verticals/used-car-dealer` endpoint → still returns 200 with same shape.
3. `isNegotiationBlocked('used_car')` → `false`.
4. Set listing to `'hybrid'` mode → `GET /listings/used_car/:id/mode` returns `'hybrid'`.

**Files:**
- `docs/plans/used-car-dealer-backfill-guide.md` (short note, not a full doc)
- `packages/negotiation/src/engine.ts` (comment documenting listing_type convention)

---

### Task 6.2: `spare-parts` — Enable Negotiation + Wholesale RFQ
**Priority:** P0  
**Est:** 3h  
**Dependencies:** [Phase 4 complete]  
**Acceptance Criteria:**
- [ ] `listing_type` for spare parts sessions is `'spare_part'` (document in engine).
- [ ] `POST /negotiation/listings/spare_part/:id/mode` succeeds for spare parts listings.
- [ ] Bulk RFQ: `POST /negotiation/sessions` with `session_type = 'bulk_rfq'` and `quantity > 1` succeeds.
- [ ] Wholesale min qty guardrail: if `guardrails.wholesale_min_qty` is set and `input.quantity < guardrails.wholesale_min_qty`, engine throws `BelowWholesaleMinQtyError` (422).
- [ ] Existing spare-parts endpoints unchanged and functional.

**QA Verification:**
1. Open bulk RFQ with `quantity = 50` → 201.
2. Open bulk RFQ with `quantity = 2` when `wholesale_min_qty = 10` → 422 `below_wholesale_min_qty`.
3. Single-unit offer (`session_type = 'offer'`, `quantity = 1`) → 201 regardless of `wholesale_min_qty`.
4. `isNegotiationBlocked('spare_part')` → `false`.
5. Existing `GET /api/v1/verticals/spare-parts` → 200, unmodified shape.

**Files:**
- `packages/negotiation/src/engine.ts` (wholesale min qty check + `BelowWholesaleMinQtyError`)

---

### Task 6.3: `logistics-delivery` — Charter / Bulk Freight Negotiation
**Priority:** P1  
**Est:** 3h  
**Dependencies:** [Phase 4 complete]  
**Acceptance Criteria:**
- [ ] `listing_type` for charter/freight sessions is `'logistics_route'` (document in engine).
- [ ] Only `session_type = 'bulk_rfq'` or `'service_quote'` allowed for logistics listings (standard `'offer'` session type is rejected with 422 `invalid_session_type_for_listing`). Per-parcel delivery remains fixed pricing only.
- [ ] `POST /negotiation/sessions` with `listing_type = 'logistics_route'`, `session_type = 'bulk_rfq'` → 201.
- [ ] `POST /negotiation/sessions` with `listing_type = 'logistics_route'`, `session_type = 'offer'` → 422.
- [ ] Existing logistics-delivery endpoints unchanged.

**QA Verification:**
1. `session_type = 'bulk_rfq'` for logistics → 201.
2. `session_type = 'offer'` for logistics → 422 `invalid_session_type_for_listing`.
3. `isNegotiationBlocked('logistics_route')` → `false`.
4. `GET /api/v1/verticals/logistics-delivery` → 200, unmodified.

**Files:**
- `packages/negotiation/src/engine.ts` (listing-type session-type guard)

---

## Phase 7: Checkout Integration (Est: 2 days)

### Task 7.1: Price-Lock Token Checkout Flow
**Priority:** P0  
**Est:** 4h  
**Dependencies:** [3.5, Phase 4 complete]  
**Acceptance Criteria:**
- [ ] When a session reaches `status = 'accepted'`, the `POST /sessions/:id/accept` response includes a `price_lock_token` field.
- [ ] Checkout endpoint (in `@webwaka/payments` or the relevant checkout route) accepts an optional `price_lock_token` parameter.
- [ ] If `price_lock_token` is provided: call `verifyPriceLockToken(token, tenantId)`; use `final_price_kobo` from the token as the order amount instead of the listing's catalog price.
- [ ] If `price_lock_token` is invalid or expired → checkout returns 422 `invalid_price_lock`.
- [ ] Paystack initialisation receives the token-verified `final_price_kobo` as `amount` in kobo (integer).
- [ ] Paystack `amount` field is always an integer. Assert `Number.isInteger(amount)` before the Paystack API call.
- [ ] On successful Paystack verification: write an order/booking row in the relevant vertical table with `total_kobo = final_price_kobo`. The negotiation session is NOT the order — the vertical's order table is still the source of truth for the order.

**QA Verification:**
1. Valid `price_lock_token` → Paystack initialised with correct kobo amount.
2. Expired token (25h old) → 422 `invalid_price_lock`.
3. Wrong-tenant token → 422 `invalid_price_lock`.
4. `amount` sent to Paystack: `typeof amount === 'number' && Number.isInteger(amount)` → true.
5. Fixed-price checkout with no token → unchanged behaviour (token is optional field).

**Files:**
- Checkout route / `@webwaka/payments` integration point
- `packages/negotiation/src/price-lock.ts`

---

### Task 7.2: Listing Reservation on Acceptance (Single-Item Goods)
**Priority:** P1  
**Est:** 3h  
**Dependencies:** [7.1]  
**Acceptance Criteria:**
- [ ] On `POST /sessions/:id/accept` for a `listing_type` that represents a unique/single item (used_car, real_estate_property), the underlying vertical table row's `status` is set to `'reserved'` (or equivalent).
- [ ] The listing is removed from active search/catalog results while `'reserved'`.
- [ ] If payment is not completed within 24 hours of acceptance, a cleanup job (see Phase 8) reverts `status` to `'available'` and sets the negotiation session to `'cancelled'`.
- [ ] For repeatable services or multi-unit goods (`spare_part`, `logistics_route`), no reservation is set.
- [ ] The distinction between single-item and multi-unit listing types is declared as a constant in the engine: `SINGLE_ITEM_LISTING_TYPES = ['used_car', 'real_estate_property']`.

**QA Verification:**
1. Accept a used_car session → vertical table row `status = 'reserved'`.
2. Accept a spare_part session → spare_part table row unchanged.
3. Reserved used_car → does not appear in `GET /api/v1/verticals/used-car-dealer` active listings.
4. 24h unpaid reservation → listing reverts to `'available'`; session → `'cancelled'`.

**Files:**
- `packages/negotiation/src/engine.ts` (`SINGLE_ITEM_LISTING_TYPES` + reservation logic)
- `apps/api/src/routes/negotiation.ts` (calls reservation logic on accept)

---

## Phase 8: Background Jobs + Analytics (Est: 2 days)

### Task 8.1: CRON — Session Expiry Sweep
**Priority:** P0  
**Est:** 3h  
**Dependencies:** [2.3]  
**Acceptance Criteria:**
- [ ] Cloudflare Worker scheduled trigger configured in `wrangler.toml`: `cron = "*/15 * * * *"` (every 15 minutes).
- [ ] Handler calls `NegotiationRepository.expireOpenSessions(db)` — no `tenant_id` filter (sweeps all tenants).
- [ ] For each expired session: writes audit log entry `event_type = 'expired'`, `actor_type = 'system'`.
- [ ] For each expired session where the listing is single-item type: reverts listing `status` to `'available'`.
- [ ] Handler is idempotent — running twice in the same window has no adverse effect (already-expired rows are not touched again due to `status = 'open'` filter in the query).
- [ ] Handler logs count of expired sessions (via `console.log`) for observability.
- [ ] Handler does NOT throw uncaught errors — all DB errors are caught and logged.

**QA Verification:**
1. Insert session with `expires_at = unixepoch() - 1` and `status = 'open'` → trigger handler → session status → `'expired'`; audit row written.
2. Already-`'expired'` session → not touched on second run.
3. Reserved used_car session expired → vertical table status reverted to `'available'`.
4. Handler called with no open sessions → logs `"0 sessions expired"` (no error).
5. Simulate DB error → handler logs error; does NOT crash the Worker.

**Files:**
- `wrangler.toml` (cron trigger)
- `apps/api/src/jobs/negotiation-expiry.ts`

---

### Task 8.2: CRON — Abandoned Acceptance Cleanup
**Priority:** P1  
**Est:** 2h  
**Dependencies:** [7.2, 8.1]  
**Acceptance Criteria:**
- [ ] Scheduled trigger (reuse the same 15-min CRON or add a separate hourly one).
- [ ] Query: sessions where `status = 'accepted'` AND `updated_at < unixepoch() - 86400` (24h ago) AND no payment record exists for the session.
- [ ] For each matched session: set `status = 'cancelled'`; revert listing reservation if single-item.
- [ ] Write audit `cancelled`, `actor_type = 'system'`.
- [ ] Idempotent.

**QA Verification:**
1. Accepted session 25h ago with no payment → status → `'cancelled'`; listing unreserved.
2. Accepted session 23h ago → not touched.
3. Accepted session with payment → not touched.
4. Handler runs twice → second run has no effect.

**Files:**
- `apps/api/src/jobs/negotiation-expiry.ts` (extend existing handler or separate function)

---

### Task 8.3: Seller Analytics Query
**Priority:** P1  
**Est:** 3h  
**Dependencies:** [2.3]  
**Acceptance Criteria:**
- [ ] `NegotiationRepository.getSellerAnalytics(db, sellerWorkspaceId, tenantId, fromUnix?, toUnix?): Promise<SellerAnalytics>` implemented.
- [ ] Uses a single compound SQL query (or at most 3 queries) — not N+1.
- [ ] All intermediate calculations done in SQL integer arithmetic (SQLite `CAST AS INTEGER`, `/ 10000`).
- [ ] Returns `SellerAnalytics` interface: `total_sessions`, `open_sessions`, `accepted_sessions`, `declined_sessions`, `expired_sessions`, `acceptance_rate_bps`, `avg_discount_depth_bps`, `avg_rounds_to_close`.
- [ ] Division by zero guarded in SQL: `CASE WHEN COUNT(*) = 0 THEN 0 ELSE ... END`.

**QA Verification:**
1. Empty dataset → all fields = 0.
2. 2 accepted sessions (listed: 4,200,000; final: 3,900,000 and 4,000,000) → `avg_discount_depth_bps` = `Math.floor(((4200000-3900000)*10000/4200000 + (4200000-4000000)*10000/4200000) / 2)` = `Math.floor((714 + 476) / 2)` = `595`.
3. `acceptance_rate_bps` = `Math.floor(2/3 * 10000)` = 6666 for 2 accepted of 3 total.
4. All returned values are integers (no JSON decimal points).

**Files:**
- `packages/negotiation/src/repository.ts`

---

## Phase 9: QA + Polish (Est: 3 days)

### Task 9.1: Security Audit — Guardrails and Authorization
**Priority:** P0  
**Est:** 4h  
**Dependencies:** [All phases complete]  
**Acceptance Criteria:**
- [ ] `min_price_kobo` never appears in any API response body (grep: `min_price` in all route files and types that are serialised to responses — must be absent or explicitly excluded from response DTOs).
- [ ] All session endpoints verify actor authorization against `session.seller_workspace_id` or `session.buyer_ref_id`. No session is readable by a third party.
- [ ] `DELETE /listings/:type/:id/mode` verifies caller's `workspace_id` matches `listing_price_overrides.workspace_id`.
- [ ] `PUT /policy` reads `workspace_id` from auth context, never from request body.
- [ ] All SQL parameters use `?` bindings — grep for any string interpolation in query strings.
- [ ] Blocked vertical list is enforced at engine layer, not only at route layer (so it cannot be bypassed by calling internal functions directly).
- [ ] `price_lock_token` is verified for tenant match on every checkout use.

**QA Verification:**
1. Grep `min_price` in all response serialisation paths → 0 matches.
2. Attempt `GET /sessions/:id` as an unrelated authenticated user → 403.
3. Attempt `PUT /policy` with `workspace_id` in request body → body field ignored; auth workspace used.
4. Grep SQL query strings for `${}` or `+` concatenation → 0 matches (all parameterised).
5. Call `openSession` directly with `listing_type = 'pharmacy_chain'` → `NegotiationBlockedError` (engine-level, not just route-level).

**Files:** Review across all new files

---

### Task 9.2: P9 / Float Audit
**Priority:** P0  
**Est:** 2h  
**Dependencies:** [All phases complete]  
**Acceptance Criteria:**
- [ ] Grep all new `.ts` files and `.sql` files for: `parseFloat`, `REAL`, `FLOAT`, `NUMERIC`, `DOUBLE`, `toFixed`, `.5`, `/100`, `* 100` (the last two should only appear in UI display conversion, not in business logic).
- [ ] Every monetary calculation uses `Math.floor` (never `Math.round` or `Math.ceil`) to enforce seller-favour rounding.
- [ ] `shouldAutoAccept`, `isOfferExceedsMaxDiscount`, `isOfferBelowFloor`, all analytics aggregations: verified integer-only.
- [ ] `SellerAnalytics` response: all numeric fields pass `Number.isInteger` in a test fixture.

**QA Verification:**
1. Grep `parseFloat` in `packages/negotiation/src/` → 0 matches.
2. Grep `REAL` or `FLOAT` in `infra/db/migrations/018*.sql` → 0 matches.
3. Unit test: `shouldAutoAccept(3780001, 4200000, 1000)` → `true`; result is integer-derived.
4. Unit test: `acceptanceRateBps(1, 3)` → `3333` (integer floor, not `3333.33...`).

**Files:** Audit across all new files

---

### Task 9.3: Regression Check — Existing Verticals Unaffected
**Priority:** P0  
**Est:** 3h  
**Dependencies:** [All phases complete]  
**Acceptance Criteria:**
- [ ] All existing vertical routes (`/api/v1/verticals/*`) return the same response shapes as before this implementation.
- [ ] No new column added to any existing vertical table.
- [ ] No existing vertical `package.json` modified.
- [ ] `apps/api/src/index.ts` mounts negotiation router without disturbing existing route order.
- [ ] Existing `authMiddleware` guard on `/api/v1/verticals/*` is unchanged.

**QA Verification:**
1. `GET /api/v1/verticals/used-car-dealer` → 200, same schema as pre-implementation.
2. `GET /api/v1/verticals/spare-parts` → 200, same schema.
3. `GET /api/v1/verticals/logistics-delivery` → 200, same schema.
4. `GET /api/v1/verticals/pharmacy-chain` → 200, same schema (negotiation is just not available for it).
5. `tsc --noEmit` on `apps/api` → zero errors.

**Files:** Integration test against existing route files

---

### Task 9.4: End-to-End Smoke Test — Full Negotiation Lifecycle
**Priority:** P0  
**Est:** 4h  
**Dependencies:** [All phases complete]  
**Acceptance Criteria:**
- [ ] Complete the following flow against a running dev instance:
  1. Seller: `PUT /negotiation/policy` → `default_pricing_mode: 'negotiable'`, `max_discount_bps: 1500`, `max_offer_rounds: 3`.
  2. Seller: `POST /negotiation/listings/spare_part/:id/mode` → `pricing_mode: 'hybrid'`.
  3. Buyer: `GET /negotiation/listings/spare_part/:id/mode` → returns `'hybrid'`.
  4. Buyer: `POST /negotiation/sessions` → 201, `status: 'open'`.
  5. Seller: `GET /negotiation/sessions` → session visible.
  6. Seller: `POST /sessions/:id/offer` (`offered_by: 'seller'`, counteroffer) → 200.
  7. Buyer: `POST /sessions/:id/offer` (`offered_by: 'buyer'`, higher offer) → 200.
  8. Seller: `POST /sessions/:id/accept` → 200, `price_lock_token` present, `final_price_kobo` set.
  9. Checkout: submit `price_lock_token` → Paystack initialised with correct kobo amount.
  10. `GET /negotiation/analytics` (seller) → `accepted_sessions: 1`, `acceptance_rate_bps > 0`.
- [ ] All 10 steps succeed without error.

**QA Verification:**
1. Steps 1–10 all return expected HTTP status codes.
2. `final_price_kobo` in step 8 matches the buyer's offer in step 7.
3. Paystack `amount` in step 9 equals `final_price_kobo`.
4. Analytics `acceptance_rate_bps` in step 10 is an integer > 0.
5. `negotiation_audit_log` contains entries: `session_opened`, `countered`, `offer_submitted`, `accepted`.

**Files:** None (manual/integration test execution)

---

### Task 9.5: Documentation Update
**Priority:** P2  
**Est:** 2h  
**Dependencies:** [All phases complete]  
**Acceptance Criteria:**
- [ ] `replit.md` updated: new package `@webwaka/negotiation` listed; new migrations 0181–0185 listed; new API routes listed.
- [ ] `NEGOTIATION_BLOCKED_VERTICALS` list documented in `packages/negotiation/src/engine.ts` with a comment block explaining the rationale (regulatory, FMCG, civic).
- [ ] `docs/plans/negotiable-pricing-implementation-plan.md` (this file) remains accurate with final state checked off.

**QA Verification:**
1. `replit.md` contains entry for `@webwaka/negotiation`.
2. Engine file has block comment above `NEGOTIATION_BLOCKED_VERTICALS` with rationale.
3. All Task 9 acceptance criteria marked complete.

**Files:**
- `replit.md`
- `packages/negotiation/src/engine.ts`

---

## Deploy Checklist

### Pre-Deploy
- [ ] All 5 migrations (0181–0185) applied to production D1 database via `wrangler d1 migrations apply`.
- [ ] Migration apply is idempotent (`IF NOT EXISTS` on all `CREATE TABLE` and `CREATE INDEX`).
- [ ] `@webwaka/negotiation` package built (`pnpm --filter @webwaka/negotiation build`) with zero TypeScript errors.
- [ ] `apps/api` builds with zero TypeScript errors (`pnpm --filter @webwaka/api build`).
- [ ] `wrangler.toml` has CRON trigger configured for negotiation expiry job.
- [ ] No `parseFloat`, `REAL`, `FLOAT`, or float literals in any new file (float audit Task 9.2 passed).
- [ ] `min_price_kobo` grep across response serialisation paths: 0 matches.
- [ ] All blocked verticals confirmed in `NEGOTIATION_BLOCKED_VERTICALS` constant.

### Deployment
- [ ] Deploy `apps/api` to Cloudflare Workers via `wrangler deploy`.
- [ ] Confirm CRON trigger registered in Cloudflare Dashboard → Workers → Triggers.
- [ ] Smoke test `GET /api/v1/negotiation/policy` (authenticated) → 404 (not configured yet, as expected) or 200 if seeded.
- [ ] Smoke test `GET /api/v1/verticals/used-car-dealer` → 200 (regression check).

### Post-Deploy
- [ ] Monitor Cloudflare Workers logs for 30 minutes after deploy for unhandled errors.
- [ ] Confirm first CRON run completes without error (check Worker logs).
- [ ] Seed one pilot seller with a pricing policy (`PUT /negotiation/policy`) as an integration validation.
- [ ] Open one test negotiation session end-to-end with a test buyer account.
- [ ] Confirm `negotiation_audit_log` has entries for the test session.
- [ ] Alert: if any `NegotiationBlockedError` is thrown for a non-blocked vertical, page on-call immediately.

---

## File Inventory

### New Migrations
| File | Migration # | Table |
|---|---|---|
| `infra/db/migrations/0181_negotiation_vendor_policies.sql` | 0181 | `vendor_pricing_policies` |
| `infra/db/migrations/0182_negotiation_listing_overrides.sql` | 0182 | `listing_price_overrides` |
| `infra/db/migrations/0183_negotiation_sessions.sql` | 0183 | `negotiation_sessions` |
| `infra/db/migrations/0184_negotiation_offers.sql` | 0184 | `negotiation_offers` |
| `infra/db/migrations/0185_negotiation_audit_log.sql` | 0185 | `negotiation_audit_log` |

### New Package
| File | Purpose |
|---|---|
| `packages/negotiation/package.json` | Package manifest |
| `packages/negotiation/tsconfig.json` | TypeScript config |
| `packages/negotiation/src/types.ts` | All domain types |
| `packages/negotiation/src/guardrails.ts` | Pure arithmetic functions |
| `packages/negotiation/src/repository.ts` | All DB access |
| `packages/negotiation/src/engine.ts` | FSM + business rules |
| `packages/negotiation/src/price-lock.ts` | Token generation/verification |
| `packages/negotiation/src/index.ts` | Public exports |

### Modified API Files
| File | Change |
|---|---|
| `apps/api/src/routes/negotiation.ts` | New — 13 endpoints |
| `apps/api/src/index.ts` | Add negotiation router mount + auth guard |
| `apps/api/src/jobs/negotiation-expiry.ts` | New — CRON job handler |
| `wrangler.toml` | Add CRON trigger |

### Existing Files — NOT MODIFIED
All files under `apps/api/src/routes/verticals/` — zero changes.  
All files under `packages/verticals-*/` — zero changes.  
All files under `infra/db/migrations/0001_*` through `0180_*` — zero changes.

---

*End of implementation plan.*
