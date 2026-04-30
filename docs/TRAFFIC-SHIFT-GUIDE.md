# Traffic Shift System - Implementation Guide

**Status**: ✅ Implemented  
**Current Environment**: Staging (10% shift to engine)  
**Tested Verticals**: bakery, hotel, pharmacy, gym, church

---

## Overview

The traffic shift system enables gradual migration from legacy vertical routes to the new vertical-engine routes with controlled, percentage-based traffic routing.

---

## Architecture

### Components

1. **Feature Flag System** (`middleware/traffic-shift.ts`)
   - Percentage-based routing
   - Per-vertical configuration
   - User-based consistent hashing
   - Header/query param overrides

2. **Admin API** (`routes/traffic-shift.ts`)
   - Monitor traffic metrics
   - Adjust percentage runtime
   - Enable/disable shift
   - Manage vertical whitelist

3. **Metrics Tracking**
   - Total requests
   - Engine vs legacy split
   - Actual percentage achieved

---

## Configuration

### Environment-Based Settings

```typescript
// Development: 100% traffic to engine for testing
development: {
  enabled: true,
  percentage: 100,
  verticals: ['*'],
  allowHeader: true,
  allowQueryParam: true,
}

// Staging: 10% traffic to tested verticals
staging: {
  enabled: true,
  percentage: 10,
  verticals: ['bakery', 'hotel', 'pharmacy', 'gym', 'church'],
  allowHeader: true,
  allowQueryParam: true,
}

// Production: Disabled until staging proves stable
production: {
  enabled: false,
  percentage: 0,
  verticals: [],
  allowHeader: false,
  allowQueryParam: false,
}
```

### Routing Logic

1. **Header Override** (if enabled): `X-Use-Engine: 1`
2. **Query Param** (if enabled): `?use_engine=1`
3. **Vertical Whitelist**: Check if vertical is allowed
4. **Percentage Routing**: Deterministic hash-based bucketing

---

## API Endpoints

### Get Status & Metrics
```bash
GET /admin/traffic-shift
Authorization: Bearer <admin-token>
```

**Response**:
```json
{
  "current": {
    "config": {
      "enabled": true,
      "percentage": 10,
      "verticals": ["bakery", "hotel", "pharmacy", "gym", "church"],
      "allowHeader": true,
      "allowQueryParam": true
    },
    "stats": {
      "totalRequests": 1000,
      "engineRequests": 105,
      "legacyRequests": 895,
      "enginePercentage": 10.5
    }
  },
  "environments": { /* all env configs */ },
  "activeEnvironment": "staging"
}
```

### Update Percentage
```bash
POST /admin/traffic-shift/percentage
Authorization: Bearer <super-admin-token>
Content-Type: application/json

{
  "percentage": 25
}
```

### Enable/Disable
```bash
POST /admin/traffic-shift/toggle
Authorization: Bearer <super-admin-token>
Content-Type: application/json

{
  "enabled": false
}
```

### Update Vertical Whitelist
```bash
POST /admin/traffic-shift/verticals
Authorization: Bearer <super-admin-token>
Content-Type: application/json

{
  "verticals": ["bakery", "hotel", "pharmacy", "gym", "church", "restaurant"]
}
```

### Reset Metrics
```bash
POST /admin/traffic-shift/metrics/reset
Authorization: Bearer <admin-token>
```

---

## Usage Examples

### Testing Specific Routes

**Force Engine Route**:
```bash
curl -H "X-Use-Engine: 1" https://api.webwaka.com/bakery/profiles
```

**Force Legacy Route**:
```bash
curl -H "X-Use-Engine: 0" https://api.webwaka.com/v1/verticals/bakery/profiles
```

### Monitoring Traffic Split

```bash
# Get current metrics
curl -H "Authorization: Bearer <token>" \
  https://api.webwaka.com/admin/traffic-shift/metrics

# Response
{
  "config": { "enabled": true, "percentage": 10, ... },
  "stats": {
    "totalRequests": 5000,
    "engineRequests": 520,
    "legacyRequests": 4480,
    "enginePercentage": 10.4
  }
}
```

---

## Migration Phases

### Phase 1: 10% Shift (Current - Staging)
- **Verticals**: 5 tested (bakery, hotel, pharmacy, gym, church)
- **Duration**: 1-2 weeks
- **Monitoring**: Error rates, response times, data consistency
- **Rollback**: Set percentage to 0 or disable

