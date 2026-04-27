# WebWaka OS — Smart Profile / Public Page Builder: Platform-Wide Architecture Report

**Document type:** Strategic Architecture Review — Research & Planning Only  
**Status:** Draft — For Founder Review  
**Date:** 2026-04-27  
**Prepared by:** Platform Architect Review (Replit Agent)  
**Scope:** Platform-wide integration mapping for a WebWaka-native Smart Profile / Public Page capability  
**Implementation phase:** NOT YET — this document prepares for implementation  

---

## Executive Note

This document follows the **Phase A → B → C → D** discovery and analysis sequence mandated by the brief. It does not assume any prior architecture from outside the current codebase. Every assertion about the current platform is traceable to files, migrations, package manifests, governance documents, or source code found in the live monorepo as of 2026-04-27.

---

## 1. Current Platform Topology

### 1.1 Organisation and Repository Structure

WebWaka OS is a **single TypeScript monorepo** hosted at `github.com/WebWakaOS/WebWaka`. There is no multi-repo organisation structure. All code, migrations, governance docs, and scripts live in one repository managed with `pnpm workspaces`.

**Previous assumptions invalidated:**  
- No multi-repo split found. Earlier references to separate repos (e.g. `WebWakaDOS`) are obsolete.  
- No separate "brand repo," "discovery repo," or "ops repo." All live in `apps/` and `packages/`.

### 1.2 Active Apps (Deployable Cloudflare Workers)

| App | Pillar | Status | Runtime | Description |
|-----|--------|--------|---------|-------------|
| `apps/api/` | Infra (all) | ✅ Live | Hono on CF Workers | Shared API gateway — all platform routes |
| `apps/platform-admin/` | Pillar 1 | ✅ Live | Node.js dev shim (port 5000) | WebWaka super-admin dashboard |
| `apps/admin-dashboard/` | Pillar 1 | ✅ Live | Hono on CF Workers | Admin dashboard |
| `apps/partner-admin/` | Pillar 1 | ⚠️ Scaffolded | Hono on CF Workers | Partner/tenant management |
| `apps/brand-runtime/` | **Pillar 2** | ✅ Live | Hono on CF Workers | Tenant-branded websites and stores |
| `apps/public-discovery/` | **Pillar 3** | ✅ Live | Hono on CF Workers | Public directory and marketplace |
| `apps/tenant-public/` | Pillar 3 | ⚠️ Partial | Hono on CF Workers | Per-tenant profile listing (discovery-lite) |
| `apps/ussd-gateway/` | Pillar 1 | ✅ Live | Hono on CF Workers | USSD micro-transactions |
| `apps/projections/` | Pillar 1 | ✅ Live | Hono on CF Workers | Data projection workers |
| `apps/notificator/` | Cross-cutting | ✅ Live | Hono on CF Workers | Notification delivery engine |
| `apps/schedulers/` | Cross-cutting | ✅ Live | Hono on CF Workers | Scheduled jobs |
| `apps/workspace-app/` | Pillar 1 | ⚠️ Partial | Hono on CF Workers | Primary client-facing tenant workspace |

### 1.3 Shared Packages (160+)

**Infrastructure / Pre-vertical:**
- `@webwaka/entities` — CRUD for 7 root entities (Individual, Organization, Place, Offering, Profile, Workspace, Brand Surface) against D1. Source of truth for canonical entity operations.
- `@webwaka/auth` — JWT auth, session management
- `@webwaka/auth-tenancy` — Multi-tenant identity, RBAC (viewer/member/admin/super_admin), JWT middleware
- `@webwaka/types` — Shared TypeScript types across all packages
- `@webwaka/shared-config` — Environment helpers, CORS config
- `@webwaka/core` — Base utilities (circuit breakers, KV helpers)

**Pillar 2 (Brand):**
- `@webwaka/white-label-theming` — TenantTheme type, CSS variable generation (`generateCssTokens`), D1+KV theme resolution, brand walk with `brand_independence_mode`, email sender resolution. **This is the single source of truth for brand tokens.**
- `@webwaka/design-system` — Shared UI patterns, mobile-first CSS, 360px base viewport tokens
- `@webwaka/frontend` — Tenant manifest rendering, profile list rendering (used by `apps/tenant-public`)

**Pillar 3 (Marketplace):**
- `@webwaka/profiles` — Currently a **stub** (types only). Actual profile management is via raw D1 in `apps/api/src/routes/profiles.ts` and `apps/tenant-public/src/index.ts`. BUG-P3-014 is open.
- `@webwaka/search-indexing` — Type contracts only (scaffold). Runtime implementation in `apps/api/src/lib/search-index.ts` using D1 FTS5.
- `@webwaka/claims` — 8-state FSM: `seeded → claimable → claim_pending → verified → managed → branded → monetized → delegated`
- `@webwaka/identity` — Nigerian KYC (BVN/NIN/CAC/FRSC via Prembly)

**Cross-Pillar:**
- `@webwaka/offerings` — Products, services, routes, seats, tickets. Cross-pillar (Pillar 1 writes, Pillar 2+3 reads). Price in integer kobo.
- `@webwaka/events` — 122+ canonical domain event types across all platform domains
- `@webwaka/notifications` — Notification primitives and templates
- `@webwaka/payments` — Payment gateway abstraction (Paystack + bank transfer)
- `@webwaka/hl-wallet` — HandyLife NGN wallet (float ledger, HITL funding, KYC-gated)
- `@webwaka/pos` — Point-of-sale primitives
- `@webwaka/workspaces` — Tenant-scoped management contexts
- `@webwaka/relationships` — Cross-entity graph rules
- `@webwaka/entitlements` — Subscription, features, limits, rights
- `@webwaka/offline-sync` — PWA sync queue, IndexedDB, conflict model
- `@webwaka/social` — Profiles, follows, posts, feed, DMs (AES-GCM), stories, moderation
- `@webwaka/community` — Skool-style community: spaces, memberships, channels, courses, events
- `@webwaka/negotiation` — B2B negotiation flows
- `@webwaka/otp` — OTP delivery
- `@webwaka/logging` — Structured logging
- `@webwaka/webhooks` — Outbound webhook delivery
- `@webwaka/superagent` — Vendor-neutral AI routing, HITL, BYOK key service, tool registry
- `@webwaka/ai-abstraction` — AI provider adapter interface
- `@webwaka/ai-adapters` — Concrete AI provider adapters (OpenAI-compat, Groq, OpenRouter)
- `@webwaka/i18n` — Internationalisation helpers
- `@webwaka/geography` — Nigerian place hierarchy (Country → Zone → State → LGA → Ward → Community)
- `@webwaka/contact` — Contact form handling

**Verticals (140+):**  
One package per vertical niche (e.g. `@webwaka/verticals-restaurant`, `@webwaka/verticals-clinic`, `@webwaka/verticals-creator`). Each composes from shared packages (P1 invariant — Build Once Use Infinitely).

### 1.4 Template System (Pillar 2)

`apps/brand-runtime/src/templates/niches/` contains **200+ niche template directories**, each providing a `WebsiteTemplateContract.renderPage()` renderer for vertical-specific branded pages.

A `resolveTemplate()` function in `apps/brand-runtime/src/lib/template-resolver.ts` looks up the active `template_installation` for a tenant and dispatches rendering through the appropriate niche template. Tenants without an active template installation fall back to generic page functions (`branded-home.ts`, `about.ts`, `services.ts`, `contact.ts`).

The base HTML shell in `apps/brand-runtime/src/templates/base.ts` provides: CSS variable injection from `white-label-theming`, Open Graph tags (SEO-02), PWA manifest link, canonical URLs, Twitter Card meta, and attribution rendering.

### 1.5 Database Model (D1 — SQLite, 416+ migrations)

Key tables relevant to the smart profile / public page capability:
- `places` — Geography hierarchy (Country/Zone/State/LGA/Ward/Community/Facility)
- `individuals` — Person-type entities
- `organizations` — Collective entities (businesses, NGOs, schools, churches, etc.)
- `profiles` — Discovery records; columns: `subject_type`, `subject_id`, `claim_state` (8-state FSM), `verification_state`, `publication_state`, `primary_place_id`
- `workspaces` — Tenant-scoped management contexts with `workspace_id`, `tenant_id`, membership
- `tenant_branding` — Brand tokens: `primary_color`, `secondary_color`, `accent_color`, `font_family`, `logo_url`, `favicon_url`, `border_radius_px`, `custom_domain`, `custom_domain_verified`, `custom_domain_verification_token`, `display_name`, `support_email`, `mailing_address`, `requires_attribution`, `payment_bank_account_json`
- `offerings` — Products/services with `tenant_id`, `name`, `description`, `price_kobo`, `is_published`, `sort_order`, `category`
- `search_entries` — FTS5-powered search index: `entity_type`, `entity_id`, `tenant_id`, `display_name`, `keywords`, `place_id`, `ancestry_path`, `visibility`
- `sector_license_verifications` — Compliance-gated vertical licence verification (migration 0416)
- `template_audit_log` — Template governance and audit trail (migration 0414)

### 1.6 Deployment Topology

- **Production:** Cloudflare Workers (edge-first, global CDN)
- **Storage:** D1 (relational), KV (tenant config/sessions/rate limits/theme cache), R2 (assets)
- **CI/CD:** GitHub Actions → Cloudflare Workers (staging auto-deploy, production manual promotion)
- **Domain routing:** `brand-runtime` resolves tenants via: (1) custom domain match against `tenant_branding.custom_domain`, (2) `brand-{slug}.webwaka.com` subdomain, (3) `/:slug` route parameter
- **Public discovery:** `apps/public-discovery` at `discover.webwaka.com` — cross-tenant, public, no auth
- **Per-tenant public:** `apps/tenant-public` — per-tenant profile listing, tenant resolved via Host header

### 1.7 Current Governance Documents

Key governance documents that must be honoured throughout any implementation:
- `docs/governance/platform-invariants.md` — 10 Product (P1–P8) + 10 Technical (T1–T10) invariants
- `docs/governance/universal-entity-model.md` — 7 root entities; authoritative
- `docs/governance/3in1-platform-architecture.md` — Authoritative pillar assignments for all modules
- `docs/governance/white-label-policy.md` — White-label rights, attribution rules, plan tiers
- `docs/governance/claim-first-onboarding.md` — Claim lifecycle governance
- `docs/governance/security-baseline.md` — NDPR, PII rules, tenant isolation

---

## 2. Executive Architecture Summary

### What this capability IS

The **WebWaka Smart Profile / Public Page System** (proposed internal name: **WakaPage**) is a **shared public-surface engine** that gives every entity on the WebWaka platform — businesses, professionals, creators, institutions, civic offices, political actors, markets, farms, and more — a **structured, composable, analytics-aware, live-data-connected public digital presence**.

This is **not** a link-in-bio tool bolted on. It is the **Pillar 2 surface layer becoming fully composable, data-bound, and distribution-aware** — completing the triangle between Operations (live data), Brand (rendered surface), and Discovery (visibility and indexing).

### What it IS NOT

- Not a standalone Linktree clone or separate product
- Not a new CMS or isolated page builder with its own entity model
- Not a duplicate of `tenant_branding` — that stores tokens; WakaPage renders composable surfaces using those tokens
- Not a creator-only product — it serves all 140+ verticals
- Not a separate analytics pipeline — it writes to existing event infrastructure

### Why it belongs across all three pillars

| Pillar | WakaPage role |
|--------|---------------|
| **Pillar 2 — Brand** | The page-building and rendering engine. WakaPage IS the next evolution of `brand-runtime`. |
| **Pillar 1 — Operations** | The live data source. Products, services, schedules, bookings, inventory, pricing, staff routing — all sourced from Pillar 1 entities and surfaced live on the page. |
| **Pillar 3 — Discovery** | The distribution layer. Every published WakaPage becomes a discoverable, indexable, shareable entry in the marketplace — geography-aware, category-tagged, claim-linked. |

### Best product framing

> **"Every entity on WebWaka OS gets a smart, living public page — built once, maintained by their operations, and distributed through discovery."**

The user flow is: Claim your profile in Pillar 3 → Activate a workspace in Pillar 1 → Your live data automatically populates your WakaPage in Pillar 2 → Discovery distributes it. No manual duplication required.

