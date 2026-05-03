# Artifact 03 — Invariants and Constraints Register
## WebWaka OS: Non-Negotiable Rules, Compliance Requirements, and Architectural Gates

**Status:** AUTHORITATIVE — Phase 0 Deep Discovery output  
**Date:** 2026-05-02  
**Source:** `docs/governance/platform-invariants.md` + all compliance, security, and governance documents  
**Authority:** Every rule here is founder-approved or regulatory-mandated. No exception without TDR + Founder approval.

---

## Section A — Platform Invariants (18 Non-Negotiable Rules)

### Product Invariants (P-series)

| ID | Name | Rule | Enforcement | Status |
|---|---|---|---|---|
| **P1** | Build Once Use Infinitely | Every capability is a reusable parameterized primitive. No vertical duplicates shared code. Vertical packages compose from shared packages only. | 212 packages all depend on shared layer; CI scan | ✅ ENFORCED |
| **P2** | Nigeria First | All UX flows, payment integrations, compliance rules, and data models designed first for Nigerian regulatory and market realities. i18n is a subsequent layer. | NGN kobo, Paystack, Nigerian geography, CBN/NDPR | ✅ ENFORCED |
| **P3** | Africa First | No architectural decision may lock the platform to a single country at data or runtime layer. Africa expansion is the next layer after Nigeria. | `country_id` abstraction documented; multi-currency path designed | ⚠️ DOCUMENTED (Nigeria-only current) |
| **P4** | Mobile First | Every interface is designed for 360px viewport first. Desktop is an enhancement. | 360px base viewport, mobile-first CSS in `@webwaka/design-system` | ✅ ENFORCED |
| **P5** | PWA First | All client-facing apps are Progressive Web Apps: installable, manifest-equipped, service-worker-enabled. | CI check: `check-pwa-manifest.ts` | ✅ ENFORCED |
| **P6** | Offline First | Core user journeys function without network. Writes queued offline, synced on reconnect, conflicts resolved deterministically. | `@webwaka/offline-sync` + Background Sync + Dexie v4 | ✅ ENFORCED |
| **P7** | Vendor Neutral AI | No direct AI SDK calls in business logic. All AI through `@webwaka/ai-abstraction`. | CI check: `check-ai-direct-calls.ts` | ✅ ENFORCED |
| **P8** | BYOK Capable | Every AI-consuming feature supports Bring Your Own Key. Tenants supply own API keys, used transparently. | `@webwaka/superagent` KeyService (5-level key resolution hierarchy) | ✅ ENFORCED |

### Technical Invariants (T-series)

| ID | Name | Rule | Enforcement | Status |
|---|---|---|---|---|
| **T1** | Cloudflare-First Runtime | Production runtime is Cloudflare Workers. No Express/Node.js HTTP servers in production path. | All apps are Hono Workers; Node.js is dev shim only | ✅ ENFORCED |
| **T2** | TypeScript-First | All packages and apps in TypeScript. `any` requires explanatory comment. No untyped JS in packages/apps. | `strict: true` all tsconfig; 0 TS errors current state | ✅ ENFORCED |
| **T3** | Tenant Isolation Everywhere | Every DB query on tenant-scoped data includes `tenant_id`. KV keys: `tenant:{tenant_id}:*`. R2 paths: `{tenant_id}/`. Cross-tenant only in super_admin contexts. | CI: `check-tenant-isolation.ts`; ADR-T3 gap log patched | ✅ ENFORCED (with sprint-4 bug fixes applied) |
| **T4** | Monetary Integrity | All monetary values stored and processed as **integer kobo** (NGN × 100). No floats for money. Display formatting is presentation layer only. | CI: `check-monetary-integrity.ts`; runtime `assertIntegerKobo()` | ✅ ENFORCED |
| **T5** | Subscription-Gated Features | Every non-public feature access checked against tenant's active subscription entitlements. Uses `@webwaka/entitlements` — no hardcoded plan checks. | `requireEntitlement()` middleware; entitlement guards | ✅ ENFORCED |
| **T6** | Geography-Driven Discovery | Discovery, inventory rollups, and marketplace aggregation driven by geography hierarchy from `@webwaka/geography`. No direct city/state string matching for aggregation. | CI: `check-geography-integrity.ts` | ✅ ENFORCED |
| **T7** | Claim-First Growth | Discoverable entities are seeded first and claimed later. Claim→verify→manage lifecycle enforced by `packages/claims/src/state-machine.ts` (8-state FSM, transition guards). | 8-state FSM, 36 tests | ✅ ENFORCED |
| **T8** | Step-by-Step GitHub Commits | All changes committed in small, coherent units. No mega-commits. Every commit must pass CI. | Release governance doc | ⚠️ PROCESS ONLY |
| **T9** | No Skipped Phases | Shared foundation packages built before vertical-specific features that depend on them. Milestones are sequential. | Phase 0→1→2→3 completed sequentially | ✅ ENFORCED |
| **T10** | Continuity-Friendly Code | Every file/function readable and resumable by new agent with no prior context. Inline comments required for non-obvious logic. No magic strings. | Code review standard | ✅ ENFORCED |

