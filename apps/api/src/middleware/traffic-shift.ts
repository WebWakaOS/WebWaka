/**
 * Traffic Shift Feature Flag System
 * 
 * Phase 2, Item 6: Begin 10% Traffic Shift to Engine
 * 
 * Implements gradual traffic routing from legacy to engine routes
 * using percentage-based feature flags.
 */

import type { Context } from 'hono';

export interface TrafficShiftConfig {
  enabled: boolean;
  percentage: number; // 0-100
  verticals: string[]; // Specific verticals to shift, or ['*'] for all
  allowHeader: boolean; // Allow X-Use-Engine header override
  allowQueryParam: boolean; // Allow ?use_engine=1 query param override
}

const DEFAULT_CONFIG: TrafficShiftConfig = {
  enabled: true,
  percentage: 0, // Start at 0%, gradually increase
  verticals: ['*'], // All verticals
  allowHeader: true,
  allowQueryParam: false, // Disabled in production for security
};

/**
 * Traffic shift configuration per environment
 */
export const TRAFFIC_SHIFT_CONFIGS: Record<string, TrafficShiftConfig> = {
  development: {
    enabled: true,
    percentage: 100, // Full traffic in dev for testing
    verticals: ['*'],
    allowHeader: true,
    allowQueryParam: true,
  },
  staging: {
    enabled: true,
    percentage: 10, // Start with 10% in staging
    verticals: ['bakery', 'hotel', 'pharmacy', 'gym', 'church'], // Only tested verticals
    allowHeader: true,
    allowQueryParam: true,
  },
  production: {
    enabled: false, // Disabled until staging proves stable
    percentage: 0,
    verticals: [],
    allowHeader: false,
    allowQueryParam: false,
  },
};

/**
 * Get current environment's traffic shift config
 */
export function getTrafficShiftConfig(): TrafficShiftConfig {
  const env = process.env.NODE_ENV || 'development';
  return TRAFFIC_SHIFT_CONFIGS[env] || DEFAULT_CONFIG;
}

/**
 * Determine if request should use engine routes
 * 
 * Decision logic:
 * 1. Check explicit header override (if allowed)
 * 2. Check query param override (if allowed)  
 * 3. Apply percentage-based routing
 * 4. Check if vertical is in allowed list
 */
export function shouldUseEngine(c: Context, vertical?: string): boolean {
  const config = getTrafficShiftConfig();

  if (!config.enabled) {
    return false;
  }

  // 1. Check explicit header override
  if (config.allowHeader) {
    const headerValue = c.req.header('X-Use-Engine');
    if (headerValue === '1' || headerValue === 'true') {
      return true;
    }
    if (headerValue === '0' || headerValue === 'false') {
      return false;
    }
  }

  // 2. Check query param override
  if (config.allowQueryParam) {
    const queryValue = c.req.query('use_engine');
    if (queryValue === '1' || queryValue === 'true') {
      return true;
    }
    if (queryValue === '0' || queryValue === 'false') {
      return false;
    }
  }

  // 3. Check if vertical is in allowed list
  if (vertical && config.verticals.length > 0 && !config.verticals.includes('*')) {
    if (!config.verticals.includes(vertical)) {
      return false;
    }
  }

  // 4. Apply percentage-based routing
  // Use deterministic hashing for consistent user experience
  const userId = c.get('auth')?.userId || c.req.header('X-User-ID') || 'anonymous';
  const hash = simpleHash(userId + vertical);
  const bucket = hash % 100;

  return bucket < config.percentage;
}

/**
 * Simple hash function for consistent bucketing
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Middleware to add traffic shift headers to response
 * Useful for debugging and monitoring
 */
export function trafficShiftHeadersMiddleware(c: Context, next: () => Promise<void>) {
  return next().then(() => {
    const config = getTrafficShiftConfig();
    c.header('X-Traffic-Shift-Enabled', config.enabled.toString());
    c.header('X-Traffic-Shift-Percentage', config.percentage.toString());
  });
}

/**
 * Log traffic shift decision for monitoring
 */
export function logTrafficShift(
  vertical: string,
  useEngine: boolean,
  reason: 'percentage' | 'header' | 'query' | 'disabled'
) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    event: 'traffic_shift',
    vertical,
    useEngine,
    reason,
  }));
}

// ---------------------------------------------------------------------------
// M-2: Extended metrics — latency percentiles + per-cohort error rates
// ---------------------------------------------------------------------------

/**
 * Extended traffic-shift metrics with canary health observability (M-2).
 *
 * Latency samples are kept in a fixed-size circular buffer (last 1,000 per
 * cohort) so P50/P95 computation doesn't grow unboundedly.
 * Error rates are tracked per cohort (engine vs legacy).
 */
export interface CanaryHealthMetrics {
  config: TrafficShiftConfig;
  stats: {
    totalRequests: number;
    engineRequests: number;
    legacyRequests: number;
    /** Actual engine routing percentage (may differ from configured %) */
    enginePercentage: number;
    engine: {
      errorCount: number;
      errorRate: number;        // 0–1
      latencyP50Ms: number | null;
      latencyP95Ms: number | null;
    };
    legacy: {
      errorCount: number;
      errorRate: number;
      latencyP50Ms: number | null;
      latencyP95Ms: number | null;
    };
  };
  health: 'healthy' | 'degraded' | 'critical';
  /** ISO-8601 timestamp of last reset */
  since: string;
}

