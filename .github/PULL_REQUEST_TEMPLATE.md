## Summary
<!-- What does this PR do? One sentence. -->

## Type
- [ ] feat — new feature
- [ ] fix — bug fix
- [ ] chore — maintenance
- [ ] docs — documentation
- [ ] refactor — code restructure
- [ ] test — tests only
- [ ] ci — CI/CD changes

## Milestone
<!-- Which milestone does this belong to? -->

## Scope
<!-- Which packages/apps/docs are changed? -->

## 3-in-1 Pillar Alignment
<!-- See docs/governance/3in1-platform-architecture.md for the full pillar map -->
- [ ] This PR is labeled with the correct `3in1:*` label(s) (`3in1:pillar-1-ops`, `3in1:pillar-2-branding`, `3in1:pillar-3-marketplace`, `3in1:superagent`, or `3in1:infra`)
- [ ] If this PR adds a new package: `[Pillar N]` prefix added to `package.json` `description` field
- [ ] If this PR adds a new vertical: `primary_pillars` field populated in seed CSV and `VerticalRegistration` type
- [ ] If this PR adds a new app: pillar assignment documented in `ARCHITECTURE.md` and `docs/governance/3in1-platform-architecture.md`
- [ ] If this PR adds AI features: features are exposed through a pillar UI surface (SuperAgent is cross-cutting — NOT a 4th pillar)

## Governance Alignment
<!-- Confirm this change aligns with docs/governance/ rules -->
- [ ] I have read the relevant governance docs
- [ ] This change respects tenant isolation (T3 — tenant_id from JWT, never from headers on auth routes)
- [ ] This change respects entitlement enforcement
- [ ] This change respects geography hierarchy rules
- [ ] Monetary values (if any) are stored as integer kobo (P9)
- [ ] No secrets are committed

## Testing
- [ ] Unit tests added/updated
- [ ] TypeScript checks pass (`pnpm typecheck`)
- [ ] All tests pass (`pnpm test`)

## Breaking Changes?
<!-- Does this break any existing behaviour? -->

## Rollout Notes
<!-- Any special deployment steps needed? -->

## Related Issues
<!-- Closes #... -->
