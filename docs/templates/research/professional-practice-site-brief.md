# Research Brief — P2-professional-practice-site

**Niche ID:** P2-professional-practice-site  
**Vertical:** professional (VN-PRO-001)  
**Family:** NF-PRO-LIC — Licensed Professionals | **Role:** ANCHOR (build before land-surveyor, professional-association)  
**Template Slug:** professional-practice-site  
**Milestone:** M8e — P1-Original  
**Status:** RESEARCH_SYNTHESIZED  
**Researched:** 2026-04-25  
**Agent:** replit-agent-2026-04-25-session-B  

---

## Section 1 — Nigeria Market Context

### Scale & Landscape
- Nigeria has 175,000+ practising lawyers (NBA, 2024); second largest bar association in the Commonwealth
- ~120,000 registered physicians (NMA); 16 doctors per 100,000 population — high-demand, low-supply
- ~45,000 ICAN-certified accountants; Big Four + mid-tier firms + sole-practitioner CPAs
- ~15,000 TOPREC-licensed estate valuers and surveyors (SURCON, TOPREC)
- ~8,000 registered architects (NIA); COREN-registered engineers ~70,000
- Individual professional website market largely untapped — most still use PDF CVs or LinkedIn

### Why a Professional Needs a Website
1. **Credential verification** — clients Google before calling; a website with professional body details creates instant trust
2. **Specialisation display** — "I focus on corporate M&A" or "I handle only wills and estate matters" reduces wrong-fit enquiries
3. **Referral destination** — when a colleague refers, the website is the first touchpoint
4. **Consultation booking channel** — WhatsApp is the dominant professional booking tool in Nigeria; website embeds the link
5. **Digital media kit** — for speaking, media appearances, expert commentary

### Key Nigerian Professional Licensing Bodies
| Body | Profession | Acronym on site |
|------|-----------|----------------|
| Nigerian Bar Association | Lawyers | NBA |
| Nigerian Medical Association | Doctors | NMA |
| Medical and Dental Council of Nigeria | Doctors (licensing) | MDCN |
| Institute of Chartered Accountants of Nigeria | Accountants | ICAN |
| Association of National Accountants of Nigeria | Accountants | ANAN |
| Nigerian Institute of Architects | Architects | NIA |
| Council for the Regulation of Engineering in Nigeria | Engineers | COREN |
| Surveyors Council of Nigeria | Surveyors | SURCON |
| Estate Surveyors and Valuers Registration Board of Nigeria | Estate Valuers | ESVARBON |
| Nigerian Institute of Town Planners | Town Planners | NITP |

### Consultation Booking Economics
- Lawyers: ₦10,000–₦500,000 consultation fee; complex matters retainer-based
- Doctors: ₦5,000–₦50,000 consultation (specialist > GP); telemedicine from ₦3,000
- Accountants: ₦25,000–₦200,000 per engagement; audit from ₦150,000
- Architects: ₦50,000–₦500,000 design brief fee; % of project cost (typically 5–10%)
- All professions: walk-in + WhatsApp booking dominant; online form supplementary

---

## Section 2 — Audience & Customer Journey

### Primary Visitors
1. **Prospective clients** — Googling or referred; verifying credentials before calling
2. **Peer professionals** — seeking referral partnerships or expert witnesses
3. **Journalists/media** — seeking expert commentary on professional matters
4. **Employers/firms** — checking credentials for potential hire or partnership

### Customer Journey
1. Referral or Google search → land on site
2. **Credential check first** — is this person actually qualified? Body membership, year of call/certification
3. **Specialisation check** — do they handle my type of matter?
4. **Contact decision** — WhatsApp (fast, informal start) or phone; form is secondary
5. Conversion: consultation booked

### Trust Factors — What Clients Look For
- Professional body name + membership number visible
- Year of call/certification (seniority signal)
- Specific areas of practice — not vague ("I handle legal matters")
- Office/practice location
- Testimonials or notable cases (not always present; privacy constraints)
- Professional portrait, not casual photo

---

## Section 3 — Content Localization Notes