---

## 3. Current-State Capability Audit

### 3.1 What Already Exists and Can Be Reused

| Capability | Status | Current Location | Reuse Plan |
|-----------|--------|-----------------|------------|
| Brand token system (colors, fonts, logo, custom domain) | ✅ Full | `@webwaka/white-label-theming`, `tenant_branding` table | Extend, not replace |
| Niche-specific page templates (200+ niches) | ✅ Full | `apps/brand-runtime/src/templates/niches/` | Extend to block-level composition |
| Base HTML template shell (OG, PWA, SEO-02) | ✅ Full | `apps/brand-runtime/src/templates/base.ts` | Reuse as WakaPage shell |
| Products/services catalog (offerings) | ✅ Full | `@webwaka/offerings`, `offerings` table | Data-bind to page blocks |
| Contact form (offline-capable) | ✅ Full | `apps/brand-runtime/src/templates/contact.ts` | Convert to Contact block |
| Public discovery routing + SEO | ✅ Full | `apps/public-discovery` — geography routes, schema.org | Extend for WakaPage URLs |
| Domain routing + custom domain verification | ✅ Full | `apps/brand-runtime` middleware, `tenant_branding.custom_domain` | Reuse as-is |
| Claim lifecycle FSM (8-state) | ✅ Full | `@webwaka/claims/src/state-machine.ts` | The `branded` state maps to WakaPage activation |
| Search indexing + FTS5 | ✅ Full | `apps/api/src/lib/search-index.ts`, `search_entries` table | Write WakaPage data into existing index |
| Profile visibility controls (public/semi/private) | ✅ Full | `apps/api/src/routes/profiles.ts` | Surface as page publish/unpublish |
| Geography hierarchy | ✅ Full | `@webwaka/geography`, `places` table | Drive WakaPage location context |
| Social graph (follows, posts, stories, DMs) | ✅ Full | `@webwaka/social` | WakaPage social integration layer |
| Community (spaces, courses, events) | ✅ Full | `@webwaka/community` | Embed community blocks in WakaPage |
| Event bus (122+ event types) | ✅ Full | `@webwaka/events` | Add WakaPage-specific event types |
| Notification engine (multi-channel) | ✅ Full | `apps/notificator`, `@webwaka/notifications` | Lead/inquiry notifications |
| AI abstraction (SuperAgent, BYOK) | ✅ Full | `@webwaka/superagent`, `@webwaka/ai-abstraction` | AI-assisted content generation |
| PWA manifest + service worker | ✅ Full | `apps/brand-runtime/src/index.ts` | Every WakaPage is a PWA |
| Offline sync | ✅ Full | `@webwaka/offline-sync` | Offline page builder edits |
| Tenant RBAC | ✅ Full | `@webwaka/auth-tenancy` | Page permission controls |
| Sector licence verification | ✅ Full | `sector_license_verifications`, `apps/api/src/routes/regulatory-verification.ts` | Trust badges on WakaPage |
| Entitlement gating | ✅ Full | `@webwaka/entitlements` | Gate WakaPage blocks by subscription tier |
| Multi-channel notifications | ✅ Full | `apps/notificator` | WhatsApp CTAs, lead notifications |
| B2B marketplace / negotiation | ✅ Full | `@webwaka/negotiation` | Quote request blocks on WakaPage |
| Analytics events | ✅ Partial | `apps/api/src/routes/analytics.ts` | Need WakaPage-specific attribution events |

### 3.2 What Partially Exists

| Capability | Gap | Location | Action Needed |
|-----------|-----|----------|---------------|
| `@webwaka/profiles` package | Only a type stub. Logic is in raw D1 queries in multiple places. BUG-P3-014 open. | `packages/profiles/src/index.ts` | Implement as a proper D1-backed service package |
| `@webwaka/search-indexing` | Type contracts only. Runtime in `api`. No pluggable adapter used. | `packages/search-indexing/src/` | Wire adapter pattern; expose as shared package |
| Page/block composition | Templates are niche-level HTML functions, not composable block schemas | `apps/brand-runtime/src/templates/` | Add block schema layer on top of existing templates |
| Analytics attribution | Page-view events exist, but no click-through, conversion, UTM attribution for WakaPage | `apps/api/src/routes/analytics.ts` | Add WakaPage-scoped analytics events |
| QR code generation | No QR infrastructure exists | Absent | New capability needed |
| Lead/inquiry capture forms | Contact form exists (offline-capable) but no structured lead model | `apps/brand-runtime/src/templates/contact.ts` | Extend to full Lead entity |
| Booking integration | No booking/appointment slots exposed on public pages | `offerings` table has schedule data | Wire `get-active-offerings` / `schedule-availability` SuperAgent tools to public rendering |
| Media kit / press pack | No media kit capability | Absent | New block type needed |
| Social link aggregation | No structured social links entity | `tenant_branding` has no social_links field | Extend `tenant_branding` or add new table |
| Campaign/time-limited pages | No campaign page concept | Brand-runtime has no expiry logic | New page_variant lifecycle needed |
| Page variant A/B support | No variant system | Absent | New entity needed |

### 3.3 What Is Missing

| Capability | Priority | Action |
|-----------|----------|--------|
| Page entity (distinct from Profile and Brand Surface) | Critical | New domain model entity |
| Block registry + schema-driven block system | Critical | New architecture layer |
| Page analytics (views, clicks, conversions, UTM) | Critical | New event types + analytics tables |
| Lead/Inquiry entity | High | New domain model entity |
| QR code generation + campaign links | High | New service |
| Audience/subscriber list | High | New entity |
| Social link registry per profile | High | Extend `tenant_branding` |
| Appointment/booking CTA blocks | High | Wire existing schedule data |
| Campaign page / time-limited variant | Medium | Page lifecycle extension |
| Media kit / downloadable assets | Medium | New block type + R2 storage |
| Testimonial / review blocks | Medium | Social proof entity |
| Verification / trust badges on WakaPage | Medium | Wire `sector_license_verifications` |
| Page-level SEO controls (title, description, OG image) | Medium | Extend page entity |
| WhatsApp-native CTA block | Medium | Extend brand-runtime routes |

### 3.4 What Conflicts With the Desired Direction

| Potential Conflict | Assessment |
|-------------------|------------|
| Niche templates are HTML functions, not block schemas | Templates should evolve to be block-registry backed. Existing templates should be wrapped as "legacy" blocks during transition — no breaking changes. |
| `@webwaka/profiles` is a stub | Resolve BUG-P3-014 before WakaPage implementation begins. WakaPage depends on a real profile service. |
| Tenant custom domain lives in `tenant_branding` | This is correct ownership. WakaPage does not need its own domain system — it reuses `tenant_branding.custom_domain`. |
| `apps/tenant-public` duplicates some of `apps/brand-runtime` | `tenant-public` serves discovery-lite, `brand-runtime` serves full branded experience. WakaPage should unify toward `brand-runtime` as the rendering engine. `tenant-public` should become a thin redirect or eventually be consolidated. |

---

## 4. Master Feature-to-Platform Mapping

The following maps the full best-of-class smart profile / public page feature set against the current WebWaka architecture.

### 4.1 Identity and Profile Core

| Feature | Platform Location | Module Owner | Scope | Phase |
|---------|------------------|--------------|-------|-------|
| Page identity (slug, URL, canonical) | `profiles.slug` extended; `search_entries` | `@webwaka/profiles` (when fully implemented) | Tenant-level | MVP |
| Display name, avatar, bio | `profiles` + `tenant_branding.display_name` | `@webwaka/entities` + `@webwaka/profiles` | Entity-level | MVP |
| Verification badge (claimed/verified) | `profiles.verification_state` + `claims.claim_state` | `@webwaka/claims` + `@webwaka/identity` | Entity-level | MVP |
| Category / vertical label | `organizations.category` | `@webwaka/entities` | Entity-level | MVP |
| Location context | `profiles.primary_place_id` → `places` | `@webwaka/geography` | Entity-level | MVP |
| Sector licence badges | `sector_license_verifications` | `apps/api/src/routes/regulatory-verification.ts` | Vertical-specific | MVP |

### 4.2 Page Composition and Blocks

| Feature | Platform Location | Module Owner | Scope | Phase |
|---------|------------------|--------------|-------|-------|
| Schema-driven block system | New: `page_blocks` table + block registry | New: `@webwaka/page-blocks` | Global | Phase 1-2 |
| Template/page archetype registry | Extend `template_audit_log`; `template_installations` | `apps/brand-runtime` lib | Global | Phase 1 |
| Text / rich content blocks | New block type | `@webwaka/page-blocks` | Global | MVP |
| Image / media blocks | R2 asset + block type | `@webwaka/page-blocks` + R2 | Global | MVP |
| Social links block | New: `social_link_profiles` table or extend `tenant_branding` | `@webwaka/white-label-theming` extended | Tenant-level | MVP |
| CTA / action blocks (WhatsApp, Call, Book, Pay) | New block types on top of existing payment/booking routes | `apps/brand-runtime/src/routes/` | Global | MVP |
| Products / offerings catalog block | `@webwaka/offerings` data-bound | `@webwaka/offerings` | Pillar 1+2 | MVP |
| Services list block | `offerings` with `category='service'` | `@webwaka/offerings` | Pillar 1+2 | MVP |
| Booking / availability block | `schedule_slots` via SuperAgent tool | `@webwaka/superagent` tools | Pillar 1+2 | Phase 2 |
| Testimonial / review block | New: `testimonials` or wire `@webwaka/social` reactions | `@webwaka/social` | Global | Phase 3 |
| Gallery / portfolio block | R2 assets + block type | New block + R2 | Global | Phase 2 |
| Video embed block | Block type with embed URL | New block | Global | Phase 2 |
| Map / location block | `places` + `geography` | `@webwaka/geography` | Entity-level | Phase 2 |
| FAQ / accordion block | New block type | `@webwaka/page-blocks` | Global | Phase 2 |
| Countdown / timer block (campaign pages) | New block with expiry field | `@webwaka/page-blocks` | Page-variant | Phase 3 |
| Community / course block | `@webwaka/community` | `@webwaka/community` | Pillar 3 | Phase 3 |

### 4.3 Commerce and Monetisation

| Feature | Platform Location | Module Owner | Scope | Phase |
|---------|------------------|--------------|-------|-------|
| Product catalog with inventory-aware pricing | `offerings` + POS stock queries | `@webwaka/offerings` + `@webwaka/pos` | Pillar 1+2 | Phase 2 |
| Direct checkout / Paystack integration | `apps/brand-runtime/src/routes/shop.ts` (already exists) | `apps/brand-runtime` | Pillar 2 | MVP (exists) |
| Buy now / pay later / hire purchase | `@webwaka/verticals-hire-purchase` | Vertical pack | Vertical | Phase 4 |
| Donation links | `offerings` with type='donation' | `@webwaka/offerings` extended | Global | Phase 3 |
| Membership / subscription links | `@webwaka/community` membership tiers | `@webwaka/community` + `@webwaka/entitlements` | Global | Phase 3 |
| Digital downloads | R2 + offering type='digital' | New offering type | Pillar 1+2 | Phase 4 |
| Invoice / quote request | `@webwaka/negotiation` | `@webwaka/negotiation` | B2B | Phase 3 |

### 4.4 Lead and Inquiry Capture

| Feature | Platform Location | Module Owner | Scope | Phase |
|---------|------------------|--------------|-------|-------|
| Contact form (offline-capable) | `apps/brand-runtime/src/templates/contact.ts` (exists) | `apps/brand-runtime` + `@webwaka/contact` | Global | MVP (exists) |
| Structured lead entity | New: `leads` table | New: `@webwaka/contact` extended or `@webwaka/leads` | Global | Phase 2 |
| WhatsApp click-to-chat CTA | New block type with wa.me link | `apps/brand-runtime` block | Global | MVP |
| Email opt-in / subscriber capture | New: `audience_records` table | New capability | Global | Phase 3 |
| Lead notifications (WhatsApp/Email/SMS) | `apps/notificator` + `@webwaka/notifications` | `apps/notificator` | Global | Phase 2 |
| Lead source attribution | `analytics_events` + UTM params | `apps/api/src/routes/analytics.ts` extended | Global | Phase 3 |

