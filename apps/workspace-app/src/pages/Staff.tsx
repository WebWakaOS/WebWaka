/**
 * Staff / Team Management page (A2-2)
 *
 * Features:
 * - List team members with name, email, role, status
 * - Invite new member via email (modal)
 * - Change role (admin / member / viewer)
 * - Suspend / remove member
 * - Activity log tab (recent actions per member)
 *
 * Uses /team/* REST endpoints on Pillar 1 API.
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, ApiError } from '@/lib/api';

type Role = 'admin' | 'member' | 'viewer';
type Status = 'active' | 'suspended' | 'invited';

interface TeamMember {
  id: string;
  full_name: string | null;
  email: string;
  role: Role;
  status: Status;
  joined_at: string | null;
  last_active: string | null;
  avatar_url: string | null;
}

interface ActivityEntry {
  id: string;
  member_id: string;
  member_name: string;
  action: string;
  entity: string;
  timestamp: string;
}

const ROLE_COLORS: Record<Role, string> = { admin: '#7c3aed', member: '#0F4C81', viewer: '#6b7280' };
const STATUS_COLORS: Record<Status, string> = { active: '#059669', suspended: '#dc2626', invited: '#d97706' };
const PRIMARY = '#0F4C81';

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
      background: color + '1a', color, textTransform: 'capitalize',
    }}>{label}</span>
  );
}

function SkeletonRow() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f3f4f6' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e5e7eb' }} />
      <div style={{ flex: 1 }}>
        <div style={{ width: '40%', height: 13, background: '#e5e7eb', borderRadius: 4, marginBottom: 6 }} />
        <div style={{ width: '60%', height: 11, background: '#f3f4f6', borderRadius: 4 }} />
      </div>
    </div>
  );
}

export default function StaffPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'members' | 'activity'>('members');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('member');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{ members: TeamMember[] }>('/team/members');
      setMembers(data.members ?? []);
    } catch (err) {
      const msg = err instanceof ApiError ? (err as ApiError).message : 'Failed to load team members';
      setError(msg);
      // Fallback: seed with current user
      if (user) {
        setMembers([{
          id: user.id,
          full_name: (user as unknown as Record<string, string>).full_name ?? user.fullName ?? null,
          email: user.email,
          role: (user.role as Role) ?? 'admin',
          status: 'active',
          joined_at: null,
          last_active: null,
          avatar_url: null,
        }]);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadActivity = useCallback(async () => {
    setActivityLoading(true);
    try {
      const data = await api.get<{ entries: ActivityEntry[] }>('/team/activity');
      setActivity(data.entries ?? []);
    } catch {
      setActivity([]);
    } finally {
      setActivityLoading(false);
    }
  }, []);

  useEffect(() => { void loadMembers(); }, [loadMembers]);
  useEffect(() => { if (tab === 'activity') void loadActivity(); }, [tab, loadActivity]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) { setInviteError('Email is required'); return; }
    setInviting(true);
    setInviteError(null);
    try {
      await api.post('/team/invite', { email: inviteEmail.trim(), role: inviteRole });
      setInviteOpen(false);
      setInviteEmail('');
      setInviteRole('member');
      void loadMembers();
    } catch (err) {
      setInviteError(err instanceof ApiError ? (err as ApiError).message : 'Failed to send invite');
    } finally {
      setInviting(false);
    }
  };

  const changeRole = async (memberId: string, newRole: Role) => {
    setActionLoading(memberId + '_role');
    try {
      await api.patch(`/team/members/${memberId}`, { role: newRole });
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
    } catch (err) {
      alert((err as ApiError).message ?? 'Failed to update role');
    } finally { setActionLoading(null); }
  };

  const toggleSuspend = async (member: TeamMember) => {
    const action = member.status === 'active' ? 'suspend' : 'activate';
    setActionLoading(member.id + '_suspend');
    try {
      await api.post(`/team/members/${member.id}/${action}`, {});
      setMembers(prev => prev.map(m => m.id === member.id ? { ...m, status: action === 'suspend' ? 'suspended' : 'active' } : m));
    } catch (err) {
      alert((err as ApiError).message ?? 'Action failed');
    } finally { setActionLoading(null); }
  };

  const removeMember = async (memberId: string) => {
    if (!confirm('Remove this team member? This cannot be undone.')) return;
    setActionLoading(memberId + '_remove');
    try {
      await api.delete(`/team/members/${memberId}`);
      setMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (err) {
      alert((err as ApiError).message ?? 'Failed to remove member');
    } finally { setActionLoading(null); }
  };

  const initials = (m: TeamMember) =>
    (m.full_name ?? m.email).split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{ padding: '28px 24px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>Team & Staff</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Manage who has access to your workspace</p>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          style={{ background: PRIMARY, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
        >
          + Invite member
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e5e7eb', marginBottom: 24 }}>
        {(['members', 'activity'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            background: 'none', border: 'none',
            color: tab === t ? PRIMARY : '#6b7280',
            borderBottom: tab === t ? `2px solid ${PRIMARY}` : '2px solid transparent',
            marginBottom: -2, textTransform: 'capitalize',
          }}>{t}</button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#991b1b' }}>
          {error} — showing cached data
        </div>
      )}

      {/* Members tab */}
      {tab === 'members' && (
        <div>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
            : members.length === 0
              ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>No team members yet</h3>
                  <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>Invite staff to collaborate on your workspace.</p>
                  <button onClick={() => setInviteOpen(true)} style={{ background: PRIMARY, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    Invite your first team member
                  </button>
                </div>
              )
              : members.map(member => (
                <div key={member.id} style={{
                  display: 'flex', gap: 12, alignItems: 'center', padding: '14px 0',
                  borderBottom: '1px solid #f3f4f6', flexWrap: 'wrap',
                }}>
                  {/* Avatar */}
                  {member.avatar_url
                    ? <img src={member.avatar_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                    : <div style={{ width: 36, height: 36, borderRadius: '50%', background: PRIMARY, color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{initials(member)}</div>
                  }
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{member.full_name ?? member.email}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{member.full_name ? member.email : ''}</div>
                  </div>
                  {/* Badges */}
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Pill label={member.role} color={ROLE_COLORS[member.role]} />
                    <Pill label={member.status} color={STATUS_COLORS[member.status]} />
                  </div>
                  {/* Actions */}
                  {member.id !== user?.id && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <select
                        value={member.role}
                        onChange={e => void changeRole(member.id, e.target.value as Role)}
                        disabled={actionLoading === member.id + '_role'}
                        style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, border: '1px solid #d1d5db', cursor: 'pointer', background: '#f9fafb' }}
                      >
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <button
                        onClick={() => void toggleSuspend(member)}
                        disabled={actionLoading === member.id + '_suspend'}
                        style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '1px solid #d1d5db', cursor: 'pointer', background: '#f9fafb', color: member.status === 'active' ? '#dc2626' : '#059669' }}
                      >
                        {member.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        onClick={() => void removeMember(member.id)}
                        disabled={actionLoading === member.id + '_remove'}
                        style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '1px solid #fecaca', cursor: 'pointer', background: '#fef2f2', color: '#dc2626' }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ))
          }
        </div>
      )}

      {/* Activity log tab */}
      {tab === 'activity' && (
        <div>
          {activityLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            : activity.length === 0
              ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>No activity yet</h3>
                  <p style={{ fontSize: 14, color: '#6b7280' }}>Team actions will appear here as your staff uses the platform.</p>
                </div>
              )
              : activity.map(entry => (
                <div key={entry.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid #f3f4f6', alignItems: 'flex-start' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: PRIMARY, marginTop: 6, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 14, color: '#111827', fontWeight: 600 }}>{entry.member_name}</span>
                    <span style={{ fontSize: 14, color: '#374151' }}> {entry.action} </span>
                    <span style={{ fontSize: 14, color: '#6b7280' }}>{entry.entity}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af', flexShrink: 0 }}>{entry.timestamp}</div>
                </div>
              ))
          }
        </div>
      )}

      {/* Invite modal */}
      {inviteOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 28, width: '100%', maxWidth: 420 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Invite team member</h2>
            {inviteError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '8px 12px', marginBottom: 12, fontSize: 13, color: '#991b1b' }}>{inviteError}</div>
            )}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Email address</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Role</label>
              <select value={inviteRole} onChange={e => setInviteRole(e.target.value as Role)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, background: '#fff' }}>
                <option value="admin">Admin — full access</option>
                <option value="member">Member — standard access</option>
                <option value="viewer">Viewer — read only</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => { setInviteOpen(false); setInviteError(null); }} style={{ background: '#f9fafb', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 18px', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => void handleInvite()} disabled={inviting} style={{ background: PRIMARY, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: inviting ? 0.6 : 1 }}>
                {inviting ? 'Sending…' : 'Send invite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
