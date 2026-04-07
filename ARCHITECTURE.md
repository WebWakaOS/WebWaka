# WebWaka OS — Architecture Overview

> For detailed architecture decisions, see `docs/architecture/decisions/`.

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
       ├── Auth + Tenancy middleware (@webwaka/core)
       ├── RBAC middleware (@webwaka/core)
       └── Module handlers

Storage
  ├── D1 — relational data (per-env: one staging, one production)
  ├── KV — tenant config, sessions, rate limits
  └── R2 — documents, assets (when needed)
```

## Monorepo Layout

```
apps/
  api/                  — Cloudflare Workers API entry point
  platform-admin/       — Super admin dashboard
  partner-admin/        — Partner/tenant management portal
  public-discovery/     — Public search and discovery frontend
  brand-runtime/        — Tenant-branded website/storefront runtime

packages/
  entities/             — Canonical root entity definitions
  relationships/        — Cross-entity graph rules
  entitlements/         — Subscription, features, limits, rights
  geography/            — Place hierarchy, ancestry, aggregation
  politics/             — Political office and territory model
  profiles/             — Discovery records and claim surfaces
  workspaces/           — Operations layer management context
  offerings/            — Products/services/routes/tickets/etc.
  auth-tenancy/         — Identity, tenant scope, access control
  ai-abstraction/       — Provider-neutral AI routing + BYOK
  offline-sync/         — Sync queue, PWA helpers, conflict model
  search-indexing/      — Facets, indexing, aggregation
  design-system/        — Shared UI patterns and tokens
  white-label-theming/  — Branding rules, theming, templates
  shared-config/        — Shared settings and environment helpers
```

## Key Design Rules

1. **Packages first** — no vertical feature code before the shared packages that support it are built
2. **Tenant isolation everywhere** — every DB query is scoped by `tenant_id`
3. **Subscription-aware** — all feature access checked against entitlements
4. **Geography-driven** — discovery, inventory, and aggregation flow through the geography hierarchy
5. **Offline-safe** — writes are queued when offline and synced on reconnect
6. **No vendor lock-in** — AI providers are swapped via the abstraction layer

## Deployment Model

- **Staging:** GitHub Actions → Cloudflare Workers (staging environment)
- **Production:** Manual promotion after staging signoff
- **DB:** Shared staging D1 + shared production D1 (no per-repo sprawl)

## Further Reading

- `docs/governance/` — non-negotiable platform rules
- `docs/architecture/decisions/` — Technical Decision Records
- `docs/product/` — product specifications
