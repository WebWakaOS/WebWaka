/**
 * Overview page — E1-2: Partner KPI dashboard
 */
import { useEffect, useState } from 'react';
import { partnersApi, type UsageData, type SubPartnersData, type CreditsData } from '../lib/api';

interface KPI { label: string; value: string | number; sub?: string; }

function StatCard({ label, value, sub }: KPI) {
  return (
    <div style={{
      background: 'var(--dark)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '1.25rem 1rem', textAlign: 'center',
    }}>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 6 }}>{label}</div>
      {sub && <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function Overview() {
  const [kpis, setKpis] = useState<KPI[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [usageRes, subRes, credRes] = await partnersApi.overview();
        if (cancelled) return;
        const usage = usageRes.status === 'fulfilled' ? usageRes.value as UsageData : {} as UsageData;
        const subD  = subRes.status  === 'fulfilled' ? subRes.value  as SubPartnersData : { subPartners: [] };
        const credD = credRes.status === 'fulfilled' ? credRes.value as CreditsData : {};
        setKpis([
          { label: 'Sub-Tenants',    value: subD.subPartners.length },
          { label: 'Active Groups',  value: usage.activeGroups ?? '—' },
          { label: 'Total Members',  value: usage.totalMembers ?? '—' },
          {
            label: 'Credit Balance',
            value: credD.wallet ? `${credD.wallet.balanceWc} WC` : '—',
            sub:   credD.wallet ? `${credD.wallet.lifetimePurchasedWc} WC lifetime` : undefined,
          },
          { label: 'Total Allocated', value: credD.totalAllocatedWc != null ? `${credD.totalAllocatedWc} WC` : '—' },
        ]);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Partner Overview</h2>
      {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
      {!kpis && !error && <p style={{ color: 'var(--muted)' }}>Loading...</p>}
      {kpis && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '0.875rem',
        }}>
          {kpis.map(k => <StatCard key={k.label} {...k} />)}
        </div>
      )}
    </div>
  );
}