---

## Section B — Regulatory Compliance Requirements

### B1 — NDPR (Nigeria Data Protection Regulation)

| Requirement | Rule | Implementation | Status |
|---|---|---|---|
| Consent before PII processing | No PII processing without explicit user consent record | `aiConsentGate` middleware, `grantAiConsent()`, `ndpr_consent_records` table | ✅ |
| Right to erasure (Article 17) | DSAR requests fulfilled within statutory window | `dsar_requests` table, R2 export bucket, pre-signed URL delivery | ✅ |
| Data minimization | PII (BVN, NIN, voter_ref, bank account) never in event payloads or AI prompts | P13 enforced in all event publishers | ✅ |
| Article 30 processing register | Maintain record of all PII processing activities | `@webwaka/superagent` NdprRegister, `ndpr_processing_register` table | ✅ |
| Data retention | Maximum retention periods enforced per data category | `evaluateDataRetention()` policy evaluator; `0452_data_retention_scheduler.sql` | ✅ |
| Data localization (Art. 2.4) | Data processing infrastructure with adequate transfer safeguards | D1 `primary_location = "wnam"` + GDPR-adequate transfer note | ✅ |
| PII hashing | BVN/NIN/phone hashed with SHA-256 + LOG_PII_SALT, never stored raw | All identity routes use `hashPii()` before storage | ✅ |

### B2 — CBN (Central Bank of Nigeria)

| Requirement | Rule | Implementation | Status |
|---|---|---|---|
| KYC Tier system | T0 (basic), T1 (phone-verified), T2 (BVN), T3 (NIN+CAC) | `cbn-kyc-tiers.ts`, `evaluateKycRequirement()` | ✅ |
| Daily transaction limits | T0: ₦50k, T1: ₦200k, T2: ₦500k, T3: ₦5M | KV overrides: `wallet:daily_limit_kobo:{tier}` | ✅ |
| Balance caps | Per tier limits enforced | KV: `wallet:balance_cap_kobo:{tier}` | ✅ |
| AML monitoring | Suspicious transaction flagging | HITL queue + compliance declarations | ✅ (Phase 1) |
| POS agent registration | SANEF/NIBSS agent enrollment | identity verification via Prembly | ✅ |

### B3 — INEC (Independent National Electoral Commission)

| Requirement | Rule | Implementation | Status |
|---|---|---|---|
| Campaign finance cap | Individual/organization: ₦50,000,000 max contribution | `INEC_DEFAULT_CAP_KOBO` in `@webwaka/fundraising`, `evaluateFinancialCap()` | ✅ |
| Voter reference opacity | voter_ref stored as opaque hash, never raw electoral ID | P13 in GOTV records: `voter_ref` opaque | ✅ |
| Disclosure requirements | Compliance declarations required for political fundraising | `fundraising_compliance_declarations` table | ✅ |
| Electoral data sourcing | INEC-sourced polling units, parties, constituencies only | S05 seeding from INEC official PDFs | ✅ |

### B4 — CAC (Corporate Affairs Commission)

| Requirement | Rule | Implementation | Status |
|---|---|---|---|
| Business registration verification | CAC RC number verification for organizations | Prembly CAC verification API | ✅ |
| Cooperative registration | CAC registration for cooperative societies | Identity verification gate on cooperative vertical | ✅ |
| NGO registration | IT number for NGOs | IT regulation gate | ✅ |

### B5 — FRSC (Federal Road Safety Corps)

| Requirement | Rule | Implementation | Status |
|---|---|---|---|
| Driver/vehicle enrollment | FRSC verification for transport verticals | Prembly FRSC integration | ✅ |
| Operator verification | Motor park and transit operator verification | Transport vertical regulatory gate | ✅ |

### B6 — NCC / NITDA

