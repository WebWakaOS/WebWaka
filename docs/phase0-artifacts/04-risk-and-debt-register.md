# Artifact 04 — Risk and Technical Debt Register
## WebWaka OS: Every Known Risk, Debt Item, and Blocker (Phase 0 Deep Discovery)

**Status:** AUTHORITATIVE — Phase 0 Deep Discovery output  
**Date:** 2026-05-02  
**Evidence standard:** Every item traced to specific file, report, or governance document.  
**Severity scale:** 🔴 CRITICAL | ⚠️ HIGH | 🟡 MEDIUM | 🔵 LOW

---

## PART 1 — CRITICAL RISKS (Require Immediate Action)

### RISK-001 — Cloudflare API Token Exposed in Public Commit
**Severity:** 🔴 CRITICAL  
**Category:** Security  
**Source:** `HANDOVER.md` §TOKEN-ROTATE, `infra/cloudflare/secrets-rotation-log.md`  
**Description:** A Cloudflare API token was inadvertently committed to a public GitHub commit. Although the token may have been rotated, the exposure window is unknown and the token may have been harvested by automated scanners.  
**Risk:** Full Cloudflare account compromise — ability to deploy malicious Workers, delete D1 databases, modify DNS, access R2 data.  
**Required action:**
1. Immediately verify current `CLOUDFLARE_API_TOKEN` is a newly generated token (post-exposure)
2. Check CF audit log for unauthorized API calls during exposure window
3. Rotate all dependent secrets that were accessible via the exposed token
4. Update `infra/cloudflare/secrets-rotation-log.md` with rotation record
5. Enable CF API token IP restriction to GitHub Actions runner IPs  
**Owner:** Founder / Ops  
**Deadline:** IMMEDIATE — before any further deployment

---

### RISK-002 — Notification Engine Staging Blockers (3 unresolved)
**Severity:** 🔴 CRITICAL (for notification delivery to work in staging)  
**Category:** Infrastructure / Operations  
**Source:** `docs/qa/reports/RELEASE-READINESS.md`  
**Blockers:**

| ID | Description | Required Action |
|---|---|---|
| UI-001 | D1 staging database ID mismatch in `apps/notificator/wrangler.toml` — notificator pointed at wrong D1 ID | Ops: align `database_id` in notificator's wrangler.toml to staging D1 ID `52719457-5d5b-4f36-9a13-c90195ec78d2` |
| UI-002 | `NOTIFICATION_KV` KV namespace not provisioned (needed for provider credentials, ADL-002) | Ops: `wrangler kv namespace create NOTIFICATION_KV --env staging && wrangler kv namespace create NOTIFICATION_KV --env production`; add IDs to wrangler.toml |
| UI-003 | `NOTIFICATION_PIPELINE_ENABLED="1"` not set in staging — pipeline disabled | Ops: `wrangler secret put NOTIFICATION_PIPELINE_ENABLED --env staging` → value `1` (do AFTER UI-001/002) |

**Impact:** Until resolved, all notification delivery falls back to legacy email path only. No SMS, WhatsApp, Telegram, In-App, or Push notifications on staging.  
**Owner:** Ops/DevOps

---

### RISK-003 — apps/api ESLint Errors (CI Lint Gate Failure)
**Severity:** ⚠️ HIGH  
**Category:** Code Quality / CI  
**Source:** `HANDOVER.md` §3a  
**Description:** The main API app has ESLint errors in 3 categories blocking the CI lint gate:

| Category | Error Type | Fix |
|---|---|---|
| A | `no-unnecessary-type-assertion` — on every `await res.json() as SomeType` pattern | Add typed helper `async function typedJson<T>(res: Response): Promise<T> { return res.json() as Promise<T>; }` |
| B | `no-unsafe-argument` — on Hono `Context` type passing | Add `// eslint-disable-next-line @typescript-eslint/no-unsafe-argument` per occurrence |
| C | `no-empty` — one empty `catch {}` block (line 63) | Change to `catch (_e) { /* intentionally empty — non-critical path */ }` |

**Impact:** CI lint job fails on `apps/api`. Staging deploy gate may be bypassed but production deploy should not proceed with failing lint.  
**Effort:** 2–4 hours  
**Owner:** Engineering

---

