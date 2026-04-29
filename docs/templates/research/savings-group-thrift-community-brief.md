# Savings Group / Thrift Community — Nigeria-First Research Brief

**Niche ID:** P2-savings-group-thrift-community
**Vertical slug:** savings-group
**Niche family:** NF-AJO (if exists) or standalone
**Research date:** 2026-04-25
**Agent:** replit-agent-2026-04-25-session-C

---

## 1. Nigerian Business Reality

### Thread A — Nigerian Business Landscape

The "Ajo", "Esusu", "Adashe" and cooperative savings systems are among the oldest and most widespread financial institutions in Nigeria, predating the formal banking system by centuries. An estimated 20-40% of Nigerian adults participate in at least one informal savings group at any time. National estimates suggest 15–25 million Nigerians actively participate in rotating savings circles. The system operates on radical trust: members commit to regular contributions; each cycle one member receives the pooled pot ("back"). Group sizes typically range from 10 to 100 members; contributions range from ₦5,000 to ₦500,000 per cycle. Names by region:

- **Yoruba:** Ajo (most common), Esusu
- **Hausa/Fulani:** Adashi, Adashe
- **Igbo:** Osusu, Isusu, Utu
- **National umbrella:** "Thrift and Credit Cooperative Society" (for registered entities)

Digital platforms (Cowrywise, PiggyVest, Bankly) are attempting to formalise these; the WebWaka savings-group template serves the LOCAL groups that want a simple web/mobile presence to attract members and display their credibility.

### Trust Dynamics
The coordinator ("ajo secretary") is the central trust figure. A savings group website must:
1. Prominently feature the coordinator's name and track record
2. Show proof of payments made (testimonials from previous cycle winners)
3. Display CAC registration (if a registered cooperative)
4. Show contribution amounts clearly (no hidden fees)
5. Show payout schedule / cycle calendar

### Group Types Supported
- **Ajo** — Rotating: each cycle one member receives all contributions
- **Esusu** — Similar to Ajo, often with "welfare" component (funeral support, medical)
- **Cooperative** — CAC-registered, may offer loans from pool, interest accrues
- **Thrift** — General term; may include fixed-term savings without rotation

---

## 2. Target Audience Profile

### Persona 1 — The Working-Class Saver
**Name:** Ngozi Okafor, 38  
**Occupation:** Market trader, Onitsha main market  
**Goal:** Regular monthly saving discipline with a trusted group  
**Website behaviour:** Someone invites her via WhatsApp; she visits the link to see the group's credibility — coordinator name, monthly contribution, payout history. Joins if she trusts what she sees.

### Persona 2 — The Diaspora Coordinator  
**Name:** Alhaji Musa Ibrahim, 47  
**Occupation:** Fabric importer, Kano  
**Goal:** Formalise his 20-member ajo group as a cooperative; website gives it credibility for member recruitment  
**Website behaviour:** Wants a professional-looking portal to share with new potential members. Highlights CAC registration and track record.

### Persona 3 — The HR/Workplace Coordinator
**Name:** Chibuike Nwosu, 33  
**Occupation:** Office manager, Lagos Island  
**Goal:** Run staff thrift society. Monthly ₦10,000 contributions from 30 staff. Website for transparency.  
**Website behaviour:** Wants members to see their payout position and upcoming calendar without calling him.

---

## 3. Recommended Website Structure

**Pages:** home / about / services / contact  
"Services" page = "How It Works" + contribution schedule + payout calendar.

**Home page sections (in order):**
1. **Hero** — Group name, tagline ("Saving Together, Thriving Together"), "Join via WhatsApp" CTA
2. **Trust strip** — Group type (Ajo/Esusu/Cooperative/Thrift) | Contribution amount | Members | CAC No. (if registered)
3. **How It Works** — 3-step: Join → Contribute → Collect. Simple, visual, Nigerian English
4. **Membership Info** — Current contribution amount, frequency, max members, open spots
5. **Why Join** — Track record, testimonials from past cycle winners (with Nigerian names + states)
6. **Contact coordinator** — WhatsApp, phone, or in-person meeting

**About page sections:**
- Coordinator bio and trust history
- Group founding story
- CAC registration certificate (if cooperative)
- Past payout statistics

**Services page sections:**
- "How It Works" detailed (step-by-step)
- Contribution schedule
- Payout cycle calendar
- FAQs (Can I miss a payment? When do I get paid? Is it CAC registered?)

**Contact page sections:**
- WhatsApp CTA (primary)
- Coordinator phone
- Meeting location (physical)
- Monthly meeting schedule

---

## 4. Content Tone & Voice

