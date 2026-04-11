# Platform Invariants

**Status:** ACTIVE — REQUIRES FOUNDER APPROVAL BEFORE MODIFICATION
**Owner:** Base44 Super Agent (initial) → Perplexity (refinement) → Founder (approval)
**Last updated:** 2026-04-11

---

## Purpose

These are the non-negotiable technical and product rules for WebWaka OS. They cannot be overridden by any individual feature, team, or agent. Changing an invariant requires a new TDR and explicit Founder approval.

---

## Core Product Invariants

### P1 — Build Once Use Infinitely
Every capability is implemented as a reusable, parameterised primitive. Vertical-specific code must compose from shared packages. Duplicating a shared capability in a vertical module is not allowed.

### P2 — Nigeria First
All UX flows, payment integrations, compliance rules, and data models are designed first for Nigerian regulatory and market realities. Internationalisation is a subsequent layer, never the primary concern.

### P3 — Africa First
After Nigeria, the next expansion target is Africa. No architectural decisions may lock the platform to a single country or jurisdiction at the data or runtime layer.

> **Current status:** Implementation is Nigeria-only (NGN kobo, Paystack, Nigerian geography hierarchy, CBN/NDPR compliance). This is intentional per P2 (Nigeria First). Multi-country expansion architecture is documented in `docs/governance/core-principles.md` — requires `country_id` abstraction, payment provider interface, multi-currency support, and regulatory body abstraction. Target: post-M12.

### P4 — Mobile First
Every interface is designed for a 360px viewport first. Desktop is an enhancement. No feature ships without mobile layout verification.

### P5 — PWA First
All client-facing apps are Progressive Web Apps: installable, manifest-equipped, and service-worker-enabled. App store distribution is secondary.

### P6 — Offline First
Core user journeys (browsing, creating records, submitting forms) must function without a network connection. Writes are queued offline and synced on reconnect. The sync model must handle conflicts deterministically.

### P7 — Vendor Neutral AI
AI capabilities are routed through a provider abstraction layer. No direct SDK calls to OpenAI, Anthropic, or any other provider in business logic. Provider selection is configuration, not code.

### P8 — BYOK Capable
Every AI-consuming feature supports Bring Your Own Key. Tenants can supply their own API keys and have them used transparently by the platform.

---

## Technical Invariants

### T1 — Cloudflare-First Runtime
The production runtime is Cloudflare Workers. No server-based runtimes (Node.js HTTP servers, Express, etc.) in the production deployment path. Local dev may use Node.js shims.

### T2 — TypeScript-First
All packages and apps are written in TypeScript. `any` types require a comment explaining why. No untyped JS files in `packages/` or `apps/`.

### T3 — Tenant Isolation Everywhere
Every database query on tenant-scoped data includes a `tenant_id` predicate. Every KV key for tenant data is prefixed with `tenant:{tenant_id}:`. Every R2 path for tenant assets is prefixed with `{tenant_id}/`. Cross-tenant queries exist only in super admin contexts and are explicitly marked.

### T4 — Monetary Integrity
All monetary values are stored and processed as **integer kobo** (NGN × 100). Floating point arithmetic is not used for money. Display formatting is a presentation concern only.

### T5 — Subscription-Gated Features
Every non-public feature access is checked against the tenant's active subscription entitlements. Entitlement checks use `@packages/entitlements` — no hardcoded plan checks in feature code.

### T6 — Geography-Driven Discovery
Discovery pages, inventory rollups, and marketplace aggregation are driven by the geography hierarchy from `@packages/geography`. Direct city/state string matching is not used for aggregation.

### T7 — Claim-First Growth
Discoverable entities (businesses, professionals, properties, routes, etc.) are seeded first and claimed later. The claim → verify → manage lifecycle is enforced by `packages/claims/src/state-machine.ts` (8-state FSM with transition guards).

### T8 — Step-by-Step GitHub Commits
All changes are committed in small, coherent units. No mega-commits spanning multiple features. Every commit must pass CI.

### T9 — No Skipped Phases
Shared foundation packages must be built before vertical-specific features that depend on them. Milestones are sequential. No skipping.

