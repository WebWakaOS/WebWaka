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

// ------------- Main Platform Admin wrapper -------------

export default function PlatformAdmin() {
  const { user } = useAuth();

  if (user?.role !== 'super_admin') {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Access Denied</h2>
        <p style={{ color: '#6b7280' }}>Platform Admin requires the super_admin role.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1100, margin: '0 auto' }} id="main-content">
      <header style={{ marginBottom: 24, borderBottom: '1px solid #e5e7eb', paddingBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🛡️</span>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>Platform Admin</h1>
            <p style={{ fontSize: 13, color: '#6b7280' }}>System-level controls for super admins</p>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: 4, marginTop: 16, flexWrap: 'wrap' }}>
          {[
            { to: '/platform', label: 'Overview', end: true },
            { to: '/platform/claims', label: 'Claims' },
            { to: '/platform/tenants', label: 'Tenants' },
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
        <Route path="*" element={<Navigate to="/platform" replace />} />
      </Routes>
    </div>
  );
}
