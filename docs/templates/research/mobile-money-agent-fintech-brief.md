# Mobile Money / POS Agent — Nigeria-First Research Brief

**Niche ID:** P2-mobile-money-agent-fintech
**Vertical slug:** mobile-money-agent
**Research date:** 2026-04-25
**Agent:** replit-agent-2026-04-25-session-C
**Slug mismatch flag:** Migration 0037 uses `mobile-money` — verify in D1 before SHIPPING.

## 1. Nigerian Market Context
Nigeria's agent banking network is one of Africa's largest (~2 million+ registered agents per CBN data). Operators: OPay, PalmPay, Moniepoint, MTN MoMo, FirstMonie, GTWorld, Kuda, Access Diamond. CBN licensing is mandatory: sub-agent number (`cbnSubAgentNumber`) is the primary trust badge. Agent services: cash-in, cash-out, bank transfers, bill payments, airtime top-up, POS transactions. Daily transaction cap: ₦300,000 (30,000,000 kobo) per sub-agent per CBN regulation. Revenue: ₦50–₦500 per transaction commission. An agent website serves two purposes: (1) let customers find the nearest agent, and (2) establish trust by displaying CBN-licensed status. KYC Tier 3 is mandatory for agent banking.

## 2. Trust Signals
- CBN sub-agent number (`cbnSubAgentNumber`) — MANDATORY trust signal
- Operating network (OPay/Moniepoint/MTN MoMo/FirstMonie partner logo)
- Services offered (cash-in, cash-out, transfer, bills, airtime)
- Operating hours (some agents offer 7am–9pm or 24hr)
- Physical location (street address, LGA, landmark)
- Daily transaction volume handled ("₦5M daily transactions processed")
- WhatsApp for location confirmation

## 3. Key CTAs
- Primary: "Find Us on WhatsApp" (for directions/confirmation)
- Secondary: "View Our Services"

## 4. Nigerian Agent Banking Context
- Cash-out is highest demand service (ATM alternatives)
- Bill payments: DSTV, electricity (NEPA/PHCN), water board, school fees
- Airtime: MTN, Airtel, Glo, 9Mobile
- BVN: NO BVN data in template (P13 — customer BVN ref is hashed, never to AI)
- "No charge on transfers" — some agents absorb fee as competitive advantage

## 5. Website Structure
- Home: hero + CBN badge + services + location + WhatsApp directions CTA
- About: CBN sub-agent number, network partnerships, years of operation
- Services: all services with any applicable charges in NGN
- Contact: location map + WhatsApp + phone + operating hours

## 6. Platform Invariants
- T4: all charges in kobo integers; daily cap 30,000,000 kobo enforced at route level
- P13: no customer BVN ref in template (hashed); no transaction details
- P2: NGN amounts, CBN badge, Nigerian mobile money networks
- CSS namespace: .mm-