### Voice & Tone
- **Formal** — the most formal register of all templates implemented so far
- Third-person biographical in About ("Barr. Adaeze Okafor was called to the bar in 2010...")
- Professional titles used correctly: Barr. (Barrister), Dr. (Doctor/PhD), Engr. (Engineer), Arch. (Architect), Surv. (Surveyor), Mr./Mrs. for accountants typically
- Nigerian-specific professional vocabulary:
  - Law: "Called to the Nigerian Bar", "Chambers", "Senior Advocate of Nigeria (SAN)", "Legal Practitioner"
  - Medicine: "Fellow of the West African College of Physicians (FWACP)", "Consultant", "Registrar"
  - Accounting: "Fellow of ICAN", "Chartered Accountant", "Auditor", "Tax Consultant"
  - Architecture: "Registered Architect", "NIA member", "Project Brief"
  - Engineering: "COREN-registered Engineer"

### Section Labels
- "Practice Areas" for lawyers; "Areas of Specialisation" for doctors; "Our Services" generic
- Template uses "Areas of Practice" as the default heading (covers law and medicine well)
- "Book a Consultation" as the primary CTA across all professions
- "Schedule an Appointment" as alternate phrasing for medical

### Currency
- ₦ for all fees — professional fees in Nigeria are in Naira
- "Fee on enquiry" for null prices (professional context; more formal than "Rate on request")
- Many professionals prefer not to show fees publicly — "Fee on enquiry" fallback is critical

---

## Section 4 — Design Direction

### Aesthetic — Formal Credentials-First
- Most conservative/formal template so far — suitable for court-facing and hospital-facing professionals
- Clean, institutional colour scheme — deep navy, forest green, or charcoal with white
- Strong credential hierarchy: name → professional title → body badge → specialisations
- Professional portrait treated with authority — circular or full-bleed above-fold
- Typography: serif or contemporary sans-serif at large scale; high contrast text on white background
- Credential badge is a design element — not just text; styled as a formal badge component

### Layout
- Hero: name (H1) + professional title/designation (from tagline/category) + credential badge component + dual CTA (WhatsApp primary + Phone secondary)
- Practice areas grid — cards listing specialisation with fee or "Fee on enquiry"
- About section strip on home — short bio excerpt + "Learn More" link
- No floating button — professional decorum; no persistent visual interruption

### WhatsApp Hierarchy
- WhatsApp **primary CTA** (back to WhatsApp-first for this vertical, unlike creator)
- Consultation booking in Nigeria's professional sector is overwhelmingly WhatsApp/phone initiated
- No floating button (professional image constraint), but WhatsApp appears in hero CTA + contact strip + contact page

---

## Section 5 — Page-by-Page Content Plan

### Home (`/`)
1. Hero: Name (h1) + professional title (from tagline/category) + credential badge + [Book on WhatsApp] + [Call Now] CTAs
2. Short bio excerpt (first ~200 chars of description)
3. Practice Areas grid (offerings as practice area cards with fee/fee-on-enquiry)
4. Contact strip: phone | location | WhatsApp

### About (`/about`)
1. Professional portrait + name + professional title + credential badge
2. Full bio — formal third-person or first-person (description field)
3. Detail list: category/profession, location, website/professional profile, phone
4. "Book a Consultation" CTA

### Services (`/services`) — "Areas of Practice"
1. Full practice area / service grid
2. "Fee on enquiry" fallback for null prices
3. Bottom CTA: "Book a Consultation on WhatsApp"

### Contact (`/contact`) — "Book a Consultation"
1. Hero: "Book a Consultation"
2. WhatsApp primary — large WhatsApp CTA with professional pre-fill message
3. Phone secondary
4. Email tertiary
5. Formal enquiry form (nature of matter, name, contact)

---

## Section 6 — Technical Notes

### `ctx.data` Contract
| Page | Available in `ctx.data` |
|------|------------------------|
| home | `offerings[]`, `description`, `tagline` |
| about | `description`, `category`, `placeName`, `phone`, `website` |
| services | `offerings[]` |
| contact | `phone`, `email`, `placeName` |

