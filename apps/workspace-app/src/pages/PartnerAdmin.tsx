/**
 * Partner Admin — Wave 2 Batch 3 (E1-1 through E1-7)
 * Role-gated: partner only
 *
 * Tabs:
 *  Overview   — partner summary dashboard (sub-tenant count, credit balance, revenue)
 *  Tenants    — sub-tenant management list with status and plan
 *  Branding   — white-label branding controls (logo, colors, domain)
 *  Credits    — credit pool: purchase, view usage history
 *  Settlements — settlement history table
 *  Onboarding — first-login wizard (shown if partner has no sub-tenants yet)
 */
import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatNaira } from '@/lib/currency';
import { toast } from '@/lib/toast';
import { useAuth } from '@/contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PartnerProfile {
  id: string;
  name: string;
  status: 'active' | 'suspended' | 'pending';
  white_label_name: string | null;
  white_label_logo: string | null;
  white_label_primary_color: string | null;
  custom_domain: string | null;
  sub_tenant_count: number;
  createdAt: number;
}

interface CreditPool {
  balanceWc: number;
  lifetimePurchasedWc: number;
  usageThisMonth: number;
}

interface SubTenant {
  id: string;
  business_name: string;
  email: string;
  plan: string;
  status: 'active' | 'suspended' | 'trial';
  created_at: number;
}

interface Settlement {
  id: string;
  amount_kobo: number;
  status: 'pending' | 'paid' | 'processing';
  period_start: number;
  period_end: number;
  paid_at: number | null;
}