### 4.5 Analytics and Attribution

| Feature | Platform Location | Module Owner | Scope | Phase |
|---------|------------------|--------------|-------|-------|
| Page view tracking | New event type in `@webwaka/events` | `@webwaka/events` + `apps/api` | Page-level | MVP |
| Link click tracking | New event type | `@webwaka/events` + `apps/brand-runtime` | Block-level | Phase 2 |
| CTA conversion events | New event type | `@webwaka/events` | Block-level | Phase 2 |
| UTM / campaign attribution | New fields in `analytics_events` | `apps/api/src/routes/analytics.ts` | Page-level | Phase 3 |
| QR scan attribution | New event type + QR entity | New capability | Page-level | Phase 3 |
| Audience source breakdown (WhatsApp / Discovery / Direct) | Analytics aggregation | `apps/api/src/routes/workspace-analytics.ts` | Tenant-level | Phase 4 |

### 4.6 Discovery and Distribution

| Feature | Platform Location | Module Owner | Scope | Phase |
|---------|------------------|--------------|-------|-------|
| Search index (FTS5) entry | `search_entries` table | `apps/api/src/lib/search-index.ts` | Entity-level | MVP |
| Geography-aware URL structure | `apps/public-discovery` routes | `apps/public-discovery` | Global | MVP (exists) |
| Schema.org structured data | `apps/public-discovery` templates | `apps/public-discovery` | Global | MVP (exists) |
| Sitemap generation | `apps/brand-runtime/src/routes/sitemap.ts` (exists) | `apps/brand-runtime` | Tenant-level | MVP (exists) |
| Cross-discovery indexing (WakaPage in global directory) | `search_entries` + discovery routes | `apps/public-discovery` | Global | Phase 2 |
| QR code generation + shortlink | New: `qr_campaigns` table + QR service | New capability | Page/campaign-level | Phase 3 |
| Social sharing (OG tags, Twitter Card) | `apps/brand-runtime/src/templates/base.ts` (exists) | `apps/brand-runtime` | Page-level | MVP (exists) |

### 4.7 Governance and Moderation

| Feature | Platform Location | Module Owner | Scope | Phase |
|---------|------------------|--------------|-------|-------|
| Publish / unpublish workflow | `profiles.publication_state` | `apps/api/src/routes/profiles.ts` | Entity-level | MVP (exists) |
| Template governance / audit | `template_audit_log` (migration 0414) | `apps/api` | Global | MVP (exists) |
| Content moderation | `@webwaka/social/src/moderation.ts` (classifyContent) | `@webwaka/social` | Block-level | Phase 2 |
| Link safety checks | New: outbound link validation | New in `apps/brand-runtime` middleware | Block-level | Phase 2 |
| Abuse reporting | New: `abuse_reports` table | New capability | Platform-level | Phase 3 |
| Audit logs | `audit_log` table + events | `apps/api` | All operations | MVP (exists) |
| Feature flags | `@webwaka/entitlements` + KV | `@webwaka/entitlements` | Tenant-level | MVP |

---

## 5. Canonical Domain Model

The following defines the recommended shared domain model for WakaPage as it integrates with the current platform. Each entity is assessed for canonical vs. derived status, current or recommended ownership, and whether it reuses or extends current structures.

### 5.1 Existing Entities (Reuse / Extend)

| Entity | Role | Status | Owner | Notes |
|--------|------|--------|-------|-------|
| **Tenant** | Platform subscriber unit | Canonical | `@webwaka/auth-tenancy` | No change needed |
| **Individual** | Person-type entity | Canonical | `@webwaka/entities` | Reuse for professional/creator profiles |
| **Organization** | Collective entity | Canonical | `@webwaka/entities` | Reuse for business/institution profiles |
| **Place** | Geographic/physical entity | Canonical | `@webwaka/entities` + `@webwaka/geography` | Reuse for location context |
| **Workspace** | Operations management context | Canonical | `@webwaka/workspaces` | Reuse as the WakaPage management context |
| **Profile** | Discovery record + claim lifecycle | Canonical | `@webwaka/profiles` (stub → must be implemented) | The `branded` claim state = WakaPage activation gate |
| **Offering** | Products, services, routes, tickets | Canonical | `@webwaka/offerings` | Data-bind offering blocks live |
| **Brand Surface** | Branded digital experience root | Canonical (universal-entity-model.md §7) | `apps/brand-runtime` + `tenant_branding` | WakaPage IS the Brand Surface entity — must be first-class in the domain model |

### 5.2 New Entities (Net-New or Major Extends)

| Entity | Role | Canonical vs. Derived | Recommended Owner | Dependencies |
|--------|------|----------------------|------------------|-------------|
| **Page** | A published WakaPage surface with slug, layout, SEO, visibility, expiry, domain | **Canonical (net-new)** | New: `packages/pages` | Brand Surface, Tenant, Profile |
| **Page Variant** | A/B variant or campaign edition of a Page | Derived from Page | New: `packages/pages` | Page |
| **Block** | Schema-driven composable unit of page content (text, image, CTA, product, booking, map, etc.) | Canonical (net-new) | New: `packages/page-blocks` | Page |
| **Block Template** | Reusable block configuration preset (niche-specific or global) | Derived from Block | New: `packages/page-blocks` | Block, TemplateRegistry |
| **Theme Tokens** | CSS custom properties resolved per tenant | Derived from Tenant Branding | `@webwaka/white-label-theming` | TenantTheme (exists) |
| **Action / CTA** | Clickable action on a page block (WhatsApp, Call, Book, Pay, Follow, Download) | Derived from Block | New: `packages/page-blocks` | Block |
| **Lead / Inquiry** | Structured visitor inquiry from a Contact or CTA block | Canonical (net-new) | Extend `@webwaka/contact` or new `packages/leads` | Page, Block, Workspace |
| **Audience Record** | Subscriber / opt-in from a Page | Canonical (net-new) | New: `packages/audience` | Page, Lead |
| **Campaign** | Time-limited page configuration with QR attribution, UTM tracking, expiry | Canonical (net-new) | New: `packages/campaigns` | Page, QR, Analytics |
| **Analytics Event** | Page-scoped view, click, CTA conversion, QR scan event | Derived from existing `@webwaka/events` | `@webwaka/events` extended | Page, Block, Campaign |
| **Discovery Index Entry** | Search-indexable representation of a WakaPage in the marketplace | Derived from Page + Profile | `apps/api/src/lib/search-index.ts` | Page, search_entries |
| **Verification Metadata** | Claim state + sector licence + KYC state surfaced as trust layer | Derived from `claims`, `identity`, `sector_license_verifications` | `@webwaka/claims` + `@webwaka/identity` | Existing tables |
| **Domain / Routing Config** | Custom domain, subdomain, shortlink | Canonical (extends existing `tenant_branding`) | `@webwaka/white-label-theming` + `apps/brand-runtime` middleware | `tenant_branding.custom_domain` (exists) |
| **Social Link Profile** | Structured registry of external social profile URLs per entity | Canonical (net-new) | Extend `tenant_branding` or new `social_link_profiles` table | Tenant, Entity |
| **Moderation Record** | Content classification result + abuse report | Derived from `@webwaka/social/src/moderation.ts` | `@webwaka/social` | Block |
| **Template Registry Entry** | Registered template pack with metadata, vertical scope, entitlement requirements | Extends `template_audit_log` | `apps/brand-runtime/src/lib/template-resolver.ts` | Existing template system |

---

## 6. Brand / Operations / Discovery Integration

### 6.1 Pillar 2 — Brand (Rendering Engine)

**WakaPage as the evolved Brand Runtime:**

`apps/brand-runtime` IS the WakaPage rendering engine. The evolution is:
- Add a block schema layer so pages are not just static template functions, but composable sequences of typed blocks stored in D1 and rendered server-side at the edge.
- The existing `resolveTemplate()` + niche templates become the **default block presets** loaded when a tenant activates a WakaPage for the first time.
- The `baseTemplate()` shell already handles PWA manifest, OG tags, SEO, CSS variable injection — reuse unchanged.
- `@webwaka/white-label-theming` remains the single source of brand tokens, unchanged.

**Inbound data to Brand:**
- `tenant_branding` — visual tokens, custom domain
- `profiles` — bio, visibility, claim state
- `offerings` — live products/services for catalog blocks
- `organizations` / `individuals` — entity data for profile blocks
- `places` — location for map blocks and SEO context
- `sector_license_verifications` — trust badges
- `community` / `social` — community blocks, social feed

**Rendered public surfaces:**
- WakaPage public URL (`brand-{slug}.webwaka.com` or custom domain)
- Mobile-first, PWA-installable, offline-capable (existing service worker)
- Schema.org structured data (extend existing)
- Open Graph / Twitter Card (existing, extend per page)

**Write-back effects into platform state:**
- Contact form → Lead entity → notification to workspace
- CTA click → Analytics event → workspace-analytics dashboard
- Booking CTA → schedule slot reservation in Pillar 1
- Payment CTA → Paystack checkout flow (already exists in `shop.ts`)

### 6.2 Pillar 1 — Operations (Live Data Source)

**Operations as the live data spine:**

No duplication of Pillar 1 data into WakaPage. The page renders live data from Pillar 1 at request time (edge-cached via KV with appropriate TTLs).

**Inbound data to WakaPage from Pillar 1:**
- `offerings` (products, services, prices in kobo, inventory state, published flag)
- `schedule_slots` (availability windows via existing SuperAgent tool `schedule-availability`)
- `pos_transactions` (recent sales — for social proof or "popular items" blocks — via SuperAgent tool `pos-recent-sales`)
- Workspace membership (staff pages, team blocks)
- POS float / agent network (for fintech/mobile-money verticals)

**Write-back to Pillar 1:**
- Lead/inquiry → workspace notification queue
- Booking from WakaPage → creates appointment in Pillar 1 schedule
- Payment from WakaPage → creates order in Pillar 1

### 6.3 Pillar 3 — Discovery (Distribution Layer)

**Discovery as the distribution engine:**

Every published WakaPage must automatically produce or update a `search_entries` record so it appears in the global marketplace. This is currently done at the profile level — WakaPage extends this to include page-level metadata (blocks content, SEO description, CTA types, page type, geography).

**Inbound data to Discovery from WakaPage:**
- Page slug, display name, category, description, place_id (for geography routing)
- Block types present (to enrich search facets — e.g. "has booking", "has checkout", "has WhatsApp CTA")
- Verification state, sector licence status (for trust-filtered search)

**Rendered public surfaces:**
- `/discover/profile/:entityType/:id` — already exists, extend to embed WakaPage blocks
- `/discover/:stateSlug/:sectorSlug` — geography-aware category browsing (already exists)
- WakaPage-specific sitemap entries in `sitemap-index.xml` (already exists, extend)

**Write-back effects into platform state:**
- Discovery visit → analytics event on WakaPage
- Discovery claim CTA → starts claim FSM for unclaimed pages
- Discovery → WhatsApp CTA → outbound wa.me link (tracked as conversion event)

---

## 7. Current-Architecture Module Map

