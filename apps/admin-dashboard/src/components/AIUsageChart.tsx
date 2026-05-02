/**
 * AIUsageChart — Wave 3 A6-2
 * apps/admin-dashboard
 *
 * Admin component showing:
 *   - Daily AI spend (WakaCU) bar chart — last 30 days
 *   - Top 5 tenants by WakaCU spend
 *   - Top 5 capabilities by call count
 *
 * Data source: GET /admin/ai/usage?days=30 (implemented A6-1)
 * Plain SVG charts — no external charting library.
 * Auto-refreshes every 60 s by default.
 */
import React, { useState, useEffect, useCallback } from 'react';

export interface DailySpend {
  date: string;          // YYYY-MM-DD
  wakaCuTotal: number;
  callCount: number;
}
export interface TenantSpend {
  tenantId: string;
  tenantName?: string;
  wakaCuTotal: number;
  callCount: number;
}
export interface CapabilityUsage {
  capability: string;
  callCount: number;
  wakaCuTotal: number;
}
export interface AIUsageData {
  dailySpend: DailySpend[];
  topTenants: TenantSpend[];
  topCapabilities: CapabilityUsage[];
  periodStart: string;
  periodEnd: string;
  totalWakaCu: number;
  totalCalls: number;
}
export interface AIUsageChartProps {
  apiBaseUrl?: string;
  refreshIntervalMs?: number;
}

function BarChart({ data, valueKey, labelKey, color = '#6366f1' }: {
  data: Record<string, unknown>[];
  valueKey: string;
  labelKey: string;
  color?: string;
}) {
  if (!data.length) return <p className="text-sm text-gray-400 italic">No data</p>;
  const values = data.map(d => Number(d[valueKey]) || 0);
  const maxVal = Math.max(...values, 1);
  const totalW = 560;
  const barW = Math.max(2, Math.floor(totalW / data.length) - 2);
  return (
    <svg viewBox={`0 0 ${totalW} 80`} className="w-full h-20" aria-hidden="true">
      {data.map((d, i) => {
        const val = Number(d[valueKey]) || 0;
        const h = Math.max(2, Math.round((val / maxVal) * 70));
        return (
          <rect key={String(d[labelKey])} x={i * (barW + 2)} y={80 - h}
                width={barW} height={h} fill={color} rx={2}
                aria-label={`${String(d[labelKey])}: ${val}`} />
        );
      })}
    </svg>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-semibold text-gray-800 mt-1">{value}</p>
    </div>
  );
}

export const AIUsageChart: React.FC<AIUsageChartProps> = ({
  apiBaseUrl = '', refreshIntervalMs = 60_000,
}) => {
  const [data, setData] = useState<AIUsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/ai/usage?days=30`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json() as AIUsageData);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    void load();
    if (!refreshIntervalMs) return;
    const id = setInterval(() => void load(), refreshIntervalMs);
    return () => clearInterval(id);
  }, [load, refreshIntervalMs]);

  if (loading && !data) {
    return (
      <div className="animate-pulse space-y-4" role="status" aria-busy="true">
        <div className="h-4 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-3 gap-3">
          {[0,1,2].map(i => <div key={i} className="h-16 bg-gray-200 rounded" />)}
        </div>
        <div className="h-20 bg-gray-200 rounded" />
        <p className="sr-only">Loading AI usage data…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div role="alert" className="text-sm text-red-600 flex items-center gap-3">
        <span>⚠️ {error}</span>
        <button onClick={() => void load()} className="underline hover:no-underline">Retry</button>
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="space-y-6" data-testid="ai-usage-chart">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">AI Usage Overview</h2>
        <span className="text-xs text-gray-400">{data.periodStart} → {data.periodEnd}</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Tile label="Total WakaCU" value={data.totalWakaCu.toLocaleString()} />
        <Tile label="Total Calls"  value={data.totalCalls.toLocaleString()} />
        <Tile label="Active Tenants" value={data.topTenants.length.toLocaleString()} />
      </div>

      <div>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Daily Spend (WakaCU) — Last 30 days
        </h3>
        <BarChart data={data.dailySpend as unknown as Record<string, unknown>[]}
                  valueKey="wakaCuTotal" labelKey="date" color="#6366f1" />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{data.dailySpend[0]?.date ?? ''}</span>
          <span>{data.dailySpend[data.dailySpend.length - 1]?.date ?? ''}</span>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Top Tenants by Spend</h3>
        <table className="w-full text-xs" aria-label="Top tenants by AI spend">
          <thead>
            <tr className="text-gray-400 border-b border-gray-100">
              <th className="text-left py-1.5 font-medium">Tenant</th>
              <th className="text-right py-1.5 font-medium">WakaCU</th>
              <th className="text-right py-1.5 font-medium">Calls</th>
            </tr>
          </thead>
          <tbody>
            {data.topTenants.slice(0, 5).map(t => (
              <tr key={t.tenantId} className="border-b border-gray-50 last:border-0">
                <td className="py-1.5 text-gray-700">{t.tenantName ?? t.tenantId}</td>
                <td className="py-1.5 text-right font-mono text-gray-700">{t.wakaCuTotal.toLocaleString()}</td>
                <td className="py-1.5 text-right text-gray-400">{t.callCount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Top Capabilities</h3>
        <BarChart data={data.topCapabilities as unknown as Record<string, unknown>[]}
                  valueKey="callCount" labelKey="capability" color="#10b981" />
        <div className="flex flex-wrap gap-2 mt-2">
          {data.topCapabilities.slice(0, 5).map(c => (
            <span key={c.capability}
                  className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-mono">
              {c.capability}: {c.callCount.toLocaleString()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIUsageChart;
