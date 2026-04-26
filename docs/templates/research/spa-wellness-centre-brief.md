# Spa / Wellness Centre — Nigeria-First Research Brief

**Niche ID:** P2-spa-wellness-centre
**Vertical slug:** spa
**Research date:** 2026-04-25
**Agent:** replit-agent-2026-04-25-session-C

## 1. Nigerian Market Context
Nigerian spa industry is concentrated in Lagos (Victoria Island, Lekki, Ikeja) and Abuja (Wuse 2, Maitama, Jabi). Estimated 800+ day spas and wellness centres. Market is driven by affluent women 28-50 seeking relaxation and self-care. Popular services: Swedish massage, deep tissue, facials, body scrubs, manicure/pedicure, waxing. Pricing: body massage ₦10,000–₦45,000; facial ₦8,000–₦30,000; mani/pedi ₦4,000–₦15,000. Trust signals: NASC-Nigeria (Nigeria Association Spas Consultants) registration, state health permit, certified therapists, Instagram portfolio of treatment rooms (clean, serene environment). Discovery path: Instagram → website → WhatsApp booking. WhatsApp is the standard booking channel.

## 2. Trust Signals  
- NASC registration number (`nascNumber`)
- State health permit (`stateHealthPermit`)
- Certified therapist credentials (CIBTAC, CIDESCO, ITEC — internationally recognised)
- Real photos of treatment rooms and products used
- Before/after photos (skin treatment, facials) with client consent
- Review testimonials from Nigerian clients (name + area/state)
- "Only organic/natural products used" if applicable

## 3. Key CTAs
- Primary: "Book an Appointment" (WhatsApp)
- Secondary: "View Our Services"

## 4. Spa Types and Nigerian Context
- `day_spa` — most common; standalone spa (no hotel affiliation)
- `hotel_spa` — attached to hotel; formal appointment system
- `mobile` — therapist comes to client's home; very popular in Lagos/Abuja
- NASC badge is primary trust signal
- "No hidden charges" — Nigerians wary of post-service add-ons

## 5. Website Structure
- Home: hero + services menu with NGN prices + NASC badge + WhatsApp booking CTA
- About: therapist credentials + spa story + certifications
- Services: detailed treatment menu with prices, duration, description
- Contact: WhatsApp booking + address + hours + Google Maps link

## 6. Platform Invariants
- T4: all service prices in kobo integers
- P13: no client health intake data in template context
- P2: NGN prices, WhatsApp CTA, NASC Nigeria badge
- CSS namespace: .sw-