| Concern | Current Owner | Status | Notes |
|---------|--------------|--------|-------|
| **Identity / Auth** | `@webwaka/auth`, `@webwaka/auth-tenancy` | ✅ Fully implemented | JWT, multi-tenant RBAC, OTP |
| **Entity Model** | `@webwaka/entities` | ✅ Fully implemented | 7 root entities with D1 repositories |
| **Themes / Branding tokens** | `@webwaka/white-label-theming` | ✅ Fully implemented | CSS variables, D1+KV caching, brand walk |
| **Rendering / Pages** | `apps/brand-runtime` | ✅ Partially implemented | Routes + niche templates exist; block composition layer missing |
| **Templates** | `apps/brand-runtime/src/templates/niches/` + `lib/template-resolver.ts` | ✅ 200+ niche templates | Not yet block-schema-driven |
| **Public routing** | `apps/brand-runtime` middleware (tenant-resolve, custom domain) | ✅ Fully implemented | Tenant resolution: custom domain → subdomain → slug |
| **Analytics** | `apps/api/src/routes/analytics.ts`, `apps/api/src/routes/workspace-analytics.ts` | ⚠️ Partial | General events exist; WakaPage-specific attribution missing |
| **Discovery / Search** | `apps/public-discovery`, `apps/api/src/lib/search-index.ts`, `search_entries` table | ✅ Mostly implemented | FTS5, geography routes, schema.org; WakaPage not yet indexed as page entity |
| **Moderation** | `@webwaka/social/src/moderation.ts`, `template_audit_log` | ⚠️ Partial | Content classification exists for social; not yet wired for page blocks |
| **Domain management** | `tenant_branding.custom_domain`, DNS verification flow in `tenant-branding.ts` | ✅ Fully implemented | Custom domain + DNS TXT verification + `brand-runtime` middleware |
| **Profiles** | `apps/api/src/routes/profiles.ts` (raw D1), `@webwaka/profiles` (stub) | ⚠️ BUG-P3-014 open | Must be resolved before WakaPage; consolidate into real service package |
| **Offerings / Products** | `@webwaka/offerings` | ✅ Fully implemented | Cross-pillar, P9 compliant (kobo), published flag, categories |
| **Payments / Checkout** | `apps/brand-runtime/src/routes/shop.ts`, `@webwaka/payments` | ✅ Partially implemented | Paystack + bank transfer exist; digital goods not yet |
| **Social / Community** | `@webwaka/social`, `@webwaka/community` | ✅ Fully implemented (M7c) | Follow, post, story, DM, community spaces, courses, events |
| **AI / SuperAgent** | `@webwaka/superagent`, `@webwaka/ai-abstraction`, `@webwaka/ai-adapters` | ✅ SA-5 live | Tool registry, HITL, BYOK, NDPR consent gate |
| **Entitlements / Subscription** | `@webwaka/entitlements` | ✅ Implemented | Plan tiers, feature gates |
| **Offline / PWA** | `@webwaka/offline-sync`, service workers in `apps/brand-runtime` + `apps/public-discovery` | ✅ Fully implemented (M7b) | Background sync, IndexedDB, Background Sync API |
| **Claim lifecycle** | `@webwaka/claims` | ✅ Fully implemented | 8-state FSM, transition guards |
| **Identity verification (KYC)** | `@webwaka/identity`, `apps/api/src/routes/identity.ts` | ✅ Fully implemented | BVN/NIN/CAC/FRSC via Prembly |
| **Sector licence verification** | `sector_license_verifications` table, `regulatory-verification.ts` route | ✅ Fully implemented (M0416) | 7 compliance-gated verticals |
| **Notification engine** | `apps/notificator`, `@webwaka/notifications` | ✅ Full (M7c Phase 3) | 8 channels: InApp, Email, SMS, WhatsApp, Telegram, FCM, Slack, Teams |
| **Geography** | `@webwaka/geography`, `places` table | ✅ Fully implemented | Nigeria: Country → Zone → State → LGA → Ward |

### Areas Missing or Ambiguous

| Area | Gap |
|------|-----|
| **Page entity** | No first-class `pages` table. Pages are implicit in `brand-runtime` template logic. |
| **Block schema system** | No `page_blocks` table or block registry. Templates are HTML functions, not composable blocks. |
| **Lead/Inquiry entity** | Contact form submissions have no structured D1 record currently. |
| **Audience/subscriber list** | No email opt-in or subscriber capture model. |
| **QR / campaign links** | No QR generation or short-link infrastructure. |
| **Page-level analytics** | No WakaPage-scoped view/click/conversion events. |
| **Social link registry** | No structured social links per entity beyond free-text in `organizations.website`. |

---

## 8. Multi-Vertical Applicability

### 8.1 Commerce Verticals
*Bakery, Restaurant, Supermarket, Pharmacy, Fashion Brand, Electronics Store, etc.*

| Dimension | Implementation |
|-----------|---------------|
| Page archetypes | Product catalog page + Category pages + Single product page |
| Block types | Product grid block (live from `offerings`), cart CTA, WhatsApp order, location/hours, trust badges |
| Conversion flows | Browse → Add to cart → Paystack checkout (already in `apps/brand-runtime/src/routes/shop.ts`) |
| Trust / compliance | NAFDAC / SON product safety badges (sector licence), verified business badge |
| Special templates | `verticals-bakery`, `verticals-restaurant`, `verticals-supermarket` niche packs (all 200+ exist) |
| Live data bindings | `offerings` (product catalog), `pos` (inventory state), `schedule_slots` (opening hours) |

### 8.2 Services and Professional Verticals
*Law Firm, Clinic, Dental, Accounting, IT Support, Construction, etc.*

| Dimension | Implementation |
|-----------|---------------|
| Page archetypes | Services list + Team profiles + Appointment booking + Testimonials |
| Block types | Services block (from `offerings` with category='service'), Booking/calendar CTA, Team block, FAQ, Testimonials |
| Conversion flows | Browse → Book appointment → Confirmation (wire `schedule_slots` to WakaPage) |
| Trust / compliance | Sector licence badges for hospital/diagnostic-lab/microfinance-bank/stockbroker (already in `sector_license_verifications`) |
| Special templates | `verticals-law-firm`, `verticals-clinic`, `verticals-dental-clinic` etc. |
| Live data bindings | `offerings`, `schedule_slots` |

### 8.3 Creator and Individual Verticals
*Creator, Motivational Speaker, Photographer, Musician, Podcast Studio, Talent Agency*

| Dimension | Implementation |
|-----------|---------------|
| Page archetypes | Bio page + Portfolio/Gallery + Media Kit + Social links + Digital products |
| Block types | Bio hero block, Gallery, Video embed, Social link grid, Digital product/download CTA, Community block |
| Conversion flows | Browse → Follow (social) → Subscribe/Join community → Purchase digital product |
| Trust / compliance | Creator verification, content moderation via `classifyContent` |
| Special templates | `verticals-creator`, `verticals-photography-studio`, `verticals-podcast-studio` |
| Live data bindings | `@webwaka/social` (posts, stories), `@webwaka/community` (courses, events) |

### 8.4 Civic and Political Verticals
*Politician, Ward Rep, LGA Office, Constituency Office, Campaign Office, Political Party*

| Dimension | Implementation |
|-----------|---------------|
| Page archetypes | Public mandate page + Constituency service page + Campaign page (time-limited) + Petition/project tracking |
| Block types | Bio/mandate block, Contact ward office CTA (WhatsApp), Project tracker block, Event/town-hall announcement |
| Conversion flows | Constituent → Contact office → Lead captured → WhatsApp notification to staff |
| Trust / compliance | INEC verification for electoral actors, NDPR consent for constituent data |
| Special templates | `verticals-politician`, `verticals-ward-rep`, `verticals-campaign-office`, `verticals-constituency-office` |
| Live data bindings | `@webwaka/geography` (ward/LGA boundaries), political assignment tables |

### 8.5 Institutional and Educational Verticals
*School, University, Training Institute, Church, Mosque, NGO, Professional Association*

| Dimension | Implementation |
|-----------|---------------|
| Page archetypes | Institution overview + Programmes/Courses + Registration CTA + Events calendar |
| Block types | About block, Courses block (from `offerings`), Event calendar, Application/enquiry form, Map/location |
| Conversion flows | Browse → Enquire → Lead captured → Staff notified via notification engine |
| Trust / compliance | NUC verification for universities, NHIA for health facilities, CAC for NGOs |
| Special templates | `verticals-school`, `verticals-university`, `verticals-church`, `verticals-ngo` |
| Live data bindings | `offerings` (courses/programmes), `community` (community groups) |

### 8.6 Transport and Logistics Verticals
*Rideshare, Motor Park, Haulage, Dispatch Rider, Cargo Truck, Ferry, Airport Shuttle*

| Dimension | Implementation |
|-----------|---------------|
| Page archetypes | Route/service listing + Schedule + Booking/hire CTA + Fleet profile |
| Block types | Route block (from `offerings` type='route'), Schedule block, WhatsApp hire CTA, Location/terminal block |
| Conversion flows | Browse route → WhatsApp contact/hire → Lead captured |
| Trust / compliance | FRSC/NCC certification for transport operators |
| Special templates | `verticals-rideshare`, `verticals-motor-park`, `verticals-haulage`, `verticals-transit` |
| Live data bindings | `offerings` (routes, tickets), `schedule_slots` |

### 8.7 Fintech and Financial Verticals
*Mobile Money Agent, Bureau de Change, Microfinance Bank, POS Business, Savings Group*

| Dimension | Implementation |
|-----------|---------------|
| Page archetypes | Services page + Rates display + WhatsApp inquiry + Agent location |
| Block types | FX rates block (live), Services/fees block, WhatsApp CTA, Map/location, Trust/licence badge |
| Conversion flows | Browse → WhatsApp inquiry → POS transaction |
| Trust / compliance | CBN-regulated verification badges mandatory; NDPR consent for financial data |
| Special templates | `verticals-bureau-de-change`, `verticals-microfinance-bank`, `verticals-pos-business`, `verticals-mobile-money-agent` |
| Live data bindings | `fx_rates` table (live via `apps/api/src/routes/fx-rates.ts`), `@webwaka/hl-wallet` for wallet-linked pages |

### 8.8 Real Estate and Property Verticals
*Property Developer, Real Estate Agency, Hotel, Vacation Rental, Student Hostel*

| Dimension | Implementation |
|-----------|---------------|
| Page archetypes | Property listing page + Unit details + Viewing/enquiry booking + Gallery |
| Block types | Property gallery, Location/map, Price/availability block, WhatsApp enquiry CTA, Viewing booking |
| Conversion flows | Browse → View gallery → Enquire → Lead captured → Staff notification |
| Trust / compliance | FRCN/ARCON for property agents; NDPR for contact data |
| Special templates | `verticals-property-developer`, `verticals-real-estate-agency`, `verticals-hotel` |
| Live data bindings | `offerings` (property listings, room types) |

### 8.9 Community and Cooperative Verticals
*Market Association, Cooperative, Women's Association, Youth Organization, Road Transport Union*

| Dimension | Implementation |
|-----------|---------------|
| Page archetypes | Association profile + Member services + Events + Join/membership CTA |
| Block types | About block, Events block, Membership CTA, WhatsApp group join, Community forum block |
| Conversion flows | Browse → Join community → `@webwaka/community` membership created |
| Trust / compliance | CAC registration for cooperatives/associations |
| Special templates | `verticals-cooperative`, `verticals-market-association`, `verticals-womens-association` |
| Live data bindings | `@webwaka/community` (spaces, events) |

---

## 9. Single-Vendor and Multi-Vendor Scenarios

### 9.1 Single Business WakaPage
- **Entity:** One Organization with a Workspace
- **Page:** Branded home + services catalog + contact
- **Domain:** `brand-{slug}.webwaka.com` or custom domain
- **Data:** Live offerings from their Pillar 1 workspace
- **Current state:** Already works via `apps/brand-runtime`. WakaPage evolution adds block composition + analytics.

### 9.2 Creator / Individual Professional WakaPage
- **Entity:** Individual (creator, professional, sole trader)
- **Page:** Bio page + portfolio + social links + digital products or booking CTA
- **Domain:** `brand-{slug}.webwaka.com` or custom domain
- **Data:** `@webwaka/social` posts, `@webwaka/community` courses, `@webwaka/offerings` digital products
- **Current state:** `verticals-creator` template exists. WakaPage evolution adds composable blocks and media kit.

### 9.3 Institution / Public Office WakaPage
- **Entity:** Organization (school, government agency, NGO)
- **Page:** Mandate/services overview + contact office + events
- **Domain:** Institutional subdomain or custom domain with verified sector licence
- **Data:** `offerings` (programmes), `community` (events), `sector_license_verifications` (licence badges)

### 9.4 Multi-Vendor Marketplace WakaPage
- **Entity:** A market, wholesale hub, or sector directory with multiple vendor sub-profiles
- **Page:** Marketplace directory + vendor grid + category filters + geography
- **Architecture:** Pillar 3 (`apps/public-discovery`) is already the multi-vendor surface. WakaPage adds composable block capability for the market-level profile page.
- **Tenant isolation:** Market-level page is one tenant; individual vendor profiles are sub-tenants or claimed profiles under the market's workspace.

