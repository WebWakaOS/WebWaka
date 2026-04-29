# Research Brief — P2-clinic-primary-care

**Niche ID:** P2-clinic-primary-care  
**Vertical:** clinic (VN-HLT-001)  
**Family:** Standalone — P1 anchor for health vertical (no NF family variants)  
**Template Slug:** clinic-primary-care  
**Milestone:** M8e — P1-Original (CRITICAL priority)  
**Status:** RESEARCH_SYNTHESIZED  
**Researched:** 2026-04-25  
**Agent:** replit-agent-2026-04-25-session-B  

---

## Section 1 — Nigeria Market Context

### Scale & Landscape
- Nigeria: ~40,000 registered healthcare facilities; ~16,000 are primary care clinics
- Doctor-to-population ratio: ~4 per 10,000 (WHO recommends 10 per 10,000) — severe shortage drives private clinic proliferation
- Private sector: 60%+ of healthcare provision in Nigeria; most are small clinics or polyclinics
- MDCN (Medical and Dental Council of Nigeria): every practising doctor and clinic must be registered; licence number is a critical trust signal
- NAFDAC: regulates drugs, medical devices, and diagnostic labs within clinics
- HMO market: 30+ registered HMOs (AXA Mansard Health, Hygeia, Total Health Trust, Leadway Health, etc.); HMO acceptance is a major patient acquisition signal
- NHIS (National Health Insurance Scheme): federal scheme; NHIS accreditation attracts civil servants and formal sector employees

### Common Presenting Conditions (Nigeria-First)
- Malaria (most common; rapid diagnostic test + treatment)
- Hypertension (1 in 3 Nigerian adults; BP monitoring + drugs)
- Typhoid fever (Widal test + Ciprofloxacin)
- Diabetes mellitus (FBS + HbA1c + insulin management)
- Antenatal care (ANC) — very high value service; 40+ million women of reproductive age
- Respiratory infections (pneumonia, bronchitis, flu)
- Skin conditions (fungal infections, eczema — common in tropical climate)
- Malnutrition / paediatric conditions (under-5s)

### Clinic Types in Nigeria
1. **GP/General Practice** — one to three doctors; consultation + basic lab + pharmacy
2. **Polyclinic** — 3+ departments (general, paediatric, dental, lab, pharmacy)
3. **Maternity clinic** — ANC, delivery suite, postnatal
4. **Diagnostic centre** — lab, scan (ultrasound, X-ray), no ward
5. **Specialist clinic** — cardiology, orthopaedics, dermatology, ophthalmology

The `clinic-primary-care` template targets types 1–3 (general practice, polyclinic, maternity). Specialist clinics will use `NF-HLT-SPE`.

### Patient Acquisition Economics
- HMO referral: HMO contracted patients booked via HMO app/portal — clinic lists HMO partnerships
- Walk-in: majority of Nigerian clinic patients; no appointment — walk in and wait
- WhatsApp appointment: growing fast; allows patients to book slot and reduce wait
- Google Maps: "clinic near me" — most patients discover via local search + Maps listing
- Word of mouth: dominant in Nigeria for healthcare; a website reinforces referrals

---

## Section 2 — Audience & Customer Journey

### Primary Visitors
1. **Patients** — seeking a clinic for general consultation, specific service (antenatal, lab), or emergency
2. **HMO holders** — checking if clinic accepts their specific HMO before visiting
3. **Employers** — checking if clinic qualifies as staff healthcare provider
4. **Regulators** — MDCN, NAFDAC verification
5. **Referrals** — patients sent by another clinic or pharmacist

### Customer Journey
1. Google "clinic near me / polyclinic in Lagos / maternity clinic Abuja" → Maps or organic
2. **Does my HMO work here?** (first question for insured patients)
3. **What do they treat?** (services/conditions)
4. **Hours** — are they open now / on weekends?
5. **How to get there** (address)
6. **Book** — WhatsApp appointment or just walk in

