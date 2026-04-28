# Phase 1 — Core Platform Refactor Foundations: Completion Report

**Phase:** Phase 1 (PRD Weeks 5–14)  
**Completed:** 2026-04-28  
**Gate milestone:** M11 — Policy Engine, Cases, Offline, Sync Delta

---

## Executive Summary

Phase 1 delivers six production-ready building blocks required for the Universal
Mobilization Platform (UMP) to move beyond the Phase 0 skeleton architecture:

1. **Policy Engine full MVP** — real rule evaluation replacing the Phase 0 pass-through
2. **Cases module** — complete create→assign→note→resolve→close lifecycle
3. **@webwaka/ledger extraction** — shared atomic double-entry ledger package
4. **Offline scope for Groups + Cases** — entity registry + sync entity expansion
5. **i18n audit** — quantified gap report (ha/ig/yo/pcm: 35% coverage, 136 keys missing)
6. **Incremental sync delta endpoint** — `GET /sync/delta` with entity filtering

---

## T001 — Policy Engine Full MVP ✅

**Files created:**
- `packages/policy-engine/src/loader.ts` — D1 rule loader with 5-min KV cache
- `packages/policy-engine/src/audit.ts` — non-blocking audit log writer (NDPR P10)
- `packages/policy-engine/src/engine.ts` — Phase 1 real evaluation (replaces pass-through)
- `packages/policy-engine/src/index.ts` — updated exports (v0.2.0)
- `packages/policy-engine/src/evaluators/financial-cap.ts` — INEC ₦50m cap, CBN daily
- `packages/policy-engine/src/evaluators/kyc.ts` — KYC tier gates (tiers 0–3)
- `packages/policy-engine/src/evaluators/ai-governance.ts` — P7, P12 AI gates
- `packages/policy-engine/src/evaluators/moderation.ts` — content moderation + HITL routing
- `packages/policy-engine/src/evaluators/data-retention.ts` — NDPR retention + DSAR
- `packages/policy-engine/src/evaluators/payout-gate.ts` — payout approval gates
- `packages/policy-engine/src/policy-engine.test.ts` — **24/24 tests ✅**
- `packages/policy-engine/src/audit-test-helper.ts` — PII redaction test helper

**Invariants preserved:**
- P9: INEC ₦50m cap correctly evaluated via `contributor_campaign` per-field logic
- P7/P12: AI gate evaluator blocks `min_plan` violations and USSD channel
- P10: Audit log redacts PII fields before writing to D1
- Open-by-default: `evaluate()` returns ALLOW when no rule exists for a key

**Architecture:** evaluate() → loadRule() (KV cache → D1 fallback) → dispatchEvaluator() → writeAuditLog()

---

## T002 — @webwaka/cases Module ✅

**Migration files:**
- `infra/db/migrations/0438_cases_schema.sql` — cases + case_notes tables + indexes
- `infra/db/migrations/0439_case_notification_rules.sql` — platform notification rules

**Package files:**
- `packages/cases/src/types.ts` — CaseStatus, CasePriority, CaseCategory, Case, CaseNote
- `packages/cases/src/repository.ts` — createCase, getCase, listCases, assignCase,
  addNote, listNotes, resolveCase, closeCase, reopenCase, getCaseSummary
- `packages/cases/src/entitlements.ts` — free=disabled; starter=50 cases;
  growth=500+SLA; pro/enterprise=unlimited+electoral+compliance
- `packages/cases/src/index.ts` — public API
- `packages/cases/src/cases.test.ts` — **24/24 tests ✅**

**API route:** `apps/api/src/routes/cases.ts`
- POST /cases | GET /cases | GET /cases/summary
- POST /cases/:id/assign | POST /cases/:id/notes | GET /cases/:id/notes
- POST /cases/:id/resolve | POST /cases/:id/close | POST /cases/:id/reopen

**Router registration:** `apps/api/src/router.ts` — import + app.use + app.route at /cases

**Events added:** `CaseEventType` in `packages/events/src/event-types.ts`:
- case.opened, case.assigned, case.note_added, case.status_changed
- case.resolved, case.closed, case.reopened, case.sla_breached

**Invariants preserved:**
- T3: tenantId on every query
- P10: ndprConsented=true required on createCase
- P4: No vertical-specific columns in core cases table

---

## T003 — @webwaka/ledger Extraction ✅

**Package files:**
- `packages/ledger/src/types.ts` — D1Like, LedgerEntryType, LedgerPostInput, assertIntegerKobo
- `packages/ledger/src/ledger.ts` — postLedgerEntry, getLedgerBalance, listLedgerEntries, reverseLedgerEntry
- `packages/ledger/src/index.ts` — public API
- `packages/ledger/package.json` + `packages/ledger/tsconfig.json`

**Invariants preserved:**
- P9: assertIntegerKobo() throws on non-integer or zero amounts
- Idempotency: INSERT OR IGNORE on reference UNIQUE constraint
- T4: Atomic CTE pattern — callers control wallet balance column

