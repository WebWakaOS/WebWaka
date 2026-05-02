# WebWaka OS

## Overview

WebWaka OS is a multi-tenant, multi-vertical, white-label SaaS platform operating system for Africa, starting with Nigeria. It is built on "Offline First," "Mobile First," and "Nigeria First" principles, utilizing a governance-driven monorepo architecture. The platform aims to establish a comprehensive digital infrastructure with extensive seeded data for various Nigerian sectors, robust notification and payment systems, B2B marketplace tools, and identity verification capabilities.

The project's vision is to empower African businesses and individuals through a scalable and adaptable operating system for diverse vertical markets. Core capabilities include nationwide entity seeding across political, educational, health, commercial, and informal sectors, a comprehensive wallet and payment infrastructure, a production-ready multi-channel notification engine, advanced identity verification and KYC, entitlement-gated access control, and a robust API supported by CI/CD.

## User Preferences

- **Communication Style**: Direct and concise. Avoid verbose explanations for routine tasks.
- **Problem Solving**: Prioritize solutions that adhere to established architectural patterns and governance rules.
- **Code Generation**: Ensure generated code is type-safe (TypeScript strict mode), well-tested, and follows the monorepo structure.
- **Deployment**: Assume a Cloudflare Workers environment for all deployments (D1, KV, R2).
- **Security**: Implement robust security measures, including tenant isolation (T3), secure authentication (JWT), and protection against common vulnerabilities (SQL injection, HTML injection, timing attacks).
- **Data Handling**: All monetary values must be stored as integer kobo (NGN × 100). Personal Identifiable Information (PII) must be handled according to NDPR guidelines, including consent gates for AI processing and anonymization where appropriate.
- **Workflow**: Iterative development with clear phase completion and adherence to defined milestones.
- **Interaction**: Ask for confirmation before making significant architectural changes or deploying to production.
- **Testing**: Maintain high test coverage; all new features require associated tests (unit, integration, E2E).
- **Documentation**: Keep `replit.md` and `docs/` up-to-date with current status, architectural decisions, and bug fixes.
- **Constraints**: Be mindful of Cloudflare D1 capacity limits and optimize migrations for efficient application.

## System Architecture

The system employs a serverless, edge-first architecture leveraging Cloudflare Workers.

### UI/UX Decisions
- **Mobile-first Design**: Frontend applications use React and PWA for an "Offline First" and "Mobile First" experience.
- **Design System**: A shared design system (`@webwaka/design-system`) and white-label theming (`@webwaka/white-label-theming`) ensure UI consistency and brand adaptability.
- **Admin Interfaces**: Dedicated dashboards for platform, general, and partner administration.

### Technical Implementations
- **Monorepo Structure**: Organized into `apps/` for deployable applications and `packages/` for reusable libraries.
- **Language**: TypeScript with strict mode.
- **API Framework**: Hono for efficient, edge-optimized API development.
- **Database Interaction**: Cloudflare D1 (SQLite) with a robust migration system, enforcing `tenant_id` for strict data isolation (T3).
- **State Machines**: Implemented for complex workflows such as claim lifecycles and wallet transactions.
- **Notification Engine**: Multi-channel (InApp, Email, SMS, WhatsApp, Telegram, FCM, Slack, Teams) with rule engine, templating, and digest capabilities, processed via Cloudflare Queues with an outbox pattern.
- **Payment & Wallet System**: Comprehensive wallet functionality supporting transfers, withdrawals, and online funding, with flexible payment modes.
- **Identity Verification**: Integrates with third-party services for BVN/NIN verification, including fallback mechanisms and rate limiting.
- **Sector Licence Verification**: Manual document-upload and admin-review workflow for compliance-gated verticals, using a Finite State Machine for status management.
- **AI Integration**: Vendor-neutral abstraction layer (`@webwaka/superagent`) with strict consent gates for NDPR compliance and support for AI agent sessions with conversation history persistence. Includes tool execution loop and built-in platform tools for inventory, sales, offerings, and scheduling.
- **Search & Discovery**: FTS5 for full-text search and `search_entries` for discoverability with deterministic `searchEntryId`.
- **Geo-spatial Data**: `@webwaka/geography` provides hierarchical geographical data for Nigeria, Ghana, and Kenya.
- **Testing**: Extensive test suites using Vitest for unit/integration and Playwright for E2E testing.
- **CI/CD**: GitHub Actions for automated type checking, testing, linting, security auditing, and deployment.
- **Rate Limiting**: Implemented at API gateway for critical endpoints.
- **Error Handling**: Centralized error handling with structured responses and audit logging.
- **WakaPage**: A no-code landing page builder vertical, allowing users to create pages with various blocks, manage leads, and integrate with search indexing. Features a public renderer with PWA capabilities and analytics.
- **Universal Module Platform (UMP)**: Core platform refactoring introducing `groups`, `cases`, and `ledger` packages. Features a policy engine for rule evaluation across various domains (financial, KYC, AI governance, moderation, data retention, payout), and differential offline sync for PWAs.
- **Workflow Engine**: MVP for starting and advancing workflows with seeded definitions.
- **Analytics Unification**: `trackEvent` with PII stripping and methods for `getWorkspaceMetrics`/`getGroupMetrics`/`getCampaignMetrics`.
- **Fundraising Extensions**: Dues collection and mutual aid functionalities with defined schedules and approval flows.
- **Template System**: Extended template registry to include `module_config`, `vocabulary`, `default_policies`, and `default_workflows` for starter templates.
- **Data Retention Automation**: Scheduled pseudonymization of expired PII for NDPR compliance.
- **Moderation Appeal Flow**: System for users to appeal content moderation decisions, with admin review and escalation.
- **Public API Versioning**: Global `X-API-Version: 1` header, and a `/developer` endpoint providing API metadata, capabilities, and changelog.
- **Webhook SDK**: TypeScript event payload types for all webhook events to facilitate integration.

