# Research Brief — P2-restaurant-general-eatery

**Niche ID:** P2-restaurant-general-eatery  
**Vertical:** restaurant (VN-FDS-001)  
**Family:** NF-FDS — Food Service | **Role:** ANCHOR (build before food-vendor, catering, bakery, restaurant-chain)  
**Template Slug:** restaurant-general-eatery  
**Status:** RESEARCH_SYNTHESIZED  
**Researched:** 2026-04-25  
**Agent:** replit-agent-2026-04-25-session-B  

---

## Section 1 — Nigeria Market Context

### Scale & Volume
- Nigeria's food service market is the largest informal sector by transaction frequency (~220M population, 50%+ urban)
- NBS 2023: food away from home accounts for ~14% of household consumption expenditure
- SMEDAN: urban Nigerians eat out 3–5 times per week on average; Lagos, Abuja, Port Harcourt drive 60%+ of commercial food service
- Estimated 400,000+ commercial food premises operating (formal + informal); vast majority have no web presence

### Buka / Eatery Model (Quintessential Nigerian SME)
- "Buka" (South West Yoruba origin), "mama put" (pidgin), "buka joint" — open-plan dine-in, affordable, communal
- Daily specials model: rotating menu 3–5 dishes per day (Jollof rice, Egusi, Amala, pounded yam, Banga soup, pepper soup, Ofada rice, Ofe Onugbu, fufu, eba, moimoi, akara)
- Price range: buka ₦800–₦2,500 per plate; mid-market restaurant ₦2,000–₦8,000; upscale ₦8,000+
- Takeaway and WhatsApp pre-order extremely common — customers text or call to confirm availability before arriving

### Digital Channels for Ordering
1. **WhatsApp** — dominant. Most restaurants have a WhatsApp Business number with menu shared as images
2. **Phone call** — direct ordering, still primary for older demographics
3. **Instagram/Facebook** — menu photos, story updates, DM orders
4. **Jumia Food / Glovo** — growing in Lagos/Abuja but perceived as expensive (commission cuts margins)
5. **Own website** — having a site is a significant brand upgrade; positions business as formal/professional

### Payment Landscape (for "How to Pay" content)
- Cash: still 55–65% of restaurant transactions
- POS terminal: growing rapidly, now ~28–35% of payments
- Bank transfer (USSD): *737# GTBank, *966# Zenith, *894# FCMB — high trust for delivery prepayment
- Bank transfer (app): Opay, Palmpay increasingly used by younger customers

---

## Section 2 — Audience & Customer Journey

### Primary Audience
- **Individual diners**: Young professionals (22–40), students, families — searching on mobile for "restaurant near me [LGA]"
- **Office groups**: Bulk orders for lunch, event catering needs (catering niche handles events separately)
- **Food delivery seekers**: Within 5–10km radius; expect WhatsApp confirmation within 5 minutes

### Customer Journey on a Restaurant Website
1. Land on homepage — **first ask**: "What do they serve? What does it cost?"
2. Scan menu items and prices
3. Confirm location + hours ("Are they near me? Are they open now?")
4. Primary conversion: **WhatsApp tap** ("Order on WhatsApp") or phone call
5. Secondary: contact form (rare in Nigeria — WhatsApp is preferred)

### Trust Factors Nigerians Look For
- Actual prices visible (not "call for price")
- Specific address (street + LGA, not just "Lagos")
- Phone/WhatsApp number clickable
- Real food photos (generic stock photos reduce trust)
- Menu items with Nigerian names (not anglicised euphemisms)

---

## Section 3 — Content Localization Notes

### Menu Item Naming Convention (both registers)
- Correct: "Egusi Soup", "Amala & Ewedu/Gbegiri", "Pepper Soup (Goat/Fish)", "Ofada Rice & Ayamase Sauce", "Eba / Fufu", "Jollof Rice", "Banga Soup with Starch", "Nkwobi", "Ofe Onugbu (Bitter Leaf Soup)", "Moimoi", "Akara"
- Common grills: "Suya", "Asun (Peppered Goat)", "Point & Kill" (catfish)
- Drinks: "Zobo", "Kunu", "Fura de Nono", "Chapman", soft drinks, Malta Guinness

### Language & Currency
- Use ₦ (Naira symbol) for all prices — never $, €, or "NGN"
- Phone numbers: accept any of: `+234 803 000 0000`, `0803 000 0000` — WhatsApp link builder must normalise to international format
- "Takeaway" preferred over "Takeout" (British English dominant in Nigerian restaurant signage)
- "Order on WhatsApp" is recognised CTA — do not translate or paraphrase

### CTA Hierarchy (Nigeria-First)
1. "Order on WhatsApp" — green WhatsApp-colour button, top of hero
2. "Call Us Now" — tel: link
3. "View Full Menu" — link to /services
4. "Contact Us" — form at /contact (lowest priority)

---

## Section 4 — Design Direction

### Colour & Aesthetic
- Warm palette: terracotta, deep amber, brick red, forest green, warm off-white
- The tenant's `--ww-primary` drives the CTA colour — restaurant tenants typically choose deep red, burnt orange, or forest green
- Hero: large type + food CTA + location line; image art direction below

