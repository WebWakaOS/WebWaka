# Community Hall / Civic Space — Nigeria-First Research Brief

**Niche ID:** P2-community-hall-civic-space
**Vertical slug:** community-hall
**Research date:** 2026-04-25
**Agent:** replit-agent-2026-04-25-session-C

## 1. Nigerian Market Context
Community halls are civic venues owned by local government, community development associations (CDAs), town unions, church organizations, or private promoters. Common in every Nigerian town and LGA. Primary use cases: owambe parties (Nigerian naming ceremonies, weddings, birthdays), church events, corporate events, graduations, political rallies, meetings. Community halls range from simple rooms (capacity 50–200) to large halls (500–2,000 guests). Pricing: ₦30,000–₦500,000/event day depending on size and location. Key features: generator (compulsory in Nigeria for power backup), chairs/tables (included or separate hire), PA system, kitchen. A website for a community hall focuses on: venue capacity, features, pricing, available dates, and WhatsApp booking. Double-booking prevention is critical — enforced at route level in the platform.

## 2. Trust Signals
- Capacity (seated/standing) clearly stated
- Features: AC, generator, kitchen, sound system, chairs/tables
- Photos of the hall (set up for different events)
- Previous events hosted ("We hosted 200 events in 2024")
- Refund/cancellation policy (important for Nigerian event planners)
- Booking confirmation via WhatsApp
- LGA/community governance body endorsement (if applicable)

## 3. Key CTAs
- Primary: "Check Availability & Book" (WhatsApp)
- Secondary: "View Hall Features & Pricing"

## 4. Nigerian Community Hall Context
- "Owambe" — Yoruba term for large social gatherings; Nigeria's event culture is vibrant
- Generator is a selling point (not assumed) — always mention
- "You can bring your own caterer / DJ" vs "House caterer only"
- Aso-ebi (coordinated fabric for events) — hall photos showing the typical Nigerian event setup build trust
- Booking deposit is standard: 30–50% upfront
- Friday/Saturday/Sunday — peak booking days
- Multiple-day bookings for weddings (rehearsal dinner + main day)

## 5. Website Structure
- Home: hero + capacity + features + pricing + check availability CTA (WhatsApp)
- About: hall management body, location history, facilities
- Services: hall types (if multiple), pricing packages in NGN, what's included
- Contact: WhatsApp booking + address + directions + phone

## 6. Platform Invariants
- T4: all prices in kobo integers; capacity_seats as integer
- P2: NGN prices, WhatsApp booking, Nigerian event context
- CSS namespace: .ch-
