# Training Institute / Vocational School — Nigeria-First Research Brief

**Niche ID:** P2-training-institute-vocational
**Vertical slug:** training-institute
**Research date:** 2026-04-25
**Agent:** replit-agent-2026-04-25-session-C

## 1. Nigerian Market Context
Vocational training institutes are regulated by NBTE (National Board for Technical Education), the primary accreditation body. NABTEB is the qualifying examination board for vocational certificates. Nigeria has 800+ accredited technical and vocational institutions. Market is driven by: youth unemployment (Nigeria's 40%+ youth unemployment drives demand for practical skills), SIWES (Students' Industrial Work Experience Scheme) placement requirements, and corporate upskilling. Popular courses: welding/fabrication, electrical installation, plumbing, ICT, fashion/tailoring, catering, cosmetology, auto mechanics, and agriculture. Fees: certificate courses ₦30,000–₦150,000 per term; short skill courses ₦15,000–₦80,000. Trust signals: NBTE accreditation number (`nbteAccreditation`), NABTEB exam registration partnership, and certificate recognition by employers.

## 2. Trust Signals
- NBTE accreditation number — PRIMARY trust signal
- NABTEB exam registration partnership
- Graduate employability rate ("80% of our graduates are employed within 3 months")
- Hands-on workshop facilities (photos of real workshop)
- Instructor experience
- Alumni testimonials with employment outcomes
- Government/NGO training partnership (SMEDAN, NDE, NAPEP)

## 3. Key CTAs
- Primary: "Enroll Now via WhatsApp"
- Secondary: "Download Course Calendar"

## 4. Nigerian Vocational Context
- SIWES placements — NBTE requirement; appeal to final year students
- Government-sponsored training (NDE, NAPEP) — free slots for indigents
- Trades in highest demand: ICT, electrical, welding, tailoring, auto mechanics
- CBT (Computer-Based Testing) centres — many institutes double as exam centres
- NIN (National Identity Number) required for registration

## 5. Website Structure
- Home: hero + NBTE badge + course catalog + WhatsApp enrollment CTA
- About: accreditation, history, facilities, SIWES partnerships
- Services: all courses with fees, duration, and certificate type
- Contact: WhatsApp enrollment + address + office hours

## 6. Platform Invariants
- T4: all fees in kobo integers
- P13: student_ref_id opaque; no student PII in template
- P2: NGN fees, NBTE trust badge, Nigerian vocational context
- CSS namespace: .ti-