### Image Art Direction
- **Required**: Nigerian dishes on ceramic or terracotta plates, natural daylight from a window
- **Mood**: warm, inviting, communal — a table with 3–4 dishes shared, a hand reaching in with a wrap of eba
- **Avoid**: European/American food photography; clinical white backgrounds; stock images of non-Nigerian dishes
- **Fallback** (no image): full-bleed warm gradient using `--ww-primary` → darker shade, white text

### Mobile-First Layout
- 375px minimum viewport
- Touch targets: 44px minimum height on all interactive elements
- WhatsApp CTA fixed/floating consideration — but for server-rendered template, just ensure it appears above the fold on mobile
- No horizontal overflow — all grids use `auto-fill, minmax(260px, 1fr)` or `minmax(200px, 1fr)`

---

## Section 5 — Page-by-Page Content Plan

### Home (`/`)
1. Hero: logo + name (h1) + tagline/description + [Order on WhatsApp] + [View Menu]
2. Featured Menu: "Today's Offerings" — up to 6 menu cards with name, description, ₦price
3. Contact strip: Phone | Location | Hours (if available in data)
4. CTA footer bar: "Visit us at [placeName]"

### About (`/about`)
1. H1: "About [Name]"
2. Food philosophy / description paragraph
3. Business info: Location, Phone, Category badge, WhatsApp link
4. Optional website link

### Services (`/services`) — Menu Page
1. H1: "Our Menu"
2. Full offerings grid — all published items with prices
3. Empty state: "Menu coming soon — call us to order today" + phone link
4. WhatsApp CTA strip at bottom

### Contact (`/contact`)
1. H1: "Find Us / Order Now"
2. WhatsApp primary CTA prominently above the form
3. Phone + email + address
4. Standard contact form (name, phone, email, message) — POST /contact

---

## Section 6 — Technical Implementation Notes

### `ctx.data` Contract (from branded-page.ts)
| Page | Available in `ctx.data` |
|------|------------------------|
| home | `offerings[]`, `description`, `tagline` |
| about | `description`, `category`, `placeName`, `phone`, `website` |
| services | `offerings[]` |
| contact | `phone`, `email`, `placeName` |

Note: `ctx.tenantId` is always available directly (not via `ctx.data`) — use for contact form hidden field.

### WhatsApp Link Builder
```
function whatsappLink(phone: string | null, msg?: string): string | null
```
- Strip non-digits
- If starts with `0` → replace with `234`
- If starts with `234` → keep as-is
- Else → prepend `234`
- Encode message with `encodeURIComponent`

### Kobo Formatting (T4)
```
₦${(kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
```

### `esc()` — local, not imported
```typescript
const esc = (s: string) =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
```

---

## Section 7 — Regulatory / Trust Notes

- **NAFDAC**: Required only for packaged/processed food sold commercially; dine-in and made-to-order restaurants are not required to display NAFDAC on their website
- **CAC**: Optional for microenterprises; encouraged for formal restaurants
- **State Environmental Health Authority (e.g., LASEHA in Lagos)**: Permits required operationally; not typically disclosed on website
- **Halal certification**: Growing demand particularly in Abuja, Kano, northern states — optional badge if applicable
- **No mandatory web disclosures** for a simple restaurant website beyond basic contact info

---

## Section 8 — Governance / Platform Invariant Checks

- [x] T2 — TypeScript strict — all types explicit, no `any`
- [x] T3 — tenant_id predicate — no DB queries in template (data arrives via ctx); `ctx.tenantId` for contact form
- [x] T4 — price in integer kobo — all prices via `ctx.data.offerings[].priceKobo` (number|null), formatted inline
- [x] P7 — white-label CSS vars only — no hardcoded hex colours; all colours via `var(--ww-*)`
- [x] P9 — NGN-first pricing — ₦ prefix, `en-NG` locale, kobo integer
- [x] P10 — mobile-first — 375px minimum; 44px touch targets; no external CDN

---

## Section 9 — Africa-First Context

- **africaFirstNotes**: "Buka model found across West Africa — Senegal ('dibiterie', rice joints), Ghana ('chop bars'), Ivory Coast ('maquis'), Cameroon ('cabaret du coin'). Template design and menu structure are portable across all West African food service businesses with minimal adaptation."
- Nigeria-specific elements (₦, NAFDAC, local dish names) are defaults but template works for any West African food business by swapping currency symbol and dish names
- WhatsApp ordering dominance is consistent across all of West/Central Africa — not Nigeria-specific
- The buka/communal-eating model is a regional cultural anchor, not just Nigerian

---

## Section 10 — Family Anchor Responsibilities

This template is the **NF-FDS family anchor** (VN-FDS-001). Variants to build after:
1. `VN-FDS-002 food-vendor` — Street Food / Mobile Vendor — inherits hero + offering cards; lighter, single-page emphasis
2. `VN-FDS-003 catering` — Catering Service — inherits structure; emphasises events, package pricing
3. `VN-FDS-004 bakery` — Bakery / Confectionery — inherits grid; product-focused with optional pre-order
4. `VN-FDS-005 restaurant-chain` — Multi-location chain — inherits anchor; adds NAFDAC chain notes, location picker

**Anchor Design Decisions Variants Should Inherit:**
- WhatsApp link builder function pattern (local to each file but consistent)
- esc() + kobo formatting utilities (local to each file)
- `.re-` CSS class namespace for restaurant family
- CTA hierarchy: WhatsApp → Phone → View Menu → Contact Form
- Nigeria-First content philosophy: ₦ pricing, local menu names, LGA-level location specificity