### Phase 2 P3 Niche Completion Sprint — Template Registry Seeded (2026-05-02)
All 78 P3-tier website templates are now fully shipped:
- **Migration 0464** (`infra/db/migrations/0464_seed_p3_website_templates.sql`): Seeds all 78 P3 templates into D1 `template_registry` with `template_type='website'`, `status='approved'`, `is_free=1`, `author_tenant_id=NULL`. Uses `unixepoch('now')` — D1/SQLite compatible, no PostgreSQL syntax. INSERT OR IGNORE for idempotency.
- **pillar3-niche-registry.json**: All 71 IMPLEMENTED entries promoted to SHIPPED (shippedAt: 2026-05-02). All 78 P3 entries now SHIPPED.
- **Execution board** (`docs/templates/pillar3-template-execution-board.md`): All 78 rows SHIPPED ✅. Summary: 78 SHIPPED, 0 READY_FOR_RESEARCH.
- **Universe map** (`docs/phase0-artifacts/05-vertical-and-niche-universe-map.md`): Pillar 2 count updated to 207 SHIPPED; Pillar 3 count updated to 78 SHIPPED, 0 READY_FOR_RESEARCH.
- **Phase 2 exit gate**: First two gates checked (P3 Pillar 2 templates SHIPPED; P3 marketplace templates seeded). Remaining: i18n ≥90% coverage, INEC HoA seed, state assemblies seed.
- **Note**: Existing `infra/db/seeds/templates/` SQL files (207 files) target a `website_templates` table with PostgreSQL ARRAY syntax — these are reference documents only, never applied to D1.

### Phase 1 Master Refactor — Engineering Complete (2026-05-02)
All engineering tasks in the Phase 1 Pre-Launch Refactor are now complete:
- **DEBT-001 (P1-010–014)**: `@webwaka/support-groups` fully genericised → `@webwaka/groups` canonical. Migration 0462 drops 14 shadow tables. `GroupEventType` is canonical; `SupportGroupEventType` is deprecated alias.
- **DEBT-002 (P1-020–023)**: Fundraising INEC-specific fields renamed (`inecCapKobo` → `contributionCapKobo`, etc.), migration 0463. `evaluateFinancialCap()` from `@webwaka/policy-engine` wired in contribution handler. `checkContributionCap()` added as generic fallback.
- **DEBT-003 (P1-030/031)**: All 11 `PlatformLayer` values verified active. Civic/AI = plan-gated; Political/Institutional = enterprise-only. No dead values.
- **DEBT-005 (P1-040/041)**: Dead `_engineFeatureFlagMiddleware` no-op removed from `register-vertical-engine-routes.ts`; migration path documented.
- **DEBT-008 (P1-050)**: `pnpm audit` = 0 vulnerabilities.
- **P1-005 ESLint**: 0 errors across all scanned route files (`timing.test.ts`, `search-index.ts`, `platform-admin-pilots.ts` fixed).
- **Remaining Phase 1 exit gate items (ops-only)**: CF API token rotation (RISK-001), SMOKE_API_KEY provisioning, notification engine staging deployment.