### RISK-004 — SMOKE_API_KEY Not Provisioned
**Severity:** 🟡 MEDIUM  
**Category:** CI/CD  
**Source:** `HANDOVER.md` §3b  
**Description:** The `SMOKE_API_KEY` GitHub Actions secret is not provisioned. Smoke test steps use `continue-on-error: true` so deploy does not fail, but smoke tests are effectively disabled.  
**Impact:** Production deployments proceed without API smoke testing. Silent regressions can reach production.  
**Required action:** Generate a valid API key for staging (create via admin dashboard or D1 directly), add to GitHub repo secrets as `SMOKE_API_KEY`.  
**Owner:** Engineering / Ops

---

## PART 2 — HIGH-PRIORITY TECHNICAL DEBT

### DEBT-001 — support-groups Module: Election-Specific Naming (PRD Class 1)
**Severity:** ✅ RESOLVED (Phase 1 — P1-010/011/012/013)  
**Category:** Architecture / Naming Debt  
**Source:** `docs/reports/WEBWAKA-UNIVERSAL-MOBILIZATION-PLATFORM-PRD.md` §1.4, Blueprint §1.3  

**Resolution summary (May 2026):**

| Was | Now |
|---|---|
| `@webwaka/support-groups` (canonical) | `@webwaka/groups` (canonical); `@webwaka/support-groups` is pure re-export alias |
| `/support-groups/*` API routes | `/groups/*` (308 redirect from `/support-groups/*`) |
| `SupportGroupEventType` | `GroupEventType` (canonical); `SupportGroupEventType` = deprecated alias |
| `support_group_id` in fundraising | `group_id` (migration 0462) |
| `support_group` slug in vertical-engine | `group` slug |
| `support_group` in vertical-ai-config | `group` slug |
| `support_group` block type in wakapage-blocks | removed (was `'support_group'` block type) |
| `indexSupportGroup` in search-index | `indexGroup` (canonical); `indexSupportGroup` = deprecated alias |
| 14 `support_groups_*` shadow tables | dropped (migration 0462) |

**Migration:** `0462_drop_support_groups_shadow_tables.sql` (forward + rollback).  
**Tests:** groups 24/24, fundraising 48/48, wakapage-blocks 18/18 — all passing.  
**Note:** `GroupEventType` still emits `'support_group.*'` string values intentionally for backward compat with existing event consumers.  
**Owner:** Engineering  
**Closed:** Phase 1

---

### DEBT-002 — Fundraising Module: INEC-Specific Compliance Fields
**Severity:** ✅ RESOLVED (Phase 1 — P1-020/021/022/023)  
**Category:** Architecture / Naming Debt  
**Source:** `docs/reports/WEBWAKA-UNIVERSAL-MOBILIZATION-PLATFORM-PRD.md` §1.4  

**Resolution summary (May 2026):**

| Was | Now | Task |
|---|---|---|
| `inec_cap_kobo` DB column | `contribution_cap_kobo` | P1-021 + migration 0463 |
| `inec_disclosure_required` DB column | `disclosure_required` | P1-021 + migration 0463 |
| `inecCapKobo` TS field | `contributionCapKobo` | P1-021 |
| `inecDisclosureRequired` TS field | `disclosureRequired` | P1-021 |
| `checkInecCap()` only | `checkContributionCap()` added (P1-022); `checkInecCap()` kept for backward compat + tests | P1-022 |
| Hardcoded `INEC_DEFAULT_CAP_KOBO` in route | `evaluateFinancialCap()` from `@webwaka/policy-engine` in contribution handler | P1-022 |

**Migration:** `0463_rename_fundraising_compliance_fields.sql` (forward + rollback).  
**Tests:** 48/48 fundraising tests passing post-rename.  
**Note:** `INEC_DEFAULT_CAP_KOBO` constant retained for test assertions and campaign-creation default logic. Policy rule already seeded in migration 0434.  
**Owner:** Engineering  
**Closed:** Phase 1

---

### DEBT-003 — PlatformLayer Enum: 4 Dead Values
**Severity:** ✅ RESOLVED (Phase 1 — P1-030/031)  
**Category:** Architecture / Type Debt  
**Source:** `docs/reports/WEBWAKA-UNIVERSAL-MOBILIZATION-PLATFORM-PRD.md` §1.4 Class 3  
**Audit result (May 2026):** All 11 `PlatformLayer` values are actively used. The "4 dead values" description in Phase 0 was stale.