| Requirement | Rule | Implementation | Status |
|---|---|---|---|
| Telecom regulations | OTP channel compliance | Multi-channel OTP with approved providers | ✅ |
| NITDA self-assessment | Platform compliance documentation | `docs/qa/nitda-self-assessment.md` | ✅ |

---

## Section C — AI Governance Constraints

### C1 — AI Platform Invariants

| Rule | Source | Implementation |
|---|---|---|
| No direct AI SDK imports in business logic | ADL-001, P7 | CI: `check-ai-direct-calls.ts` blocks direct imports |
| All AI keys in KV only (AES-256-GCM encrypted) | ADL-002 | CI: `check-adl-002.ts` verifies zero credentials in D1 |
| NDPR consent required before any PII AI processing | P10, P12 | `aiConsentGate` middleware + `getNdprConsentStatus()` |
| HITL required for sensitive sector AI outputs | P12, political/legal/medical | `sensitive_sector = 1` in vertical AI configs → HITL queue |
| WakaCU credits as accounting primitive | SA-1.7 | `CreditBurnEngine` — pool→workspace→BYOK waterfall |
| BYOK key resolution (5-level hierarchy) | SA-1.4 | request-key → user-key → workspace-key → partner-key → platform-key |
| AI autonomy levels L0–L5 | VERTICAL_AI_CONFIGS | `max_autonomy_level` per vertical, enforced in `ComplianceFilter` |
| Sandbox mode enforced in staging | G24 | `NOTIFICATION_SANDBOX_MODE="true"` + `assertSandboxConsistency()` |
| Prohibited capabilities per tenant | Phase 5 | `evaluateAiGovernance()` with `prohibited_capabilities` |

### C2 — Per-Vertical AI Capability Declarations (159 configs)

Each vertical in `VERTICAL_AI_CONFIGS` declares:
- `capabilities[]` — allowed AI capability types
- `sensitive_sector` — boolean (triggers HITL)
- `hitl_required` — boolean
- `max_autonomy_level` — L0 (human decides) to L5 (full auto)
- `pii_exclusions[]` — fields never passed to AI

**Sensitive sectors (HITL mandatory):** politician, political-party, campaign-office, lawyer/doctor/professional (regulated), pharmacy, hospital, school

---

## Section D — Security Constraints

### D1 — Authentication and Session Rules

| Rule | Implementation |
|---|---|
| Every authenticated request must carry valid JWT | `jwtAuthMiddleware` on all non-public routes |
| JWT payload must include: sub, tenant_id, role | Validated in `packages/auth/src/jwt.ts` |
| Missing tenant_id = hard 401 | `jwtAuthMiddleware` enforces |
| Cross-tenant access = critical security bug | T3 enforced + CI check |
| Super admin routes require explicit super_admin role check | `requireRole('super_admin')` guards |
| Opaque refresh tokens, single-use rotation | SHA-256 hashed, invalidated on use |
| PBKDF2 SHA-256, 600k iterations (OWASP 2024) | `packages/auth/src/hash.ts` |
| Login rate limiting (brute-force protection) | `authRateLimit` middleware (SEC-03 fixed) |

### D2 — Secrets Rules

| Rule |
|---|
| All secrets in CF Worker Secrets or GitHub Actions Secrets. Never in code. |
| No .env files committed (only .env.example with placeholders) |
| SECRET ROTATION POLICY: 90 days or immediately on exposure |
| CLOUDFLARE_API_TOKEN: **URGENT — was exposed in public commit. Must rotate immediately.** |
| R2 DSAR access key: separate from main R2 access (PII isolation) |
| DM_MASTER_KEY: AES-GCM key for DM encryption (P14) — rotation requires re-encryption migration |

### D3 — Input Validation Rules

| Rule | Implementation |
|---|---|
| All request bodies validated with Zod before processing | Zod schemas in all route handlers |
| Monetary inputs: `assertIntegerKobo()` rejects non-integers | Runtime guard, returns 422 |
| CSS injection: `sanitizeCssValue()` strips escape sequences | `@webwaka/white-label-theming` |
| HTML injection: `esc()` in brand-runtime templates | Escapes &, <, >, " |
| Webhook payloads: HMAC-SHA256 signature verification | `@webwaka/webhooks` |

---

## Section E — Architecture Gates

### E1 — What Cannot Be Changed Without TDR + Founder Approval

