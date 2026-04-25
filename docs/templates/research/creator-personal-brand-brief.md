# Research Brief — P2-creator-personal-brand

**Niche ID:** P2-creator-personal-brand  
**Vertical:** creator (VN-CRE-001)  
**Family:** NF-CRE-DIG — Digital Creator | **Role:** ANCHOR (build before photography, podcast-studio, motivational-speaker)  
**Template Slug:** creator-personal-brand  
**Milestone:** M8e — P1-Original  
**Status:** RESEARCH_SYNTHESIZED  
**Researched:** 2026-04-25  
**Agent:** replit-agent-2026-04-25-session-B  

---

## Section 1 — Nigeria Market Context

### Scale & Creator Economy
- Nigeria's creator economy is the fastest-growing in Africa (Paystack/Flutterwave data 2024): 2M+ active monetised creators across YouTube, Instagram, TikTok, Twitter/X
- YouTube Nigeria: ~400K channels; 150+ channels with 100K+ subscribers; Afrobeats/Nollywood/comedy dominant
- Instagram Nigeria: 10M+ accounts, 3M+ with >1K followers; fashion, lifestyle, beauty dominant
- TikTok Nigeria: 5M+ creators; fastest growth segment (18–25 age bracket)
- Podcasting: rapid growth post-2021; Lagos-based audio-first creators monetising via Spotify/Apple
- Brand deals: primary monetisation for 70%+ of mid-tier Nigerian creators (10K–1M followers)

### Creator Website Use Cases
- **Media kit** — one-URL to send to brand managers: "Here's my profile, reach, and rate card"
- **Booking page** — "Work With Me" / "Collaborate" form so brands can initiate contact
- **Content portfolio** — showcase videos, posts, campaigns, testimonials from past partnerships
- **Link in bio replacement** — a richer alternative to Linktree; all social links + services in one place

### Brand Deal Economics (Nigerian Market)
- Nano (1K–10K followers): ₦20,000–₦80,000 per sponsored post
- Micro (10K–100K): ₦80,000–₦500,000 per sponsored post; product gifting + fee
- Mid-tier (100K–1M): ₦500,000–₦3,000,000 per campaign
- Top-tier (1M+): ₦3,000,000–₦15,000,000+ per deal
- Brand categories: FMCG (indomie, chi, peak milk), telcos (MTN, Airtel, Glo), fintech (Opay, Palmpay, Kuda), fashion (Zara, Ankara brands), food delivery, personal care

### Key Nigerian Creator Categories
- Comedy / skit makers: Lasisi Elenu, Broda Shaggi model — Instagram + YouTube
- Afrobeats promoters: music review, Amapiano, Afropop coverage
- Lifestyle / beauty / fashion: "naija slay", fashion haul, makeup tutorials
- Nollywood content: movie reviews, actor interviews, film BTS
- Finance / tech content: "how to make money in Nigeria" — very high engagement
- Food content: Naija recipe tutorials — "cook with me" format
- Motivational / business: thought leadership, entrepreneurship, real estate tips

---

## Section 2 — Audience & Customer Journey

### Primary Visitors
1. **Brand managers / marketing teams** — seeking influencer profiles, media kits, rate cards
2. **Event promoters** — booking creators for events, press nights, product launches
3. **Fellow creators** — seeking collaboration or referrals
4. **Fans** — discovering more about their favourite creator, buying merch, joining community

### Customer Journey on a Creator Site
1. Land via brand manager search or referral link ("here's my media kit")
2. First check: **Who is this person? What do they create?** (bio + content type)
3. **Numbers check**: follower counts, engagement stats, audience demographics — creators typically add these to their description field
4. **What do they offer?** — rates, packages, types of collaboration
5. Primary conversion: **"Work With Me" form** or **email** (brand deals are email-first)
6. Secondary: WhatsApp for quick initial contact

### Trust Factors for Brand Partnership
- Clear niche/content type
- Visible platform presence (website link / social handle)
- Past brand collaborations mentioned in bio or offerings
- Professional look of the website itself (polish = trust)
- Response time commitment ("I respond within 24 hours")

---

## Section 3 — Content Localization Notes

### Voice & Tone
- First-person but polished — between artisan (very casual) and corporate (too stiff)
- "I create", "I collaborate", "My audience" — personal but professional
- Creator economy vocabulary: "content creator", "brand collaboration", "sponsored content", "UGC", "media kit", "engagement rate", "organic reach"
- Nigeria-specific: "Afrobeats content", "Naija audience", "Lagos lifestyle", "Nigerian fashion"
- Section headings: "What I Create", "Work With Me", "My Portfolio", "About Me"
- CTA copy: "Let's Collaborate", "Work With Me", "Send a Brief", "Get My Media Kit"

### Nigerian Platform References
- "Follow me on": YouTube, Instagram, TikTok, Twitter/X, Spotify (podcast)
- The `ctx.data.website` field is the primary "find me online" link — often their YouTube channel or Instagram profile
- Offering names: "Sponsored Instagram Post", "YouTube Integration", "Brand Ambassador", "Product Review", "Event Appearance", "Podcast Ad Read", "TikTok Duet/Stitch"

### Currency
- ₦ for all pricing — creator rates are quoted in Naira for Nigerian brands
- International brands: rates sometimes quoted in USD but displayed in ₦ equivalent

---

## Section 4 — Design Direction