### T10 — Continuity-Friendly Code
Every file, function, and module must be readable and resumable by a new agent or developer with no prior context. Inline comments are required for non-obvious logic. No magic strings.

---

## Enforcement Status (as of 2026-04-11, post-Phase 3 remediation)

### Product Invariants

| ID | Invariant | Status | Enforcement Method | Code Reference |
|----|-----------|--------|-------------------|----------------|
| P1 | Build Once Use Infinitely | ✅ Enforced | 175 shared packages, vertical composition pattern | `packages/*/package.json` — all verticals depend on shared packages |
| P2 | Nigeria First | ✅ Enforced | NGN kobo, Naira formatting, Nigerian geography hierarchy | `packages/geography/`, `infra/db/seed/` (774 LGAs, 37 states, 6 zones) |
| P3 | Africa First | ⚠️ Documented | Architecture note added; current implementation is Nigeria-only | `docs/governance/core-principles.md` — expansion path documented |
| P4 | Mobile First | ✅ Enforced | 360px base viewport, mobile-first CSS | `packages/design-system/src/index.ts`, brand-runtime + public-discovery templates |
| P5 | PWA First | ✅ Enforced | Manifest + service worker in all client-facing apps | CI: `scripts/governance-checks/check-pwa-manifest.ts` |
| P6 | Offline First | ✅ Enforced | Background Sync + IndexedDB queue in service workers | `apps/*/src/index.ts` (inline SW), `packages/offline-sync/` |
| P7 | Vendor Neutral AI | ✅ Enforced | No direct AI SDK imports allowed | CI: `scripts/governance-checks/check-ai-direct-calls.ts` |
| P8 | BYOK Capable | ✅ Enforced | Key service with per-user/workspace key resolution | `packages/superagent/src/key-service.ts`, ADL-004 |

### Technical Invariants

| ID | Invariant | Status | Enforcement Method | Code Reference |
|----|-----------|--------|-------------------|----------------|
| T1 | Cloudflare-First Runtime | ✅ Enforced | All 9 apps are Hono-based Workers; Node.js server is dev shim only | `apps/*/src/index.ts` (Hono), `apps/platform-admin/server.js` (dev shim) |
| T2 | TypeScript-First | ✅ Enforced | `strict: true` in all tsconfig; 5 apps typecheck clean | All `tsconfig.json` files |
| T3 | Tenant Isolation Everywhere | ✅ Enforced | Every tenant-scoped query includes `tenant_id`; CI scan | CI: `scripts/governance-checks/check-tenant-isolation.ts` |
| T4 | Monetary Integrity | ✅ Enforced | Integer kobo; no floats on monetary fields | CI: `scripts/governance-checks/check-monetary-integrity.ts` |
| T5 | Subscription-Gated Features | ✅ Enforced | Entitlement middleware on vertical + AI + branding routes | `apps/api/src/middleware/entitlement.ts`, `apps/brand-runtime/src/middleware/branding-entitlement.ts` |
| T6 | Geography-Driven Discovery | ✅ Enforced | Geography hierarchy with integrity checks | CI: `scripts/governance-checks/check-geography-integrity.ts`, `packages/geography/` |
| T7 | Claim-First Growth | ✅ Enforced | 8-state FSM with transition guards, 36 tests | `packages/claims/src/state-machine.ts` |
| T8 | Step-by-Step Commits | ⚠️ Process | Documented in release governance; actual workflow uses batched pushes | `docs/governance/release-governance.md` |
| T9 | No Skipped Phases | ✅ Enforced | Milestone dependencies tracked; Phase 0→1→2→3 completed sequentially | `docs/governance/milestone-tracker.md` |
| T10 | Continuity-Friendly Code | ✅ Enforced | Inline comments, typed interfaces, governance doc references in code | All source files |

---

## Enforcement

Violations of any invariant are treated as blocking issues:
- **Product invariants (P1–P8):** Founder review required before any exception
- **Technical invariants (T1–T10):** Base44 blocks merge; issue opened with `governance` + `blocked` labels

To propose an exception, open an issue using the **Architecture Decision** template.