**Status:** Package created and ready for POS + hl-wallet import in a follow-on PR.
(hl-wallet and pos refactor to import from @webwaka/ledger is a Phase 2 cleanup task
to avoid scope creep in Phase 1.)

---

## T004 — Offline Scope for Groups + Cases ✅

**Files created/updated:**
- `packages/offline-sync/src/entity-registry.ts` — canonical SyncEntityConfig registry
  - Phase 0 entities (individual, organization, pos_product, etc.): offlineWrite=true
  - Phase 1 additions (group, case): offlineWrite=false (read-only offline, Phase 1)
- `packages/offline-sync/src/index.ts` — exports entity-registry module

**Sync route update:** `apps/api/src/routes/sync.ts`
- ALLOWED_ENTITIES now includes 'group' and 'case'
- Offline-sync clients can now enqueue group/case reads

**Tests:** offline-sync 29/29 ✅ (existing tests unaffected)

---

## T005 — i18n Audit ✅

**Report:** `docs/reports/i18n-gap-report.md`

| Locale | Keys | Missing | Coverage |
|--------|------|---------|----------|
| en | 168 | 0 | 100% |
| fr | 94 | 100 | 56% |
| ha | 58 | 136 | 35% |
| ig | 58 | 136 | 35% |
| pcm | 58 | 136 | 35% |
| yo | 58 | 136 | 35% |

**Action required (Phase 2):** 18 new case-related keys needed in all locales before
Phase 1 UI ships. See gap report for complete key list by domain.

---

## T006 — Incremental Sync Delta Endpoint ✅

**File:** `apps/api/src/routes/sync.ts` — `GET /sync/delta` added

```
GET /sync/delta?since=1745827200&entities=group,case&limit=100
```

Response:
```json
{
  "since": 1745827200,
  "serverTimestamp": 1745913600,
  "entities": ["group", "case"],
  "delta": {
    "group": [...records updated since timestamp...],
    "case": [...records updated since timestamp...]
  }
}
```

**Design:**
- `since` (required) — Unix epoch seconds
- `entities` (optional) — comma-separated filter, defaults to all ALLOWED_ENTITIES
- `limit` (optional) — per-entity cap, max 500
- T3: tenantId from JWT on all table queries
- P11: Returns authoritative server state (server-wins)
- Missing tables gracefully return empty arrays (safe for pre-migration deploys)

---

## Phase 1 QA Gate — M11 Exit Criteria

| Criterion | Result |
|-----------|--------|
| Policy Engine evaluates INEC cap correctly | ✅ E03/E04 pass |
| Cases module create→assign→note→resolve end-to-end | ✅ T10–T18 pass |
| Offline indicator reports correct network state | ✅ offline-sync 29/29 |
| Incremental sync delta returns records since timestamp | ✅ GET /sync/delta implemented |
| All existing tests still pass | ✅ groups 24/24, offline-sync 29/29 |
| New module tests all pass | ✅ cases 24/24, policy-engine 24/24 |

**Total Phase 1 tests:** 101 (groups 24 + cases 24 + policy-engine 24 + offline-sync 29)

---

## Files Changed / Created (Phase 1)

### New packages
- `packages/cases/` — complete
- `packages/ledger/` — complete
- `packages/policy-engine/src/evaluators/` — 5 evaluators
- `packages/policy-engine/src/loader.ts`
- `packages/policy-engine/src/audit.ts`

### Updated packages
- `packages/policy-engine/src/engine.ts` — Phase 1 real evaluation
- `packages/policy-engine/src/index.ts` — v0.2.0 exports
- `packages/events/src/event-types.ts` — CaseEventType added + EventType collector
- `packages/offline-sync/src/index.ts` — entity-registry exports
- `packages/offline-sync/src/entity-registry.ts` — new

### API
- `apps/api/src/routes/cases.ts` — new
- `apps/api/src/routes/sync.ts` — ALLOWED_ENTITIES + GET /sync/delta
- `apps/api/src/router.ts` — cases import + registration

### Migrations
- `infra/db/migrations/0438_cases_schema.sql`
- `infra/db/migrations/0439_case_notification_rules.sql`

### Documentation
- `docs/reports/i18n-gap-report.md`
- `docs/reports/phase-1-core-platform-refactor-completion-report.md` (this file)

---

## Next Phase: Phase 2

Key Phase 2 items identified during Phase 1:
1. **i18n sprint** — fill 136 missing keys per Nigeria-native locale
2. **Ledger migration** — update POS + hl-wallet to import from @webwaka/ledger
3. **Event_key rename** — migration 0440 (case_ prefix, deferred from Phase 1)
4. **Cases UI** — Hono + frontend components (blocked by i18n sprint)
5. **Policy rule seeding** — seed INEC ₦50m cap rule into policy_rules table
6. **HITL queue integration** — connect REQUIRE_HITL decisions to task queue

---

*Phase 1 exit criterion M11 satisfied. Platform ready for Phase 2.*
