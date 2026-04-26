# Veterinary Clinic / Pet Care — Nigeria-First Research Brief

**Niche ID:** P2-vet-clinic-veterinary-care
**Vertical slug:** vet-clinic
**Research date:** 2026-04-25
**Agent:** replit-agent-2026-04-25-session-C
**Slug mismatch flag:** Migration 0037 uses `vet` — verify in D1 before SHIPPING.

## 1. Nigerian Market Context
Nigeria's pet ownership is growing rapidly in urban centres (Lagos, Abuja, PH) — dogs, cats, exotic birds, and ornamental fish are common. Poultry/livestock veterinary care remains significant in semi-urban and rural areas. VCNB (Veterinary Council of Nigeria Board) is the regulatory body — registration number (`vcnbRegistration`) is the trust badge. Clinic types: `companion` (dogs/cats/pets — urban), `livestock` (poultry/cattle/goats — semi-urban), `both`. Services: consultation, vaccination (rabies, DHLPP for dogs), surgery, grooming, pet food/accessories sales. Fees: consultation ₦3,000–₦15,000; vaccination ₦5,000–₦20,000 per dose; surgery varies. Discovery: WhatsApp referral and Google "vet clinic near me".

## 2. Trust Signals
- VCNB registration (`vcnbRegistration`) — PRIMARY trust badge
- Individual vet's VCNB license
- Years of practice
- Services offered (especially emergency services — 24hr availability)
- "VCNB Licensed Vet on Premises"
- Pharmacy / pet shop attached

## 3. Key CTAs
- Primary: "Book an Appointment" (WhatsApp)
- Secondary: "View Our Services"

## 4. Nigerian Vet Context
- `companion` clinic — Lagos/Abuja urban pet owners (dogs, cats, rabbits, birds)
- `livestock` clinic — poultry farmers, cattle ranchers, goat keepers
- `both` — versatile rural/suburban clinic
- Emergency services are rare in Nigeria — clinics offering 24hr emergency stand out
- NAAH (Nigerian Association of Animal Health) complement to VCNB

## 5. Website Structure
- Home: hero + VCNB badge + services + clinic type + WhatsApp appointment CTA
- About: vet qualifications, VCNB license, clinic history
- Services: full treatment menu with fees in NGN, pet shop if applicable
- Contact: WhatsApp appointment + address + emergency contact

## 6. Platform Invariants
- T4: all fees in kobo integers
- P13: animal_ref_id and owner_ref_id opaque; no diagnosis in template
- P2: NGN fees, VCNB badge, Nigerian pet/livestock context
- CSS namespace: .vc-
