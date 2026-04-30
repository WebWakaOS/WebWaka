# Parity Testing Framework

## Overview

The parity testing framework validates that the new **vertical-engine** routes produce identical results to legacy vertical-specific routes, enabling confident gradual migration.

## Architecture

### Dual-Path Routing

Both legacy and engine routes are mounted simultaneously:

```
/v1/verticals/bakery/*  → Legacy handler (existing code)
/bakery/*               → Engine handler (vertical-engine)
```

Engine routes are triggered via `X-Use-Engine: 1` header (feature flag).

### Test Strategy

1. **Same Request, Both Paths**: Send identical requests to legacy and engine routes
2. **Deep Comparison**: Compare status codes, response bodies, and headers
3. **Performance Metrics**: Track response times for regression detection
4. **Report Generation**: Automated reports showing pass/fail and performance

## Usage

### Running Parity Tests

```bash
# Run all parity tests
cd packages/vertical-engine
pnpm test parity

# Run specific vertical tests
pnpm test parity -- bakery

# Generate parity report
pnpm test parity -- --reporter=verbose
```

### Writing Custom Parity Tests

```typescript
import { createParityTest } from '@webwaka/vertical-engine/testing/parity-framework';

describe('Parity: My Vertical', () => {
  createParityTest({
    vertical: 'my-vertical',
    endpoint: '/profiles',
    method: 'GET',
    legacyPath: '/v1/verticals/my-vertical/profiles',
    enginePath: '/my-vertical/profiles',
    headers: { Authorization: `Bearer ${token}` },
  });
});
```

### Batch Testing

```typescript
import { runParityTestSuite, generateParityReport } from '@webwaka/vertical-engine/testing/parity-framework';

const results = await runParityTestSuite([
  { vertical: 'bakery', endpoint: '/profiles', method: 'GET', legacyPath: '...', enginePath: '...' },
  { vertical: 'hotel', endpoint: '/profiles', method: 'GET', legacyPath: '...', enginePath: '...' },
  // ... more configs
]);

const report = generateParityReport(results);
console.log(report);
```

## Test Phases

### Phase 1: Core CRUD Operations (Current)

Testing basic operations for 5 sample verticals:
- `GET /profiles` - List all profiles
- `GET /profiles/:id` - Get single profile
- `POST /profiles` - Create profile
- `PATCH /profiles/:id` - Update profile
- `DELETE /profiles/:id` - Delete profile

**Verticals**: bakery, hotel, pharmacy, gym, church

### Phase 2: FSM Transitions (Next)

Testing state machine transitions:
- `POST /profiles/:id/claim` - Claim profile
- `POST /profiles/:id/activate` - Activate profile
- `GET /profiles/:id/history` - View state history

### Phase 3: Sub-Entities (Future)

Testing sub-entity operations:
- Inventory, offerings, staff, etc.
- Relationships and nested resources

### Phase 4: Full Vertical Suite (Future)

Expand to all 155 verticals with automated test generation.

## Configuration

### Environment Variables

```bash
API_BASE_URL=http://localhost:8001      # Backend URL
TEST_TOKEN=eyJhbGc...                    # Auth token for tests
PARITY_TIMEOUT=5000                      # Request timeout (ms)
PARITY_PARALLEL=false                    # Run tests in parallel
```

### Feature Flag

The `X-Use-Engine` header controls routing:
- `X-Use-Engine: 1` → Routes to engine
- No header or `X-Use-Engine: 0` → Routes to legacy

## Metrics & Reporting

### Success Criteria

- **100% parity** for status codes
- **100% parity** for response structure
- **≤ 20% performance regression** acceptable during initial rollout

### Report Format

```markdown
# Parity Test Report

**Total Tests:** 25
**Passed:** ✅ 23
**Failed:** ❌ 2
**Success Rate:** 92.0%

## Failed Tests

### bakery - /profiles/:id
**Differences:**
- status mismatch: legacy=200, engine=404
- Response body structure differs

## Performance Comparison

| Vertical | Endpoint | Legacy (ms) | Engine (ms) | Difference |
|----------|----------|-------------|-------------|------------|
| bakery   | /profiles| 45          | 52          | +7         |
| hotel    | /profiles| 38          | 35          | -3         |
```

## CI Integration

Parity tests run automatically on:
- **Pull Requests** targeting `staging`
- **Nightly builds** for regression detection
- **Pre-deployment** checks

### GitHub Actions Workflow

```yaml
name: Parity Tests
on: [pull_request]
jobs:
  parity:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pnpm install
      - run: pnpm --filter @webwaka/vertical-engine test parity
      - run: pnpm run generate-parity-report
      - uses: actions/upload-artifact@v3
        with:
          name: parity-report
          path: parity-report.md
```

## Troubleshooting

### Common Issues

**Issue**: Tests fail with 401 Unauthorized
- **Fix**: Ensure `TEST_TOKEN` environment variable is set with valid auth token

**Issue**: Response body differences in timestamps
- **Fix**: Normalize timestamps before comparison or exclude from comparison

**Issue**: Performance regression detected
- **Fix**: Profile engine routes, optimize database queries, add caching

### Debug Mode

```bash
# Run with verbose logging
DEBUG=parity:* pnpm test parity

# Save detailed results to file
pnpm test parity -- --json > parity-results.json
```

## Roadmap

- [x] Phase B.1: Framework implementation
- [x] Phase B.2: Sample tests (5 verticals)
- [ ] Phase B.3: Automated test generation
- [ ] Phase B.4: Performance profiling integration
- [ ] Phase B.5: Full 155-vertical coverage

## References

- [AI Transformation Implementation Plan](../docs/plans/AI-TRANSFORMATION-IMPLEMENTATION-PLAN.md)
- [Vertical Engine Architecture](./README.md)
- [Dual-Path Routing RFC](../docs/rfcs/dual-path-routing.md)