### 9.5 Branch / Location Model
- **Entity:** A chain business (e.g. Restaurant Chain, Pharmacy Chain, Bank Branch) with multiple Places
- **Page:** Brand-level page + individual location pages
- **Architecture:** Parent Workspace + child Workspaces per location; each location gets its own profile and `primary_place_id`
- **Current state:** `verticals-restaurant-chain`, `verticals-pharmacy-chain` templates exist.

### 9.6 Operator / Staff Public Page
- **Entity:** Individual (staff member or agent) linked to an Organization
- **Page:** Personal profile page with booking/contact CTA, role title, and brand affiliation
- **Architecture:** Individual entity + relationship link to Organization (via `@webwaka/relationships`)
- **Current state:** Relationship model exists. Individual public pages via `apps/public-discovery/src/routes/profiles.ts`.

### 9.7 Campaign Page
- **Entity:** Organization or Individual with a time-limited campaign
- **Page:** Campaign-specific landing page with countdown, CTA, donation/purchase link, and QR code
- **Architecture:** `Page` entity with `expiry_at` field + `Campaign` entity with UTM/QR attribution
- **Current state:** No campaign page concept exists yet. Net-new entity needed.

### 9.8 Listing-Level Public Surface
- **Entity:** A seeded profile that has not yet been claimed
- **Page:** Read-only discovery profile with claim CTA
- **Architecture:** `apps/public-discovery/src/routes/profiles.ts` already serves this. WakaPage extends with richer block data once claimed.
- **Claim CTA:** Links to claim flow gated by `@webwaka/claims` state machine (`seeded → claimable`).

---

## 10. Nigeria-First / Africa-First Adaptations

### 10.1 WhatsApp-Native Actions
WhatsApp is the primary digital communication channel in Nigeria. Every WakaPage CTA system must treat WhatsApp as a first-class action, not an afterthought.

**Implementation in current platform:**
- Notification engine already supports WhatsApp via Meta/Dialog360 (`apps/notificator`)
- Lead notifications should route via WhatsApp by default for Nigerian tenants
- New: **WhatsApp CTA block** on every WakaPage — generates `wa.me/+234XXXXXXXXXXX?text=...` links with pre-filled message templates per vertical
- New: WhatsApp share button on every WakaPage (pre-formatted share text)
- WhatsApp Business API integration for automated lead follow-up

### 10.2 Local Payment Methods
- **Paystack:** Already integrated in `apps/brand-runtime/src/routes/shop.ts`. Default checkout for WakaPage commerce blocks.
- **Bank transfer:** Already supported via `apps/api/src/routes/bank-transfer.ts`. Bank transfer payment confirmation flow must be surfaced as a WakaPage CTA option.
- **HandyLife Wallet:** `@webwaka/hl-wallet` — for wallet-linked payments on WakaPage (post-M8)
- **POS Float:** For agent/POS business pages, offline cash collection flow must be represented
- **Pay on delivery / COD:** Block type for commerce pages in markets with low card penetration
- All prices displayed in Naira (₦), stored as kobo (T4 invariant — never float arithmetic)

### 10.3 Low-Bandwidth Behaviour
- `apps/brand-runtime` service worker already caches the page shell and manifest (PWA-002)
- WakaPage blocks must support a **low-data mode**: text-only rendering when connection speed is below threshold
- Images in blocks must use lazy loading + `srcset` with small defaults
- Offerings/catalog blocks should request a compact payload (limit 6 items, no descriptions by default)
- Existing `apps/api/src/routes/low-data.test.ts` confirms low-data scenario is already tested
- Add `?data=low` query parameter support to WakaPage routes for explicit low-bandwidth mode

### 10.4 PWA Behaviour
- `apps/brand-runtime` already generates `/manifest.webmanifest` dynamically per tenant with theme colors from `tenant_branding`
- Every WakaPage is installable as a standalone PWA on Android (primary device type in Nigeria)
- PWA start URL should be the WakaPage home (`/`)
- Service worker caches: page shell, manifest, critical CSS, offline fallback
- **Add to Home Screen** prompt should appear after second visit — configures engagement for repeat customers

### 10.5 Offline-Aware Patterns
- Contact/inquiry forms: already offline-capable via Background Sync API in `apps/brand-runtime`
- Offline product browsing: service worker caches last-fetched offerings for offline display
- Offline-first principle (P6): core page shell must render from cache when offline; dynamic blocks degrade gracefully to last-cached state
- Sync on reconnect: queued contact form submissions sync via Background Sync when connection restores

### 10.6 Regional Onboarding
- Claim-first onboarding (T7): most Nigerian businesses are already seeded in Pillar 3. WakaPage activation begins from claiming a seeded profile — no blank-slate onboarding.
- USSD onboarding path: informal/feature-phone businesses can be onboarded via `apps/ussd-gateway` and their WakaPage auto-generated from profile data without requiring a smartphone.
- Step-by-step guided activation: claim → verify identity (BVN/NIN via Prembly) → add branding → publish WakaPage. All gates wired through existing claim FSM states.

### 10.7 Trust Cues
Nigerian customers require visible trust signals before engaging with a business online.

| Trust cue | Implementation |
|-----------|---------------|
| "Claimed & Verified" badge | `profiles.verification_state === 'verified'` + `claim_state === 'managed'` or higher |
| CAC Registration badge | `@webwaka/identity` CAC verification result |
| Sector licence badge | `sector_license_verifications` (for 7 regulated verticals) |
| NDPR-compliant data handling | NDPR notice on contact forms; consent gate before data collection |
| Operating hours / physical address | Location block from `places` + `organizations.phone` |
| Social proof (reviews/testimonials) | `@webwaka/social` reactions/posts wired to WakaPage |
| WhatsApp Business green tick | Surfaced as a badge when tenant has verified WhatsApp Business account |

### 10.8 Local Public-Office and Community Workflows
- Constituency office pages: public mandate display + constituent contact + weekly clinic schedule
- Ward rep pages: project tracker blocks + town-hall event announcements + community WhatsApp group link
- Market association pages: market directory + levy/dues payment link + event announcements
- Political party pages: candidate listings + manifesto download + campaign WhatsApp CTA
- These use existing political and civic vertical templates. WakaPage block composition makes them richer and more maintainable.

### 10.9 Market-Specific Template Needs
- **Informal market vendor:** Minimal template — photo, WhatsApp button, price list. No checkout required.
- **Food vendor (buka/mama put):** Menu block, WhatsApp order CTA, "Today's special" dynamic block
- **Artisan/handyman:** Before/after gallery, WhatsApp quote request, service area map
- **POS agent:** Services block (transfers, bills, cash-out), float availability indicator, location map
- **Motor park:** Routes block, fare table, departure schedule, WhatsApp booking

---

## 11. Builder and Template Architecture

### 11.1 Current State Assessment

The current system uses **niche-specific HTML function templates** — 200+ files in `apps/brand-runtime/src/templates/niches/`. Each is a TypeScript function that returns an HTML string. They are:
- ✅ Vertical-specific and governance-controlled
- ✅ Theme-aware (CSS variable injection via `@webwaka/white-label-theming`)
- ✅ SEO-aware (OG tags, schema.org, canonical URLs via `baseTemplate`)
- ✅ PWA-aware (manifest, service worker)
- ❌ Not block-schema-driven (cannot be composed or reordered)
- ❌ Not data-bound in a structured way (each template has its own D1 query logic)
- ❌ Not extensible without editing the template file

### 11.2 Recommended Block Schema Architecture

Introduce a **Block Registry** as a new shared layer in `packages/page-blocks`:

