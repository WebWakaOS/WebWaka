# Research Brief — P2-church-faith-community

**Niche ID:** P2-church-faith-community  
**Vertical:** church (VN-CIV-001)  
**Family:** NF-CIV-REL — Civic Religious | **Role:** ANCHOR (build before mosque, ministry-mission)  
**Template Slug:** church-faith-community  
**Milestone:** M8d — P1-Original (CRITICAL priority — overdue)  
**Status:** RESEARCH_SYNTHESIZED  
**Researched:** 2026-04-25  
**Agent:** replit-agent-2026-04-25-session-B  

---

## Section 1 — Nigeria Market Context

### Scale & Landscape
- Nigeria: 55%+ Christian population (~115M+ believers); largest in Africa by count
- 300,000+ registered churches per Christian Association of Nigeria (CAN)
- Denominations: Pentecostal (dominant; 40%+ of Christians), Anglican, Catholic, Baptist, Methodist, ECWA, Deeper Life, MFM, RCCG, Foursquare, Living Faith (Winners), Salvation Army
- Megachurches: RCCG (Redemption Camp), Winners Chapel, MFM, Daystar, House on the Rock, Covenant Christian Centre
- 30,000+ Pentecostal assemblies in Lagos alone
- Church giving: estimated ₦2–5 trillion annually circulating through Nigerian churches
- Online giving surge post-2020: Paystack/Flutterwave integration, church apps, live giving during streams

### Digital Presence Gap
- Most Nigerian churches have Facebook pages but no website
- A website serves as the authoritative "hub" linking all digital presence
- Key pain point: potential members search for "church near me" + denomination — a website wins this search
- Church websites reduce pressure on WhatsApp broadcast groups for service time queries

### Key Use Cases
1. **Service time discovery** — #1 use case; new residents or visitors want Sunday times immediately
2. **Location/branch finder** — especially for large denominations with multiple branches
3. **Online giving** — growing rapidly; members want to give even when travelling
4. **Sermon access** — links to YouTube/podcast; drives return visits to site
5. **Ministry directory** — "what do you have for my age group?"
6. **Visitor welcome** — plan a first visit; WhatsApp a pastor

### Church Website Economics
- No direct transaction on most church sites (giving is handled by dedicated platforms)
- "Offerings" in template context = ministries/programs/services, not paid products
- Some churches charge for conferences, retreats, Christian education (e.g. Bible school fees)
- Those are the only cases where `priceKobo` on an offering is non-null

---

## Section 2 — Audience & Customer Journey

### Primary Visitors
1. **Prospective members** — new to area, looking for a church home; want service times + location
2. **Existing members** — checking service times, event info, giving
3. **Family/friends of members** — invited; researching before attending
4. **Media/journalists** — verifying church existence, contacting leadership
5. **Regulators/CAC** — IT-registration number lookup (trust)

### Customer Journey — New Visitor
1. Search ("church near me / Pentecostal church in Lekki") → site
2. **Service times** — first thing they need (Sunday: 7am, 9am, 11am?)
3. **Location** — Google Maps link or address
4. **Is this my kind of church?** — denomination badge, tagline, about blurb
5. **Plan a visit** — WhatsApp the visitor/welcome team, or fill enquiry form
6. **Online giving** — link if they become members

### Trust Factors
- Denomination clearly labelled (Pentecostal vs Anglican vs Catholic matters a lot to Nigerians)
- IT registration number visible (Incorporated Trustees — signals legitimacy)
- Pastor/leadership name (G.O., Senior Pastor) — Nigerian church culture is pastor-centric
- Physical address + Google Maps directional link
- Active congregation feel — ministry photos, service count

---

## Section 3 — Content Localization Notes

### Voice & Tone
- **Warm, welcoming, hopeful** — the most community-forward template yet
- Classic Nigerian church greeting: "You are welcome" / "Welcome home"
- "We" language throughout: "We believe...", "Join us...", "Our family..."
- Aspirational: "A house of prayer for all nations", "Building lives, transforming communities"
- CTA copy: "Plan a Visit", "Join Us This Sunday", "WhatsApp the Welcome Team", "Give Online"

