/**
 * Overview page — E1-2: Partner KPI dashboard with quick actions + health alerts
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { partnersApi, type UsageData, type SubPartnersData, type CreditsData, type SubPartner } from '../lib/api';

interface KPI { label: string; value: string | number; sub?: string; accent?: string; icon: string; }

function StatCard({ label, value, sub, accent = 'var(--green)', icon }: KPI) {
  return (
    <div style={{
      background: 'var(--dark)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '1.25rem 1.125rem',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ fontSize: '1.5rem' }}>{icon}</div>
      <div style={{ fontSize: '1.875rem', fontWeight: 800, color: accent, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{sub}</div>}
    </div>
  );
}

function QuickAction({ icon, label, to }: { icon: string; label: string; to: string }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        background: 'var(--dark)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '1rem 0.75rem',
        cursor: 'pointer', color: 'inherit', transition: 'border-color 0.15s',
        flex: '1 1 100px',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--green)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <span style={{ fontSize: '1.625rem' }}>{icon}</span>
      <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{label}</span>
    </button>
  );
}

function HealthBadge({ balance }: { balance: number }) {
  const status = balance > 200 ? 'Healthy' : balance > 50 ? 'Low' : 'Critical';
  const color  = balance > 200 ? '#16a34a' : balance > 50 ? '#d97706' : '#dc2626';
  const bg     = balance > 200 ? '#dcfce7' : balance > 50 ? '#fef3c7' : '#fee2e2';
  return (
    <span style={{
      display: 'inline-block', padding: '4px 12px',
      background: bg, color, borderRadius: 20,
      fontWeight: 700, fontSize: '0.8125rem',
    }}>
      ● {status}
    </span>
  );
}

const STATUS_COLOR: Record<string, string> = {
  active: '#16a34a', suspended: '#dc2626', pending: '#d97706',
};

export default function Overview() {
  const [kpis,       setKpis]       = useState<KPI[] | null>(null);
  const [balance,    setBalance]    = useState<number | null>(null);
  const [subPartners,setSubPartners]= useState<SubPartner[]>([]);
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [usageRes, subRes, credRes] = await partnersApi.overview();
        if (cancelled) return;
        const usage = usageRes.status === 'fulfilled' ? usageRes.value as UsageData     : {} as UsageData;
        const subD  = subRes.status  === 'fulfilled' ? subRes.value  as SubPartnersData : { subPartners: [] };
        const credD = credRes.status === 'fulfilled' ? credRes.value as CreditsData     : {} as CreditsData;

        const bal = credD.wallet?.balanceWc ?? 0;
        setBalance(bal);
        setSubPartners(subD.subPartners);

        setKpis([
          {
            icon: '🏢', label: 'Sub-Tenants', value: subD.subPartners.length,
            sub: `${subD.subPartners.filter(s => s.status === 'active').length} active`,
          },
          {
            icon: '👥', label: 'Total Members', value: (usage.totalMembers ?? '—').toLocaleString?.() ?? usage.totalMembers ?? '—',
            sub: `${usage.activeGroups ?? '—'} active groups`,
          },
          {
            icon: '💳', label: 'Credit Balance',
            value: credD.wallet ? `${credD.wallet.balanceWc.toLocaleString()} WC` : '—',
            sub: credD.wallet ? `${credD.wallet.lifetimePurchasedWc.toLocaleString()} WC lifetime` : undefined,
            accent: bal < 50 ? '#dc2626' : bal < 200 ? '#d97706' : 'var(--green)',
          },
          {
            icon: '📤', label: 'Total Allocated',
            value: credD.totalAllocatedWc != null ? `${credD.totalAllocatedWc.toLocaleString()} WC` : '—',
            sub: 'distributed to sub-tenants',
          },
        ]);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: 4 }}>Partner Overview</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
            {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        {balance !== null && <HealthBadge balance={balance} />}
      </div>

      {error && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}

      {/* KPI skeleton */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.875rem', marginBottom: '2rem' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: 120, borderRadius: 14, background: 'var(--dark)', border: '1px solid var(--border)', opacity: 0.5 }} />
          ))}
        </div>
      )}

      {/* KPI grid */}
      {kpis && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '0.875rem', marginBottom: '2rem',
        }}>
          {kpis.map(k => <StatCard key={k.label} {...k} />)}
        </div>
      )}

      {/* Credit health alert */}
      {balance !== null && balance <= 50 && (
        <div style={{
          background: '#fee2e2', border: '1.5px solid #fca5a5',
          borderRadius: 12, padding: '1rem 1.25rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem',
        }}>
          <div>
            <div style={{ fontWeight: 700, color: '#dc2626', marginBottom: 2 }}>⚠️ Credit Balance Low</div>
            <div style={{ fontSize: '0.875rem', color: '#991b1b' }}>
              Your balance is {balance} WC — sub-tenants may lose access. Top up now.
            </div>
          </div>
          <a href="/credits" style={{
            padding: '0.5rem 1.125rem', background: '#dc2626', color: '#fff',
            borderRadius: 8, fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none',
          }}>Top Up →</a>
        </div>
      )}

      {/* Quick actions */}
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.8125rem', marginBottom: '0.875rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Quick Actions
        </h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <QuickAction icon="➕" label="Add Sub-Tenant"  to="/sub-partners"  />
          <QuickAction icon="💳" label="Buy Credits"     to="/credits"       />
          <QuickAction icon="📊" label="Settlements"     to="/settlements"   />
          <QuickAction icon="🎨" label="Branding"        to="/branding"      />
          <QuickAction icon="🔔" label="Notifications"   to="/notifications" />
        </div>
      </section>

      {/* Sub-tenant summary list */}
      {!loading && (
        <section>
          <h3 style={{ fontWeight: 700, fontSize: '0.8125rem', marginBottom: '0.875rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Sub-Tenants
          </h3>

          {subPartners.length === 0 ? (
            <div style={{
              background: 'var(--dark)', border: '1.5px dashed var(--border)',
              borderRadius: 12, padding: '1.5rem', textAlign: 'center',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏢</div>
              <div style={{ fontWeight: 700, marginBottom: '0.375rem' }}>No Sub-Tenants Yet</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                Add your first sub-tenant to start distributing credits and managing their workspace.
              </div>
              <a href="/sub-partners" style={{
                padding: '0.625rem 1.25rem', background: 'var(--green)', color: '#fff',
                borderRadius: 8, fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none',
              }}>Add Sub-Tenant →</a>
            </div>
          ) : (
            <div style={{ background: 'var(--dark)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              {subPartners.slice(0, 5).map((s, i) => (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                  padding: '0.875rem 1rem',
                  borderBottom: i < Math.min(subPartners.length, 5) - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--border)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0,
                  }}>
                    {(s.display_name || s.tenant_id || s.id).charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.display_name || s.tenant_id || s.id}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>ID: {s.id}</div>
                  </div>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                    color: STATUS_COLOR[s.status] ?? '#6b7280',
                  }}>{s.status}</span>
                </div>
              ))}
              {subPartners.length > 5 && (
                <div style={{ padding: '0.75rem 1rem', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
                  <a href="/sub-partners" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none', fontSize: '0.875rem' }}>
                    View all {subPartners.length} sub-tenants →
                  </a>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
