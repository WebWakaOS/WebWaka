# Research Brief: Courier Service
**Niche ID:** P2-courier-courier-service-site
**Template Slug:** courier-courier-service-site
**Family:** NF-TRN-SVC
**NF Priority:** high
**Generated:** 2026-04-26

---

## Thread A — Nigerian Business Reality
The Courier Service operates within Nigeria's NF-TRN-SVC sector. Key business realities include:
- **Regulatory signals:** NPC (Nigerian Postal Commission), CAC, NESREA, FRSC
- **Primary markets:** Lagos, Abuja, Port Harcourt and secondary state capitals
- **Payment context:** Bank transfer, Paystack, POS; USSD for lower-income customers
- **Trust signals:** NPC Licensed, CAC Registered, FRSC Compliant
- **Communication:** WhatsApp is the primary business communication channel; phone calls secondary

## Thread B — Website Design Patterns
Nigerian businesses in this niche typically need:
- **Services:** Domestic parcel, international shipping, document courier, express delivery, fragile goods, returns
- **WhatsApp CTA:** Prominent WhatsApp button on every page; drives majority of lead conversions
- **NDPR Notice:** Mandatory data-privacy notice in contact section
- **Mobile-first:** 80%+ of Nigerian web traffic is mobile; responsive design critical

## Thread C — Template Architecture
- **Pages:** Home, Services/Products, Contact (minimum viable set)
- **CSS prefix:** Unique per-template to prevent style leakage
- **Contract:** Implements WebsiteTemplateContract with slug, version, pages[], renderPage()
- **Helpers:** esc(), whatsappLink(), safeHref(), waSvg() defined inline

## Thread D — Competitive Landscape
- Most Nigerian Courier Service businesses lack a web presence
- Opportunity: first-mover digital credibility via WebWaka platform
- Differentiator: WhatsApp integration + trust signals (regulatory logos/badges)
- SEO opportunity: local search terms (city + service type)

## Approval Status
- **Template Status:** active
- **Pillar:** 2 (P2 priority niche)
- **Version:** 1.0.0
