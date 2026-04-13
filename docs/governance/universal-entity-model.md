# Universal Entity Model

**Status:** Approved — Milestone 1 Governance Baseline
**Author:** Perplexity (Milestone 1)
**Reviewed by:** Base44 Super Agent
**Founder approved:** ✅ 7 April 2026

---

## Root Entities

### Individuals

Person entities such as politicians, creators, professionals, founders, sole traders, agents, and office holders.

### Organizations

Collective entities such as businesses, political parties, NGOs, schools, churches, clinics, firms, and partner operators.

### Places

Physical or territorial entities such as markets, motor parks, offices, wards, LGAs, states, zones, communities, and households.

### Offerings

The units of value or participation exposed by downstream entities, including products, services, routes, seats, donations, memberships, subscriptions, tickets, campaigns, and appointments.

### Profiles

Public discovery records for Individuals, Organizations, Places, and sometimes Offerings.

### Workspaces

Tenant-scoped management contexts for operations, teams, data, settings, and workflows.

### Brand Surfaces

Dedicated branded digital experiences such as websites, stores, portals, booking pages, and campaign sites.

## 3-in-1 Pillar Mapping

Each root entity maps to one or more of the three platform pillars:

| Root Entity | Pillar 1 — Ops | Pillar 2 — Branding | Pillar 3 — Marketplace |
|---|---|---|---|
| **Workspaces** | ✅ Primary (back-office, POS, staff, inventory) | — | — |
| **Brand Surfaces** | — | ✅ Primary (website, store, portal, booking page) | — |
| **Profiles** | — | Supports (branded profile) | ✅ Primary (discovery, directory, claim-first) |
| **Individuals** | ✅ (operations actor) | ✅ (personal brand surface) | ✅ (directory listing) |
| **Organizations** | ✅ (business operations) | ✅ (branded business site) | ✅ (marketplace listing) |
| **Places** | ✅ (location management) | — | ✅ (geography-powered discovery) |
| **Offerings** | ✅ (POS, transactions) | ✅ (branded catalog) | ✅ (marketplace products/services) |

> **3-in-1 classification note:** Community and Social features extend this entity model as **cross-cutting infrastructure** on top of all three pillars, primarily enhancing Pillar 3 (Marketplace) engagement. They are not additional root entities — they layer on top of Workspaces (operations) and Brand Surfaces (branding). See `docs/governance/3in1-platform-architecture.md` for authoritative pillar assignments.

---

## Key Rules

**Model what something _is_ before modeling what it _does_.**

Roles, claims, subscriptions, and political assignments are layered on top of root entities, not substituted for them.

## Access Rule

Existence in the system does not automatically grant access to all capabilities. Subscription and entitlements determine what each entity can activate and manage.