### Aesthetic — Polished Creator Brand
- Significantly more design-forward than restaurant or artisan templates
- The website *is* the portfolio — it must look good to convince brand managers
- Clean, minimal, confident — hero with bold name + content type label
- Warm accent colours work (most Naija creators use bold, rich palettes)
- Strong typographic hierarchy: large name, smaller descriptor, clear CTAs
- Uses CSS vars from white-label theming fully — this niche especially benefits from colour theming

### Layout
- Hero: full-width, centred — creator name (h1) + content type badge + tagline + CTA pair
- "Content Types" badges strip — quick read of what they create (derived from category + offerings names)
- Services/collaboration grid — cards with offer type + price (or "Rate on request")
- About: bio + "find me on" link + contact

### Image Art Direction
- Nigerian creator at work: YouTube studio in Lagos apartment, influencer at a brand event, Nollywood-aesthetic photo shoot, on-location at Lekki or VI
- **Avoid**: stock images of western YouTubers; generic "influencer" photography from non-African contexts

---

## Section 5 — Page-by-Page Content Plan

### Home (`/`)
1. Hero: name (h1) + content type label (from category) + tagline + [Let's Collaborate] + [View What I Offer]
2. Short bio excerpt (first 200 chars of description)
3. "What I Create" — offering cards (collaboration packages) with types and prices
4. Contact strip: email | social link (website) | WhatsApp

### About (`/about`)
1. "About Me" — full bio/description paragraph
2. Content type/niche badge
3. Locations, contact info, social/website link
4. "Work With Me" CTA

### Services (`/services`) — "What I Offer"
1. Full collaboration packages grid
2. Price-on-request fallback for null prices ("Rate on request — send a brief")
3. Bottom "Get in touch" CTA strip

### Contact (`/contact`) — "Work With Me"
1. "Work With Me" hero
2. Email CTA prominently (professional brand deals are email-first)
3. WhatsApp secondary
4. Collaboration enquiry form — includes "What type of collaboration?" field

---

## Section 6 — Technical Notes

### `ctx.data` Contract
| Page | Available in `ctx.data` |
|------|------------------------|
| home | `offerings[]`, `description`, `tagline` |
| about | `description`, `category`, `placeName`, `phone`, `website` |
| services | `offerings[]` |
| contact | `phone`, `email`, `placeName` |

### Key Design Choice: Email > WhatsApp hierarchy
Unlike restaurant (WhatsApp first) and artisan (WhatsApp float + inline), the creator template:
- Makes **email the primary conversion CTA** on contact page (brand deals are email/form-first)
- Keeps **WhatsApp secondary** — still present but not the hero CTA
- No floating WhatsApp button — would undermine the polished brand image expected by brand managers

### Social Link Display
`ctx.data.website` is used as the primary "find me online" link. The template displays it as a "Visit my channel / profile →" link without assuming what platform it is.

### CSS Namespace
`.cr-` — creator. Distinct from `.re-` (restaurant) and `.st-` (sole trader).

### `esc()` + `fmtKobo()` + `whatsappLink()` — same local pattern as previous templates

---

## Section 7 — Regulatory / Trust Notes

- **NBMC**: National Broadcasting Commission content code applies to creators distributing on broadcast platforms; not required to disclose on personal website
- **NCC**: Social media operators registration (SBO) — for platforms with 100K+ users, not individual creators
- **Copyright**: Nigerian Copyright Act — original content is auto-protected; voluntary registration available via NCC/NCC; not a website disclosure requirement
- **CAMA/CAC**: Individual creators are typically sole proprietors; CAC registration not mandatory for content creation
- **No mandatory web disclosures** for an individual creator website

---

## Section 8 — Governance / Platform Invariant Checks

- [x] T2 — TypeScript strict — all types explicit, no `any`
- [x] T3 — no DB queries; ctx.tenantId for contact form only
- [x] T4 — integer kobo; fmtKobo(); null price → "Rate on request"
- [x] P7 — CSS vars only; `#25D366` WhatsApp green exception
- [x] P9 — NGN-first pricing
- [x] P10 — mobile-first 375px; 44px targets; no CDN

---

## Section 9 — Africa-First Context

- **africaFirstNotes**: "Afrobeats, Nollywood, and Nigerian fashion creators have global audiences — Africa-first content has worldwide reach. Template applicable across African creator economies: Ghana (Highlife, Afropop), Kenya (Bongo Flava, digital entrepreneurs), South Africa (Amapiano, lifestyle). Brand deal structure identical across African markets."
- Nigerian creator economy is the most documented in Africa but the template works for any African creator market
- Media kit website model is globally understood — Africa-first language choices make it authentic

---

## Section 10 — Family Anchor Responsibilities

This template is the **NF-CRE-DIG family anchor** (VN-CRE-001). Variants:
1. `VN-CRE-002 photography` — Photography / Videography Studio — inherits portfolio layout; adds booking calendar intent, price-per-shoot emphasis
2. `VN-CRE-007 podcast-studio` — Podcast Studio / Audio Platform — inherits about + services; emphasises audio embed intent, episode catalogue
3. `VN-CRE-008 motivational-speaker` — Motivational Speaker — inherits hero + offerings; adds speaking topics, booking inquiry, event appearances emphasis

**Anchor Design Decisions Variants Must Inherit:**
- `.cr-` CSS namespace
- Email-first contact (not WhatsApp-first) on the contact page
- "Rate on request" fallback for null prices
- `esc()` + `fmtKobo()` + `whatsappLink()` local utilities (same pattern)
- Polished aesthetic — these are all professional/brand-facing templates
- `website` field as "find me online" primary link