type Tab = 'overview' | 'tenants' | 'branding' | 'credits' | 'settlements' | 'onboarding';

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = '#0F4C81' }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '18px 20px', flex: 1, minWidth: 150 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    active:     ['#dcfce7', '#16a34a'],
    trial:      ['#fef3c7', '#d97706'],
    suspended:  ['#fee2e2', '#dc2626'],
    pending:    ['#fef3c7', '#d97706'],
    paid:       ['#dcfce7', '#16a34a'],
    processing: ['#dbeafe', '#2563eb'],
  };
  const [bg, color] = map[status] ?? ['#f3f4f6', '#6b7280'];
  return (
    <span style={{ padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: bg, color }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PartnerAdmin() {
  const { user } = useAuth();
  const isPartner = user?.role === 'partner';

  const [partner, setPartner] = useState<PartnerProfile | null>(null);
  const [credits, setCredits] = useState<CreditPool | null>(null);
  const [tenants, setTenants] = useState<SubTenant[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');
  const [tenantSearch, setTenantSearch] = useState('');
  const [saving, setSaving] = useState(false);

  // Branding form state
  const [wlName, setWlName] = useState('');
  const [wlColor, setWlColor] = useState('#0F4C81');
  const [wlDomain, setWlDomain] = useState('');

  // Onboarding wizard state
  const [wizardStep, setWizardStep] = useState(1);

  const load = useCallback(async () => {
    if (!isPartner) { setLoading(false); return; }
    setLoading(true);
    try {
      const [partnerRes, creditsRes, tenantsRes, settlementsRes] = await Promise.allSettled([
        api.get<{ partners: PartnerProfile[] }>('/partner/profile'),
        api.get<CreditPool>('/partner/credits'),
        api.get<{ tenants: SubTenant[] }>('/partner/tenants?limit=100'),
        api.get<{ settlements: Settlement[] }>('/partner/settlements?limit=20'),
      ]);
      if (partnerRes.status === 'fulfilled') {
        const p = partnerRes.value.partners?.[0] ?? null;
        setPartner(p);
        if (p) {
          setWlName(p.white_label_name ?? '');
          setWlColor(p.white_label_primary_color ?? '#0F4C81');
          setWlDomain(p.custom_domain ?? '');
          // Show onboarding wizard if no sub-tenants yet
          if ((p.sub_tenant_count ?? 0) === 0) setTab('onboarding');
        }
      }
      if (creditsRes.status === 'fulfilled') setCredits(creditsRes.value);
      if (tenantsRes.status === 'fulfilled') setTenants(tenantsRes.value.tenants ?? []);
      if (settlementsRes.status === 'fulfilled') setSettlements(settlementsRes.value.settlements ?? []);
    } catch {
      // errors handled per-section
    } finally {
      setLoading(false);
    }
  }, [isPartner]);

  useEffect(() => { load(); }, [load]);

  const saveBranding = async () => {
    setSaving(true);
    try {
      await api.patch('/partner/branding', {
        white_label_name: wlName || null,
        white_label_primary_color: wlColor,
        custom_domain: wlDomain || null,
      });
      toast.success('White-label branding saved');
      load();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSuspendTenant = async (tenantId: string, suspend: boolean) => {
    try {
      await api.patch(`/partner/tenants/${tenantId}`, { status: suspend ? 'suspended' : 'active' });
      toast.success(suspend ? 'Tenant suspended' : 'Tenant activated');
      setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, status: suspend ? 'suspended' : 'active' } : t));
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Action failed');
    }
  };

  // ─── Not a partner ─────────────────────────────────────────────────────────
  if (!isPartner) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>Partner Access Only</h2>
        <p style={{ color: '#6b7280' }}>This section is available to WebWaka Partner accounts.</p>
      </div>
    );
  }

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>Loading partner dashboard…</div>;

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview',     label: '📊 Overview' },
    { id: 'tenants',      label: '🏢 Sub-Tenants' },
    { id: 'branding',     label: '🎨 Branding' },
    { id: 'credits',      label: '💳 Credits' },
    { id: 'settlements',  label: '💰 Settlements' },
  ];

  const filteredTenants = tenants.filter(t =>
    t.business_name.toLowerCase().includes(tenantSearch.toLowerCase()) ||
    t.email.toLowerCase().includes(tenantSearch.toLowerCase())
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div id="main-content" style={{ padding: '24px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#0F4C81', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🤝</div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>
              {partner?.white_label_name ?? 'Partner Portal'}
            </h1>
            <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>
              {partner?.status && <StatusBadge status={partner.status} />}
              {' '}Partner dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Onboarding wizard — shown if no sub-tenants */}
      {tab === 'onboarding' && (
        <div style={{ background: '#fff', border: '2px solid #0F4C81', borderRadius: 16, padding: 32, maxWidth: 560, marginBottom: 28 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ flex: 1, height: 4, borderRadius: 99, background: s <= wizardStep ? '#0F4C81' : '#e5e7eb' }} />
            ))}
          </div>
          {wizardStep === 1 && (
            <>
              <div style={{ fontSize: 32, marginBottom: 12 }}>👋</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Welcome to Partner Portal</h2>
              <p style={{ color: '#6b7280', marginBottom: 20 }}>
                As a WebWaka Partner, you can white-label the platform and manage multiple business sub-tenants under your umbrella.
              </p>
              <ul style={{ color: '#374151', fontSize: 14, lineHeight: 2, paddingLeft: 20, marginBottom: 24 }}>
                <li>Onboard businesses under your brand</li>
                <li>Manage credit pools and settlements</li>
                <li>White-label with your logo and colours</li>
              </ul>
              <Button onClick={() => setWizardStep(2)}>Get Started →</Button>
            </>
          )}
          {wizardStep === 2 && (
            <>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Step 2: Set Up Your Branding</h2>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Your brand name</label>
                <Input value={wlName} onChange={e => setWlName(e.target.value)} placeholder="Acme Business Hub" />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Primary colour</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="color" value={wlColor} onChange={e => setWlColor(e.target.value)}
                    style={{ width: 48, height: 36, cursor: 'pointer', border: 'none', borderRadius: 6 }} />
                  <span style={{ fontSize: 13, color: '#374151', fontFamily: 'monospace' }}>{wlColor}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <Button variant="secondary" onClick={() => setWizardStep(1)}>← Back</Button>
                <Button onClick={() => { void saveBranding(); setWizardStep(3); }}>Save & Continue →</Button>
              </div>
            </>
          )}
          {wizardStep === 3 && (
            <>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>You're all set!</h2>
              <p style={{ color: '#6b7280', marginBottom: 20 }}>
                Your partner account is ready. Now you can invite businesses as sub-tenants, manage their accounts, and track your revenue.
              </p>
              <Button onClick={() => setTab('overview')}>Go to Dashboard →</Button>
            </>
          )}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #e5e7eb', marginBottom: 24, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: tab === t.id ? 700 : 400,
            color: tab === t.id ? '#0F4C81' : '#6b7280',
            borderBottom: tab === t.id ? '2px solid #0F4C81' : '2px solid transparent',
            marginBottom: -1, whiteSpace: 'nowrap',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview tab ──────────────────────────────────────────── */}
      {tab === 'overview' && (
        <>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
            <StatCard label="Sub-Tenants" value={partner?.sub_tenant_count ?? tenants.length} />
            <StatCard label="Credit Balance" value={`${(credits?.balanceWc ?? 0).toLocaleString()} WC`} color="#059669" />
            <StatCard label="Credits Used (month)" value={(credits?.usageThisMonth ?? 0).toLocaleString()} sub="WebWaka Credits" />
            <StatCard label="Lifetime Purchased" value={(credits?.lifetimePurchasedWc ?? 0).toLocaleString()} sub="WC" color="#d97706" />
          </div>
          {/* Recent tenants */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Recent Sub-Tenants</h2>
              <button onClick={() => setTab('tenants')} style={{ fontSize: 13, color: '#0F4C81', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                View all →
              </button>
            </div>
            {tenants.slice(0, 5).map(t => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{t.business_name}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>{t.email}</div>
                </div>
                <StatusBadge status={t.status} />
              </div>
            ))}
            {tenants.length === 0 && (
              <div style={{ textAlign: 'center', padding: 24, color: '#9ca3af', fontSize: 14 }}>
                No sub-tenants yet. <button onClick={() => setTab('onboarding')} style={{ color: '#0F4C81', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Start onboarding</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Tenants tab ───────────────────────────────────────────── */}
      {tab === 'tenants' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Sub-Tenants ({tenants.length})</h2>
          </div>
          <Input value={tenantSearch} onChange={e => setTenantSearch(e.target.value)} placeholder="Search tenants…" style={{ marginBottom: 16, maxWidth: 320 }} />
          {filteredTenants.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🏢</div>
              {tenantSearch ? 'No tenants match your search.' : 'No sub-tenants yet. Contact WebWaka to add tenants under your partner account.'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    {['Business', 'Email', 'Plan', 'Status', 'Joined', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTenants.map((t, i) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 500 }}>{t.business_name}</td>
                      <td style={{ padding: '10px 12px', color: '#6b7280', fontSize: 13 }}>{t.email}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{t.plan}</td>
                      <td style={{ padding: '10px 12px' }}><StatusBadge status={t.status} /></td>
                      <td style={{ padding: '10px 12px', color: '#9ca3af', fontSize: 12 }}>
                        {new Date(t.created_at * 1000).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <button
                          onClick={() => handleSuspendTenant(t.id, t.status !== 'suspended')}
                          style={{
                            fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                            border: '1px solid', borderColor: t.status === 'suspended' ? '#d1fae5' : '#fecaca',
                            background: t.status === 'suspended' ? '#f0fdf4' : '#fff5f5',
                            color: t.status === 'suspended' ? '#059669' : '#dc2626',
                          }}>
                          {t.status === 'suspended' ? 'Activate' : 'Suspend'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Branding tab ─────────────────────────────────────────── */}
      {tab === 'branding' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, maxWidth: 560 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 20px' }}>White-Label Branding</h2>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Brand Name</label>
            <Input value={wlName} onChange={e => setWlName(e.target.value)} placeholder="Acme Business Hub" />
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Shown to your sub-tenants instead of "WebWaka"</p>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Primary Colour</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input type="color" value={wlColor} onChange={e => setWlColor(e.target.value)}
                style={{ width: 56, height: 40, cursor: 'pointer', border: '1px solid #e5e7eb', borderRadius: 8 }} />
              <div style={{ width: 80, height: 40, borderRadius: 8, background: wlColor, border: '1px solid rgba(0,0,0,0.1)' }} />
              <span style={{ fontFamily: 'monospace', fontSize: 14, color: '#374151' }}>{wlColor}</span>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Custom Domain</label>
            <Input value={wlDomain} onChange={e => setWlDomain(e.target.value)} placeholder="hub.yourbrand.com" />
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Point a CNAME to partner.webwaka.com</p>
          </div>
          <Button onClick={saveBranding} disabled={saving}>
            {saving ? 'Saving…' : 'Save Branding'}
          </Button>
        </div>
      )}

      {/* ── Credits tab ──────────────────────────────────────────── */}
      {tab === 'credits' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>Credit Balance</h2>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
              <StatCard label="Available" value={`${(credits?.balanceWc ?? 0).toLocaleString()} WC`} color="#059669" />
              <StatCard label="Used (this month)" value={(credits?.usageThisMonth ?? 0).toLocaleString()} />
            </div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#15803d', marginBottom: 4 }}>💡 How credits work</div>
              <p style={{ fontSize: 13, color: '#166534', margin: 0, lineHeight: 1.6 }}>
                WebWaka Credits (WC) are shared across all your sub-tenants. Each API call, AI request, or platform feature consumes credits from your pool.
                Contact your WebWaka account manager to purchase more credits.
              </p>
            </div>
            <Button onClick={() => toast.info('Contact your WebWaka account manager to purchase additional credits.')}>
              💳 Purchase Credits
            </Button>
          </div>
        </div>
      )}

      {/* ── Settlements tab ──────────────────────────────────────── */}
      {tab === 'settlements' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Settlement History</h2>
          {settlements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>💰</div>
              No settlements recorded yet.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['Period', 'Amount', 'Status', 'Paid On'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {settlements.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151' }}>
                      {new Date(s.period_start * 1000).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })} –{' '}
                      {new Date(s.period_end * 1000).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>{formatNaira(s.amount_kobo)}</td>
                    <td style={{ padding: '10px 12px' }}><StatusBadge status={s.status} /></td>
                    <td style={{ padding: '10px 12px', color: '#9ca3af', fontSize: 12 }}>
                      {s.paid_at ? new Date(s.paid_at * 1000).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
