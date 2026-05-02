# Regression Gate — Wave 3 C1-2

Each test in this directory encodes a CRITICAL or HIGH issue from
`PRODUCTION_READINESS_BACKLOG.md` and the fixes committed in Wave 1-3.

If a test breaks, it means a previously-fixed bug has re-emerged.

| Test file | Issue encoded |
|-----------|---------------|
| `critical-migration-sql-syntax.test.ts` | Issue #1 — backslash-escaped quotes in SQLite migrations |
| `critical-no-rollback-in-forward-dir.test.ts` | Issue #2 — stray rollback files in apps/api/migrations |
| `high-monetary-float.test.ts` | P9 invariant — no floats in WakaCU accounting |
| `high-ai-direct-calls.test.ts` | P7 invariant — no direct AI SDK imports outside ai-adapters |
| `high-ndpr-consent-gate.test.ts` | NDPR — consent gate present on superagent routes |
| `high-credit-burn-integer.test.ts` | P9 — credit burn always returns integer wakaCuCharged |
| `high-spend-controls-integer.test.ts` | P9 — spend controls reject fractional monthlyLimitWakaCu |
| `high-partner-pool-integer.test.ts` | P9 — partner pool balance always integer |
| `high-fsm-no-unknown-transitions.test.ts` | FSM — no transitions to UNKNOWN state |