- **Register:** Warm, community-focused, trust-building. Like a neighbour recommending a trusted savings group.
- **Language:** Pidgin-influenced English is fine for informal groups; more formal for cooperative societies. Use "contribute" not "deposit". Use "collect" not "receive payout". Use local group names (Ajo, Esusu) prominently.
- **Primary CTA:** "Join via WhatsApp" (green button)
- **Secondary CTA:** "Learn How It Works"
- **What to AVOID:** Corporate finance language ("investment returns", "asset management") — this sounds alien for informal savings groups. Do NOT use "savings account" — it implies a bank.
- **Trust-building phrases:** "We have been saving together since [year]", "Over [N] successful payout cycles", "Every member has received their pot on time"

---

## 5. Trust Signal Inventory

- [x] Group type prominently displayed (Ajo / Esusu / Cooperative / Thrift)
- [x] Coordinator full name and WhatsApp number (most critical trust signal)
- [x] Contribution amount and frequency (members must see this immediately)
- [x] Number of current members / max capacity
- [x] CAC RC number (if registered cooperative)
- [x] Payout cycle number / track record ("Completed 15 successful payout cycles")
- [x] Testimonials from past cycle winners — Nigerian names and LGA/state
- [x] Meeting schedule (monthly, weekly — when and where)
- [x] "Open positions" count — creates urgency for recruitment
- [x] Payment method accepted: bank transfer, cash at meeting, POS

---

## 6. Image Direction (5 Specific Concepts)

1. **Hero image:** Nigerian women in lace aso-ebi / ankara fabric grouped around a table, smiling, counting money. Authentic communal savings scene. Market women, church women's group, workplace colleagues — all valid. No stock photo western meeting imagery.
2. **Coordinator trust image:** Nigerian man or woman (coordinator) in traditional dress, seated confidently. Nigerian home or office background. Confident, authoritative expression — "I have your money safe."
3. **Payout celebration image:** Nigerian woman receiving an envelope from the group, smiling broadly, surrounded by her ajo group. Market setting or living room. "Collected her pot" energy.
4. **Contribution meeting image:** Mixed group of Nigerians seated in a circle in a living room or community centre. Someone has a notebook. Writing contributions. Nigerian environment (ceiling fan, patterned chairs, etc.)
5. **Mobile money payment:** Nigerian hands typing USSD code on a feature phone or mobile transfer app for ajo contribution. *737# visible, Opay/Palmpay screen — Nigerian fintech context.

---

## 7. Platform Invariants Confirmed

- **T2** — TypeScript strict: all types explicit, no `any`
- **T3** — Tenant isolation: `tenant_id` on all DB queries (repository layer)
- **T4** — Kobo integers: all amounts (contributionAmountKobo) stored as integer kobo; `fmtKobo()` for display
- **P2** — Nigeria First: group type names (Ajo/Esusu/Adashe/Osusu), WhatsApp CTA, CAC trust signal
- **P4** — Mobile first: 375px layout; members access on mobile phones — not desktop
- **P7** — CSS vars: `--ww-primary`, `--ww-bg-surface`, `--ww-text`, `--ww-border`, `--ww-radius` only
- **P9** — NGN (₦) with kobo integers throughout
- **P13** — No member PII (memberRefId opaque; never to AI)

---

## 8. Nigeria-First Compliance Checklist

- [x] Primary CTA is WhatsApp (coordinator contact method)
- [x] All contribution amounts in NGN (₦) using kobo integers
- [x] Group type (Ajo/Esusu/Cooperative/Thrift) prominently displayed
- [x] Nigerian group terminology used (Ajo, Esusu, Osusu, Adashe)
- [x] WhatsApp link uses Nigeria international format (+234)
- [x] Coordinator trust presented as central trust signal
- [x] CAC registration badge (optional field — shown only if cacRc present)
- [x] HTML escape on all user data (`esc()` function)
- [x] Try/catch at page boundary
- [x] null-safe rendering throughout
- [x] Mobile-first CSS at 375px minimum
- [x] 44px minimum tap targets on all CTAs
- [x] No references to formal banking, investment returns, or western financial terms
- [x] P13: No member PII in template context (memberRefId is opaque)

---

## 9. Key Data Model Fields for Template

From `SavingsGroupProfile`:
- `groupName` — display as page title
- `groupType`: `'ajo' | 'esusu' | 'cooperative' | 'thrift'` — show as badge
- `contributionFrequency`: `'daily' | 'weekly' | 'biweekly' | 'monthly'`
- `contributionAmountKobo`: `number` — display with `fmtKobo()`
- `maxMembers`: `number` — total slots
- `currentMembers`: `number` — filled slots

Via `ctx.data`:
- `groupType`, `contributionFrequency`, `contributionAmountKobo`, `maxMembers`, `currentMembers`
- `coordinatorName` (string|null)
- Standard: `phone`, `placeName`, `description`, `logoUrl`
