# Research Brief — P2-sole-trader-artisan-catalogue

**Niche ID:** P2-sole-trader-artisan-catalogue  
**Vertical:** sole-trader (VN-SVC-002)  
**Family:** standalone (no family — not an anchor or variant)  
**Template Slug:** sole-trader-artisan-catalogue  
**Milestone:** M8e — must ship before M9  
**Status:** RESEARCH_SYNTHESIZED  
**Researched:** 2026-04-25  
**Agent:** replit-agent-2026-04-25-session-B  

---

## Section 1 — Nigeria Market Context

### Scale & Volume
- SMEDAN 2023: Nigeria has 37M+ micro-enterprises; approximately 70% are individual sole traders with no registered business entity
- Dominant informal economy trades: tailoring/fashion design, welding, carpentry/furniture, plumbing, electrical installation, shoe repair (cobbling), phone/electronics repair, auto mechanics, printing, hairdressing/barbering, painting, tiling, bricklaying, generator repair
- Most sole traders operate from a single location — shop, kiosk, workshop, or home — often in residential areas
- Digital presence: <8% have any web presence; nearly all use WhatsApp and Instagram informally
- Average monthly revenue: ₦80,000–₦400,000 (SMEDAN); service pricing ranges from ₦500 (simple cobbling) to ₦150,000+ (full furniture sets, major plumbing jobs)

### Why They Need a Website
- "WhatsApp catalogue" is the standard reference — a link customers can share: "This is the person that does your work well"
- Referrals drive 80%+ of sole trader business — a shareable link replaces verbal word-of-mouth
- Legitimacy signal: having a website/link positions the trader as "serious business"
- Quote requests: customers want to see work (portfolio) and approximate pricing before calling
- Location + hours: "Are you available? Where are you located?" — top customer questions

### Payment Landscape
- Cash: dominant (75%+ of transactions)
- POS: growing especially in Lagos, Abuja; traders with POS readers are trusted more
- Bank transfer (USSD): *737#, *966# for deposits and material cost advances
- 30–50% upfront deposits common for custom work (tailoring, carpentry, welding)
- No complex billing — customers pay on completion or in two-stage milestone payments

---

## Section 2 — Audience & Customer Journey

### Primary Audience
- **Neighbourhood customers** — within 2–5km radius; "Who's the good tailor near me in Surulere?"
- **Referred customers** — forwarded the WhatsApp link or website by a mutual contact
- **Office/estate procurement** — bulk orders (furniture for new office, building trade for renovation)
- **Event clients** — fashion tailors get dress orders for weddings, owambes, graduations

### Customer Journey on a Sole Trader Website
1. Land via shared WhatsApp link or Google search for "[trade] near [area/LGA]"
2. First ask: "What do they do? Do they do it well?" → look at portfolio/work samples
3. "How much does it cost?" → price list or price range
4. "Where are they / are they available?" → location + contact
5. Primary conversion: **WhatsApp tap** → "I'd like to inquire about your services"
6. Secondary: **phone call**
7. Rare: contact form

### Trust Factors
- Portfolio / "My Work" section — photos of completed projects (garments, furniture, pipework, etc.)
- Price transparency — even a range ("Wardrobes from ₦45,000") reduces friction enormously
- Location specificity — "Alade Market area, Ikosi-Ketu, Lagos"
- "Established since [year]" if veteran
- Optional: business name registration badge, vocational training certificate
- Positive testimonials / referral mentions

---

## Section 3 — Content Localization Notes

### Voice & Tone (Critical Difference from Restaurant)
- **First-person** throughout — "I do", "My work", "Call me", "WhatsApp me"
- Informal, direct, approachable — not corporate
- Nigerian English register: "I fix all kinds of shoes", "I do interior design and furniture", "Quality work, fast delivery"
- Section headings: "My Services", "My Work", "About Me", "Get in Touch"
- CTA copy: "WhatsApp Me", "Call Me Now", "Send a Message"

### Trade-Specific Language
- Tailors: "native wear", "senator styles", "aso-oke", "ankara designs", "corporate wears"
- Carpenters: "upholstery", "wardrobes", "TV stands", "kitchen cabinets", "office furniture"
- Plumbers: "PVC pipes", "overhead tank installation", "burst pipe repair"
- Electricians: "inverter installation", "generator repairs", "rewiring"
- Generic template must work for ALL trades — use abstract labels ("My Services", "My Work")

### Currency
- ₦ prefix on all prices
- Many sole traders list price ranges, not exact prices — template should handle null priceKobo gracefully
- "Price on request" / "Call for quote" when no price is set — show a CTA instead

### Location
- LGA + street/market/area: "Ladipo Market, Mushin, Lagos"
- Many traders operate from a market stall — "Alaba International Market, Ojo, Lagos"

---

## Section 4 — Design Direction