### Trust Factors
- MDCN licence number displayed (verifiable on MDCN website)
- HMO acceptance list (specific names: AXA, Hygeia, Total Health Trust, etc.)
- NHIS accreditation badge
- Doctor names and qualifications (MBBS, FWACP, etc.)
- Opening hours clearly shown
- Physical address + Google Maps link

---

## Section 3 — Content Localization Notes

### Voice & Tone
- **Professional + warm + reassuring** — between formal professional template and community church template
- "Your health is our priority" — standard Nigerian clinic ethos
- "We are here for you" — reassuring, not clinical-cold
- Third-person for clinic description; first-person for patient-facing CTAs ("Book your appointment")
- Nigerian health vocabulary:
  - "Consultation" (not "appointment" for the service; "Book an appointment" for the CTA)
  - "HMO Accepted" — very important patient-facing phrase
  - "Walk-ins welcome" — reassures patients who can't or won't book ahead
  - "Antenatal care" / "ANC" — high-value maternity service
  - "Lab investigations" / "Diagnostics" — not "tests" (more formal)
  - "NHIS accredited" — for civil servants / formal sector

### Section Labels
- "Our Services" — covers consultation types, lab, pharmacy, antenatal
- "Book an Appointment" — primary CTA for contact page
- "Accepting New Patients" — welcoming phrase in hero
- Tagline examples: "Your trusted family healthcare provider | MDCN Licensed | HMO Accepted"

### Currency
- ₦ for consultation fees and service prices
- "Fee on enquiry" for null prices (professional/formal medical context — consistent with `.pr-` pattern)
- Many clinics prefer not to list fees publicly; the fallback is important

---

## Section 4 — Design Direction

### Aesthetic — Clinical Trust + Warmth
- Clean, medical aesthetic — whites, light blues, soft greens
- MDCN/HMO trust badge strip beneath the hero — distinct "trust row" element unique to this template
- Service cards with medical icons or category labels
- Opening hours prominent — displayed as a structured block (like church service times)
- Doctor/staff section optional but common: name + qualification + specialisation
- "Walk-ins welcome" tag on service cards where appropriate

### Layout
- Hero: clinic name + tagline + WhatsApp "Book Appointment" + Walk-in note
- Trust strip: HMO accepted | NHIS accredited | MDCN licensed (from tagline/description context)
- Services grid: treatment/service cards (consultation, lab, pharmacy, antenatal, etc.)
- Contact strip: address, phone, hours, WhatsApp

### WhatsApp Hierarchy
- **WhatsApp-primary**: "Book an Appointment on WhatsApp" — consistent with professional template
- Pre-fill message: "Hello [Clinic Name], I would like to book an appointment for [describe condition/service]."
- Walk-in option displayed as secondary — not all patients book ahead

---

## Section 5 — Page-by-Page Content Plan

### Home (`/`)
1. Hero: Clinic name + tagline + [Book Appointment on WhatsApp] + [Call Now]
2. Trust strip: HMO | NHIS | MDCN (derived from tagline/description — template renders tagline verbatim)
3. Services grid: top 6 services from offerings
4. About excerpt + "Learn More →"
5. Contact strip: address | hours | phone

### About (`/about`)
1. Clinic logo + name + category badge (e.g. "General Clinic", "Maternity Clinic")
2. Full description — clinic story, team, specialisation
3. Detail list: category, location, phone, website/patient portal
4. Book Appointment + WhatsApp CTAs

### Services (`/services`) — "Our Services"
1. "Our Services" title + brief intro
2. Full service cards — medical service name, description, fee or "Fee on enquiry"
3. "Walk-ins welcome" or "By appointment" as service meta tag
4. Bottom CTA: "Book an Appointment on WhatsApp"

### Contact (`/contact`) — "Book an Appointment"
1. "Book an Appointment" hero
2. WhatsApp primary block: "Book on WhatsApp"
3. Phone + address + email
4. Walk-in note: "Walk-ins also welcome during opening hours"
5. Patient enquiry form: name, phone, "What is the nature of your visit / condition?"

---

## Section 6 — Technical Notes

