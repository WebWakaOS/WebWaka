# WebWaka OS

## Overview

WebWaka OS is a multi-tenant, multi-vertical, white-label SaaS platform operating system for Africa, starting with Nigeria. It adheres to "Offline First," "Mobile First," and "Nigeria First" principles, operating with a governance-driven monorepo architecture. The platform aims to provide a comprehensive digital infrastructure, including extensive seeded data for various sectors across Nigeria, robust notification and payment systems, and tools for B2B marketplaces and identity verification.

The project's ambition is to empower businesses and individuals across Africa by providing a scalable and adaptable operating system for diverse vertical markets. Key capabilities include:
- Nationwide entity seeding across political, educational, health, regulated commercial, and informal sectors.
- Comprehensive wallet and payment infrastructure supporting bank transfers, online funding, and withdrawals.
- A production-ready notification engine with multi-channel delivery and templating.
- Advanced identity verification and KYC processes.
- Entitlement-gated access control and role-based permissions.
- Robust API with extensive test coverage and CI/CD pipelines.

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

The system is built on a serverless, edge-first architecture utilizing Cloudflare Workers.

### UI/UX Decisions
- **Mobile-first Design**: Frontend applications are built with React and PWA capabilities for an "Offline First" and "Mobile First" experience.
- **Design System**: A shared design system (`@webwaka/design-system`) and white-label theming (`@webwaka/white-label-theming`) ensure consistent branding and user experience across different tenant applications.
- **Admin Interfaces**: Dedicated dashboards for platform administration (`platform-admin`), general administration (`admin-dashboard`), and partner management (`partner-admin`).

### Technical Implementations
- **Monorepo Structure**: Organized into `apps/` (for deployable applications) and `packages/` (for reusable libraries).
- **Language**: TypeScript with strict mode enforced across the codebase.
- **API Framework**: Hono for efficient, edge-optimized API development.
- **Database Interaction**: Uses Cloudflare D1 (SQLite) with a robust migration system (`infra/db/migrations`) including rollback scripts. All tenant-scoped queries enforce `tenant_id` for strict data isolation (T3).
- **State Machines**: Implemented for complex workflows like claim lifecycles (`packages/claims/src/state-machine.ts`) and wallet transactions.
- **Notification Engine**: A multi-channel notification system (InApp, Email, SMS, WhatsApp, Telegram, FCM, Slack, Teams) with a rule engine, templating, and digest capabilities. Events are processed via Cloudflare Queues using an outbox pattern for reliability.
- **Payment & Wallet System**: Comprehensive wallet functionality (`@webwaka/hl-wallet`) supporting transfers, withdrawals, and online funding, with flexible payment modes (bank transfer, Paystack integration).
- **Identity Verification**: Integrates with third-party services (Prembly) for BVN/NIN verification, with fallback mechanisms. Rate limiting is applied to identity verification routes.
- **AI Integration**: A vendor-neutral abstraction layer (`@webwaka/superagent`) handles AI interactions, with strict consent gates (`aiConsentGate`) for NDPR compliance.
- **Search & Discovery**: Utilizes FTS5 for full-text search and `search_entries` for discoverability of entities, with deterministic `searchEntryId` for stable indexing.
- **Geo-spatial Data**: `@webwaka/geography` package provides hierarchical geographical data (country, zones, states, LGAs, wards) crucial for entity seeding and place resolution.
- **Testing**: Extensive test suites using Vitest, with dedicated tests for API routes, packages, and governance checks. Playwright is used for E2E testing.
- **CI/CD**: GitHub Actions workflows for type checking, testing, linting, security auditing, and automated deployment to staging and production environments.
- **Rate Limiting**: Implemented at the API gateway level for critical endpoints (login, register, password reset, identity verification, airtime).
- **Error Handling**: Centralized error handling for API routes, including structured error responses and audit logging.

### Feature Specifications
- **Nationwide Entity Seeding**: Multi-phase data ingestion process (S00-S16) covering diverse Nigerian entities (political parties, polling units, schools, health facilities, regulated commercial entities, marketplaces, faith venues, transport, NGOs, professional services, universities, agricultural entities), with robust provenance tracking and data reconciliation.
- **Claim & Activation Flow**: Multi-step process for entities to claim their profiles and activate vertical-specific services, including entitlement checks and admin confirmation workflows for bank transfer payments.
- **Configurable Bank Accounts**: Supports platform-level and workspace-specific bank account configurations for payments.
- **Tenant Branding**: API for creating and updating tenant branding (colors, logos, custom domains) with domain verification.
- **Profile Visibility**: Workspace admins can control profile visibility (public, semi, private), which syncs with search indexes.

