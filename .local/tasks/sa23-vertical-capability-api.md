# Vertical Capability Declaration API (SA-2.3)

## What & Why
`VERTICAL_AI_CONFIGS` covers all 159 verticals and declares which AI capabilities
each one permits, its primary pillar, and its use-case descriptions. This data is
consumed internally by the compliance pre-check in `/chat` but is never exposed via
HTTP. Every vertical-specific frontend (workspace-app, partner-admin) has no
programmatic way to discover which AI features to surface for their vertical — they
either hard-code capability lists or show everything and let the server reject them.

This task adds three read-only endpoints that expose the vertical AI configuration as
a first-class API, enabling dynamic capability-driven UIs and reducing invalid
requests that hit the server only to fail a capability check.

Beyond simple exposure, the task adds **`prohibitedCapabilities`** as a first-class
field alongside `allowedCapabilities`. Some verticals must explicitly prohibit
certain capabilities even when they are on the plan (e.g. `function_call` auto-
writes are inappropriate for `legal-firm` or `health-clinic` without HITL). A
prohibitions list makes this machine-readable for compliance audit tooling.

## Done looks like
- `GET /superagent/capabilities` — returns the full catalogue of all known
  `AICapabilityType` values with a human-readable `displayName`, `description`, and
  `pillar` (1 = General, 2 = Commercial, 3 = Regulated). No auth required (public).
- `GET /superagent/vertical/:slug/capabilities` — returns the full `VerticalAiConfig`
  for that slug: `allowedCapabilities`, `prohibitedCapabilities`, `primaryPillar`,
  `aiUseCases`, `contextWindowTokens`. Falls back to `DEFAULT_VERTICAL_AI_CONFIG` for
  unknown slugs (never 404). Auth required.
- `GET /superagent/vertical/:slug/capabilities/check?capability=X` — returns
  `{ allowed: true|false, reason: "..." }` in O(1). Auth required. This is the hot
  path called by UIs before enabling/disabling feature toggles.
- `prohibitedCapabilities` added to `VerticalAiConfig` interface and to all 159
  configs that need it (especially legal, health, finance, sensitive-sector verticals
  where auto-execution without HITL is inappropriate).
- The compliance pre-check in `/chat` is updated to also reject requests where the
  capability is in `prohibitedCapabilities` (not just absent from `allowedCapabilities`
  — the two lists can overlap differently after this change).
- `GET /superagent/capabilities` and the check route are documented in OpenAPI.
- TypeScript: 0 errors.
- Push to staging, CI green, merge to main.

## Out of scope
- Writing or mutating vertical configs at runtime (configs are code, not DB rows)
- Per-workspace capability overrides (plan-tier caps are handled by billing separately)
- UI implementation for capability-driven feature flags (API-only task)

## Steps
1. **`CapabilityMetadata` registry** — Create
   `packages/superagent/src/capability-metadata.ts` with a `CAPABILITY_METADATA`
   map: `AICapabilityType → { displayName, description, pillar: 1|2|3 }`. Cover all
   23 capability types in the NDPR register.

2. **`prohibitedCapabilities` field** — Add `prohibitedCapabilities?: readonly
   AICapabilityType[]` to `VerticalAiConfig`. Add explicit prohibition lists to all
   verticals where unguarded auto-execution of `function_call`, `price_suggest`, or
   write-adjacent capabilities is inappropriate (health, legal, finance, orphanage,
   artisanal-mining, etc.). Leave most commercial verticals with an empty list.

3. **`/superagent/capabilities` route** — No auth. Returns `{ capabilities:
   CapabilityMetadata[] }` ordered by pillar then alphabetically.

4. **`/superagent/vertical/:slug/capabilities` route** — Auth required, tenant-scoped.
   Calls `getVerticalAiConfig(slug)` and returns the full config augmented with
   `prohibitedCapabilities`. Never returns 404 (falls back to default).

5. **`/superagent/vertical/:slug/capabilities/check` route** — Auth required. Accepts
   `?capability=X`. Returns `{ allowed: boolean, prohibited: boolean, reason: string }`.
   Reason strings: `"capability_allowed"`, `"not_in_allowed_list"`,
   `"explicitly_prohibited"`.

6. **Compliance pre-check update** — In `/chat`, after the existing `allowedCapabilities`
   check, add a second guard: if the requested capability is in `prohibitedCapabilities`,
   return 403 `CAPABILITY_PROHIBITED_FOR_VERTICAL`.

7. **Export new types** — Export `CapabilityMetadata` and `CAPABILITY_METADATA` from
   `packages/superagent/src/index.ts`.

8. **OpenAPI** — Document all three new routes in `docs/openapi/v1.yaml` under the
   SuperAgent tag.

9. **Push to staging, CI green, merge to main.**

## Relevant files
- `packages/superagent/src/vertical-ai-config.ts`
- `packages/superagent/src/ndpr-register.ts`
- `packages/superagent/src/index.ts`
- `packages/ai-abstraction/src/capabilities.ts`
- `apps/api/src/routes/superagent.ts:249-300`
- `docs/openapi/v1.yaml:1421-1580`