### `ctx.data` Contract
| Page | Available in `ctx.data` |
|------|------------------------|
| home | `offerings[]`, `description`, `tagline` |
| about | `description`, `category`, `placeName`, `phone`, `website` |
| services | `offerings[]` |
| contact | `phone`, `email`, `placeName` |

### Offerings Semantic for Clinic Template
`offerings[]` = medical services/departments:
- `name`: Service name ("General Consultation", "Antenatal Care", "Lab Investigations", "Pharmacy", "Paediatrics")
- `description`: Details ("Malaria, typhoid, hypertension, diabetes management")
- `priceKobo`: Consultation fee in kobo, or `null` for fee-on-enquiry

**Rendering rule**: null priceKobo → "Fee on enquiry" (formal medical = professional context).

### Trust Badge Strip
Rendered from `tagline` — the clinic expresses "HMO Accepted | NHIS Accredited | MDCN Licensed" through their tagline field. Template renders tagline verbatim in the hero as a trust/designation line, consistent with professional template pattern.

### CSS Namespace
`.cl-` — clinic. Distinct from `.re-`, `.st-`, `.cr-`, `.pr-`, `.ch-`.

---

## Section 7 — Regulatory / Trust Notes

- **MDCN**: Medical and Dental Council of Nigeria — every doctor and clinic must be registered; licence number mandatory; verifiable at mdcn.gov.ng
- **NAFDAC**: National Agency for Food and Drug Administration and Control — regulates pharmacy and diagnostic lab operations within clinics
- **CAC**: Clinics with 2+ doctors often register as a company (RC number); sole practitioners may operate as sole proprietor
- **HMO regulation**: NAICOM (National Insurance Commission) regulates HMOs — clinics list HMO partnerships, not their own licence; no regulatory disclosure needed on website
- **NHIS**: National Health Insurance Scheme — accreditation by NHIA (formerly NHIS); clinics display "NHIS Accredited" to attract federal civil servants
- **Medical Ethics (MDCN Code)**: prohibits false claims about qualifications or treatments; template displays factual services and credentials — compliant
- **HIPAA equivalent**: Nigeria has no data protection regulation specifically for medical records on websites; the NDPR (Nigeria Data Protection Regulation) 2019 applies to personal data collected via forms

---

## Section 8 — Governance / Platform Invariant Checks

- [x] T2 — TypeScript strict; no `any`
- [x] T3 — no DB queries; ctx.tenantId for contact form only
- [x] T4 — integer kobo; fmtKobo(); null → "Fee on enquiry"
- [x] P7 — CSS vars only; #25D366 WhatsApp exception
- [x] P9 — NGN-first pricing
- [x] P10 — mobile-first 375px; 44px targets; no CDN

---

## Section 9 — Africa-First Context

- **africaFirstNotes**: "Primary care access patterns common across West Africa: malaria, typhoid, hypertension are universal presenting conditions. Template applicable to Ghana (GHMC licensed), Kenya (Kenya Medical Board), Senegal (Ordre des Médecins), South Africa (HPCSA). HMO/NHIS model parallels NHIF (Kenya), NHIA (Ghana), CSPS system (Burkina Faso). WhatsApp appointment booking is pan-African."
- The tropical disease mention (malaria, typhoid) is accurate and resonant across West and Central Africa
- MDCN licence badge concept maps to all Commonwealth African medical councils

---

## Section 10 — Standalone Notes

This template is **standalone** (not anchoring a formal NF family). As "P1 anchor for health vertical":
- The `.cl-` CSS namespace, WhatsApp-primary appointment pattern, and service-as-treatment semantics should be referenced when building `NF-HLT-SPE` variants (dental-clinic, optician, vet-clinic)
- "Fee on enquiry" fallback (consistent with professional template) should be standard across all health templates
- Trust badge strip pattern (MDCN/HMO derived from tagline) is a reusable design concept for health vertical
- The pharmacy template (`NF-PHA anchor`) will follow similar trust signal structure (NAFDAC/PCN instead of MDCN/HMO)
