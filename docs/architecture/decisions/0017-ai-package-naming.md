# ADR-0017: Canonical AI Package Naming — `packages/superagent` vs `packages/superagent-sdk`

**Status:** Accepted  
**Date:** 2026-04-13  
**Supersedes:** ADL-012 (see `docs/governance/ai-architecture-decision-log.md`)  
**Authors:** WebWaka Platform Team

---

## Context

Early planning documents and governance rules referenced `packages/superagent-sdk` as the required import entry point for vertical packages calling AI features. The `-sdk` suffix was intended to signal a "public vertical contract" layer distinct from the internal `packages/ai-abstraction`.

During implementation, the actual package created was `packages/superagent` (without the `-sdk` suffix). This package:
- Wraps `packages/ai-abstraction` with vertical-safe defaults
- Enforces P12 (L1/L2/L3 HITL gates)
- Enforces P13 (PII filter before any AI call)
- Enforces P10 (NDPR consent gate for all AI routes)
- Provides WakaCU metering stubs

At the time `packages/superagent-sdk` was referenced in governance docs, the package did not exist and was never created. Creating it as a new thin wrapper over `packages/superagent` would add an indirection layer with zero functional benefit and would require all 124+ vertical packages to update their import paths.

## Decision

**`packages/superagent` IS the vertical-facing AI SDK.** No separate `packages/superagent-sdk` package will be created.

All governance documentation references to `packages/superagent-sdk` and `@webwaka/superagent-sdk` have been updated to `packages/superagent` and `@webwaka/superagent` respectively.

## Consequences

### Positive
- No migration burden on existing vertical packages (all already import `@webwaka/superagent` correctly)
- Eliminates a phantom package that was blocking governance audits
- Reduces package count by 1
- No breaking change — the API surface is unchanged

### Negative
- Historical governance docs that were exported or shared externally may reference the old `-sdk` name; these must be updated manually if re-shared

## Governance Rule Update

The following rule in `docs/governance/superagent/06-governance-rules.md` is updated:

> **Before:** Vertical packages MUST use `packages/superagent-sdk` to call AI  
> **After:** Vertical packages MUST use `packages/superagent` (`@webwaka/superagent`) to call AI

This ADR resolves ADL-012 and closes the gap noted in `docs/reports/governance-compliance-deep-audit-2026-04-11.md`.