### Phase 2: 25% Shift
- **Trigger**: Phase 1 stable for 1 week, zero incidents
- **Verticals**: Same 5 + newly expanded
- **Duration**: 1-2 weeks
- **Monitoring**: Increased scrutiny on performance

### Phase 3: 50% Shift
- **Trigger**: Phase 2 stable, performance within targets
- **Verticals**: All tested verticals (up to 32)
- **Duration**: 2-4 weeks
- **Monitoring**: Production metrics, user feedback

### Phase 4: 75% Shift
- **Trigger**: Phase 3 stable, full confidence
- **Verticals**: All verticals
- **Duration**: 2-3 weeks
- **Monitoring**: Prepare for 100%

### Phase 5: 100% Shift
- **Trigger**: Phase 4 stable, executive approval
- **Verticals**: All 155 verticals
- **Action**: Disable legacy routes, mark deprecated
- **Timeline**: After 8-12 weeks of gradual rollout

---

## Monitoring & Alerts

### Key Metrics

1. **Error Rate Comparison**
   - Legacy 4xx/5xx rates
   - Engine 4xx/5xx rates
   - Alert if engine > legacy + 5%

2. **Response Time Comparison**
   - Legacy P95/P99
   - Engine P95/P99
   - Alert if engine > legacy * 1.2

3. **Traffic Distribution**
   - Actual % vs target %
   - Alert if deviation > 5%

4. **Data Consistency**
   - Compare response data
   - Parity test pass rate
   - Alert on any failures

### Alert Thresholds

| Metric | Threshold | Action |
|--------|-----------|--------|
| Engine Error Rate | > Legacy + 5% | Reduce percentage by 50% |
| Engine P95 | > Legacy * 1.2 | Investigate, consider rollback |
| Parity Failures | > 0 | Immediate rollback to 0% |
| Traffic Deviation | > 10% from target | Check bucketing algorithm |

---

## Rollback Procedure

### Immediate Rollback (< 1 minute)
```bash
# Set percentage to 0
curl -X POST https://api.webwaka.com/admin/traffic-shift/percentage \
  -H "Authorization: Bearer <super-admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"percentage": 0}'

# Or disable entirely
curl -X POST https://api.webwaka.com/admin/traffic-shift/toggle \
  -H "Authorization: Bearer <super-admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'
```

### Post-Rollback Actions
1. Analyze logs for root cause
2. Run comprehensive parity tests
3. Fix identified issues
4. Test fixes in development
5. Gradual re-enable after validation

---

## Testing Procedures

### Pre-Shift Checklist
- [ ] Parity tests 100% passing
- [ ] Performance baselines established
- [ ] Monitoring dashboards configured
- [ ] Alert thresholds set
- [ ] Rollback procedure tested
- [ ] Team trained on monitoring

### During Shift
- [ ] Monitor every 15 minutes first hour
- [ ] Monitor hourly first day
- [ ] Monitor daily first week
- [ ] Weekly review with team

### Post-Shift Validation
- [ ] Error rates within acceptable range
- [ ] Performance within targets
- [ ] No data consistency issues
- [ ] User feedback positive
- [ ] Ready for next phase

---

## Current Status

### Phase 1: 10% Shift - IMPLEMENTED

**Configuration**:
- Enabled: ✅ Yes (staging only)
- Percentage: 10%
- Verticals: bakery, hotel, pharmacy, gym, church
- Header override: ✅ Enabled
- Query param override: ✅ Enabled (staging only)

**Metrics** (To be collected):
- Total requests: TBD
- Engine requests: TBD
- Legacy requests: TBD
- Actual percentage: TBD

**Next Steps**:
1. Deploy to staging environment
2. Monitor for 24 hours
3. Collect initial metrics
4. Validate error rates and performance
5. Proceed to 25% after 1 week stability

---

## References

- [Parity Testing Documentation](../../packages/vertical-engine/docs/PARITY-TESTING.md)
- [Performance Baselines](../../packages/vertical-engine/docs/PERFORMANCE-BASELINE.md)
- [Vertical Engine Architecture](../../packages/vertical-engine/README.md)

---

**Last Updated**: 2025-01-07  
**Next Review**: After 1 week of 10% traffic  
**Owner**: Platform Engineering Team
