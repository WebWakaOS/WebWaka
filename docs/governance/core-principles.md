# Core Principles

**Status:** Approved — Milestone 1 Governance Baseline
**Author:** Perplexity (Milestone 1)
**Reviewed by:** Base44 Super Agent
**Founder approved:** ✅ 7 April 2026

---

The following principles are mandatory across product, engineering, governance, and deployment decisions.

## Product Principles

- **Build Once Use Infinitely** — shared primitives must be reused across sectors and layers.
- **Nigeria First** — optimize first for Nigerian realities, workflows, connectivity, and geography.
- **Africa First** — design abstractions to generalize across African markets after succeeding in Nigeria.
- **Mobile First** — primary user journeys must be designed for phones first.
- **PWA First** — installable browser experiences are a first-class delivery channel.
- **Offline First** — critical flows must support low-connectivity operation and sync recovery.

## Platform Principles

- **Universal entity modeling before sector features**
- **Subscription determines access**
- **Claim-first onboarding as default growth pattern**
- **Geography drives discovery and aggregation**
- **White-labeling is a strategic platform capability**
- **Tenant isolation is non-negotiable**

## AI Principles

- **Vendor Neutral AI** — do not hard-lock the platform to one AI provider.
- **BYOK support** — users or partners may provide their own keys where appropriate.
- **AI is embedded but governed** — all AI capability must follow clear product and security rules.

## Execution Principles

- **Thoroughness over speed**
- **No skipping required phases**
- **Step-by-step GitHub pushes**
- **Continuity-friendly implementation for future agents**
- **Governance before improvisation**

---

## Africa-First Expansion Architecture (Future)

**Current status:** Nigeria-only. All data structures, geography, payments, and compliance are designed for Nigerian realities. This is intentional (P2 — Nigeria First) and is not a governance violation.

**Multi-country expansion requirements (when the time comes):**
1. **Geography abstraction:** Add `country_id` column to `geography_places` and tenant-scoped tables. The current hierarchy (Zone → State → LGA → Ward) is Nigeria-specific; other countries have different administrative divisions.
2. **Payment provider abstraction:** Paystack is Nigeria-first. Expansion requires a payment provider interface layer: `PaymentProvider { charge(), verify(), webhook() }` → Paystack (NG), Flutterwave (Africa-wide), Stripe (global).
3. **Multi-currency support:** Replace hardcoded kobo (NGN × 100) with a currency-aware smallest-unit integer pattern: `{ amount: number, currency: 'NGN' | 'GHS' | 'KES', unit: 'kobo' | 'pesewa' | 'cent' }`.
4. **Regulatory body abstraction:** CAC (Nigeria), FRSC (Nigeria) → interface → other countries' business registries.
5. **Locale support:** Add country-specific locale data (phone formats, address formats, tax rules).

This is marked as a **Future Architecture** item, not a current violation. Implementation target: post-M12, once Nigeria market is validated.
