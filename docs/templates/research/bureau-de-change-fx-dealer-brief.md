# Bureau de Change / FX Dealer — Nigeria-First Research Brief

**Niche ID:** P2-bureau-de-change-fx-dealer
**Vertical slug:** bureau-de-change
**Research date:** 2026-04-25
**Agent:** replit-agent-2026-04-25-session-C
**Slug mismatch flag:** Migration 0037 uses `bdc` — verify in D1 before SHIPPING.

## 1. Nigerian Market Context
Bureau de Change (BDC) operators are regulated by CBN under the BDC Regulations 2015. CBN BDC licence (`cbnBdcLicence`) is mandatory. After the 2021 CBN directive restricting banks from selling FX to BDCs, the parallel market became dominant. Key currencies: USD (most traded), EUR, GBP, CNY (growing), AED (for Dubai travel). BDC website should NOT display live FX rates (rates change daily; displaying outdated rates misleads customers and violates CBN communication guidelines). Instead: "Call/WhatsApp for today's rate" is the correct CTA. BDC revenues: spread between buy/sell rates (typically 0.5–2%). Target customers: importers, travellers (Hajj, student abroad fees, medical tourism), and diaspora remittances. KYC Tier 3 mandatory. CRITICAL: FX rates stored as integer kobo per USD cent (no floats).

## 2. Trust Signals
- CBN BDC licence number (`cbnBdcLicence`) — MANDATORY trust signal
- CAC registration
- Years of operation and daily volumes handled
- "Licensed by CBN" badge prominently displayed
- Currencies traded (USD, EUR, GBP, CNY)
- "Competitive rates — WhatsApp for today's rate"
- Physical location (street + LGA + landmark)

## 3. Key CTAs
- Primary: "Get Today's Rate on WhatsApp"
- Secondary: "View Our Services"
- DO NOT display static FX rates (they become outdated immediately)

## 4. Nigerian BDC Context
- "Parallel market rate" vs "official CBN rate" — BDCs operate at parallel/street rate
- EFCC anti-money-laundering compliance — BDCs are high AML risk
- NIN + BVN required for transactions above $500 equivalent
- ECOWAS travel allowance (PTA: $5,000/trip; BTA: $5,000/trip)
- Student fee remittance: Form A / Form M documentation

## 5. Website Structure
- Home: hero + CBN badge + currencies traded + "WhatsApp for today's rate" CTA
- About: CBN licence, years of operation, daily volumes, team
- Services: currencies available, transaction limits, documentation required
- Contact: WhatsApp rate inquiry + phone + address + hours

## 6. Platform Invariants
- T4: FX rates as integer kobo per USD cent; NGN amounts as kobo integers
- P13: customer BVN ref hashed; never to AI
- P2: NGN amounts, CBN badge, Nigerian FX market context
- CSS namespace: .bd-