| Value | Plan Tiers | Status |
|---|---|---|
| Discovery | free, starter, growth, pro, enterprise, partner, sub_partner | ✅ Active |
| Operational | starter, growth, pro, enterprise, partner, sub_partner | ✅ Active |
| Commerce | growth, pro, enterprise, partner, sub_partner | ✅ Active |
| Civic | starter, growth, pro, enterprise, partner, sub_partner | ✅ Active (added Phase 0) |
| AI | growth, pro, enterprise, partner, sub_partner | ✅ Active (added Phase 0) |
| Transport | pro, enterprise, partner | ✅ Active |
| Professional | pro, enterprise, partner | ✅ Active |
| Creator | pro, enterprise, partner | ✅ Active |
| WhiteLabel | enterprise, partner, sub_partner | ✅ Active |
| Political | enterprise, partner only | ✅ Active — intentionally enterprise-only (sensitiveSectorRights=true) |
| Institutional | enterprise, partner only | ✅ Active — intentionally enterprise-only (sensitiveSectorRights=true) |

**Resolution:** No code changes needed. All values are in `LAYER_CODE_MAP` in `workspace-entitlement-context.ts`. Political and Institutional are correctly restricted to enterprise/partner plans as sensitive-sector layers requiring regulatory clearance.  
**Owner:** Engineering  
**Closed:** Phase 1

---

### DEBT-004 — i18n Coverage Gap (35% for Nigeria-Native Locales)
**Severity:** 🟡 MEDIUM  
**Category:** UX / Localization  
**Source:** `docs/reports/i18n-gap-report.md`, Phase 1 completion report  
**Description:** Nigeria-native locales (ha, ig, yo, pcm) are at 35% coverage. 136 keys missing per locale. French is at 56% (100 keys missing). PRD UX-15 requires 90%+ before GA.

**Missing key domains (all 4 Nigeria-native locales):**
- Actions (7 keys)
- AI assistant (12 keys)
- Analytics (12 keys)
- Auth (6 keys)
- B2B marketplace (15 keys)
- Cases module (new — not yet in any locale)
- Groups/fundraising module (new — not yet in any locale)
- Policy engine messages (new)
- 60+ other cross-domain keys

**Required action:** Fill 136 × 4 = 544 total missing translations + new keys for Phase 1–3 modules.  
**Owner:** Content / Engineering  
**Milestone target:** Before GA

---

### DEBT-005 — vertical-engine Dual-Path Routing (Legacy vs Engine)
**Severity:** ✅ RESOLVED (Phase 1 — P1-040/041)  
**Category:** Architecture  
**Source:** `apps/api/src/route-groups/register-vertical-engine-routes.ts`  
**Resolution:** Dead `_engineFeatureFlagMiddleware` no-op function removed (Phase 1). The Hono middleware model cannot implement header-based routing to different route groups — both branches always called `next()`. This architectural constraint is now documented in the file header comment.

**Current state (post-P1-040):**
- Engine routes ARE registered and active, mounted AFTER legacy routes in server.ts.
- Route precedence: Hono resolves by registration order — legacy wins on path conflict.
- Traffic shifting must be done at load-balancer or Cloudflare Worker routing rule level (not Hono middleware).
- Migration path to engine-only documented in `register-vertical-engine-routes.ts` header (step-by-step per vertical).
- ADR: `docs/adrs/0048-vertical-engine-routing.md` (pending creation, Phase 2).

**Remaining work (Phase 2):** Run parity-all.test.ts; migrate verticals one-by-one by unregistering legacy routes.  
**Owner:** Engineering  
**Closed:** Phase 1 (P1-040 done; P1-041 documentation complete in file header)

---

### DEBT-006 — Partner Model: Phases 3 and 4 Not Started
**Severity:** 🟡 MEDIUM  
**Category:** Feature Completeness  
**Source:** `docs/governance/partner-and-subpartner-model.md`  
**Description:** Partner model Phases 1+2 are complete (registration, delegation, sub-partners). Phases 3 and 4 are not started:
- Phase 3: Partner billing, revenue share (WakaCU wholesale allocation), white-label depth control per subscription tier
- Phase 4: Partner analytics dashboard, partner-level audit logs, partner→sub-partner cascading entitlements  
**Impact:** Partners cannot be monetized. No revenue share model implemented. No partner analytics.  
**Owner:** Engineering  
**Milestone target:** M11-M12

---

