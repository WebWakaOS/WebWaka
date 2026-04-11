# Partner and Sub-Partner Model

**Status:** Approved — Milestone 1 Governance Baseline
**Author:** Perplexity (Milestone 1)
**Reviewed by:** Base44 Super Agent
**Founder approved:** ✅ 7 April 2026

---

## Purpose

WebWaka supports multi-level partner expansion where authorized Partners can onboard and manage downstream entities under approved branding and entitlement rules.

## Hierarchy

| Level | Role |
|---|---|
| 0 | Platform Owner (WebWaka) |
| 1 | Partner |
| 2 | Sub-Partner |
| 3 | Downstream Entity Manager |

## Rules

1. Delegation is entitlement-controlled — a Partner cannot delegate what it does not hold.
2. Partner branding depth (white-label capability) depends on subscription tier.
3. Sub-Partner creation must be auditable with a clear parent record.
4. Downstream management must preserve full tenant isolation at every level.
5. Parent partners must not gain undocumented access to child tenant data.
6. The platform retains override capability at all levels for compliance purposes.

---

## Implementation Status

**Status:** NOT IMPLEMENTED — No partner management API, partner workspace creation, or delegation enforcement exists in the codebase as of 2026-04-11.

The governance rules above are approved and binding, but no runtime code enforces them yet. The following components do not exist:
- No partner registration API or partner management routes
- No sub-partner creation or delegation rights enforcement
- No partner billing, revenue share, or white-label depth control
- No `partners` or `sub_partners` D1 tables
- Sub-delegation controls are documented but have no implementation

---

## Implementation Roadmap

| Phase | Scope | Target Milestone |
|-------|-------|-----------------|
| **Phase 1** | Partner registration API, partner workspace creation, `partners` D1 table, partner-specific RBAC roles | M11 (Partner & White-Label) |
| **Phase 2** | Sub-partner creation, delegation rights enforcement, `sub_partners` table, delegation agreement workflow | M11 |
| **Phase 3** | Partner billing, revenue share (WakaCU wholesale allocation), white-label depth control per subscription tier | M11–M12 |
| **Phase 4** | Partner analytics dashboard, partner-level audit logs, partner→sub-partner cascading entitlements | M12 |

**Dependencies:**
- Phase 1 depends on: completed entitlement model (T5 — done), RBAC middleware (done), tenant isolation (T3 — done)
- Phase 2 depends on: Phase 1 partner infrastructure
- Phase 3 depends on: WakaCU wallet system (ADL-008 — tables defined, implementation pending)
