# Research Brief: Pharmacy Chain / Drugstore
**Niche ID:** P2-pharmacy-chain-pharmacy-chain-drugstore
**Template Slug:** pharmacy-chain-pharmacy-chain-drugstore
**Family:** NF-HLT-SVC
**NF Priority:** high
**Generated:** 2026-04-26

---

## Thread A — Nigerian Business Reality
The Pharmacy Chain / Drugstore operates within Nigeria's NF-HLT-SVC sector. Key business realities include:
- **Regulatory signals:** PCN (mandatory), NAFDAC, HEFAMAA, NPhA, CAC
- **Primary markets:** Lagos, Abuja, Port Harcourt and secondary state capitals
- **Payment context:** Bank transfer, Paystack, POS; USSD for lower-income customers
- **Trust signals:** PCN Licensed, NAFDAC Compliant, HEFAMAA Approved, NPhA Member, CAC Registered
- **Communication:** WhatsApp is the primary business communication channel; phone calls secondary

## Thread B — Website Design Patterns
Nigerian businesses in this niche typically need:
- **Services:** Prescription drugs, OTC medicines, health supplements, baby care, family planning, wellness products
- **WhatsApp CTA:** Prominent WhatsApp button on every page; drives majority of lead conversions
- **NDPR Notice:** Mandatory data-privacy notice in contact section
- **Mobile-first:** 80%+ of Nigerian web traffic is mobile; responsive design critical

## Thread C — Template Architecture
- **Pages:** Home, Services/Products, Contact (minimum viable set)
- **CSS prefix:** Unique per-template to prevent style leakage
- **Contract:** Implements WebsiteTemplateContract with slug, version, pages[], renderPage()
- **Helpers:** esc(), whatsappLink(), safeHref(), waSvg() defined inline

## Thread D — Competitive Landscape
- Most Nigerian Pharmacy Chain / Drugstore businesses lack a web presence
- Opportunity: first-mover digital credibility via WebWaka platform
- Differentiator: WhatsApp integration + trust signals (regulatory logos/badges)
- SEO opportunity: local search terms (city + service type)

## Approval Status
- **Template Status:** active
- **Pillar:** 2 (P2 priority niche)
- **Version:** 1.0.0
