# Mutation Testing Baseline — Wave 3 C1-3

Mutation tests for financial logic in:
- `packages/superagent/src/credit-burn.ts`  (P9 — integer ceil charge)
- `packages/superagent/src/spend-controls.ts` (P9 — integer budget validation)

## Philosophy
Financial logic must be mutation-resilient: flipping an operator, changing a
constant, or inverting a condition must cause at least one test to fail.
These tests are written with "mutation killers" in mind — each test targets
a specific code mutation that could cause silent billing errors.

## Running
```bash
# Via Stryker (mutation testing framework)
cd packages/superagent && pnpm stryker run

# Or run the companion unit tests directly:
cd tests/mutation && pnpm vitest run
```
