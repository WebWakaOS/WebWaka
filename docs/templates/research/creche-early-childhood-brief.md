# Crèche / Day Care Centre — Nigeria-First Research Brief

**Niche ID:** P2-creche-early-childhood
**Vertical slug:** creche
**Research date:** 2026-04-25
**Agent:** replit-agent-2026-04-25-session-C

## 1. Nigerian Market Context
Day care / crèche is a growing sector driven by dual-income households in urban Nigeria (Lagos, Abuja, PH). SUBEB (State Universal Basic Education Board) registers and inspects early childhood centres at state level — `subebRegistration` is the trust badge. NUC (National Universities Commission) oversees nursery/primary schools. Typical age range: 0–5 years (creche 0-18 months, toddler 18 months-3 years, nursery 3-5 years). Monthly fees: Lagos ₦30,000–₦200,000/month; other states ₦15,000–₦80,000/month depending on quality tier. Parents look for: safety (CCTV, qualified staff), learning environment, meal plans, and proximity to home/work. L3 HITL mandatory for all AI calls (child data — most sensitive P13 category).

## 2. Trust Signals
- SUBEB registration (`subebRegistration`) — PRIMARY trust badge
- Qualified early childhood educators (NCE in Early Childhood, B.Ed)
- Teacher-to-child ratio ("1 teacher per 5 children")
- CCTV and safety features
- Meal plan (nutritious meals included)
- Emergency contact protocols
- Testimonials from Nigerian parents (name + area)

## 3. Key CTAs
- Primary: "Book a Nursery Visit" (WhatsApp)
- Secondary: "View Programmes & Fees"

## 4. Nigerian Crèche Context
- "Reception class" (Nursery 1, Nursery 2) are common terms
- "Play group" for younger toddlers
- Creche fees often include meals, nappies for infants
- Transport service (school bus) is premium service
- "Child-safe environment" — very important messaging for Nigerian parents
- After-school care (for primary school children) offered by many crèches

## 5. Website Structure
- Home: hero + SUBEB badge + age groups + fees + nursery visit CTA (WhatsApp)
- About: founder story, qualifications, staff-child ratio, safety features
- Services: all programmes (creche, toddler, nursery) with fees in NGN
- Contact: WhatsApp visit booking + address + hours

## 6. Platform Invariants
- T4: all fees in kobo integers
- P13: child_ref_id is most sensitive category; NO child PII in template
- L3 HITL mandatory for all AI calls on child data
- P2: NGN fees, SUBEB badge, Nigerian childcare context
- CSS namespace: .cr-