1. Any platform invariant (P1–P8, T1–T10)
2. The 3-in-1 pillar architecture (Pillar 1 = Ops, Pillar 2 = Branding, Pillar 3 = Marketplace)
3. SuperAgent classification (cross-cutting AI, NOT a fourth pillar)
4. The `tenant_id` isolation model
5. The kobo-integer monetary model
6. The claim-first growth model (T7)
7. The Cloudflare Workers runtime target (T1)
8. The BYOK AI key model (P8)

### E2 — What Cannot Be Added Without Registering in BUILT_IN_TEMPLATES

Any new niche template for Pillar 2 (brand-runtime) must be:
1. Added as `WebsiteTemplateContract` implementation in `apps/brand-runtime/src/templates/niches/`
2. Registered in `BUILT_IN_TEMPLATES` Map in `apps/brand-runtime/src/lib/template-resolver.ts`
3. Added to vertical-niche-master-map.md with canonical VN-ID
4. Added to `infra/db/seeds/0004_verticals-master.csv` with `status=planned` first

### E3 — What Cannot Be Added Without Policy Engine Entry

Regulatory constraints MUST be expressed as `policy_rules` entries, not hardcoded:
- Financial caps (INEC, CBN)
- KYC tier requirements
- AI capability gates
- NDPR retention periods
- Payout approval thresholds

**Violation of this rule creates technical debt that is catastrophically expensive to retrofit.**

### E4 — CF Cron Trigger Limit

**HARD LIMIT: 5/5 cron triggers allocated.** Current allocation:
- api-staging: 2 (DSAR processor + data retention)
- api-production: 2 (DSAR processor + data retention)
- projections-staging: 1

DO NOT add new cron triggers without removing an existing one. This requires architectural consultation.

### E5 — Migration Numbering

All migrations must follow sequential numbering in `infra/db/migrations/`. The current highest is `0461`. Next migration must be `0462` (or next available). Rollback SQL required for every forward migration. No forward migration without a corresponding `.rollback.sql`.

---

## Section F — Naming Conventions (Non-Negotiable)

| Entity | Convention | Example |
|---|---|---|
| Package names | `@webwaka/[domain]` | `@webwaka/fundraising` |
| Vertical slugs | kebab-case, no underscores | `motor-park`, `pos-business` |
| Canonical VN-IDs | `VN-[CATEGORY]-[3-digit]` | `VN-CIV-004` |
| Niche families | `NF-[CODE]` | `NF-CIV-REL` |
| Table names | snake_case | `support_group_members` |
| ID format | `[entity_prefix]_[slug]` or `lower(hex(randomblob(16)))` | `place_lga_ogun_sagamu` |
| Migration files | `[NNNN]_[description].sql` + `[NNNN]_[description].rollback.sql` | `0462_foo.sql` |
| Event types | `[domain].[event_name]` | `fundraising.campaign_created` |
| Tenant KV keys | `tenant:{tenant_id}:{domain}:{key}` | `tenant:t123:session:abc` |
| R2 paths | `{tenant_id}/{resource_type}/{id}` | `t123/logos/logo.png` |

---

## Section G — Discovery and Search Rules

| Rule | Source | Implementation |
|---|---|---|
| FTS5 full-text search for discovery | T6 | `search_entries` table + FTS5 virtual table |
| Geography hierarchy must be traversed top-down | T6 | `@webwaka/geography` hierarchy lookup |
| Seeded entities must appear before signup | T7 | `claim_state = 'seeded'` entities indexed immediately |
| Discovery results must be tenant-neutral (public) | Pillar 3 | `/discovery/*` routes are public (no auth) |
| Seeded entities require provenance chain | S00 control plane | `seed_entity_sources` + `seed_sources` table |

---

## Section H — Operational Constraints

| Constraint | Rule |
|---|---|
| D1 multi-region | DEFERRED — blocked on Cloudflare D1 African replicas. `read_replication = { mode = "auto" }` is a no-op currently. |
| Rollback time | < 30 seconds via Cloudflare versioned worker promotion (ADR-0042/0046) |
| Migration rollback | Must be possible for every migration. `.rollback.sql` required. |
| Log retention | Cloudflare dashboard: 72h max. Axiom (ADR-0045): 30d free / 90d Pro. NDPR requires ≥ 7d. |
| API versioning | All breaking changes go to `/v2/*` prefix (ADR-0018). `/v1` is the implicit current version. |
| CORS | ALLOWED_ORIGINS CF secret restricts to `*.webwaka.com` and partner domains. No wildcard in production. |
| Error alerting | `ALERT_WEBHOOK_URL` CF secret triggers POST on error rate threshold breaches |