```typescript
// packages/page-blocks/src/types.ts

export type BlockType =
  | 'hero'           // Header/banner with avatar, display name, bio, verification badge
  | 'social_links'   // Structured social link grid
  | 'cta'            // Single call-to-action button (WhatsApp, Call, Book, Pay, Download)
  | 'offerings_grid' // Live-bound product/service catalog
  | 'booking'        // Availability calendar / appointment CTA
  | 'contact_form'   // Offline-capable contact form
  | 'gallery'        // Photo/portfolio gallery (R2 assets)
  | 'text'           // Rich text content block
  | 'video_embed'    // YouTube/Vimeo embed
  | 'map'            // Location map from places table
  | 'hours'          // Operating hours block
  | 'testimonials'   // Social proof testimonials
  | 'community'      // @webwaka/community space embed
  | 'event_list'     // Upcoming events block
  | 'pricing_table'  // Tiered pricing block
  | 'team'           // Team member profiles
  | 'faq'            // FAQ accordion
  | 'countdown'      // Campaign countdown timer
  | 'media_kit'      // Downloadable press pack / brand assets
  | 'trust_badges'   // Verification + sector licence badges
  | 'social_feed';   // @webwaka/social posts feed

export interface Block {
  id: string;
  pageId: string;
  tenantId: string;
  blockType: BlockType;
  sortOrder: number;
  config: Record<string, unknown>; // Block-type-specific JSON config
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Registry pattern:** Each block type registers a `render(block: Block, ctx: PageContext): string` function. The page renderer iterates blocks in `sort_order` and calls the appropriate renderer. This follows P1 (Build Once Use Infinitely) — renderers are shared across all verticals.

**Existing niche templates become block presets:** Each niche template becomes a default `BlockPreset[]` array that is installed when a tenant activates that niche. This preserves all existing template work without rewriting it.

### 11.3 Theme Inheritance

Unchanged from current implementation. `@webwaka/white-label-theming` resolves:
1. Workspace-level brand tokens
2. Partner-level brand tokens (with `brand_independence_mode` flag)
3. Platform default tokens (fallback)

CSS variables are injected into the page `<style>` block via `generateCssTokens()`. Every block uses `var(--ww-primary)` etc. — no hardcoded colours.

### 11.4 Page Archetypes

| Archetype | Default blocks | Niche examples |
|-----------|---------------|----------------|
| **Business profile** | hero + social_links + offerings_grid + contact_form + map | Restaurant, Bakery, Pharmacy |
| **Service professional** | hero + offerings_grid (services) + booking + testimonials + contact_form | Lawyer, Doctor, Tutor |
| **Creator/personal** | hero + gallery + social_links + social_feed + community | Creator, Photographer, Speaker |
| **Campaign** | hero + countdown + cta + gallery + contact_form | Political campaign, Product launch |
| **Market/directory** | hero + offerings_grid (vendors) + map + contact_form | Market association, Wholesale hub |
| **Civic/office** | hero + text (mandate) + event_list + contact_form + map | Politician, Ward rep, LGA office |
| **Institution** | hero + offerings_grid (programmes) + event_list + team + contact_form | School, Church, NGO |
| **Fintech/agent** | hero + offerings_grid (services) + trust_badges + map + cta (WhatsApp) | Mobile money agent, POS business, BDC |

### 11.5 Data-Bound Blocks

Blocks that pull live data must not duplicate data storage. They read from existing platform tables:

| Block | Data source | Query |
|-------|-------------|-------|
| `offerings_grid` | `offerings` table | `listOfferings(db, { tenantId, publishedOnly: true })` |
| `booking` | `schedule_slots` | SuperAgent tool `schedule-availability` |
| `social_feed` | `@webwaka/social` posts | `getUserFeed()` |
| `community` | `@webwaka/community` spaces | `getCommunitySpace()` |
| `event_list` | `@webwaka/community` events | `listEvents()` |
| `trust_badges` | `sector_license_verifications` + `profiles.verification_state` + `claims.claim_state` | Existing D1 queries |
| `map` | `places` table | `getPlaceById()` from `@webwaka/entities` |

### 11.6 Analytics Instrumentation

Every block renders with a `data-block-id` attribute and a lightweight JavaScript snippet that fires analytics events on view (IntersectionObserver) and click. Events route to `POST /analytics/events` in `apps/api`.

### 11.7 Governance-Controlled Template Approval

The `template_audit_log` table (migration 0414) and `template_registry_rejected_status` (migration 0415) already implement a governance review flow for templates. Extend this to cover:
- New block type approval (platform-level governance)
- Tenant-submitted custom block configs (moderation check via `classifyContent`)
- Niche-specific template pack release approval

---

## 12. Data, APIs, Events, and Contracts

### 12.1 Must Reuse (Existing Contracts — No Change)

| Contract | Location |
|---------|----------|
| `tenant_branding` table schema | `infra/db/migrations/` (exists) |
| `profiles` table schema | `infra/db/migrations/0005_init_profiles.sql` |
| `offerings` table + `@webwaka/offerings` interface | `packages/offerings/src/index.ts` |
| `search_entries` table + FTS5 index | `apps/api/src/lib/search-index.ts` |
| `TenantTheme` + `generateCssTokens()` | `@webwaka/white-label-theming` |
| `ClaimLifecycleState` FSM | `@webwaka/claims` |
| `AuthEventType`, `WorkspaceEventType`, etc. | `@webwaka/events/src/event-types.ts` |
| Paystack checkout flow | `apps/brand-runtime/src/routes/shop.ts` |
| Contact form (offline-capable) | `apps/brand-runtime/src/templates/contact.ts` |
| SuperAgent tool registry | `@webwaka/superagent/src/tool-registry.ts` |

### 12.2 Must Extend (Existing Contracts — Additive Changes Only)

| Contract | Extension Needed |
|---------|-----------------|
| `tenant_branding` table | Add `social_links_json TEXT` column (social link registry) |
| `organizations` table | Already extended in M0388 (description, phone, website, logo_url, category, place_id) — no further change needed for MVP |
| `profiles` table | Add `page_id TEXT REFERENCES pages(id)` FK to link profile → WakaPage |
| `search_entries` table | Add `page_type TEXT`, `has_booking INTEGER`, `has_checkout INTEGER`, `has_whatsapp INTEGER` facet columns |
| `@webwaka/events/src/event-types.ts` | Add `PageEventType` namespace: `PageViewed`, `PageBlockClicked`, `PageCTAConverted`, `PagePublished`, `PageUnpublished`, `QRScanned`, `LeadSubmitted` |
| `apps/brand-runtime` routes | Add block-level rendering routes; wire block registry |
| `@webwaka/white-label-theming` | Add `socialLinks: SocialLink[]` field to `TenantTheme` |

### 12.3 Net-New Contracts

**New D1 migrations needed:**

| Migration | Table | Columns |
|-----------|-------|---------|
| `pages` | WakaPage entity | `id, tenant_id, workspace_id, profile_id, slug, title, seo_description, og_image_url, page_type (profile/campaign/store/community/booking), status (draft/published/archived), expiry_at, created_at, updated_at` |
| `page_blocks` | Block registry per page | `id, page_id, tenant_id, block_type, sort_order, config JSON, is_visible, created_at, updated_at` |
| `page_analytics` | WakaPage analytics events | `id, page_id, tenant_id, event_type (view/click/cta_convert/qr_scan), block_id, session_id, utm_source, utm_medium, utm_campaign, referrer, country_code, created_at` |
| `leads` | Structured lead capture | `id, page_id, tenant_id, block_id, name, phone, email, message, source (contact_form/whatsapp_cta/booking/quote), status (new/contacted/converted), created_at` |
| `audience_records` | Email/WhatsApp opt-ins | `id, page_id, tenant_id, phone, email, opt_in_source, ndpr_consent_at, created_at` |
| `qr_campaigns` | QR + campaign link entities | `id, page_id, tenant_id, short_code, qr_image_url, utm_campaign, scan_count, created_at` |
| `social_link_profiles` | Per-entity social links | `id, entity_type, entity_id, tenant_id, platform (instagram/tiktok/youtube/twitter/linkedin/facebook/whatsapp_business), url, created_at` |

**New API endpoints needed:**

| Method | Endpoint | Handler App | Notes |
|--------|----------|-------------|-------|
| `POST` | `/pages` | `apps/api` | Create WakaPage |
| `GET` | `/pages/:pageId` | `apps/api` | Fetch page + blocks |
| `PATCH` | `/pages/:pageId` | `apps/api` | Update page metadata |
| `POST` | `/pages/:pageId/blocks` | `apps/api` | Add block to page |
| `PATCH` | `/pages/:pageId/blocks/:blockId` | `apps/api` | Update block config |
| `DELETE` | `/pages/:pageId/blocks/:blockId` | `apps/api` | Remove block |
| `POST` | `/pages/:pageId/publish` | `apps/api` | Publish page → update search_entries |
| `POST` | `/pages/:pageId/analytics` | `apps/api` | Ingest analytics event |
| `GET` | `/pages/:pageId/analytics/summary` | `apps/api` | View/click/conversion summary |
| `POST` | `/leads` | `apps/api` | Submit lead from WakaPage |
| `POST` | `/qr-campaigns` | `apps/api` | Generate QR + short link |
| `GET` | `/qr/:shortCode` | `apps/brand-runtime` | QR redirect + scan event |

**New events needed (extend `@webwaka/events`):**

```typescript
export const PageEventType = {
  PageCreated:        'page.created',
  PagePublished:      'page.published',
  PageUnpublished:    'page.unpublished',
  PageViewed:         'page.viewed',
  PageBlockClicked:   'page.block_clicked',
  PageCTAConverted:   'page.cta_converted',
  LeadSubmitted:      'page.lead_submitted',
  QRScanned:          'page.qr_scanned',
  AudienceOptIn:      'page.audience_opt_in',
} as const;
```

---

## 13. Governance, Moderation, Security, and Compliance

### 13.1 RBAC

| Action | Required Role |
|--------|--------------|
| Create/edit WakaPage | `admin` or `super_admin` for tenant |
| Publish WakaPage | `admin` or `super_admin` |
| View WakaPage analytics | `admin`, `member` (read-only) |
| Moderate WakaPage content | `super_admin` (platform level) |
| Approve new block types | `super_admin` (platform level) |
| View leads | `admin` or `super_admin` |

### 13.2 Tenant Isolation (T3)

Every `pages`, `page_blocks`, `page_analytics`, `leads`, `audience_records`, `qr_campaigns` table row must include `tenant_id` in all queries. The CI governance check `scripts/governance-checks/check-tenant-isolation.ts` must be extended to include these new tables.

### 13.3 Publish / Unpublish Workflow

WakaPage lifecycle states:
- `draft` — being edited; not publicly accessible
- `published` — live and publicly accessible; `search_entries` record exists
- `archived` — hidden; search entry removed; URL returns 404
- `scheduled` (future) — publish at a future `published_at` timestamp

Publishing a WakaPage triggers:
1. Set `pages.status = 'published'`
2. Upsert `search_entries` record for this page
3. Publish `PagePublished` event to notification queue
4. Advance claim state to `branded` if still at `managed` (via `@webwaka/claims` FSM)

### 13.4 Moderation

- **Block content:** Before any user-submitted text block is rendered publicly, run it through `classifyContent()` from `@webwaka/social/src/moderation.ts`
- **Contact form submissions / leads:** Classify message body before storing; flag if contains NSFW content
- **Link safety:** All outbound links in CTA blocks must be validated against a blocklist (implement in `apps/brand-runtime` middleware). No `javascript:` or `data:` URLs.
- **Abuse reporting:** New `abuse_reports` table; platform admin review queue in `apps/platform-admin`
- **Template governance:** `template_audit_log` (migration 0414) already tracks template installs; extend to log block additions

### 13.5 Custom Domain Safety

The existing DNS TXT verification flow in `tenant-branding.ts` is robust and must be reused unchanged. Additional requirements:
- Do not allow custom domains matching WebWaka-owned domains or known phishing domains (blocklist in KV)
- Rate-limit domain verification re-trigger attempts (T3 scoped, existing rate-limit infrastructure)
- Audit-log every custom domain change in `audit_log` table

### 13.6 Feature Flags

All new WakaPage capabilities must be gated by entitlement flags:
- `wakapage_basic` — page creation, text/social_links/contact blocks (Starter plan)
- `wakapage_commerce` — offerings_grid, Paystack checkout (Brand/Full Platform plan)
- `wakapage_booking` — booking/schedule block (Brand/Full Platform plan)
- `wakapage_analytics` — full analytics dashboard (Growth/Pro plan)
- `wakapage_custom_domain` — custom domain mapping (paid plans)
- `wakapage_campaign` — campaign pages with countdown/QR (Pro/Business plan)
- `wakapage_ai_content` — AI-assisted content generation (SuperAgent tiers)
- `wakapage_media_kit` — downloadable media kit block (Business/Enterprise plan)

Use `@webwaka/entitlements` — no hardcoded plan checks in feature code (T5 invariant).

### 13.7 Vertical-Specific Compliance

| Vertical group | Compliance requirement |
|----------------|----------------------|
| Healthcare (clinic, hospital, pharmacy) | NHIA/NAFDAC notices mandatory; no medical advice CTAs without licence badge |
| Financial (MFB, BDC, stockbroker) | CBN licence badge mandatory; no savings/investment promises without full disclosure |
| Educational (school, university) | NUC accreditation status displayed; no misleading qualification claims |
| Electoral / political | INEC-linked verification; campaign finance disclosure links where applicable |
| All data-collecting pages | NDPR consent notice on any form that collects name/phone/email; `ndpr_consent_at` recorded in `audience_records` and `leads` |

---

## 14. Readiness Gaps

The following are explicit blockers and open questions that **must be resolved before implementation begins**.

### 14.1 Critical Blockers

| Gap | Description | Resolution task |
|----|-------------|----------------|
| **BUG-P3-014** | `@webwaka/profiles` is a stub. WakaPage depends on a real profile service. | Implement `@webwaka/profiles` as a proper D1-backed package, consolidating the raw D1 queries from `apps/api/src/routes/profiles.ts` and `apps/tenant-public`. Must be done first (Phase 0). |
| **No Page entity** | No `pages` table or `Page` domain object exists in the platform. WakaPage cannot be implemented without this. | Design and migrate `pages` table. Must complete before Phase 1. |
| **No block schema** | No block registry or `page_blocks` table exists. | Design block schema and `@webwaka/page-blocks` package. Phase 1. |
| **No page analytics** | No WakaPage-scoped view/click/conversion tracking. | Extend `@webwaka/events` + new `page_analytics` table. Phase 1. |
| **Unresolved: `apps/tenant-public` vs `apps/brand-runtime`** | Both serve public tenant pages. The boundary is not clean. `tenant-public` is "discovery-lite." Should it be retired and folded into `brand-runtime`? | Architecture decision needed before implementation. Propose ADR. |

### 14.2 Architecture Ambiguities

| Question | Context | Action needed |
|---------|---------|--------------|
| Who owns the "Page" entity — `brand-runtime` or `api`? | Pages are data (live in D1, managed via API) and a rendered surface (brand-runtime renders). The split is API for CRUD and brand-runtime for rendering — same as offerings. | Document in ADR before implementation. |
| Should block config be stored as JSON in D1 or as typed columns? | JSON is flexible but hard to index. Typed columns are rigid but query-friendly. | Decision: use `config JSON NOT NULL` with typed TypeScript interface per block type. No relational explosion per block. |
| What is the performance model for block rendering on the edge? | Each page request must join `page_blocks` + `offerings` + `schedule_slots` + more. | Decide on: (a) KV-cached pre-rendered HTML per page (invalidated on publish), (b) edge-composed rendering with block-level KV caching. Recommended: hybrid — KV-cached page HTML with 60s TTL, bypassed for dynamic blocks (booking, inventory). |
| Should WakaPage replace or extend `apps/tenant-public`? | `tenant-public` serves per-tenant profile listing (discovery-lite). WakaPage is the full branded surface. | Recommendation: WakaPage evolution lives in `apps/brand-runtime`. `apps/tenant-public` becomes a thin redirect shim and is eventually deprecated. Requires migration plan. |
| QR code generation: in-house or third-party? | No current QR infrastructure. Options: (a) use a library at edge (qr-code npm), (b) generate SVG directly, (c) external API. | Cloudflare Workers can generate QR SVG inline — no external dependency needed (P1 — Build Once). |
| Social link platform list: what platforms to support at MVP? | WhatsApp Business, Instagram, TikTok, YouTube, X/Twitter, Facebook, LinkedIn, Telegram | Define MVP set and extensible registry pattern for future platforms. |

### 14.3 Permission Gaps

| Gap | Description |
|----|-------------|
| No WakaPage-specific entitlement keys defined | `wakapage_*` entitlement flags need to be defined in `@webwaka/entitlements` before feature gating can be implemented |
| No `page:edit`, `page:publish`, `page:view_analytics` permission granularity | Current RBAC is role-level. May need action-level page permissions for larger teams |

### 14.4 Analytics Gaps

| Gap | Description |
|----|-------------|
| No UTM parameter parsing on `apps/brand-runtime` | Needed for campaign attribution |
| No WakaPage view funnel (views → clicks → conversions) | Requires new analytics aggregation queries |
| No comparison across pages (which page converts best) | Requires page-level analytics aggregation |

### 14.5 Builder Gaps

| Gap | Description |
|----|-------------|
| No block drag-and-drop UI | The builder UI for composing blocks does not exist yet. This requires a dedicated builder interface in `apps/workspace-app` or a new app. |
| No AI content generation for blocks | SuperAgent has `get-active-offerings` and related tools, but no "generate bio text," "write services description," or "suggest block layout" tools |
| No live preview of WakaPage during editing | Builder must show a live preview rendered by `apps/brand-runtime` in an iframe |

---

## 15. Phased Implementation Roadmap

### Phase 0: Current-State Validation and Architecture Confirmation
**Objective:** Resolve blockers, make architecture decisions, and finalise contracts before any new code lands.

**Dependencies:** None — must be completed before all other phases.

**Tasks:**
1. Resolve BUG-P3-014: implement `@webwaka/profiles` as a real D1-backed service package
2. Deprecate raw D1 profile queries in `apps/api/src/routes/profiles.ts` and `apps/tenant-public` — replace with `@webwaka/profiles` calls
3. Write ADR: WakaPage architecture (Page entity ownership, block schema design, `tenant-public` retirement plan, edge caching strategy)
4. Define `wakapage_*` entitlement flags in `@webwaka/entitlements`
5. Add `PageEventType` constants to `@webwaka/events/src/event-types.ts`
6. Define MVP block type list and TypeScript interfaces in `packages/page-blocks/src/types.ts`
7. Extend CI governance checks to cover new tables (tenant isolation, monetary integrity)

**Modules involved:** `@webwaka/profiles`, `@webwaka/entitlements`, `@webwaka/events`, new `packages/page-blocks`  
**Risks:** BUG-P3-014 fix may surface hidden dependencies on raw D1 query patterns  
**Acceptance criteria:** All profile-related raw D1 queries replaced with `@webwaka/profiles` calls; ADR written and approved; event types added; entitlement flags defined  
**Tests:** Existing `apps/api/src/routes/profiles.ts` tests must pass after refactor; new `@webwaka/profiles` unit tests

### Phase 1: Canonical Entities and Contracts
**Objective:** Stand up the `pages` and `page_blocks` domain model, API routes, and event instrumentation. No UI yet.

**Dependencies:** Phase 0 complete

**Tasks:**
1. D1 migration: `pages` table
2. D1 migration: `page_blocks` table
3. D1 migration: `page_analytics` table
4. D1 migration: `leads` table
5. D1 migration: extend `search_entries` with facet columns (`page_type`, `has_booking`, `has_checkout`, `has_whatsapp`)
6. D1 migration: extend `tenant_branding` with `social_links_json`
7. New `packages/page-blocks`: block type registry, block render interface, MVP block renderers (hero, social_links, text, cta, contact_form, map, hours, trust_badges)
8. New API routes in `apps/api`: `POST /pages`, `GET /pages/:id`, `PATCH /pages/:id`, `POST /pages/:id/blocks`, `PATCH /pages/:id/blocks/:blockId`, `DELETE /pages/:id/blocks/:blockId`, `POST /pages/:id/publish`
9. Wire `PagePublished` event to notification queue on publish
10. Write unit tests for all new API routes and block renderers

**Modules involved:** `apps/api`, new `packages/page-blocks`, `@webwaka/events`, `@webwaka/entitlements`  
**Risks:** D1 migration contention with existing migration sequence (follow sequential numbering strictly)  
**Acceptance criteria:** Pages can be created, populated with blocks, and published via API; published pages appear in `search_entries`; events fire correctly  
**Tests:** API route unit tests; block renderer unit tests; governance checks pass

### Phase 2: Public-Page Core Foundation
**Objective:** WakaPage renders correctly in `apps/brand-runtime`. Basic builder UI available. Contact forms and leads captured.

**Dependencies:** Phase 1 complete

**Tasks:**
1. Update `apps/brand-runtime` page rendering to use `page_blocks` registry when a WakaPage exists for the tenant
2. Keep existing niche template fallback for tenants without a WakaPage
3. Implement all MVP block renderers: hero, social_links, text, cta (WhatsApp/Call/Book/Pay), contact_form (existing offline-capable form wired), map, hours, trust_badges, offerings_grid (wire `@webwaka/offerings`)
4. Migrate existing `apps/brand-runtime/src/templates/contact.ts` to create a `leads` record on submission
5. Lead notification: on new lead, publish `LeadSubmitted` event → notification engine → WhatsApp/Email to workspace admin
6. D1 migration: `social_link_profiles` table
7. Social links block renderer: fetch from `social_link_profiles`, render grid of platform links
8. Add `?data=low` low-bandwidth mode to `apps/brand-runtime` (text-only blocks, no images)
9. Basic builder UI in `apps/workspace-app` (or dedicated `apps/waka-page-builder`): block list, add/remove/reorder blocks, preview iframe

**Modules involved:** `apps/brand-runtime`, `apps/workspace-app` (or new builder), `apps/api`, `apps/notificator`, `packages/page-blocks`  
**Risks:** Block rendering performance at edge needs profiling; iframe preview CORS setup  
**Acceptance criteria:** A tenant can create a WakaPage, add blocks, publish, and view it at their branded URL; contact form creates a lead record; lead notification sent to admin  
**Tests:** E2E test: create page → add hero block → publish → visit URL → verify render; unit test: lead creation; lead notification

### Phase 3: Operations / Live-Data Bindings
**Objective:** WakaPage blocks display live data from Pillar 1. Booking, calendar, and commerce blocks wired.

**Dependencies:** Phase 2 complete

**Tasks:**
1. `offerings_grid` block: live query from `@webwaka/offerings` at request time (KV-cached with 60s TTL)
2. `booking` block: wire `schedule-availability` SuperAgent tool to render available appointment slots; booking CTA submits inquiry → Lead record
3. Gallery block + R2 asset upload API: tenants upload photos to R2 via signed URL; gallery block renders from stored URLs
4. Testimonials block: wire `@webwaka/social` reactions and posts to render social proof
5. Event list block: wire `@webwaka/community` events
6. Analytics: `POST /pages/:id/analytics` event ingestion; track page views via service worker beacon; track CTA clicks via `data-block-id` JavaScript
7. Full analytics dashboard in `apps/workspace-app`: views, clicks, CTA conversions, lead count, top blocks
8. AI content generation: add SuperAgent tools for `generate_page_bio`, `suggest_block_layout`, `generate_service_description`; integrate into builder UI
9. D1 migration: `audience_records` table; email opt-in block; NDPR consent gate on opt-in

**Modules involved:** `apps/brand-runtime`, `apps/api`, `@webwaka/offerings`, `@webwaka/superagent`, `@webwaka/social`, `@webwaka/community`, R2  
**Risks:** Live data queries at edge add latency; must implement KV caching per block type; R2 asset management scope definition  
**Acceptance criteria:** Offerings appear live on page; booking block shows real availability; analytics events captured; AI content generation works in builder  
**Tests:** Integration test: live offerings block renders correct prices from D1; E2E: book appointment from WakaPage; analytics event fires on CTA click

### Phase 4: Discovery Integration
**Objective:** Every published WakaPage is discoverable in `apps/public-discovery` with rich facets and geography routing.

**Dependencies:** Phase 3 complete

**Tasks:**
1. On page publish, upsert `search_entries` with WakaPage-specific facets (`page_type`, `has_booking`, `has_checkout`, `has_whatsapp`, `has_community`)
2. Update `apps/public-discovery/src/routes/profiles.ts` to display WakaPage block previews on the discovery profile card (hero block content, offerings count, CTA types)
3. Geography-aware WakaPage URLs in `apps/public-discovery`: `/discover/lagos/restaurant/iya-bisi-kitchen` routing to the WakaPage
4. D1 migration: `qr_campaigns` table
5. QR code generation: `POST /qr-campaigns` API; SVG QR generation at edge; short-code redirect with `QRScanned` event
6. Campaign page archetype: WakaPage with `page_type='campaign'`, `expiry_at` field, countdown block, QR code block
7. Sitemap: extend `apps/brand-runtime/src/routes/sitemap.ts` to include all published WakaPage blocks in sitemap
8. Schema.org markup: extend per WakaPage type (LocalBusiness, Person, Event, Product, etc.)

**Modules involved:** `apps/public-discovery`, `apps/brand-runtime`, `apps/api`, `@webwaka/search-indexing`  
**Risks:** Sitemap size for tenants with many pages; geography routing collision with existing URL patterns  
**Acceptance criteria:** Published WakaPage appears in discovery search results; QR code generated and redirects correctly; campaign page expires after `expiry_at`; schema.org markup validates  
**Tests:** E2E: publish page → search discovery → find in results; QR scan attribution event captured

### Phase 5: Advanced Monetisation, Media Kit, Growth, Automation
**Objective:** Advanced blocks and monetisation flows. Media kit. Automated lead workflows.

**Dependencies:** Phase 4 complete

**Tasks:**
1. Digital download block: offering with `type='digital'`, purchase → R2 signed download URL
2. Membership/subscription block: wire `@webwaka/community` membership tiers to WakaPage CTA
3. Donation block: offering with `type='donation'`; Paystack donation flow
4. Media kit block: downloadable brand assets, press pack (R2 files); access controlled by `wakapage_media_kit` entitlement
5. Pricing table block: tiered service/product pricing display
6. Automated lead follow-up: configurable automation rules (e.g. "when new lead received → send WhatsApp message within 1 hour") in `apps/schedulers`
7. Audience broadcast: send WhatsApp/email message to opted-in audience from workspace dashboard
8. A/B page variant: `page_variants` table; traffic split; variant analytics comparison
9. UTM campaign tracking: parse `utm_source/medium/campaign` from WakaPage URL and store in `page_analytics`

**Modules involved:** `apps/api`, `apps/schedulers`, `apps/brand-runtime`, `@webwaka/community`, `@webwaka/payments`, R2  
**Risks:** Automated messaging must comply with WhatsApp Business API rate limits and opt-out requirements  
**Acceptance criteria:** Digital download purchase works end-to-end; media kit download available for entitled tenants; A/B variant traffic split correctly  
**Tests:** Purchase digital product → receive download link; opt-out from audience removes audience record; A/B variant delivers correct split

### Phase 6: Vertical Packs and Governance Hardening
**Objective:** Vertical-specific block presets and niche template packs. Full governance and moderation coverage.

**Dependencies:** Phase 5 complete

**Tasks:**
1. Convert all 200+ existing niche templates to block preset arrays (the default block layout installed when a tenant activates that niche template)
2. Vertical-specific block types: fintech FX rates block (live from `fx_rates`), hospital consultation booking, legal consultation request, campaign timeline block for politicians
3. Content moderation: classify all text blocks on publish via `classifyContent()`; flag if any block content is classified as harmful
4. Abuse reporting: `abuse_reports` table + platform admin review queue
5. Link safety: blocklist validation for all outbound URLs in CTA and social link blocks
6. NDPR audit: all new tables with PII columns (`leads`, `audience_records`) included in NDPR Article 30 export via `@webwaka/superagent/src/ndpr-register.ts`
7. Sector licence badge rendering: extend trust_badges block with `sector_license_verifications` integration for all 7 gated verticals
8. Entitlement enforcement audit: verify all `wakapage_*` flags are checked consistently across all routes

**Modules involved:** `apps/brand-runtime`, `apps/platform-admin`, `@webwaka/superagent`, `@webwaka/social`, all vertical packages  
**Risks:** 200+ template migrations must not break existing tenant sites  
**Acceptance criteria:** All vertical niche templates produce correct block presets; content classification fires on publish; abuse report flow works end-to-end  
**Tests:** Template migration regression tests; moderation test for harmful content block; NDPR export includes `leads` and `audience_records`

### Phase 7: Rollout, QA, Instrumentation, and Adoption Support
**Objective:** Production readiness, operator runbooks, and pilot rollout.

**Dependencies:** Phase 6 complete

**Tasks:**
1. Load testing: k6 test WakaPage rendering under 1000 concurrent visitors per page (especially live-data blocks)
2. Low-bandwidth E2E test: verify WakaPage degrades gracefully on slow connections
3. Mobile QA: test all block types on 360px viewport on Android Chrome
4. PWA install test: verify WakaPage is installable as standalone app
5. Offline test: verify page shell loads from service worker cache when offline
6. Operator runbook: add WakaPage section to `docs/operator-runbook.md`
7. Pilot rollout: 10 tenants across 5 verticals (restaurant, clinic, creator, motor park, politician)
8. Feedback collection: 2-week pilot with direct founder review of real WakaPages
9. Incident runbooks: WakaPage down, block rendering failure, analytics data loss scenarios
10. Production monitoring: add WakaPage-specific dashboards to `apps/admin-dashboard`

**Modules involved:** All apps, `docs/`, `tests/`  
**Risks:** Live-data block latency at scale; QR redirect speed; D1 connection limits under concurrent WakaPage renders  
**Acceptance criteria:** k6 load test passes at 1000 concurrent with p99 < 1s; all mobile QA scenarios pass; 10 pilot tenants have live WakaPages; no critical incidents in first 2 weeks  
**Tests:** k6 load test suite; mobile QA checklist; pilot sign-off

---

## 16. Repo / Package / Service Execution Map

Based on the **current monorepo structure** (not historical assumptions), the following table shows which current module owns what for WakaPage.

| Concern | Current / New Owner | File / Package | Phase |
|---------|--------------------|----|-------|
| WakaPage domain entity (Page, Block, PageVariant) | New: `packages/page-blocks` | `packages/page-blocks/src/types.ts` | Phase 0-1 |
| Block renderers (server-side HTML) | New: `packages/page-blocks` | `packages/page-blocks/src/renderers/` | Phase 1-2 |
| WakaPage CRUD API routes | `apps/api` | `apps/api/src/routes/pages.ts` (new) | Phase 1 |
| WakaPage rendering (public HTTP) | `apps/brand-runtime` | `apps/brand-runtime/src/routes/` (extend) | Phase 2 |
| WakaPage builder UI | `apps/workspace-app` (or new `apps/waka-page-builder`) | TBD | Phase 2 |
| WakaPage analytics ingestion | `apps/api` | `apps/api/src/routes/analytics.ts` (extend) | Phase 3 |
| WakaPage analytics dashboard | `apps/workspace-app` | TBD | Phase 3 |
| Lead capture + storage | `apps/api` | `apps/api/src/routes/leads.ts` (new) | Phase 2 |
| Lead notifications | `apps/notificator` | Extend notification templates | Phase 2 |
| Brand tokens / theme | `@webwaka/white-label-theming` | Extend `TenantTheme` with `socialLinks` | Phase 1 |
| Social links registry | `apps/api` | Extend `tenant-branding.ts` routes | Phase 1 |
| Offerings (live product data) | `@webwaka/offerings` | No change — data-bind in block renderer | Phase 3 |
| Booking / schedule blocks | `@webwaka/superagent` tools | `packages/superagent/src/tools/schedule-availability.ts` (exists) | Phase 3 |
| QR code generation | `apps/api` | `apps/api/src/routes/qr-campaigns.ts` (new) | Phase 4 |
| QR redirect | `apps/brand-runtime` | `apps/brand-runtime/src/routes/qr.ts` (new) | Phase 4 |
| Discovery indexing (WakaPage in search) | `apps/api/src/lib/search-index.ts` | Extend with page facets | Phase 4 |
| Discovery rendering (WakaPage on profile card) | `apps/public-discovery` | Extend profile route templates | Phase 4 |
| Audience / subscriber list | `apps/api` | `apps/api/src/routes/audience.ts` (new) | Phase 5 |
| Campaign / A/B variant | `apps/api` | Extend pages routes | Phase 5 |
| Vertical block presets (200+ niches) | `apps/brand-runtime/src/templates/niches/` | Convert HTML functions to block preset arrays | Phase 6 |
| Content moderation | `@webwaka/social` | `classifyContent()` (exists) | Phase 6 |
| Abuse reporting | `apps/api` + `apps/platform-admin` | New routes + admin UI | Phase 6 |
| NDPR registration for new tables | `@webwaka/superagent/src/ndpr-register.ts` | Extend with `leads`, `audience_records` | Phase 6 |
| Entitlement flags | `@webwaka/entitlements` | Add `wakapage_*` flags | Phase 0 |
| Event types | `@webwaka/events` | Add `PageEventType` namespace | Phase 0 |
| DB migrations | `infra/db/migrations/` | New migration files | Phases 0-5 |
| PWA / service worker | `apps/brand-runtime/src/index.ts` | Extend SW cache for block assets | Phase 2 |
| Offline sync | `@webwaka/offline-sync` | Extend for builder offline editing | Phase 2 |

---

## 17. Risk Register

| Risk | Category | Impact | Stage | Mitigation |
|------|----------|--------|-------|------------|
| BUG-P3-014 fix breaks existing profile queries | Migration | High | Phase 0 | Write comprehensive tests before and after refactor; feature-flag the change |
| Block rendering latency at edge (live-data blocks hit D1 on every request) | Performance | High | Phase 2-3 | KV-cached block HTML per page (60s TTL); only dynamic blocks bypass cache; edge-optimise D1 queries |
| 200+ niche template migration to block presets introduces regressions | Architecture | High | Phase 6 | Automated regression test per template: before/after HTML diff must match; run as CI gate |
| WakaPage-as-PWA install confusion (tenants' WakaPaged vs platform PWA) | UX | Medium | Phase 2 | Per-tenant `manifest.webmanifest` already isolated by tenant (existing in brand-runtime); no change needed |
| NDPR non-compliance for audience/lead data collection without consent | Governance | High | Phase 2-3 | Consent gate on all forms; `ndpr_consent_at` recorded; `classifyContent` on all submissions; NDPR register updated |
| D1 migration sequence gaps (non-sequential migration numbers) | Data | Medium | All phases | Strictly follow sequential migration numbering; CI validates migration sequence |
| Tenant-public app confusion (two apps serving per-tenant public pages) | Architecture | Medium | Phase 2 | Decide and document tenant-public retirement plan in Phase 0 ADR; redirect shim first, then deprecation |
| Custom domain security: phishing or domain squatting via WakaPage | Security | High | Phase 1 | DNS TXT verification already enforced; add platform domain blocklist in KV; rate-limit domain changes |
| WhatsApp Business API rate limits on automated lead follow-ups | Operational | Medium | Phase 5 | Implement send rate limiting per tenant via KV; honour WhatsApp opt-out signals; user-level opt-out in `audience_records` |
| AI content generation producing inaccurate or non-compliant content | Governance | Medium | Phase 3 | SuperAgent HITL gate for sensitive verticals; NDPR consent gate before AI processes any PII; content generation marked as AI-generated in audit log |
| Block schema design: too rigid (missing block types) or too flexible (security risks from custom JSON) | Architecture | Medium | Phase 0 | Define typed TypeScript interface per block type; `config` JSON validated against per-type schema on write; no free-form HTML injection |
| Analytics data volume overwhelming D1 at scale | Data | Medium | Phase 3+ | Page analytics written to `page_analytics` table; implement data retention TTL; aggregate to daily summaries via `apps/projections`; purge raw events after 90 days |
| Offline builder editing sync conflicts | UX/Data | Low | Phase 2 | Use `@webwaka/offline-sync` conflict resolution model for builder edits; last-write-wins with conflict log |
| Q4 pillar rollout dependency: brand-runtime must be live before WakaPage renders | Rollout | Medium | Phase 7 | `apps/brand-runtime` is already live (✅ confirmed); no dependency risk |

---

## 18. Final Recommendation

### Preferred Internal Naming

| Term | Rationale |
|------|-----------|
| **WakaPage** | Short, memorable, brand-native. "Waka" is a Yoruba/Igbo word meaning "to go" — evokes movement, progress, and distribution. Fits the Africa-first identity. |
| **WakaPage Builder** | The workspace UI for composing block layouts |
| **Block** | The composable unit (not "widget" or "section") |
| **Block Preset** | A named default configuration for a block type (not "template component") |
| **Page Archetype** | A named default block layout for a vertical (not "theme") |
| **WakaLink** | Short URL / QR campaign link (equivalent to Bitly + QR) |

### Preferred Module Boundaries

| Module | Boundary |
|--------|----------|
| `packages/page-blocks` | Block types, schemas, interfaces, and server-side renderers. No UI, no D1 queries. Pure rendering primitives. |
| `apps/api` (extended) | All WakaPage CRUD, lead capture, audience, QR campaign, analytics ingestion API routes. Single source of truth for data writes. |
| `apps/brand-runtime` (extended) | All WakaPage public rendering (read-only, edge-optimised). Consumes `packages/page-blocks` renderers. |
| `apps/workspace-app` (extended) or new `apps/waka-page-builder` | WakaPage builder UI. Communicates only with `apps/api`. Live preview via iframe embedding `apps/brand-runtime`. |
| `apps/public-discovery` (extended) | WakaPage discovery integration. Reads from `search_entries`, renders WakaPage previews on discovery cards. |
| `apps/notificator` (extended) | WakaPage lead and audience notifications. |

### What to Avoid

1. **Do not create a separate page-rendering worker.** `apps/brand-runtime` already exists, is live, and handles tenant resolution, custom domains, PWA, service worker, and theming. All WakaPage rendering belongs here.
2. **Do not duplicate the brand token system.** `@webwaka/white-label-theming` is the single source of truth. WakaPage blocks inherit tokens from this — no block should have its own colour system.
3. **Do not create a new entity model for pages that conflicts with the 7 root entities.** Pages are a derivative of Brand Surfaces (the 7th root entity). The domain model must explicitly acknowledge this.
4. **Do not implement analytics outside the existing event infrastructure.** All WakaPage analytics events go through `@webwaka/events` → `apps/api` → `page_analytics` table → `apps/projections` aggregation. No third-party analytics SDK.
5. **Do not allow raw HTML in block configs.** All block content must be typed, validated, and escaped at render time. This prevents XSS (BUG-WALLET-UI-05 was a real XSS bug in this repo — the lesson is applied here).
6. **Do not skip Phase 0 (BUG-P3-014 fix).** The profile service stub is a genuine architectural debt. Building WakaPage on top of it without resolving this would create compounding technical debt.
7. **Do not create vertical-specific WakaPage logic in the platform layer.** Block presets and page archetypes are the correct mechanism for vertical customisation. No `if (vertical === 'restaurant')` logic in core WakaPage code.

### Most Future-Proof Implementation Direction

The most future-proof direction is: **WakaPage as the composable layer on top of all three pillars — built once, rendering data from everywhere, distributed through everything.**

Practically, this means:
- `pages` + `page_blocks` tables as the canonical data model
- `packages/page-blocks` as the shared block registry (Build Once Use Infinitely — P1)
- `apps/brand-runtime` as the edge rendering engine (already live, already handles theming + PWA + SEO)
- `apps/api` as the management API (consistent with how all platform entities are managed)
- `apps/public-discovery` as the distribution surface (already handles geography + FTS5 + schema.org)
- The 200+ existing niche templates becoming block presets — zero waste, maximum reuse
- The claim FSM `branded` state as the natural activation gate for WakaPage — clean, governed, frictionless

This approach requires zero new workers, zero new domain concepts outside the universal entity model, zero duplication of brand tokens or analytics infrastructure, and zero deviation from any of the 10 Product and 10 Technical invariants.

**WakaPage is not a new product. It is the natural completion of what WebWaka OS was designed to be.**

---

*End of report. This document is a planning and research artefact. No implementation has occurred. All referenced files and code are from the live codebase as of 2026-04-27.*