### DEBT-007 — D1 Multi-Region Latency (180–250ms Nigeria Round-Trip)
**Severity:** 🔵 LOW (blocked on CF)  
**Category:** Performance  
**Source:** `docs/adr/ADR-0044-d1-multi-region-replication.md`  
**Description:** D1 primary location is `wnam` (Western North America). Nigerian edge-to-D1 latency is 180–250ms. Cloudflare has announced D1 read replication but has not yet deployed African region replicas. `read_replication = { mode = "auto" }` in wrangler.toml is currently a no-op.  
**Target:** `waf1`/`meaf` replicas would reduce read latency to ~35–40ms for Nigerian users.  
**Required action:** None now — monitor CF D1 roadmap. When African replicas are announced, verify wrangler.toml `read_replication` config and test.  
**Owner:** Engineering (monitoring)

---

### DEBT-008 — Dependabot Vulnerabilities (3 Moderate)
**Severity:** ✅ RESOLVED (Phase 1 — P1-050)  
**Category:** Security  
**Source:** `HANDOVER.md` §3d  
**Resolution:** `pnpm audit` run May 2026 — **0 known vulnerabilities found**. The 3 moderate vulnerabilities originally flagged by GitHub Dependabot have been resolved by dependency updates applied in prior sprints.  
**Owner:** Engineering  
**Closed:** Phase 1

---

### DEBT-009 — E2EE Direct Messages (Proposed, Not Implemented)
**Severity:** 🔵 LOW (proposed)  
**Category:** Feature / Architecture  
**Source:** `docs/adr/ADR-0043-e2e-dm-encryption.md`  
**Description:** Current DM encryption is server-side AES-GCM (server holds DM_MASTER_KEY). ADR-0043 proposes true E2EE using recipient public keys. Status: Proposed, not yet implemented.  
**Current state:** Server-side encryption is appropriate for platforms needing content moderation, legal hold, and compliance (all applicable to WebWaka).  
**Required action:** No immediate action. Revisit if user privacy requirements escalate.  
**Owner:** Engineering (future)

---

### DEBT-010 — S05 Batch 6 INEC Candidates (SQL Generation Pending)
**Severity:** 🟡 MEDIUM  
**Category:** Seeding / Data  
**Source:** `docs/reports/phase-s05-political-foundation-coverage-report-2026-04-22.md`  
**Description:** 8,971 INEC 2023 HoA candidates JSON extracted from official INEC PDF. SQL generation for migration is pending. This would complete the political seeding for the 9th Assembly election candidates.  
**Required action:** Run SQL generation script against the extracted JSON; create migration `0462_political_hoa_candidates_seed.sql`; validate and apply to staging.  
**Owner:** Data Engineering

---

### DEBT-011 — State Assembly Seeding Gap (35 of 36 States Missing)
**Severity:** 🟡 MEDIUM  
**Category:** Seeding / Data  
**Source:** `docs/reports/phase-s05-deferred-items-source-research-2026-04-22.md`  
**Description:** Only Lagos State Assembly (40 members) has been seeded. The remaining 35 state assemblies (~950 members) could not be seeded because Wikipedia only has a structured list for Lagos. No consolidated national source exists.  
**Required action:** Either (a) source per-state official HoA websites for each state, or (b) defer to a future manual seeding sprint when field partner data is available.  
**Owner:** Data Engineering (future sprint)

---

### DEBT-012 — LGA Chairpersons Not Seeded (774 LGAs)
**Severity:** 🟡 MEDIUM  
**Category:** Seeding / Data  
**Source:** `docs/reports/phase-s05-deferred-items-source-research-2026-04-22.md`  
**Description:** LGA chairpersons are elected by State SIECs (not INEC), so no consolidated national source exists. ALGON website was unreachable from CI environment. 36 per-state SIEC websites would need individual scraping.  
**Required action:** Priority states: Lagos, Kano, Rivers, Ogun, Oyo. Source from state government official websites.  
**Owner:** Data Engineering (future sprint)

---

### DEBT-013 — groups-electoral GOTV Tables Still Use support_groups Naming
**Severity:** ⚠️ HIGH  
**Category:** Naming Debt  
**Source:** Phase 0 architecture reset completion report, migration 0433  
**Description:** Migration 0433 (`0433_group_electoral_extensions.sql`) created electoral extension tables. The GOTV table naming may still reference `support_group_gotv_records` before rename migrations are applied.  
**Required action:** Verify that migrations 0432–0437 have been applied to staging D1 and that all `support_group_*` references have been renamed to `group_*` / `groups_*` throughout the codebase.  
**Owner:** Engineering

---

