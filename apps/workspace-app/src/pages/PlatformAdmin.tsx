/**
 * Platform Admin — C5: Super Admin tools merged into workspace-app
 * Role-gated: super_admin only
 */
import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { api, ApiError } from '@/lib/api';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

// ------------- Types -------------
interface ClaimRequest {
  id: string;
  profileId: string;
  subjectType: string;
  subjectId: string;
  claimState: string;
  requesterEmail: string;
  requesterName: string | null;
  status: string;
  verificationMethod: string | null;
  rejectionReason: string | null;
  expiresAt: number | null;
  createdAt: number;
}

interface ClaimsResponse {
  claims: ClaimRequest[];
  total: number;
}

interface Tenant {
  id: string;
  name: string;
  status: string;
  plan: string;
  createdAt: number;
}

// ------------- Sub-pages -------------

function PlatformOverview() {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Platform Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
        {[
          { label: 'Claims', icon: '📋', href: '/platform/claims', desc: 'Review claim requests' },
          { label: 'Tenants', icon: '🏢', href: '/platform/tenants', desc: 'Manage organizations' },
          { label: 'Platform Settings', icon: '⚙️', href: '/platform/settings', desc: 'System configuration' },
        ].map(card => (
          <NavLink key={card.href} to={card.href}
            style={{
              textDecoration: 'none', background: '#fff', border: '1px solid #e5e7eb',
              borderRadius: 12, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 8,
              transition: 'box-shadow 0.15s',
            }}
          >
            <span style={{ fontSize: 28 }}>{card.icon}</span>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{card.label}</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>{card.desc}</div>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

function PlatformClaims() {
  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [processing, setProcessing] = useState<string | null>(null);

  const loadClaims = async () => {
    setLoading(true);
    try {
      const data = await api.get<ClaimsResponse>(`/admin/claims?status=${statusFilter}&limit=50`);
      setClaims(data.claims ?? []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        toast.error('Access denied — super admin role required');
      } else {
        toast.error('Failed to load claims');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadClaims(); }, [statusFilter]);

  const approveClaim = async (id: string) => {
    setProcessing(id);
    try {
      await api.post(`/admin/claims/${id}/approve`);
      toast.success('Claim approved');
      void loadClaims();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to approve claim');
    } finally { setProcessing(null); }
  };

  const rejectClaim = async (id: string) => {
    setProcessing(id);
    try {
      await api.post(`/admin/claims/${id}/reject`, { reason: 'Rejected by platform admin' });
      toast.success('Claim rejected');
      void loadClaims();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to reject claim');
    } finally { setProcessing(null); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Claim Requests</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {['pending', 'approved', 'rejected', 'all'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '6px 14px', borderRadius: 16, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', border: '1.5px solid',
              borderColor: statusFilter === s ? '#0F4C81' : '#e5e7eb',
              background: statusFilter === s ? '#0F4C81' : '#fff',
              color: statusFilter === s ? '#fff' : '#374151',
            }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#9ca3af', fontSize: 14 }}>Loading claims…</p>
      ) : claims.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', background: '#f9fafb', borderRadius: 12 }}>
          <p style={{ color: '#6b7280' }}>No {statusFilter} claims found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {claims.map(claim => (
            <div key={claim.id} style={{
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 4 }}>
                    {claim.requesterName ?? claim.requesterEmail}
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 2 }}>
                    Profile: {claim.profileId.slice(0, 16)}… | Type: {claim.subjectType}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>
                    Submitted: {new Date(claim.createdAt * 1000).toLocaleDateString()}
                    {claim.verificationMethod && ` | Method: ${claim.verificationMethod}`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{
                    fontSize: 11, padding: '3px 10px', borderRadius: 20,
                    background: claim.status === 'pending' ? '#fef9c3' : claim.status === 'approved' ? '#dcfce7' : '#fee2e2',
                    color: claim.status === 'pending' ? '#92400e' : claim.status === 'approved' ? '#166534' : '#991b1b',
                    fontWeight: 700,
                  }}>{claim.status.toUpperCase()}</span>
                  {claim.status === 'pending' && (
                    <>
                      <Button size="sm" loading={processing === claim.id}
                        style={{ background: '#059669', borderColor: '#059669' }}
                        onClick={() => void approveClaim(claim.id)}>✓ Approve</Button>
                      <Button size="sm" variant="danger" loading={processing === claim.id}
                        onClick={() => void rejectClaim(claim.id)}>✕ Reject</Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlatformTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ tenants: Tenant[] }>('/platform/tenants?limit=50')
      .then(r => setTenants(r.tenants ?? []))
      .catch(() => setTenants([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Tenants</h2>
      {loading ? (
        <p style={{ color: '#9ca3af', fontSize: 14 }}>Loading tenants…</p>
      ) : tenants.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', background: '#f9fafb', borderRadius: 12 }}>
          <p style={{ color: '#6b7280' }}>No tenants found or you lack permission.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tenants.map(t => (
            <div key={t.id} style={{
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 16px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{t.name ?? t.id}</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>ID: {t.id} | Plan: {t.plan}</div>
              </div>
              <span style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 12,
                background: t.status === 'active' ? '#dcfce7' : '#fee2e2',
                color: t.status === 'active' ? '#166534' : '#991b1b',
                fontWeight: 600,
              }}>{t.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ------------- Platform Settings Page (DB-backed via WALLET_KV) -------------

function PlatformSettings() {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  // Platform bank account (for receiving WebWaka subscription payments)
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [sortCode, setSortCode] = useState('');
  const [bankSource, setBankSource] = useState<'kv' | 'env' | 'none'>('none');

  // Platform config
  const [platformName, setPlatformName] = useState('WebWaka OS');
  const [ussdShortcode, setUssdShortcode] = useState('*384#');
  const [defaultPlan, setDefaultPlan] = useState('free');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    // Load current platform bank account from /platform-admin/settings/payment
    api.get<{
      bank_account: { bank_name: string; account_number: string; account_name: string; bank_code?: string; sort_code?: string } | null;
      source: 'kv' | 'env' | 'none';
    }>('/platform-admin/settings/payment')
      .then(res => {
        if (res.bank_account) {
          setBankName(res.bank_account.bank_name ?? '');
          setAccountNumber(res.bank_account.account_number ?? '');
          setAccountName(res.bank_account.account_name ?? '');
          setBankCode(res.bank_account.bank_code ?? '');
          setSortCode(res.bank_account.sort_code ?? '');
        }
        setBankSource(res.source);
      })
      .catch(() => { /* silently fail */ })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
      toast.error('Bank name, account number, and account name are required');
      return;
    }
    if (!/^\d{10}$/.test(accountNumber.trim())) {
      toast.error('Account number must be exactly 10 digits (Nigerian NUBAN format)');
      return;
    }
    setSaving(true);
    try {
      await api.patch('/platform-admin/settings/payment', {
        bank_name: bankName.trim(),
        account_number: accountNumber.trim(),
        account_name: accountName.trim(),
        ...(bankCode.trim() ? { bank_code: bankCode.trim() } : {}),
        ...(sortCode.trim() ? { sort_code: sortCode.trim() } : {}),
      });
      setBankSource('kv');
      setSaved(true);
      toast.success('Platform bank account saved');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save bank account');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 24, color: '#6b7280' }}>Loading settings…</div>;
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Platform Settings</h2>

      {/* ── Platform receiving bank account ───────────────────────────── */}
      <form onSubmit={handleSaveBankAccount}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 20, maxWidth: 600 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Platform Receiving Bank Account</h3>
            <span style={{
              fontSize: 11, padding: '3px 10px', borderRadius: 999,
              background: bankSource === 'kv' ? '#f0fdf4' : bankSource === 'env' ? '#fef9c3' : '#fef2f2',
              color: bankSource === 'kv' ? '#166534' : bankSource === 'env' ? '#92400e' : '#dc2626',
              border: `1px solid ${bankSource === 'kv' ? '#bbf7d0' : bankSource === 'env' ? '#fde68a' : '#fecaca'}`,
              fontWeight: 600,
            }}>
              {bankSource === 'kv' ? 'Saved in KV ✓' : bankSource === 'env' ? 'From env var' : 'Not configured'}
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, lineHeight: 1.6 }}>
            This is the account where <strong>WebWaka</strong> receives subscription payments from workspace owners
            when they upgrade their plan via bank transfer. Different from each business's own customer payment account.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Bank Name *</label>
              <input value={bankName} onChange={e => setBankName(e.target.value)} required placeholder="e.g. Zenith Bank Nigeria"
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 15, minHeight: 44 }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Account Name *</label>
              <input value={accountName} onChange={e => setAccountName(e.target.value)} required placeholder="WebWaka Technologies Limited"
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 15, minHeight: 44 }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Account Number * <span style={{ color: '#9ca3af', fontWeight: 400 }}>(10-digit NUBAN)</span></label>
              <input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} required
                placeholder="0123456789" maxLength={10} pattern="\d{10}"
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 15, minHeight: 44, fontFamily: 'monospace', letterSpacing: '0.1em' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Bank Code (optional)</label>
                <input value={bankCode} onChange={e => setBankCode(e.target.value)} placeholder="057"
                  style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 15, minHeight: 44 }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Sort Code (optional)</label>
                <input value={sortCode} onChange={e => setSortCode(e.target.value)} placeholder=""
                  style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 15, minHeight: 44 }} />
              </div>
            </div>
          </div>

          {saved && (
            <div style={{ marginTop: 14, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 13, color: '#166534' }}>
              ✓ Platform bank account saved to KV storage. Takes effect immediately on all new upgrade requests.
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <Button type="submit" loading={saving} size="md">Save Platform Bank Account</Button>
          </div>
        </div>
      </form>

      {/* ── General platform settings ─────────────────────────────────── */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>General</h3>
        <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
          These settings are informational — update the corresponding Cloudflare Worker vars to change runtime behavior.
        </p>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Platform Name</label>
          <input value={platformName} onChange={e => setPlatformName(e.target.value)}
            style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 15, minHeight: 44 }} />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>USSD Shortcode</label>
          <input value={ussdShortcode} onChange={e => setUssdShortcode(e.target.value)} placeholder="*384#"
            style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 15, minHeight: 44 }} />
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>NCC registration pending. Update when approved.</p>
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Default Plan for New Tenants</label>
          <select value={defaultPlan} onChange={e => setDefaultPlan(e.target.value)}
            style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 15, minHeight: 44 }}>
            <option value="free">Free</option>
            <option value="starter">Starter</option>
            <option value="growth">Growth</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            role="switch"
            aria-checked={maintenanceMode}
            onClick={() => setMaintenanceMode(v => !v)}
            style={{
              width: 48, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
              background: maintenanceMode ? '#dc2626' : '#e5e7eb',
              position: 'relative', transition: 'background 0.2s', flexShrink: 0,
            }}
          >
            <span style={{
              position: 'absolute', top: 3, left: maintenanceMode ? 22 : 3,
              width: 22, height: 22, borderRadius: '50%', background: '#fff',
              transition: 'left 0.2s',
            }} />
          </button>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: maintenanceMode ? '#dc2626' : '#111827' }}>
              {maintenanceMode ? 'Maintenance mode ON' : 'Platform operational'}
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>Toggle via Cloudflare Worker vars for production effect</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------- Main Platform Admin wrapper -------------

export default function PlatformAdmin() {
  const { user } = useAuth();

  if (user?.role !== 'super_admin') {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }} aria-hidden="true">🔒</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Access Denied</h2>
        <p style={{ color: '#6b7280' }}>Platform Admin requires the super_admin role.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1100, margin: '0 auto' }} id="main-content">
      <header style={{ marginBottom: 24, borderBottom: '1px solid #e5e7eb', paddingBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }} aria-hidden="true">🛡️</span>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>Platform Admin</h1>
            <p style={{ fontSize: 13, color: '#6b7280' }}>System-level controls for super admins</p>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: 4, marginTop: 16, flexWrap: 'wrap' }} aria-label="Platform admin sections">
          {[
            { to: '/platform', label: 'Overview', end: true },
            { to: '/platform/claims', label: 'Claims' },
            { to: '/platform/tenants', label: 'Tenants' },
            { to: '/platform/settings', label: 'Settings' },
          ].map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              style={({ isActive }) => ({
                padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                textDecoration: 'none', border: '1.5px solid',
                borderColor: isActive ? '#0F4C81' : '#e5e7eb',
                background: isActive ? '#0F4C81' : '#fff',
                color: isActive ? '#fff' : '#374151',
              })}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <Routes>
        <Route index element={<PlatformOverview />} />
        <Route path="claims" element={<PlatformClaims />} />
        <Route path="tenants" element={<PlatformTenants />} />
        <Route path="settings" element={<PlatformSettings />} />
        <Route path="*" element={<Navigate to="/platform" replace />} />
      </Routes>
    </div>
  );
}