### Aesthetic
- Personal, warm, artisan — handcraft feel without being rustic/primitive
- Dark accents work well (toolbox black, earthy tones), but the tenant's `--ww-primary` drives it
- Single-column-leaning layout on mobile (375px) — hero, then work, then contact
- Clean cards for service items — name + description + price/range

### Visual / Art Direction
- **Required**: Nigerian artisan at work — tailor at a Singer machine, carpenter planing timber, welder with mask, plumber under a sink, cobbler stitching
- Real workshop setting — not a studio, not a stock background
- **Avoid**: European artisan imagery; overly polished product photography; corporate headshots

### WhatsApp Integration — Even More Dominant
- For sole traders, WhatsApp is often their ONLY digital channel before this website
- The "WhatsApp Me" button must be the single most prominent element on every page
- Consider a persistent floating WhatsApp button (handled in CSS — server-rendered, no JS)

---

## Section 5 — Page-by-Page Content Plan

### Home (`/`)
1. Hero: name (h1) + trade/tagline + "WhatsApp Me" (largest CTA) + "See My Work"
2. "My Services" preview — up to 6 service cards with name, description, price/range
3. Contact strip: phone | location | WhatsApp
4. Floating WhatsApp button (fixed, bottom-right, CSS only)

### About (`/about`)
1. "About Me" section — description, trade, years in business if given
2. Location, phone, website
3. WhatsApp CTA
4. Optional: category badge (trade type)

### Services (`/services`) — My Work / Catalogue
1. "My Services" full grid — all published offerings
2. Empty state: "Service list coming soon — WhatsApp me to ask about availability"
3. Bottom WhatsApp CTA strip

### Contact (`/contact`)
1. "Get in Touch" hero
2. WhatsApp CTA — above everything else, larger than restaurant template
3. Phone + email + location
4. Contact form (name, phone, email, message)

---

## Section 6 — Technical Implementation Notes

### `ctx.data` Contract (from branded-page.ts — same as all templates)
| Page | Available in `ctx.data` |
|------|------------------------|
| home | `offerings[]`, `description`, `tagline` |
| about | `description`, `category`, `placeName`, `phone`, `website` |
| services | `offerings[]` |
| contact | `phone`, `email`, `placeName` |

Note: `ctx.tenantId` available directly for contact form hidden field.

### Floating WhatsApp Button (CSS-only, server-rendered)
```html
<div class="st-wa-float">
  <a href="https://wa.me/..." class="st-wa-float-btn">WhatsApp</a>
</div>
```
```css
.st-wa-float { position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 500; }
```
Server-rendered, no JS needed — available on every page load immediately.

### CSS Namespace
`.st-` — sole trader. Stable, not used by restaurant (`.re-`) or any other planned template.

### `esc()` + `fmtKobo()` + `whatsappLink()` — local to file, same pattern as restaurant anchor

---

## Section 7 — Regulatory / Trust Notes

- **Business Name Registration (CAC)**: Optional for sole traders; encouraged. No mandatory web disclosure.
- **Vocational training certificates**: Some trades (electrical, plumbing) have COREN/relevant body certificates — can be displayed as trust badge if provided via description
- **No mandatory web disclosure** for informal trade services
- **Halal certification**: Not applicable for services; N/A
- **NAFDAC**: N/A (not food production)

---

## Section 8 — Governance / Platform Invariant Checks

- [x] T2 — TypeScript strict — all types explicit, no `any`
- [x] T3 — tenant_id isolation — no DB queries; `ctx.tenantId` for contact form only
- [x] T4 — integer kobo — `fmtKobo()` pattern; graceful null handling
- [x] P7 — CSS vars only — `var(--ww-*)` throughout; `#25D366` WhatsApp green exception
- [x] P9 — NGN-first pricing — ₦ prefix, `en-NG` locale
- [x] P10 — mobile-first — 375px minimum; 44px targets; no CDN; no external scripts

---

## Section 9 — Africa-First Context

- **africaFirstNotes**: "Informal artisan economy dominant across sub-Saharan Africa — Ghana (roadside workshops), Kenya (Jua Kali sector), South Africa (informal trades), Senegal (artisans informels). Template applies across the continent with minor localisation."
- WhatsApp-first catalogue is a pan-African pattern — not Nigeria-specific
- First-person, direct-language design works across African markets (all value personal trust over corporate formality)
- Price-on-request fallback accommodates markets where price negotiation is universal

---

## Section 10 — Family / Standalone Notes

`sole-trader` is **standalone** (VN-SVC-002 — not in any niche family). This template does not serve as an anchor for any variants. It is self-contained.

Future vertical templates that may share this pattern's philosophy (first-person, WhatsApp-first, individual service provider): `creator`, `photography`, `tutoring`, `handyman`. None are formal variants — each gets its own template.
