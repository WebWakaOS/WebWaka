/**
 * Partner Admin — C5: Partner tools merged into workspace-app
 * Role-gated: partner only
 */
import { useState, useEffect } from 'react';
import { api, ApiError } from '@/lib/api';
import { toast } from '@/lib/toast';
import { formatNaira } from '@/lib/currency';
import { useAuth } from '@/contexts/AuthContext';

interface Partner {
  id: string;
  name: string;
  status: string;
  sub_partner_count: number;
  createdAt: number;
}

interface CreditPool {
  balanceWc: number;
  lifetimePurchasedWc: number;
}

interface Settlement {
  id: string;
  amount_kobo: number;
  status: string;
  period_start: number;
  period_end: number;
}

export default function PartnerAdmin() {
  const { user } = useAuth();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [credits, setCredits] = useState<CreditPool | null>(null);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'credits' | 'settlements'>('overview');

  if (user?.role !== 'partner') {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Access Denied</h2>
        <p style={{ color: '#6b7280' }}>Partner Portal requires the partner role.</p>
      </div>
    );
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    // Load partner info from current user's linked partner
    Promise.allSettled([
      api.get<{ partners: Partner[] }>('/partners?limit=1'),
    ]).then(([partnerRes]) => {
      if (partnerRes.status === 'fulfilled') {
        const p = partnerRes.value.partners?.[0];
        if (p) {
          setPartner(p);
          Promise.allSettled([
            api.get<{ wallet: CreditPool }>(`/partners/${p.id}/credits`),
            api.get<{ settlements: Settlement[] }>(`/partners/${p.id}/settlements`),
          ]).then(([credRes, settleRes]) => {
            if (credRes.status === 'fulfilled') setCredits(credRes.value.wallet);
            if (settleRes.status === 'fulfilled') setSettlements(settleRes.value.settlements ?? []);
          });
        }
      }
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: '48px 24px', textAlign: 'center', color: '#6b7280' }}>Loading partner data…</div>;
  }

  return (
    <div style={{ padding: '24px 20px', maxWidth: 900, margin: '0 auto' }} id="main-content">
      <header style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🤝</span>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>Partner Portal</h1>
            <p style={{ fontSize: 13, color: '#6b7280' }}>
              {partner ? partner.name : 'Your partner management dashboard'}
            </p>
          </div>
        </div>
      </header>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>WakaCU Balance</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0F4C81' }}>{credits?.balanceWc ?? '—'} WC</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Sub-Partners</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0F4C81' }}>{partner?.sub_partner_count ?? '—'}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Status</div>
          <div style={{
            fontSize: 15, fontWeight: 700,
            color: partner?.status === 'active' ? '#166534' : '#92400e',
          }}>{partner?.status ?? 'unknown'}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: 24 }}>
        {[{ id: 'overview', label: 'Overview' }, { id: 'credits', label: 'Credits' }, { id: 'settlements', label: 'Settlements' }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as typeof activeTab)} style={{
            padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 14, minHeight: 44,
            color: activeTab === t.id ? '#0F4C81' : '#6b7280',
            fontWeight: activeTab === t.id ? 700 : 400,
            borderBottom: activeTab === t.id ? '2.5px solid #0F4C81' : '2.5px solid transparent',
          }}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Partner capabilities</h2>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Sub-partner creation and delegation',
              'White-label branding (up to depth configured)',
              'WakaCU credit pool management',
              'Revenue share settlements',
              'Partner notification inbox',
            ].map(f => (
              <li key={f} style={{ fontSize: 14, color: '#374151', display: 'flex', gap: 8 }}>
                <span style={{ color: '#059669' }}>✓</span> {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'credits' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>WakaCU Credit Pool</h2>
          {credits ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div style={{ background: '#f0f9ff', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 12, color: '#0369a1', fontWeight: 600, marginBottom: 4 }}>Available</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#0F4C81' }}>{credits.balanceWc} WC</div>
                </div>
                <div style={{ background: '#f0fdf4', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 12, color: '#166534', fontWeight: 600, marginBottom: 4 }}>Lifetime Purchased</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#059669' }}>{credits.lifetimePurchasedWc} WC</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#6b7280' }}>
                Contact your platform admin to top up your credit pool.
              </p>
            </>
          ) : (
            <p style={{ color: '#9ca3af', fontSize: 14 }}>No credit pool data available.</p>
          )}
        </div>
      )}

      {activeTab === 'settlements' && (
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Settlements</h2>
          {settlements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: 12 }}>
              <p style={{ color: '#6b7280' }}>No settlements recorded yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {settlements.map(s => (
                <div key={s.id} style={{
                  background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                      {new Date(s.period_start * 1000).toLocaleDateString()} — {new Date(s.period_end * 1000).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>ID: {s.id.slice(0, 12)}…</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#0F4C81' }}>{formatNaira(s.amount_kobo)}</div>
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 10,
                      background: s.status === 'paid' ? '#dcfce7' : '#fef9c3',
                      color: s.status === 'paid' ? '#166534' : '#92400e',
                      fontWeight: 600,
                    }}>{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
