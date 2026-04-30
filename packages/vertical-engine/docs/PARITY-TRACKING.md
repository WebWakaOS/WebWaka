# Parity Test Tracking Dashboard

## Overview

This document tracks the status of parity tests across all 155 verticals to ensure engine routes produce identical results to legacy routes.

## Test Coverage Summary

| Category | Count | Status |
|----------|-------|--------|
| **Total Verticals** | 155 | - |
| **Full Configs** | 5 | ✅ Ready for testing |
| **Stub Configs** | 150 | ⏳ Awaiting expansion |
| **Tests Written** | 5 | ✅ Complete |
| **Tests Passing** | 0 | ⚠️ Requires test execution |

## Testing Strategy

### Phase 1: Foundation (Current)
- **Scope**: 5 verticals with full configs
- **Verticals**: bakery, hotel, pharmacy, gym, church
- **Tests**: Basic CRUD operations
- **Status**: ✅ Tests written, awaiting execution

### Phase 2: High-Priority Expansion
- **Scope**: 32 high-priority verticals
- **Timeline**: After config expansion
- **Tests**: CRUD + FSM transitions
- **Status**: ⏳ Blocked on Phase C expansion

### Phase 3: Full Coverage
- **Scope**: All 155 verticals
- **Timeline**: Incremental rollout
- **Tests**: Complete feature parity
- **Status**: 📋 Planned

## Test Matrix

### Fully Tested (5 verticals)

| Vertical | CRUD | FSM | Sub-Entities | Parity % | Last Run |
|----------|------|-----|--------------|----------|----------|
| bakery | ✅ | ⏳ | ⏳ | - | Not yet run |
| hotel | ✅ | ⏳ | ⏳ | - | Not yet run |
| pharmacy | ✅ | ⏳ | ⏳ | - | Not yet run |
| gym | ✅ | ⏳ | ⏳ | - | Not yet run |
| church | ✅ | ⏳ | ⏳ | - | Not yet run |

### High-Priority Queue (32 verticals)

**Commerce (10)**
- restaurant, supermarket, marketplace, beauty-salon, barber-shop
- auto-mechanic, petrol-station, car-wash, laundry, tailor

**Civic (5)**
- mosque, ngo, youth-organization, womens-association, government-agency

**Health & Education (5)**
- dental-clinic, optician, vet-clinic, private-school, training-institute

**Transport & Logistics (4)**
- logistics-delivery, cargo-truck, dispatch-rider, okada-keke

**Professional Services (4)**
- law-firm, accounting-firm, event-planner, photography-studio

**Agriculture & Food (4)**
- farm, poultry-farm, fish-market, food-processing

### Remaining Stubs (118 verticals)
Status: ⏳ Awaiting config expansion before testing

## Execution Instructions

### Prerequisites

```bash
# 1. Ensure backend is running
cd /app/webwaka-repo/apps/api
pnpm run dev

# 2. Set test environment variables
export API_BASE_URL=http://localhost:8001
export TEST_TOKEN=<valid-jwt-token>
```

### Running Tests

```bash
# Run all parity tests
cd packages/vertical-engine
pnpm test parity

# Run specific vertical
pnpm test parity -- bakery

# Generate report
pnpm test parity -- --reporter=verbose > parity-report.txt
```

### Continuous Monitoring

```bash
# Watch mode for development
pnpm test parity -- --watch

# CI/CD integration
pnpm test parity -- --ci --coverage
```

## Success Criteria

### Per-Vertical Criteria
- ✅ All HTTP status codes match
- ✅ Response body structure identical
- ✅ Critical headers match (content-type, etag)
- ✅ Performance within 20% of legacy
- ✅ No data loss or corruption

### Overall Migration Criteria
- 🎯 100% parity for all tested endpoints
- 🎯 ≥ 95% performance baseline maintained
- 🎯 Zero production incidents
- 🎯 Gradual traffic shift: 10% → 50% → 100%

## Known Issues & Exceptions

### Acceptable Differences
1. **Timestamps**: Slight variations in server-generated timestamps (< 1s)
2. **IDs**: Different ID generation strategies (UUID vs ObjectID) - normalized
3. **Headers**: Non-critical header differences (x-request-id, etc.)

### Blockers
- None currently identified

## Test Results Archive

### Latest Run: Not Yet Executed
- **Date**: -
- **Verticals Tested**: 0
- **Pass Rate**: -
- **Performance Delta**: -

### Historical Trends
| Date | Verticals | Pass Rate | Avg Performance |
|------|-----------|-----------|-----------------|
| - | - | - | - |

## Action Items

### Immediate (Week 1)
- [ ] Execute initial parity tests for 5 full-config verticals
- [ ] Document any discrepancies found
- [ ] Fix critical parity failures
- [ ] Establish baseline performance metrics

### Short-term (Weeks 2-4)
- [ ] Expand 10 high-priority verticals
- [ ] Write parity tests for expanded verticals
- [ ] Run tests and fix issues
- [ ] Begin gradual traffic shift (10%)

### Medium-term (Months 2-3)
- [ ] Expand remaining 22 high-priority verticals
- [ ] Achieve 100% parity for high-priority set
- [ ] Increase traffic to 50%
- [ ] Monitor production metrics

### Long-term (Months 4-6)
- [ ] Expand all 150 remaining stub configs
- [ ] Complete parity testing for all 155 verticals
- [ ] Shift 100% traffic to engine routes
- [ ] Deprecate legacy vertical routes

## Appendix

### Test Automation

```yaml
# .github/workflows/parity-tests.yml
name: Parity Tests
on:
  pull_request:
    paths:
      - 'packages/vertical-engine/**'
      - 'apps/api/src/routes/**'
  schedule:
    - cron: '0 2 * * *'  # Nightly at 2 AM

jobs:
  parity:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm --filter @webwaka/vertical-engine test parity
      - name: Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: parity-report
          path: packages/vertical-engine/parity-report.md
```

### Monitoring Dashboard

Track parity metrics in production:
- Request success rate (legacy vs engine)
- Response time percentiles (p50, p95, p99)
- Error rate comparison
- Data integrity checks

### References
- [Parity Testing Documentation](./PARITY-TESTING.md)
- [Expansion Patterns](./EXPANSION-PATTERNS.md)
- [AI Transformation Plan](../../docs/plans/AI-TRANSFORMATION-IMPLEMENTATION-PLAN.md)