### System Design Choices
- **Edge-first**: Leverages Cloudflare Workers for low-latency and scalable execution.
- **Stateless Workers**: Most Workers are designed to be stateless, relying on D1, KV, and R2 for persistence.
- **Immutable Data Patterns**: Emphasizes idempotent operations and audit logging for traceability.
- **Modular Design**: Clear separation of concerns with domain-specific packages and vertical-specific implementations.
- **Scalable Notification Pipeline**: Decoupled notification generation from delivery via Cloudflare Queues.

## External Dependencies

- **Cloudflare**: Workers (runtime), D1 (database), KV (key-value store), R2 (object storage), Queues (messaging), DNS.
- **Termii**: SMS Gateway for OTP and notifications.
- **Resend**: Email service for transactional emails.
- **Meta/Dialog360 WhatsApp**: WhatsApp Business API integration for notifications.
- **Telegram**: Messaging platform integration for notifications.
- **Firebase Cloud Messaging (FCM)**: Push notifications.
- **Slack**: Internal team notifications.
- **Microsoft Teams**: Internal team notifications.
- **Paystack**: Payment gateway for online transactions (optional, platform supports bank transfers as default).
- **Prembly**: Identity verification APIs (BVN, NIN, CAC, FRSC).
- **OpenStreetMap (Overpass API)**: Source for geo-spatial entity data (marketplaces, hotels, food venues, faith venues, transport, pharmacies, supermarkets, salons, NGOs, fuel stations, bank branches, health clinics, government offices, schools, professional services, farms, water infrastructure, supply chain entities).
- **Wikipedia**: Source for political entity data (e.g., state governors, national assembly members).
- **INEC (Independent National Electoral Commission)**: Official source for electoral data (wards, polling units, political parties, candidate lists).
- **UBEC (Universal Basic Education Commission)**: Source for school data.
- **NUPRC (Nigerian Upstream Petroleum Regulatory Commission)**: Source for upstream oil and gas operators.
- **NAICOM (National Insurance Commission)**: Source for insurance entities.
- **CBN (Central Bank of Nigeria)**: Source for regulated financial institutions (BDCs, MFBs, DMBs, NIBs, PMIs, DFIs).
- **NCC (Nigerian Communications Commission)**: Source for licensed telecom operators.
- **SEC (Securities and Exchange Commission) Nigeria**: Source for capital market operators.
- **NHIA (National Health Insurance Authority)**: Source for accredited healthcare providers.
- **NPHCDA (National Primary Health Care Development Agency)**: Source for Primary Health Care facilities.
- **MLSCN (Medical Laboratory Science Council of Nigeria)**: Source for approved MLS/MLA-T training institutions.
- **NUC (National Universities Commission)**: Official government registry for universities.
- **GRID3 / HDX**: Source for health facilities data.

## Bug Fix Log — Round 5B: UI/UX & API Contract Audit (2026-04-23)

### Critical — API Contract Bugs
- **BUG-WALLET-UI-01**: `loadHitlQueue()` called wrong endpoint (`/platform-admin/wallets/stats`) and read non-existent `data.pending_hitl` field. Stats endpoint is aggregate-only; no list of HITL items. Fixed by: (a) adding new `GET /platform-admin/wallets/hitl` admin route returning paginated pending HITL items; (b) updating `loadHitlQueue()` to call the correct endpoint and read `data.items`.
- **BUG-WALLET-UI-02**: Stats API field name mismatches — API returned `active_count`/`frozen_count` but UI read `active_wallets`/`frozen_wallets`. Fixed by renaming SQL aliases to `active_wallets` and `frozen_wallets`.
- **BUG-WALLET-UI-03**: Stats API missing `pending_hitl_count` and `pending_funding_count` fields — both now added as sub-queries in the stats endpoint.
- **BUG-WALLET-UI-04**: Feature flag pills hardcoded DISABLED, never loaded from API. Fixed by reading `data.feature_flags` from the stats response and calling `updateFlagPill()` to reflect real-time flag state.

### Critical — Security
- **BUG-WALLET-UI-05**: XSS vulnerability — HITL table rows were built with string interpolation into `innerHTML` (item.id, item.wallet_id, item.tenant_id, bank_transfer_order_id all unescaped). Fixed by replacing innerHTML string interpolation with DOM API (`document.createElement`, `textContent`, `addEventListener`).

### Backend Bug
- **BUG-FREEZE-01**: Freeze/unfreeze endpoints used `auth.tenantId` in WHERE clause, preventing cross-tenant super-admin freezes. GOVERNANCE_SKIP: super-admins must freeze any wallet platform-wide. Fixed by looking up the wallet's actual `tenant_id` first, removing tenant scope from UPDATE, adding `changes` check for 404/409 feedback, and using the wallet's `tenant_id` for events/audit logs. Same pattern applied to unfreeze.

