# Driving School — Nigeria-First Research Brief

**Niche ID:** P2-driving-school-training
**Vertical slug:** driving-school
**Research date:** 2026-04-25
**Agent:** replit-agent-2026-04-25-session-C

## 1. Nigerian Market Context
Driving schools are licensed by FRSC (Federal Road Safety Corps) — the primary regulatory body. Nigeria has an estimated 2,000+ registered driving schools. Market driven by: new drivers (young Nigerians getting first licence), licence renewal, defensive driving courses (for corporate clients), and truck/commercial vehicle training. FRSC registration (`frscRegistration`) is the non-negotiable trust badge. CAC registration (`cacRc`) is secondary. Pricing: car driving (5-10 lessons) ₦30,000–₦80,000; truck/commercial ₦80,000–₦200,000; motorcycle ₦15,000–₦30,000. Process: theory test → practical test → FRSC road test → licence issuance. Nigerian customers want to know: is the school FRSC registered? Do they help with the FRSC test? Do they have cars in good condition?

## 2. Trust Signals
- FRSC registration number (`frscRegistration`) — PRIMARY trust signal
- CAC RC number (`cacRc`)
- Fleet condition ("Modern, well-maintained training vehicles")
- Instructor qualifications (years of experience, FRSC certified)
- Pass rate ("95% FRSC test pass rate on first attempt")
- Testimonials from Nigerian graduates (name, course type)
- NYSC participants welcome (corporate discount)

## 3. Key CTAs
- Primary: "Enroll Now via WhatsApp"
- Secondary: "View Course Fees"

## 4. Course Types and Nigerian Context
- `car` — most common; sedan/saloon for FRSC licence
- `truck` — commercial vehicle; lorries, buses, tankers
- `motorcycle` — okada licence; less common as formal course
- Corporate packages: defensive driving for company staff

## 5. Website Structure
- Home: hero + FRSC badge + course types + fee summary + WhatsApp enrollment CTA
- About: school history, FRSC registration, instructor profiles, fleet photos
- Services: all courses with fees in NGN, duration in lessons, what's included
- Contact: WhatsApp enrollment + address + hours

## 6. Platform Invariants
- T4: all fees in kobo integers
- P13: student_ref_id is opaque; no student names in template
- P2: NGN fees, FRSC trust badge, Nigerian driver license process
- CSS namespace: .ds-