### Dynamic Configurability & Delegated Governance (2026-05-02)
- **`@webwaka/control-plane`** package (`packages/control-plane/`): 6 runtime services (PlanCatalogService, EntitlementEngine, PermissionResolver, FlagService, DelegationGuard, AuditService) backed by 20 new D1 tables.
- **Migrations 0464–0471**: 8 migration pairs (forward + rollback) covering subscription_packages, billing_intervals, package_pricing, entitlement_definitions, package_entitlement_bindings, workspace_entitlement_overrides, custom_roles, permission_definitions, role_permission_bindings, user_groups, group_memberships, admin_delegation_policies, configuration_flags, configuration_overrides, governance_audit_log, plus seed data translating all 7 hardcoded PLAN_CONFIGS into DB records.
- **API**: 30+ routes under `/platform-admin/cp/*` (super_admin only + audit log) for plans, entitlements, roles, groups, feature flags, delegation policies, and audit query.
- **Dashboard**: `apps/platform-admin/public/control-plane.html` — tabbed UI for all 5 control layers.
- **Entitlement Middleware Wire-Up**: `apps/api/src/middleware/workspace-entitlement-context.ts` — shared builder that calls `EntitlementEngine.resolveForWorkspace()` on every gated request, maps DB codes → `Partial<PlanConfig>`, merges layer grants into `ctx.activeLayers`, and falls back to `PLAN_CONFIGS` transparently when control-plane tables are absent.
- **Billing Runtime Configuration**: Migration 0472 seeds `billing_grace_period_days` (integer) and `billing_default_interval_code` (string) flags. `billing.ts` now uses `lookupIntervalDays`, `lookupGracePeriodSeconds`, and `loadPlanRank` DB helpers (all with graceful fallback) instead of the three hardcoded values (`30 * 24 * 60 * 60`, `7 * 24 * 60 * 60`, and the 4-plan static `PLAN_RANK`). Static fallback updated to all 7 seeded plans.
- **FlagService KV Caching**: `KVLike` interface added to `@webwaka/control-plane/types`. `FlagService` now accepts an optional `KVLike` (3rd constructor arg). `createControlPlane(db, kv?)` threads KV through to FlagService only. 3-tier cache: flag definitions (120s), resolved values (60s), kill-switch status (5s). Kill-switch flags bypass resolved-value cache for near-instant propagation. All 6 CP route files updated to pass `c.env.KV`. All KV operations are non-fatal (try/catch); DB remains source of truth.
- **PilotFlagService Bridge**: `PilotFlagService` now accepts optional `FlagServiceLike` (2nd constructor arg). `isEnabled()` checks `pilot_feature_flags` first (explicit per-tenant override takes priority including explicit disables); if no row exists, delegates to control-plane `FlagService.resolve()`. Both pilot routes (`platform-admin-pilots.ts`, `pilot-feedback-route.ts`) pass `createControlPlane(db, kv).flags` as the bridge. Added `getFlag()` method. Fixed pre-existing silent bug: `pilot-feedback-route.ts` called non-existent `flagSvc.getFlag()` — replaced with `isEnabled()` via bridge.
- **Compatibility**: `PLAN_CONFIGS` and `ROLE_HIERARCHY` preserved unchanged as static fallbacks. No breaking changes.
- **Implementation Register**: `IMPLEMENTATION_REGISTER.md` — full audit of hardcoded config locations, DB tables, API routes, resolution order, and migration risks.

### Feature Specifications
- **Nationwide Entity Seeding**: Multi-phase data ingestion for diverse Nigerian entities with provenance tracking.
- **Claim & Activation Flow**: Multi-step process for entities to claim profiles and activate services.
- **Configurable Bank Accounts**: Supports platform and workspace-specific bank accounts.
- **Tenant Branding**: API for custom branding (colors, logos, custom domains).
- **Profile Visibility**: Workspace admins control public, semi, or private profile visibility.

### System Design Choices
- **Edge-first**: Leverages Cloudflare Workers for low-latency and scalability.
- **Stateless Workers**: Most Workers are stateless, relying on D1, KV, and R2 for persistence.
- **Immutable Data Patterns**: Emphasizes idempotent operations and audit logging.
- **Modular Design**: Clear separation of concerns with domain-specific packages.
- **Scalable Notification Pipeline**: Decoupled notification generation from delivery via Cloudflare Queues.

## External Dependencies

- **Cloudflare**: Workers, D1, KV, R2, Queues, DNS.
- **Termii**: SMS Gateway.
- **Resend**: Email service.
- **Meta/Dialog360 WhatsApp**: WhatsApp Business API.
- **Telegram**: Messaging platform.
- **Firebase Cloud Messaging (FCM)**: Push notifications.
- **Slack**: Internal team notifications.
- **Microsoft Teams**: Internal team notifications.
- **Paystack**: Payment gateway (optional).
- **Prembly**: Identity verification APIs (BVN, NIN, CAC, FRSC).
- **OpenStreetMap (Overpass API)**: Geo-spatial entity data.
- **Wikipedia**: Political entity data.
- **INEC (Independent National Electoral Commission)**: Electoral data.
- **UBEC (Universal Basic Education Commission)**: School data.
- **NUPRC (Nigerian Upstream Petroleum Regulatory Commission)**: Oil and gas operators.
- **NAICOM (National Insurance Commission)**: Insurance entities.
- **CBN (Central Bank of Nigeria)**: Regulated financial institutions.
- **NCC (Nigerian Communications Commission)**: Licensed telecom operators.
- **SEC (Securities and Exchange Commission) Nigeria**: Capital market operators.
- **NHIA (National Health Insurance Authority)**: Accredited healthcare providers.
- **NPHCDA (National Primary Health Care Development Agency)**: Primary Health Care facilities.
- **MLSCN (Medical Laboratory Science Council of Nigeria)**: MLS/MLA-T training institutions.
- **NUC (National Universities Commission)**: Universities registry.
- **GRID3 / HDX**: Health facilities data.