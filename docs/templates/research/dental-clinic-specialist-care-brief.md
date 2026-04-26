# Dental Clinic / Specialist Care — Nigeria-First Research Brief

**Niche ID:** P2-dental-clinic-specialist-care
**Vertical slug:** dental-clinic
**Research date:** 2026-04-25
**Agent:** replit-agent-2026-04-25-session-C
**Slug mismatch flag:** Migration 0037 uses `dental` — verify in D1 before SHIPPING.

## 1. Nigerian Market Context
Nigeria has a severe dentist-to-patient ratio (~1:40,000 vs WHO recommended 1:2,000). Private dental clinics are concentrated in Lagos, Abuja, and Port Harcourt. MDCN (Medical and Dental Council of Nigeria) licenses all dental facilities. Trust badge: `mdcnFacilityReg` (MDCN facility registration number). Services: consultation, cleaning/scaling/polishing, filling, extraction, orthodontics (braces), x-ray/OPG, dental implants. Pricing: consultation ₦5,000–₦20,000; cleaning ₦8,000–₦25,000; extraction ₦10,000–₦40,000; braces ₦250,000–₦1,500,000. Discovery: Google "dental clinic near me [LGA]" and WhatsApp referral. Primary concern for Nigerian patients: infection control ("will they use new needles?"), pain management, and cost transparency.

## 2. Trust Signals
- MDCN facility registration (`mdcnFacilityReg`) — MANDATORY
- Dentist's MDCN license number (individual registration)
- Specialist qualifications (BDS, FDSRCS, FMCDent for specialists)
- "Sterile instruments — single-use materials"
- NHIS accreditation (if applicable)
- WhatsApp appointment booking
- Pain-free treatment emphasis ("Gentle dentistry")

## 3. Key CTAs
- Primary: "Book an Appointment" (WhatsApp)
- Secondary: "View Treatments & Fees"

## 4. Nigerian Dental Context
- Orthodontics (braces) is aspirational — premium service, higher-income segment
- Fear of the dentist is common — "painless treatment" messaging helps
- School dental screening partnerships
- "No referral needed" — direct access positioning

## 5. Website Structure
- Home: hero + MDCN badge + treatment types + WhatsApp appointment CTA
- About: dentist qualifications, clinic history, MDCN registration
- Services: treatment menu with fees in NGN
- Contact: WhatsApp appointment + address + hours

## 6. Platform Invariants
- T4: all fees in kobo integers
- P13: patient_ref_id opaque; no diagnosis/treatment details in template
- P2: NGN fees, MDCN badge, Nigerian dental context
- CSS namespace: .dc-