### Key Design Choice: WhatsApp-Primary (Back to WhatsApp-First)
Unlike creator (email-first), the professional template is **WhatsApp-primary**:
- Nigerian professionals book consultations via WhatsApp before anything else
- WhatsApp pre-fill message: "Hello [Name], I would like to book a consultation regarding [matter type]"
- No floating button (decorum), but WhatsApp CTA appears in hero + contact strip + contact page prominently

### Category-Derived Vocabulary
`ctx.data.category` on the About page drives vocabulary:
- "Lawyer" / "Barrister" / "Solicitor" / "Legal Practitioner" → practice area language, "Chambers"
- "Doctor" / "Physician" / "Consultant" → "Clinic", "Appointment", "Specialisation"
- "Accountant" / "Auditor" → "Engagement", "Service"
- Fallback: generic "Practice Areas" + "Consultation"

The home page doesn't receive `category` in `ctx.data` — vocabulary defaults to generic professional language.

### Credential Badge
Displayed in hero and about using `ctx.data.category` (About page). On Home, tagline typically carries the credential string (e.g. "Barrister & Solicitor | NBA Member | Call to Bar: 2010").

### CSS Namespace
`.pr-` — professional. Distinct from `.re-`, `.st-`, `.cr-`.

### Price Fallback
`null` priceKobo → **"Fee on enquiry"** (more formal than "Rate on request" used by creator).

---

## Section 7 — Regulatory / Trust Notes

- **NBA**: Nigerian Bar Association — every practising lawyer must be registered; year of call is displayed
- **NMA**: Nigerian Medical Association — every practising doctor is registered; MDCN licence number
- **ICAN / ANAN**: Accountancy bodies — fellowship or membership grade
- **NIA**: Nigerian Institute of Architects — registration number
- **COREN**: Council for the Regulation of Engineering — registration number
- **SURCON / ESVARBON**: Surveying / Estate valuation regulatory bodies
- **Legal Ethics (RPC)**: Rules of Professional Conduct bar Nigerian lawyers from advertising specific services in certain ways; template displays factual practice information, which is compliant
- **Medical Ethics**: MDCN code bars specific patient testimonials and certain promotional claims; "Areas of Specialisation" is compliant
- **CAC**: Many professionals operate as sole proprietors; some register as professional partnerships or companies — template is agnostic

---

## Section 8 — Governance / Platform Invariant Checks

- [x] T2 — TypeScript strict; no `any`
- [x] T3 — no DB queries; ctx.tenantId for contact form only
- [x] T4 — integer kobo; fmtKobo(); null → "Fee on enquiry"
- [x] P7 — CSS vars only; #25D366 WhatsApp green exception
- [x] P9 — NGN-first pricing
- [x] P10 — mobile-first 375px; 44px targets; no CDN

---

## Section 9 — Africa-First Context

- **africaFirstNotes**: "Professional licensing bodies (NBA, NMA, ICAN) are pan-African recognition signals. Template is directly applicable to Ghana (GBA, GMA, ICAG), Kenya (LSK, KMA, ICPAK), South Africa (LSSA, HPCSA, SAICA), East Africa broadly."
- The formal credential-display pattern is universal across African Commonwealth legal systems
- WhatsApp consultation booking is pan-African — same pattern in Lagos, Nairobi, Accra, Kampala

---

## Section 10 — Family Anchor Responsibilities

This template is the **NF-PRO-LIC family anchor** (VN-PRO-001). Variants:
1. `VN-CST-009 land-surveyor` — Land Surveyor / Registry Agent — inherits credential badge + formal aesthetic; adds SURCON/ESVARBON-specific vocabulary and property/land-related service terminology
2. `VN-CIV-007 professional-association` — Professional Association (NBA/NMA/ICAN branches) — org entity; inherits formal aesthetic + credential emphasis; adapts for collective membership, events, and governance functions

**Anchor Design Decisions Variants Must Inherit:**
- `.pr-` CSS namespace
- WhatsApp-primary consultation CTAs (no floating button)
- "Fee on enquiry" fallback for null prices
- Credential badge component pattern (`.pr-credential-badge`)
- Formal register and third-person bio pattern
- `esc()` + `fmtKobo()` + `whatsappLink()` local utilities