### Denomination-Specific Vocabulary
- **Pentecostal**: "Holy Ghost service", "Power night", "General Overseer (G.O.)", "Headquarters (HQ)"
- **Anglican**: "Vicar", "Rector", "Diocese", "Holy Communion"
- **Catholic**: "Mass", "Parish Priest", "Father", "Diocese"
- **Baptist**: "Pastor", "Deacon", "Fellowship"
- **Generic/default**: "Service", "Pastor", "Congregation", "Fellowship"
- Template uses generic defaults; `category` field + `tagline` allow denomination to be expressed

### Key Label Choices
- "Service Times" not "Mass Schedule" (default; unless tagline/category says Catholic)
- "Giving" not "Donations" (Pentecostal context is dominant)
- "Pastor" or "G.O." as leadership title (expressed through displayName or description)
- "Branch" for multi-location churches
- "Ministries" for programmes (Children's Ministry, Youth Ministry, Men's Fellowship, Women's Fellowship)
- "Plan a Visit" as the primary action CTA

### Currency
- ₦ only for paid conferences/events (unusual)
- Most ministries are free — no price display for null priceKobo
- Free services: show "Free to attend" or simply no price at all

---

## Section 4 — Design Direction

### Aesthetic — Community Warmth + Spiritual Hope
- Most warm, community-oriented aesthetic of all templates implemented
- Deep purples, warm golds, or rich greens — reflect Nigerian church visual culture
- Large, inviting hero: church name + denomination + welcoming tagline
- **Service times are a design element** — displayed as a dedicated prominent block, not buried in text
- Ministry cards use icons/labels rather than prices (community, not commerce)
- "Give" button uses a distinct colour (secondary accent) — present but not dominant

### Layout
- Hero: church name + denomination badge + welcoming tagline + [Plan a Visit] + [Give] CTAs
- **Service Times block** — prominent dedicated section with day/time grid from offerings
- Ministry highlights grid (from offerings) on home page
- About strip: vision/mission excerpt + "Learn More →"
- Contact strip: address, phone, WhatsApp

### WhatsApp Hierarchy
- WhatsApp CTA label: **"WhatsApp the Welcome Team"** or **"Speak With a Pastor"**
- Appears in hero CTAs + contact page — same prominence as professional template
- No floating button (organisational context)

---

## Section 5 — Page-by-Page Content Plan

### Home (`/`)
1. Hero: Church name + denomination badge + tagline + [Plan a Visit] + [Give Online] CTAs
2. Service times block (offerings rendered as a "join us" schedule strip)
3. Ministry highlights — top 4 offering cards (ministry name + description, no price unless event)
4. About excerpt + "About Us →"
5. Contact strip: address, phone, WhatsApp Welcome Team

### About (`/about`)
1. Church logo + name + denomination badge
2. Full description — vision, mission, history
3. Detail list: denomination/category, location, phone, website/giving link, IT registration in tagline
4. "Plan a Visit" + WhatsApp CTAs

### Services (`/services`) — "Our Ministries"
1. "Our Ministries & Programmes" title
2. Full offerings grid — ministry cards (no price for free; price only for paid events/conferences)
3. "Free to attend" tag for null priceKobo
4. Bottom CTA: "Plan a Visit" + WhatsApp

### Contact (`/contact`) — "Plan a Visit"
1. "Plan a Visit" hero
2. Service times summary (from location/description context)
3. Address (placeName), phone, email
4. WhatsApp: "WhatsApp the Welcome Team"
5. Visitor enquiry form: name, phone, "How can we help you plan your visit?"

---

## Section 6 — Technical Notes

### `ctx.data` Contract
| Page | Available in `ctx.data` |
|------|------------------------|
| home | `offerings[]`, `description`, `tagline` |
| about | `description`, `category`, `placeName`, `phone`, `website` |
| services | `offerings[]` |
| contact | `phone`, `email`, `placeName` |

### Offerings Array Semantic for Church Template
Church `offerings[]` items represent ministries/services/programmes, not products:
- `name`: Ministry or service name ("Sunday Worship Service", "Youth Church", "Bible Study", "Children's Ministry")
- `description`: Day/time or description ("Every Sunday at 8AM, 10AM & 12PM")
- `priceKobo`: `null` for all free services/ministries; non-null only for conferences/events with registration fees

**Rendering rule**: if `priceKobo === null` → "Free to attend" tag (not "Fee on enquiry" — churches differ from professional practices). If `priceKobo > 0` → show ₦ amount as "Entry/Registration: ₦X".

### IT Registration Display
Displayed as part of the credential/trust strip — typically expressed through `tagline` ("IT/0000012. Pentecostal. Est. 2002") or `category` ("Pentecostal — Incorporated Trustees"). The template renders the tagline as-is in the hero without assuming its structure.

### CSS Namespace
`.ch-` — church. Distinct from `.re-`, `.st-`, `.cr-`, `.pr-`.

---

## Section 7 — Regulatory / Trust Notes

- **CAC/IT Registration**: Incorporated Trustees (IT-XXXXXXXX) — required for any unincorporated association operating as a church; template encourages display via tagline/category
- **EFCC**: Some megachurches have faced scrutiny; IT registration + financial transparency builds trust; template encourages "giving" transparency (not mandatory)
- **CAN (Christian Association of Nigeria)**: National umbrella body; affiliation is a trust signal
- **RCCG/Winners/MFM affiliation**: Denomination/mother-church affiliation is a major trust signal for Nigerians considering which church to attend
- **No financial regulations** specific to church websites — content is informational + community-building

---

## Section 8 — Governance / Platform Invariant Checks

- [x] T2 — TypeScript strict; no `any`
- [x] T3 — no DB queries; ctx.tenantId for contact form only
- [x] T4 — integer kobo; fmtKobo(); null → "Free to attend" (church-specific, not "Fee on enquiry")
- [x] P7 — CSS vars only; #25D366 WhatsApp green exception
- [x] P9 — NGN-first for any paid events
- [x] P10 — mobile-first 375px; 44px targets; no CDN

---

## Section 9 — Africa-First Context

- **africaFirstNotes**: "Nigerian Pentecostal church model is Africa's most developed and most exported — RCCG, Winners Chapel, MFM all have pan-African and global presence. Template applicable to Ghana (PIWC, Lighthouse Chapel), Kenya (Mavuno, CITAM, Nairobi Chapel), South Africa (Grace Bible Church, Rhema, Living Word), DR Congo, Uganda, Zimbabwe."
- The denomination-neutral default (generic Pentecostal vocabulary) works across all Anglophone African church contexts
- Service times display pattern is universal; WhatsApp visitor follow-up is pan-African

---

## Section 10 — Family Anchor Responsibilities

This template is the **NF-CIV-REL family anchor** (VN-CIV-001). Variants:
1. `VN-CIV-004 mosque` — Mosque / Islamic Centre — inherits service times block + community-first layout; adapts vocabulary (Jumu'ah Friday prayer, Imam, Salat times, Zakat for giving)
2. `VN-CIV-014 ministry-mission` — Ministry / Apostolic Mission / Outreach — inherits hero + ministries; emphasises outreach programmes, mission field, prayer network

**Anchor Design Decisions Variants Must Inherit:**
- `.ch-` CSS namespace
- Service times / gathering times as a prominent visual block
- Offerings = programmes/services (not products; "Free to attend" for null price)
- Community-first "Plan a Visit" CTA pattern (adapted per context)
- WhatsApp = "speak with us" / "visitor follow-up" (not order/consult)
- No floating WhatsApp button (organisational context)
- `esc()` + `fmtKobo()` + `whatsappLink()` local utilities