### UI/PWA Bugs
- **BUG-PWA-01**: Both `index.html` and `wallet.html` missing `<link rel="manifest">` — PWA install banner and installability broken. Fixed.
- **BUG-PWA-02**: Service Worker SHELL cache only included `['/', '/manifest.json', '/offline.html']` — `/wallet.html` and `/sw.js` not cached offline. Updated to `['/', '/wallet.html', '/manifest.json', '/offline.html', '/sw.js']` and bumped cache name to `webwaka-admin-v4`.
- **BUG-PWA-03**: `manifest.json` `background_color` was `#ffffff` (white) against a dark `#0a0f1e` app. Fixed to `#0a0f1e`. `theme_color` was `#006400` (wrong dark green) vs actual brand `#00c851`. Fixed.
- **BUG-A11Y-01**: HandyLife Wallet Admin card was a `<div onclick="...">` — not keyboard-focusable, no `tabindex`, no `role="button"`, no keydown handler. Fixed by converting to a native `<a href="/wallet.html">` element.
- **BUG-A11Y-02**: Stat value elements (`#stat-total`, etc.) had no `aria-live` attribute — screen readers would not announce dynamically loaded values. Added `aria-live="polite"` to each.
- **BUG-A11Y-03**: Alert box had both `role="alert"` (implies `aria-live="assertive"`) and `aria-live="polite"` — contradictory. Removed `aria-live="polite"` leaving only `role="alert"`.
- **BUG-UI-01**: Footer "Governance Doc" link pointed to `/docs/governance/handylife-wallet-governance.md` which returns 404 (file not in public dir). Link removed.
- **BUG-UI-02**: `server.js` health endpoint reported `milestone: 2` — corrected to `7`.
- **BUG-UI-03**: Feature flag PATCH body example in wallet.html showed `{ "transfers": true }` which doesn't match the updated API signature `{ "flag": "transfers", "enabled": true }`. Fixed.

### Enhancements Applied
- Added `AbortController` with 10-second timeout on all `fetch` calls in `wallet.html` — prevents indefinite UI hang on unresponsive API.
- `rejectFunding()` now trims whitespace from the reason string before sending.
- HITL confirm/reject buttons now use `encodeURIComponent(id)` in URL construction.
- HITL action buttons now have explicit `aria-label` attributes for screen reader accessibility.
- Added `scope="col"` to all table header cells.
- `GET /platform-admin/wallets/hitl` endpoint is cursor-paginated (id-based, `?limit` and `?cursor` params).
- **Dexie.js**: For "Offline First" data synchronization in frontend.

## Bug Fix Log — Round 6B: UI/UX, PWA & Accessibility Audit (2026-04-23)

### Accessibility Bugs
- **BUG-A11Y-04**: `offline.html` plug icon div `🔌` missing `aria-hidden="true"` — screen readers would announce the decorative emoji. Fixed by adding `aria-hidden="true" role="presentation"` to the icon element.

### PWA Completeness Bugs
- **BUG-PWA-04**: `offline.html` missing `<link rel="manifest">` — orphaned from the PWA install graph. Added manifest link plus `apple-touch-icon`, `theme-color`, and Apple PWA meta tags.
- **BUG-PWA-05**: `index.html` and `wallet.html` missing `<meta name="theme-color" content="#00c851">` — mobile Chrome address bar was not themed. Added to both pages.
- **BUG-PWA-06**: `index.html` and `wallet.html` missing iOS PWA meta tags (`apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title`) — iOS "Add to Home Screen" install was unstyled. Added to all three HTML pages.
- **BUG-PWA-07**: Both `index.html` and `wallet.html` missing `<meta property="og:title">` and `og:description` — social share previews were blank. Added Open Graph meta tags.

### Content Accuracy Bugs
- **BUG-CONTENT-01**: Phase W1 gate card in `wallet.html` showed "51 tests passing" — outdated since `hl-wallet` now has 107 passing tests. Updated to "107 tests passing".
- **BUG-CONTENT-02**: `index.html` footer date was stale at "2026-04-12". Updated to "2026-04-23".
- **BUG-CONTENT-03**: `wallet.html` footer date was stale at "2026-04-20". Updated to "2026-04-23".

### UX Bugs
- **BUG-UX-01**: Non-live app cards (Partner Admin, Brand Runtime, Public Discovery, API) had the same hover border effect as the clickable HandyLife card, implying they were interactive when they are not. Fixed by adding `.card--future` CSS class: `cursor: default; opacity: 0.65;` with hover kept to `border-color: var(--border)`. Added `aria-label` describing the milestone status.
- **BUG-UX-02**: Stats section showed "n/a" with no explanation when API was unreachable — users had no way to tell if data was zero or an error. Added a visible amber warning banner (`#stats-api-status`) that appears when `showStatsOffline()` fires, reading "API unreachable — stats unavailable. Check network or service worker key."
- **BUG-UX-03**: HITL queue showed "Unable to load — check API auth" with no way to retry without a full page refresh. Added a ↻ Retry button inline next to the HITL heading that calls `loadHitlQueue()` directly.