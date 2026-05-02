/**
 * ErrorRateChart — Wave 3 C6-4
 * [apps/admin-dashboard] Error rate dashboard (5xx by route, last 24h)
 *
 * Displays HTTP 5xx rate per API route over the last 24 hours.
 * Data sources:
 *   - Primary: ai_usage_events.error field (structured events from AI adapter)
 *   - Secondary: Logpush aggregation endpoint (GET /internal/admin/error-stats)
 *
 * Shows:
 *   - Stacked bar chart: 5xx count per route per hour
 *   - Summary table: top 10 routes by error count
 *   - Overall error rate % for the period
 *
 * Design tokens: uses @webwaka/design-system breakpoints (P4 mobile-first).
 */

import React, { useEffect, useState } from 'react';

export interface RouteErrorStats {
  route:       string;
  error_count: number;
  total_count: number;
  error_rate:  number; // 0–1
  p95_ms:      number;
}

export interface HourlyErrorPoint {
  hour:        string; // ISO-8601 hour bucket, e.g. "2026-05-02T09:00:00Z"
  error_count: number;
  total_count: number;
}

export interface ErrorRateData {
  period_start:    string;
  period_end:      string;
  overall_rate:    number;
  top_routes:      RouteErrorStats[];
  hourly_series:   HourlyErrorPoint[];
}

interface ErrorRateChartProps {
  /** API base URL — defaults to env var VITE_API_URL */
  apiBaseUrl?: string;
  /** JWT for the /internal/admin/error-stats endpoint */
  authToken:   string;
  /** Refresh interval in ms (default: 60_000) */
  refreshMs?:  number;
}

const formatRate = (r: number) => `${(r * 100).toFixed(2)}%`;
const formatHour = (iso: string) => {
  try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
  catch { return iso; }
};

/**
 * Fetches error stats from the admin endpoint.
 * Falls back to empty data if fetch fails (non-blocking dashboard).
 */
async function fetchErrorStats(baseUrl: string, token: string): Promise<ErrorRateData> {
  const res = await fetch(`${baseUrl}/internal/admin/error-stats?window=24h`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`error-stats fetch failed: ${res.status}`);
  return res.json() as Promise<ErrorRateData>;
}

const EMPTY: ErrorRateData = {
  period_start: '', period_end: '',
  overall_rate: 0, top_routes: [], hourly_series: [],
};

export function ErrorRateChart({ apiBaseUrl, authToken, refreshMs = 60_000 }: ErrorRateChartProps) {
  const base = apiBaseUrl ?? (typeof import.meta !== 'undefined'
    ? (import.meta as { env?: Record<string, string> }).env?.['VITE_API_URL'] ?? '/api'
    : '/api');

  const [data, setData]       = useState<ErrorRateData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const d = await fetchErrorStats(base, authToken);
        if (!cancelled) { setData(d); setError(null); setLastFetch(new Date()); }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'fetch failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    const timer = setInterval(() => void load(), refreshMs);
    return () => { cancelled = true; clearInterval(timer); };
  }, [base, authToken, refreshMs]);

  const overallRateColor =
    data.overall_rate > 0.05 ? '#ef4444' :   // >5% — red
    data.overall_rate > 0.01 ? '#f59e0b' :   // >1% — amber
    '#22c55e';                                // green

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
          Error Rate — Last 24h
        </h2>
        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
          {lastFetch ? `Updated ${lastFetch.toLocaleTimeString()}` : 'Loading...'}
        </span>
      </div>

      {loading && <div style={{ color: '#6b7280' }}>Loading error stats...</div>}
      {error   && <div style={{ color: '#ef4444', fontSize: '0.875rem' }}>⚠ {error} — retrying in {Math.round(refreshMs / 1000)}s</div>}

      {!loading && !error && (
        <>
          {/* Overall rate pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: overallRateColor }}>
              {formatRate(data.overall_rate)}
            </span>
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>overall 5xx rate</span>
          </div>

          {/* Hourly bar chart (CSS-based for zero dependencies) */}
          {data.hourly_series.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>5xx count per hour</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '60px' }}>
                {data.hourly_series.map((pt) => {
                  const maxCount = Math.max(1, ...data.hourly_series.map(p => p.error_count));
                  const height   = Math.round((pt.error_count / maxCount) * 56);
                  return (
                    <div key={pt.hour} title={`${formatHour(pt.hour)}: ${pt.error_count} errors`}
                      style={{ flex: 1, height: `${height}px`, background: '#ef4444', borderRadius: '2px 2px 0 0', minWidth: '4px' }} />
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', color: '#9ca3af', marginTop: '2px' }}>
                <span>{data.period_start ? formatHour(data.period_start) : ''}</span>
                <span>{data.period_end   ? formatHour(data.period_end)   : ''}</span>
              </div>
            </div>
          )}

          {/* Top routes table */}
          {data.top_routes.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ textAlign: 'left',   padding: '0.5rem 0.75rem', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>Route</th>
                    <th style={{ textAlign: 'right',  padding: '0.5rem 0.75rem', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>5xx</th>
                    <th style={{ textAlign: 'right',  padding: '0.5rem 0.75rem', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>Total</th>
                    <th style={{ textAlign: 'right',  padding: '0.5rem 0.75rem', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>Rate</th>
                    <th style={{ textAlign: 'right',  padding: '0.5rem 0.75rem', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>P95 ms</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top_routes.map((r, i) => (
                    <tr key={r.route} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                      <td style={{ padding: '0.375rem 0.75rem', fontFamily: 'monospace', fontSize: '0.75rem' }}>{r.route}</td>
                      <td style={{ padding: '0.375rem 0.75rem', textAlign: 'right', color: r.error_count > 0 ? '#ef4444' : '#22c55e' }}>{r.error_count}</td>
                      <td style={{ padding: '0.375rem 0.75rem', textAlign: 'right', color: '#6b7280' }}>{r.total_count}</td>
                      <td style={{ padding: '0.375rem 0.75rem', textAlign: 'right',
                        color: r.error_rate > 0.05 ? '#ef4444' : r.error_rate > 0.01 ? '#f59e0b' : '#22c55e',
                        fontWeight: r.error_rate > 0.01 ? 600 : 400,
                      }}>{formatRate(r.error_rate)}</td>
                      <td style={{ padding: '0.375rem 0.75rem', textAlign: 'right', color: r.p95_ms > 2000 ? '#f59e0b' : '#6b7280' }}>{r.p95_ms}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data.top_routes.length === 0 && (
            <div style={{ color: '#22c55e', fontSize: '0.875rem' }}>
              ✓ No 5xx errors in the last 24 hours.
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ErrorRateChart;