### DEBT-014 — /v2 Router Empty (Reserved but Unused)
**Severity:** 🔵 LOW  
**Category:** Architecture  
**Source:** `apps/api/src/routes/v2/index.ts`, `docs/adr/ADR-0018-api-versioning.md`  
**Description:** The `/v2` prefix is reserved per ADR-0018 for breaking changes. The router is mounted but the index is empty. No breaking changes have been gated here.  
**Required action:** None now. As breaking changes are planned, the v2 router must be populated. Ensure all v1 consumers have migration paths documented before v2 routes are activated.  
**Owner:** Engineering (future)

---

## PART 3 — COMPLETED RISKS (Resolved, For Reference)

| ID | Description | Resolution |
|---|---|---|
| RESOLVED-001 | JWT_SECRET_STAGING was empty (auth broken) | Fixed: 128-char hex written to CF via REST API |
| RESOLVED-002 | PBKDF2 hash property eaten by inline comment | Fixed: `packages/auth/src/hash.ts` corrected |
| RESOLVED-003 | 517 TypeScript compilation errors blocking CI | Fixed: All packages now typecheck clean |
| RESOLVED-004 | Wildcard CORS on projections and tenant-public workers | Fixed: Origin-restricted CORS |
| RESOLVED-005 | Admin dashboard `/admin/:workspaceId/dashboard` exposed without auth | Fixed: `authMiddleware` added |
| RESOLVED-006 | No login-specific rate limiting (brute-force surface) | Fixed: `authRateLimit` middleware |
| RESOLVED-007 | JWT refresh allows infinite token chaining | Fixed: Opaque token, single-use rotation |
| RESOLVED-008 | `/pos/*` routes not gated by entitlement (free-tier could access) | Fixed: `requireEntitlement(PlatformLayer.Operational)` added |
| RESOLVED-009 | CSS injection possible via fontFamily | Fixed: `sanitizeCssValue()` in white-label-theming |
| RESOLVED-010 | PBKDF2 iteration count at 100k (OWASP needs 600k) | Fixed: Updated to 600k iterations |
| RESOLVED-011 | T3 breach — contact_channels query missing tenant_id | Fixed: BUG-001 |
| RESOLVED-012 | function_call AI capability declared but not implemented | Fixed: F-019 — tool registry + handler dispatch |
| RESOLVED-013 | ESLint errors in brand-runtime, partner-admin, public-discovery, identity | Fixed: eslintrc.json added to 4 apps |
| RESOLVED-014 | USSD gateway queue name mismatch with notificator consumer | Fixed: DEF-001 |
| RESOLVED-015 | HITL legacy dispatch code still present in notificator | Fixed: DEF-002 / N-100b |
| RESOLVED-016 | Price-lock tokens unsigned (base64 only — forgeable) | Fixed: HMAC-SHA256 signed via PRICE_LOCK_SECRET |
| RESOLVED-017 | apps/api TypeScript `types.ts` missing (47 route files failing) | Fixed: Types moved to `@webwaka/types` package |
| RESOLVED-018 | Cloudflare D1/KV placeholder IDs in wrangler.toml | Fixed: Real IDs inserted |

---

## PART 4 — RISK HEAT MAP

```
PROBABILITY →
              LOW          MEDIUM         HIGH
            ┌───────────┬────────────────┬────────────────┐
HIGH        │           │ DEBT-001 (name)│ RISK-001 (CF   │
IMPACT      │           │ DEBT-002 (INEC)│   token)       │
            │           │ DEBT-013 (GOTV)│ RISK-002 (notif│
            ├───────────┼────────────────┤────────────────┤
MEDIUM      │ DEBT-009  │ DEBT-004 (i18n)│ RISK-003 (lint)│
IMPACT      │ (E2EE)    │ DEBT-008 (deps)│ RISK-004 (smoke│
            │ DEBT-014  │ DEBT-010 (S05) │   key)         │
            │ (v2 empty)│ DEBT-011 (st.  │                │
            │           │   assembly)    │                │
            ├───────────┼────────────────┼────────────────┤
LOW         │ DEBT-007  │ DEBT-003 (enum)│ DEBT-005 (dual │
IMPACT      │ (D1 latency│ DEBT-006 (ptnr│  path routing) │
            │ -- blocked)│   phases 3-4) │                │
            └───────────┴────────────────┴────────────────┘
```

**Immediate action required (top-right):**
1. RISK-001 — Rotate CF API token
2. RISK-002 — Resolve notification engine staging blockers (UI-001/002/003)
3. RISK-003 — Fix apps/api ESLint errors
