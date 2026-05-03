# WebWaka OS — Architecture Overview

> For detailed architecture decisions, see `docs/architecture/decisions/`.
> For the current-state platform assessment, see `docs/phase0-artifacts/00-current-state-assessment.md`.
> For the master refactor program, see `docs/program/master-program.md`.

## Platform Model

WebWaka OS is a **multi-tenant, multi-vertical, white-label platform** where:
- A **Platform Operator** (WebWaka) manages the overall system
- **Partners** subscribe and operate branded instances
- **Sub-partners** can be delegated under partners
- **Tenants** own their data and configuration within their subscription scope
- **End users** interact through tenant-branded interfaces

## Runtime Stack

```
Edge (Cloudflare Workers)
  └── Hono (HTTP routing + middleware)
       ├── Auth + Tenancy middleware (@webwaka/auth, @webwaka/auth-tenancy)
       ├── RBAC middleware (@webwaka/auth)
       └── Module handlers

Storage
  ├── D1 — relational data (per-env: one staging, one production)
  ├── KV — tenant config, sessions, rate limits, feature flags, geo cache
  ├── R2 — documents, assets (logos, DSAR exports)
  └── Queues — notification pipeline (producer: api, consumer: notificator)
```

## Monorepo Layout

```
apps/
  api/                  — Cloudflare Workers API entry point (master API)
  workspace-app/        — React/Vite PWA (operator/cashier interface) [CF Pages]
  brand-runtime/        — Tenant-branded website/storefront runtime [CF Worker]
  public-discovery/     — Public search and discovery SSR [CF Worker] (legacy; see discovery-spa)
  discovery-spa/        — Public discovery React SPA [CF Pages] (canonical new surface)
  platform-admin/       — Super admin dashboard [CF Pages] (Wave 2: rebuilding as React SPA)
  admin-dashboard/      — Admin analytics Worker [CF Worker] (Wave 2: merging into platform-admin)
  partner-admin/        — Old partner management Worker [CF Worker] (deprecated; see partner-admin-spa)
  partner-admin-spa/    — Partner management React SPA [CF Pages] (canonical new surface)
  marketing-site/       — Public marketing site [CF Pages]
  ussd-gateway/         — USSD micro-transactions gateway [CF Worker]
  notificator/          — Notification queue consumer [CF Worker]
  projections/          — Data projection CRON worker [CF Worker]
  schedulers/           — Scheduled tasks CRON worker [CF Worker]
  log-tail/             — Structured log drain tail worker [CF Worker]
  tenant-public/        — Legacy per-tenant profile pages [CF Worker] (deprecated)

packages/
  auth/                 — JWT, PBKDF2, role hierarchy, guards
  auth-tenancy/         — Re-exports @webwaka/auth; declared tenancy surface
  entitlements/         — Subscription plan config, evaluation, guards
  control-plane/        — Dynamic plans/entitlements/roles/flags/delegation (complete)
  ai-abstraction/       — Provider-neutral AI routing + BYOK circuit-breaker
  ai-adapters/          — Fetch-only AI provider adapters (P7 invariant)
  superagent/           — Full AI agent loop, HITL, consent, tools, credit burn
  vertical-engine/      — Configuration-driven vertical CRUD + FSM + route generator
  verticals/            — Shared vertical types + template manifest validator
  verticals-*/          — 175 individual vertical packages (migrating to vertical-engine)
  offline-sync/         — Dexie.js IndexedDB, SyncEngine, conflict resolution (server-wins)
  design-system/        — Shared UI tokens and components (Wave 2: implementing)
  white-label-theming/  — Branding rules, theming, CSS var generation, depth-cap
  notifications/        — Multi-channel notification engine (templates, rules, channels, digest)
  claims/               — 8-state claim workflow FSM
  entities/             — Canonical root entity definitions
  geography/            — Place hierarchy, ancestry, aggregation
  community/            — Community spaces, channels, courses, events, moderation
  social/               — Social profiles, posts, DMs, feed algorithm
  groups/               — User groups, group roles, memberships (renamed from support-groups)
  payments/             — Paystack integration, subscription sync
  hl-wallet/            — HandyLife NGN wallet (feature-flagged)
  pilot/                — Pilot rollout flags, operator management, FlagService bridge
  policy-engine/        — Policy evaluation engine
  analytics/            — Analytics aggregation
  i18n/                 — Internationalization (en complete; yo/ig/ha planned)
  ... (full list in docs/phase0-artifacts/09-packages-map.md)
```

## 3-in-1 Platform Pillars

WebWaka delivers three interconnected capabilities that can be subscribed to individually or in any combination:

| Pillar | Name | Runtime | Description |
|--------|------|---------|-------------|
| **Pillar 1** | Operations-Management (POS) | `apps/api/`, `apps/workspace-app/`, `apps/ussd-gateway/` | Back-office: POS, float ledger, orders, inventory, staff, USSD |
| **Pillar 2** | Branding / Website / Portal | `apps/brand-runtime/`, `apps/workspace-app/` | Front-of-house: branded website, storefront, service portal, white-label |
| **Pillar 3** | Listing / Multi-Vendor Marketplace | `apps/public-discovery/`, `apps/discovery-spa/` | Discovery: seeded directories, geography search, claim-first onboarding |
| **Cross-cutting** | AI / SuperAgent | `packages/superagent/`, `packages/ai-abstraction/` | Intelligence layer across all pillars (NOT a fourth pillar) |

### Pillar-to-Package Map

```
Pillar 1 (Ops):        packages/pos, packages/offerings, packages/workspaces, packages/payments
Pillar 2 (Brand):      packages/white-label-theming, packages/design-system, packages/frontend
Pillar 3 (Marketplace): packages/profiles, packages/search-indexing, packages/claims, packages/geography
AI (Cross-cutting):    packages/superagent, packages/ai-abstraction, packages/ai-adapters
Infra (Pre-vertical):  packages/auth, packages/entities, packages/entitlements, packages/relationships
                       packages/community, packages/social  (cross-cutting; enhances Pillar 3 marketplace engagement)
```

See `docs/governance/3in1-platform-architecture.md` for authoritative module-to-pillar assignments.

## Key Design Rules

1. **Packages first** — no vertical feature code before the shared packages that support it are built
2. **Tenant isolation everywhere** — every DB query is scoped by `tenant_id`
3. **Subscription-aware** — all feature access checked against entitlements
4. **Geography-driven** — discovery, inventory, and aggregation flow through the geography hierarchy
5. **Offline-safe** — writes are queued when offline and synced on reconnect
6. **No vendor lock-in** — AI providers are swapped via the abstraction layer
7. **Entitlement gates at route-group level** — `requireEntitlement(PlatformLayer.X)` applied in route-group registration files, not inside individual route handlers

## Deployment Model

- **Staging:** GitHub Actions → Cloudflare Workers (staging environment)
- **Production:** Manual promotion after staging signoff
- **DB:** Shared staging D1 + shared production D1 (no per-repo sprawl)

## Further Reading

- `docs/governance/` — non-negotiable platform rules
- `docs/architecture/decisions/` — Technical Decision Records
- `docs/phase0-artifacts/` — Phase 0 current-state assessment
- `docs/program/` — Master refactor program + staged wave implementation plan
- `docs/product/` — product specifications
