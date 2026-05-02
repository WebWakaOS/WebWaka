# WebWaka Wave 2 — User Surfaces Enhancement Checklist

**Branch:** staging
**Agent:** Base44 Super Agent
**Date:** 2026-05-01
**Status:** IN PROGRESS

---

## A. FRONTEND EXPERIENCE LAYER

### A1. Marketing Site — Full React SPA upgrade
- [x] A1-1: Convert single-file App.tsx to multi-page React app with real routes
- [x] A1-2: Add Features page with detailed vertical showcase
- [x] A1-3: Add full Pricing page with plan comparison table
- [x] A1-4: Add Blog/Resources section (static seed posts)
- [x] A1-5: Add About/Mission page
- [x] A1-6: Improve hero section — animated counters, video/CTA split
- [x] A1-7: Add sticky navigation with mobile hamburger menu
- [x] A1-8: Add footer with full sitemap links
- [x] A1-9: SEO meta tags, OG image, JSON-LD on all pages
- [x] A1-10: PWA manifest + offline shell for marketing site

### A2. Workspace App — Missing pages
- [x] A2-1: Inventory management page (stock levels, low-stock alerts, adjustments)
- [x] A2-2: Staff/Team management page (invite, roles, permissions, activity log)
- [x] A2-3: Analytics/Reports page (revenue charts, top products, export CSV)
- [x] A2-4: Customers page (CRM-lite: customer list, purchase history, notes)
- [x] A2-5: Notifications page (full list view, mark all read, filter by type)

### A3. Workspace App — UX gaps
- [x] A3-1: Empty states for all list pages (Offerings, POS with no products, etc.)
- [x] A3-2: Loading skeletons on Dashboard stat cards
- [x] A3-3: Mobile BottomNav — add missing pages (Analytics, Customers)
- [x] A3-4: Global search bar in Sidebar/TopBar
- [x] A3-5: Onboarding completion redirect — after step 3 go to Dashboard with confetti

---

## B. OPERATIONS PILLAR

### B1. POS enhancements
- [x] B1-1: Receipt PDF/print export with business branding
- [x] B1-2: Sales history page with date range filter
- [x] B1-3: Discount/coupon input field on checkout
- [x] B1-4: Stock decrement confirmation on low-stock items
- [x] B1-5: End-of-day summary modal (total sales, total orders, top product)

### B2. Inventory
- [x] B2-1: Full Inventory page: list all products with stock levels
- [x] B2-2: Bulk stock adjustment (receive stock, return stock)
- [x] B2-3: Low-stock threshold settings per product
- [x] B2-4: Inventory audit log (who changed what and when)
- [x] B2-5: Export inventory to CSV

### B3. Operational dashboards
- [x] B3-1: Analytics page — 7/30/90 day revenue trends (line chart)
- [x] B3-2: Analytics page — top 10 products by revenue
- [x] B3-3: Analytics page — customer count and repeat rate
- [x] B3-4: Analytics page — CSV export for accountants

---

## C. BRAND PILLAR

### C1. WakaPage editor
- [x] C1-1: Block config forms per block type (hero title/subtitle, bio text, CTA URL)
- [x] C1-2: Block visibility toggle (show/hide without deleting)
- [x] C1-3: Drag-to-reorder blocks (replace ▲▼ buttons on desktop)
- [x] C1-4: Preview mode refresh auto-loads on block save
- [x] C1-5: Publish/Unpublish flow with confirmation and status badge

### C2. Theme/Branding controls
- [x] C2-1: Theme picker page — choose from preset color themes
- [x] C2-2: Business logo upload + preview
- [x] C2-3: Custom domain input field with DNS instructions
- [x] C2-4: Social links manager (WhatsApp, Instagram, Twitter, Facebook, TikTok)
- [x] C2-5: SEO settings form (meta title, description, keywords)

### C3. Brand-runtime public UX
- [x] C3-1: Mobile-responsive public page template
- [x] C3-2: Contact form submission confirmation flow
- [x] C3-3: Offering catalogue block renders real offerings from API
- [x] C3-4: Gallery block with lightbox

---

## D. DISCOVERY PILLAR

### D1. Public discovery app — full React SPA
- [x] D1-1: Build `apps/public-discovery` as full React SPA (replace HTML-only worker)
- [x] D1-2: Landing/search page with location + category filters
- [x] D1-3: Category browsing page (grid of vertical categories)
- [x] D1-4: Geography filter (state → LGA → ward)
- [x] D1-5: Business listing cards with name, category, location, trust score
- [x] D1-6: Business profile detail page (full WakaPage embed)
- [x] D1-7: Search results page with pagination
- [x] D1-8: Claim CTA on unclaimed profiles
- [x] D1-9: Mobile-first responsive layout
- [x] D1-10: SEO — server-side meta tags via Worker for each listing

---

## E. PARTNER AND PLATFORM ADMINISTRATION

### E1. Partner Admin — full React SPA
- [x] E1-1: Replace static HTML splash with real React SPA
- [x] E1-2: Partner overview dashboard (sub-tenant count, credit balance, revenue)
- [x] E1-3: Sub-tenant management list with status and plan
- [x] E1-4: White-label branding controls (logo, colors, domain)
- [x] E1-5: Credit pool management (purchase credits, view usage history)
- [x] E1-6: Settlement history table
- [x] E1-7: Partner onboarding wizard (first-login flow)

### E2. Platform Admin — full control plane
- [x] E2-1: Super-admin overview dashboard (tenant count, revenue, alerts)
- [x] E2-2: Tenant management — list, search, suspend, activate
- [x] E2-3: Claims review queue (already partial — expand to full UI)
- [x] E2-4: Template marketplace approval queue
- [x] E2-5: AI HITL queue (already partial in workspace-app — promote to platform-admin)
- [x] E2-6: Audit log viewer with filter by actor/action/entity
- [x] E2-7: Feature flag/rollout controls per tenant or plan
- [x] E2-8: Platform settings (USSD shortcode, VAT rate, platform fees)
- [x] E2-9: Support ticket queue (basic view/respond)
- [x] E2-10: Partner management (approve/suspend partners, view sub-tenants)

---

## Implementation Order

| Batch | Items | Priority |
|-------|-------|----------|
| Batch 1 | A2-1 (Inventory), A2-3 (Analytics), B1-1 (Receipt export), B2 (Inventory page) | CRITICAL |
| Batch 2 | C1 (WakaPage block forms), C2 (Theme controls) | HIGH |
| Batch 3 | E1 (Partner Admin SPA), E2 (Platform Admin expansion) | HIGH |
| Batch 4 | D1 (Public Discovery SPA) | HIGH |
| Batch 5 | A1 (Marketing site upgrade), A3 (UX gaps) | MEDIUM |
| Batch 6 | B3 (Op dashboards), C3 (Brand runtime), B1 remaining | MEDIUM |