/** Threshold above which canary is considered degraded / critical */
const ERROR_RATE_WARN = 0.05;   // 5 %
const ERROR_RATE_CRIT = 0.10;   // 10 %
const LATENCY_BUF_SIZE = 1_000;

interface CohortStore {
  requests: number;
  errors: number;
  latencySamples: number[];   // circular — filled via push+shift
}

interface ExtendedMetricsStore {
  engine: CohortStore;
  legacy: CohortStore;
  since: string;
}

let extendedStore: ExtendedMetricsStore = {
  engine: { requests: 0, errors: 0, latencySamples: [] },
  legacy: { requests: 0, errors: 0, latencySamples: [] },
  since: new Date().toISOString(),
};

/** Compute a percentile (0–100) from a sorted array. Returns null if empty. */
function percentile(sorted: number[], p: number): number | null {
  if (sorted.length === 0) return null;
  const idx = Math.floor((p / 100) * (sorted.length - 1));
  return sorted[idx] ?? null;
}

/**
 * Record a completed request for M-2 observability.
 * Call this AFTER the upstream handler returns.
 *
 * @param useEngine  Whether the engine cohort handled this request
 * @param latencyMs  Response latency in milliseconds
 * @param isError    Whether the response was a 5xx / transport error
 * @param logger     Optional structured logger (console-compatible)
 */
export function recordCanaryRequest(
  useEngine: boolean,
  latencyMs: number,
  isError: boolean,
  logger?: { warn: (msg: string, ctx?: unknown) => void },
): void {
  const cohort = useEngine ? extendedStore.engine : extendedStore.legacy;
  const cohortName = useEngine ? 'engine' : 'legacy';

  cohort.requests++;
  if (isError) cohort.errors++;

  // Maintain fixed-size sample buffer
  if (cohort.latencySamples.length >= LATENCY_BUF_SIZE) {
    cohort.latencySamples.shift();
  }
  cohort.latencySamples.push(latencyMs);

  // Structured log every request for Cloudflare Logpush / logflare
  const errorRate = cohort.requests > 0 ? cohort.errors / cohort.requests : 0;

  if (isError || errorRate >= ERROR_RATE_WARN) {
    const level = errorRate >= ERROR_RATE_CRIT ? 'critical' : 'warn';
    (logger ?? console).warn(
      `[traffic-shift] canary ${level}: ${cohortName} error_rate=${(errorRate * 100).toFixed(1)}%`,
      {
        event: 'canary_health_degraded',
        cohort: cohortName,
        errorRate,
        level,
        latencyMs,
        totalRequests: cohort.requests,
      },
    );
  }
}

/** Legacy compatibility — also updates extended store */
export interface TrafficShiftMetrics {
  config: TrafficShiftConfig;
  stats: {
    totalRequests: number;
    engineRequests: number;
    legacyRequests: number;
    enginePercentage: number;
  };
}

// In-memory stats (reset on server restart)
// In production, use Redis or similar for distributed stats
let metricsStore = {
  totalRequests: 0,
  engineRequests: 0,
  legacyRequests: 0,
};

export function recordTrafficShiftDecision(useEngine: boolean) {
  metricsStore.totalRequests++;
  if (useEngine) {
    metricsStore.engineRequests++;
  } else {
    metricsStore.legacyRequests++;
  }
}

export function getTrafficShiftMetrics(): TrafficShiftMetrics {
  const total = metricsStore.totalRequests || 1;
  return {
    config: getTrafficShiftConfig(),
    stats: {
      ...metricsStore,
      enginePercentage: (metricsStore.engineRequests / total) * 100,
    },
  };
}

export function resetTrafficShiftMetrics() {
  metricsStore = { totalRequests: 0, engineRequests: 0, legacyRequests: 0 };
  extendedStore = {
    engine: { requests: 0, errors: 0, latencySamples: [] },
    legacy: { requests: 0, errors: 0, latencySamples: [] },
    since: new Date().toISOString(),
  };
}

/** Returns full canary health metrics (M-2). */
export function getCanaryHealthMetrics(): CanaryHealthMetrics {
  const total = metricsStore.totalRequests || 1;

  const buildCohort = (c: CohortStore) => {
    const sorted = [...c.latencySamples].sort((a, b) => a - b);
    const errorRate = c.requests > 0 ? c.errors / c.requests : 0;
    return {
      errorCount: c.errors,
      errorRate,
      latencyP50Ms: percentile(sorted, 50),
      latencyP95Ms: percentile(sorted, 95),
    };
  };

  const engineStats = buildCohort(extendedStore.engine);
  const legacyStats = buildCohort(extendedStore.legacy);

  const maxErrorRate = Math.max(engineStats.errorRate, legacyStats.errorRate);
  const health: CanaryHealthMetrics['health'] =
    maxErrorRate >= ERROR_RATE_CRIT
      ? 'critical'
      : maxErrorRate >= ERROR_RATE_WARN
        ? 'degraded'
        : 'healthy';

  return {
    config: getTrafficShiftConfig(),
    stats: {
      totalRequests: metricsStore.totalRequests,
      engineRequests: metricsStore.engineRequests,
      legacyRequests: metricsStore.legacyRequests,
      enginePercentage: (metricsStore.engineRequests / total) * 100,
      engine: engineStats,
      legacy: legacyStats,
    },
    health,
    since: extendedStore.since,
  };
}
