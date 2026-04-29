# Hire Purchase / Asset Finance — Nigeria-First Research Brief

**Niche ID:** P2-hire-purchase-asset-finance
**Vertical slug:** hire-purchase
**Research date:** 2026-04-25
**Agent:** replit-agent-2026-04-25-session-C

## 1. Nigerian Market Context
Hire purchase (HP) is a consumer credit product where a buyer takes an asset on credit, paying installments over time (asset ownership transfers on final payment). CBN regulates consumer credit operators — `cbnConsumerCreditReg` is the trust badge. Nigerian HP market is dominated by: motorcycle/okada dealers (keke NAPEP, bajaj motorcycles), electronics retailers (phones, TVs, fridges), and agricultural equipment dealers. Key operators: first bank, microfinance banks, and specialist HP firms. Target customers: small traders, farmers, transport workers who cannot afford outright purchase. Typical installment tenor: 6-24 months. Assets: `motorcycle`, `electronics`, `agricultural_equipment`. Repayment: usually daily/weekly cash collection at customer location.

## 2. Trust Signals
- CBN consumer credit registration (`cbnConsumerCreditReg`) — PRIMARY trust signal
- Years of operation and customers served
- Asset types available (motorcycles, electronics, farm equipment)
- Installment plan clarity ("Pay ₦5,000/week for 20 weeks")
- "No hidden charges" pledge
- Testimonials from successful HP customers
- CAC registration

## 3. Key CTAs
- Primary: "Apply for Hire Purchase via WhatsApp"
- Secondary: "View Available Assets & Plans"

## 4. Nigerian HP Context
- Keke NAPEP (tricycle) HP is massive in Southern Nigeria
- Bajaj/TVS/Honda motorcycles dominate motorcycle HP
- Electronics: smartphones (budget Tecno/Infinix, not iPhones), fans, TVs, fridges
- Farm equipment: hand tractors, irrigation pumps, threshers
- Daily/weekly repayment collection by agents at customer location
- BVN required for credit check; guarantor system also used

## 5. Website Structure
- Home: hero + CBN badge + asset types + installment example + WhatsApp application CTA
- About: CBN registration, years of operation, eligible customer types
- Services: all asset types with example installment plans in NGN
- Contact: WhatsApp application + phone + office address

## 6. Platform Invariants
- T4: all prices and installments in kobo integers; tenor_months as integer
- P13: customer BVN ref hashed; never to AI
- P2: NGN amounts, CBN badge, Nigerian HP products
- CSS namespace: .hp-
