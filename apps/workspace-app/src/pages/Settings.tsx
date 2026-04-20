import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/lib/toast';
import { authApi, api, ApiError, type SessionInfo, type InvitationInfo } from '@/lib/api';

const DARK_MODE_KEY = 'ww_dark_mode';

function getInitialDarkMode(): boolean {
  const stored = localStorage.getItem(DARK_MODE_KEY);
  if (stored !== null) return stored === 'true';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyDarkMode(enabled: boolean): void {
  document.documentElement.setAttribute('data-theme', enabled ? 'dark' : 'light');
  localStorage.setItem(DARK_MODE_KEY, String(enabled));
}

type Tab = 'profile' | 'team' | 'notifications' | 'appearance' | 'security';

function isAdmin(role: string | undefined): boolean {
  return role === 'admin' || role === 'super_admin';
}

export default function Settings() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('profile');
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);
  const [pushEnabled, setPushEnabled] = useState(false);

  // P19-B: Controlled profile fields — populated on mount from GET /auth/me
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);

  // N-070: Notification preference state (low-data mode)
  const [lowDataMode, setLowDataMode] = useState(false);
  const [lowDataLoading, setLowDataLoading] = useState(false);
  const [prefLoaded, setPrefLoaded] = useState(false);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  // P20-B: Sessions
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [revokingSession, setRevokingSession] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  // P20-A: Team / invitations
  const [invitations, setInvitations] = useState<InvitationInfo[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    applyDarkMode(darkMode);
  }, [darkMode]);

  // P19-B: Fetch extended profile on mount to populate the form with real data
  useEffect(() => {
    authApi.me()
      .then((profile) => {
        setBusinessName(profile.businessName ?? '');
        setPhone(profile.phone ?? '');
      })
      .catch(() => {
        setBusinessName(user?.businessName ?? '');
        setPhone(user?.phone ?? '');
      })
      .finally(() => setProfileLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // P20-B: Load sessions when Security tab is active
  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const res = await authApi.sessions();
      setSessions(res.sessions);
    } catch {
      toast.error('Failed to load sessions');
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  // P20-A: Load pending invitations when Team tab is active
  const loadInvitations = useCallback(async () => {
    if (!isAdmin(user?.role)) return;
    setTeamLoading(true);
    try {
      const res = await authApi.pendingInvitations();
      setInvitations(res.invitations);
    } catch {
      toast.error('Failed to load invitations');
    } finally {
      setTeamLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    if (tab === 'security') void loadSessions();
    if (tab === 'team') void loadInvitations();
    if (tab === 'notifications' && !prefLoaded) void loadNotificationPrefs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, loadSessions, loadInvitations]);

  // N-070: Load current low_data_mode preference from API
  const loadNotificationPrefs = useCallback(async () => {
    try {
      const res = await api.get<{ preferences: Array<{ channel: string; lowDataMode: boolean }> }>(
        '/notifications/preferences',
      );
      const emailPref = res.preferences.find((p) => p.channel === 'email');
      if (emailPref) setLowDataMode(emailPref.lowDataMode);
      setPrefLoaded(true);
    } catch {
      setPrefLoaded(true);
    }
  }, []);

  // P19-B: Profile save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.workspaceId) {
      toast.error('Workspace not found. Please reload the page.');
      return;
    }
    setSaving(true);
    try {
      const updates: Promise<unknown>[] = [];
      // BUG-06 fix: only PATCH workspace when businessName is non-empty (empty body → 400)
      if (businessName.trim()) {
        updates.push(api.patch(`/workspaces/${user.workspaceId}`, { name: businessName.trim() }));
      }
      updates.push(authApi.updateProfile({ phone: phone || undefined }));
      await Promise.all(updates);
      toast.success('Settings saved');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to save settings. Please try again.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPw) { toast.error('Enter your current password'); return; }
    if (newPw.length < 8) { toast.error('New password must be at least 8 characters'); return; }
    if (newPw !== confirmPw) { toast.error("Passwords don't match"); return; }
    setChangingPw(true);
    try {
      await authApi.changePassword(currentPw, newPw);
      toast.success('Password changed successfully');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Password change failed. Please try again.';
      toast.error(msg);
    } finally {
      setChangingPw(false);
    }
  };

  // P20-B: Revoke a specific session
  const handleRevokeSession = async (sessionId: string) => {
    setRevokingSession(sessionId);
    try {
      await authApi.revokeSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast.success('Session revoked');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to revoke session';
      toast.error(msg);
    } finally {
      setRevokingSession(null);
    }
  };

  // P20-B: Revoke all sessions except current
  const handleRevokeAllSessions = async () => {
    setRevokingAll(true);
    try {
      const res = await authApi.revokeAllSessions();
      toast.success(`Revoked ${res.revokedCount} other session${res.revokedCount !== 1 ? 's' : ''}`);
      void loadSessions();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to revoke sessions';
      toast.error(msg);
    } finally {
      setRevokingAll(false);
    }
  };

  // P20-A: Send an invitation
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) { toast.error('Enter an email address'); return; }
    setInviting(true);
    try {
      await authApi.invite(inviteEmail.trim(), inviteRole);
      toast.success(`Invitation sent to ${inviteEmail.trim()}`);
      setInviteEmail('');
      void loadInvitations();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to send invitation';
      toast.error(msg);
    } finally {
      setInviting(false);
    }
  };

  // P20-A: Revoke a pending invitation
  const handleRevokeInvite = async (id: string, email: string) => {
    try {
      await authApi.revokeInvitation(id);
      setInvitations(prev => prev.filter(i => i.id !== id));
      toast.success(`Invitation to ${email} revoked`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to revoke invitation';
      toast.error(msg);
    }
  };

  // N-070: Toggle low_data_mode via PUT /notifications/preferences
  const handleLowDataToggle = async (enabled: boolean) => {
    setLowDataLoading(true);
    try {
      for (const channel of ['email', 'sms', 'push', 'in_app'] as const) {
        await api.put('/notifications/preferences', {
          channel,
          lowDataMode: enabled,
        });
      }
      setLowDataMode(enabled);
      toast.success(enabled ? 'Low-data mode enabled' : 'Low-data mode disabled');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to update notification preferences';
      toast.error(msg);
    } finally {
      setLowDataLoading(false);
    }
  };

  const requestPush = async () => {
    if (!('Notification' in window)) { toast.error('Push notifications not supported'); return; }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      setPushEnabled(true);
      toast.success('Push notifications enabled');
    } else {
      toast.warning('Permission denied. Enable in browser settings.');
    }
  };

  // P20-D: Build tabs — Team tab only visible to admins
  const visibleTabs = TABS.filter(t => t.id !== 'team' || isAdmin(user?.role));

  return (
    <div style={styles.page}>
      <header style={{ marginBottom: 28 }}>
        <h1 style={styles.heading}>Settings</h1>
        <p style={styles.subheading}>Manage your account and preferences</p>
      </header>

      <div style={styles.layout}>
        <nav aria-label="Settings sections" style={styles.sideNav}>
          {visibleTabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as Tab)}
              style={{
                ...styles.navItem,
                background: tab === t.id ? '#f0f9ff' : 'transparent',
                color: tab === t.id ? '#0F4C81' : '#374151',
                fontWeight: tab === t.id ? 600 : 400,
                borderLeft: tab === t.id ? '3px solid #0F4C81' : '3px solid transparent',
              }}
            >
              <span aria-hidden="true">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div style={styles.content}>
          {tab === 'profile' && (
            <section aria-label="Profile settings">
              <h2 style={styles.sectionHeading}>Profile</h2>
              {profileLoading ? (
                <p style={{ color: '#9ca3af', fontSize: 14 }}>Loading profile…</p>
              ) : (
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <Input
                    label="Email address"
                    type="email"
                    value={user?.email ?? ''}
                    readOnly
                    hint="Contact support to change your email"
                  />
                  <Input
                    label="Business name"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    placeholder="Your business name"
                  />
                  <Input
                    label="Phone number"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+2348000000000"
                  />
                  <div style={styles.fieldGroup}>
                    <label style={styles.label} htmlFor="role-display">Role</label>
                    <input id="role-display" value={user?.role ?? ''} readOnly style={styles.readOnlyInput} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label} htmlFor="tenant-display">Tenant ID</label>
                    <input id="tenant-display" value={user?.tenantId ?? ''} readOnly style={styles.readOnlyInput} />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Button type="submit" loading={saving}>Save changes</Button>
                  </div>
                </form>
              )}
              <div style={styles.dangerZone}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#991b1b', marginBottom: 8 }}>Danger zone</h3>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
                  Signing out clears your session on this device. Your account remains active.
                </p>
                <Button variant="danger" size="sm" onClick={() => void logout()}>Sign out</Button>
              </div>
            </section>
          )}

          {/* P20-A: Team tab — admin only */}
          {tab === 'team' && isAdmin(user?.role) && (
            <section aria-label="Team management">
              <h2 style={styles.sectionHeading}>Team</h2>

              <div style={{ marginBottom: 28 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
                  Invite a member
                </h3>
                <form onSubmit={handleInvite} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div style={{ flex: 2, minWidth: 200 }}>
                    <Input
                      label="Email address"
                      type="email"
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      placeholder="colleague@example.com"
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 140, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={styles.label} htmlFor="invite-role">Role</label>
                    <select
                      id="invite-role"
                      value={inviteRole}
                      onChange={e => setInviteRole(e.target.value)}
                      style={{ ...styles.readOnlyInput, background: '#fff', cursor: 'pointer' }}
                    >
                      <option value="member">Member</option>
                      <option value="agent">Agent</option>
                      <option value="cashier">Cashier</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <Button type="submit" loading={inviting}>Send invite</Button>
                </form>
              </div>

              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
                  Pending invitations
                </h3>
                {teamLoading ? (
                  <p style={{ color: '#9ca3af', fontSize: 14 }}>Loading…</p>
                ) : invitations.length === 0 ? (
                  <p style={{ color: '#9ca3af', fontSize: 14 }}>No pending invitations.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {invitations.map(inv => (
                      <div key={inv.id} style={styles.inviteRow}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{inv.email}</div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>
                            Role: {inv.role} &middot; Expires: {new Date(inv.expires_at * 1000).toLocaleDateString()}
                          </div>
                        </div>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => void handleRevokeInvite(inv.id, inv.email)}
                        >
                          Revoke
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {tab === 'notifications' && (
            <section aria-label="Notification settings">
              <h2 style={styles.sectionHeading}>Notifications</h2>

              {/* Push notifications */}
              <div style={styles.toggleRow}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Push notifications</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>Sales alerts, advisory results, and system updates</div>
                </div>
                {pushEnabled ? (
                  <span style={{ fontSize: 13, color: '#166534', fontWeight: 600 }}>✓ Enabled</span>
                ) : (
                  <Button size="sm" onClick={requestPush}>Enable</Button>
                )}
              </div>

              {/* Email summaries */}
              <div style={styles.toggleRow}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Email summaries</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>Daily business summary at 8am</div>
                </div>
                <ToggleSwitch defaultChecked onChange={v => toast.info(v ? 'Email summaries on' : 'Email summaries off')} />
              </div>

              {/* Low stock alerts */}
              <div style={styles.toggleRow}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Low stock alerts</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>Notified when offering stock drops below threshold</div>
                </div>
                <ToggleSwitch defaultChecked onChange={v => toast.info(v ? 'Low stock alerts on' : 'Low stock alerts off')} />
              </div>

              {/* N-070: Low-data mode (G22) */}
              <div style={{ ...styles.toggleRow, borderTop: '1px solid #e5e7eb', paddingTop: 16, marginTop: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Low-data mode</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>
                    Reduces notification data usage: suppresses push notifications, image attachments,
                    and limits SMS to critical-only alerts. Ideal for slow or metered connections.
                  </div>
                  {lowDataMode && (
                    <div style={{
                      marginTop: 6,
                      fontSize: 12,
                      color: '#92400e',
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: 4,
                      padding: '4px 8px',
                      display: 'inline-block',
                    }}>
                      Low-data mode active — push & images suppressed
                    </div>
                  )}
                </div>
                {lowDataLoading ? (
                  <span style={{ fontSize: 12, color: '#6b7280' }}>Saving…</span>
                ) : (
                  <ToggleSwitch
                    checked={lowDataMode}
                    onChange={(v) => { void handleLowDataToggle(v); }}
                  />
                )}
              </div>
            </section>
          )}

          {tab === 'appearance' && (
            <section aria-label="Appearance settings">
              <h2 style={styles.sectionHeading}>Appearance</h2>
              <div style={styles.toggleRow}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Dark mode</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>Switch between light and dark themes</div>
                </div>
                <ToggleSwitch checked={darkMode} onChange={v => { setDarkMode(v); toast.info(v ? 'Dark mode on' : 'Light mode on'); applyDarkMode(v); }} />
              </div>
              <div style={styles.toggleRow}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Compact view</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>Reduce spacing in lists and tables</div>
                </div>
                <ToggleSwitch onChange={v => toast.info(v ? 'Compact view on' : 'Compact view off')} />
              </div>
            </section>
          )}

          {tab === 'security' && (
            <section aria-label="Security settings">
              <h2 style={styles.sectionHeading}>Security</h2>
              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
                <Input
                  label="Current password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={currentPw}
                  onChange={e => setCurrentPw(e.target.value)}
                />
                <Input
                  label="New password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="At least 8 characters"
                  hint="Use a strong, unique password"
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                />
                <Input
                  label="Confirm new password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                />
                <Button type="submit" loading={changingPw}>Change password</Button>
              </form>

              {/* P20-B: Active sessions panel */}
              <div style={{ marginTop: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#374151' }}>Active sessions</h3>
                  <Button
                    variant="danger"
                    size="sm"
                    loading={revokingAll}
                    onClick={() => void handleRevokeAllSessions()}
                  >
                    Revoke all other sessions
                  </Button>
                </div>
                {sessionsLoading ? (
                  <p style={{ color: '#9ca3af', fontSize: 14 }}>Loading sessions…</p>
                ) : sessions.length === 0 ? (
                  <p style={{ color: '#9ca3af', fontSize: 14 }}>No active sessions found.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {sessions.map(s => (
                      <div key={s.id} style={styles.sessionRow}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{s.deviceHint}</div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>
                            Started: {new Date(s.issuedAt * 1000).toLocaleString()} &middot;{' '}
                            Last seen: {new Date(s.lastSeenAt * 1000).toLocaleString()}
                          </div>
                        </div>
                        <Button
                          variant="danger"
                          size="sm"
                          loading={revokingSession === s.id}
                          onClick={() => void handleRevokeSession(s.id)}
                        >
                          Revoke
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ ...styles.dangerZone, marginTop: 32 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#991b1b', marginBottom: 8 }}>Session</h3>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
                  Signing out clears your local session and invalidates your token on the server.
                </p>
                <Button variant="danger" size="sm" onClick={() => void logout()}>Sign out</Button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function ToggleSwitch({ defaultChecked, checked: controlledChecked, onChange }: {
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (v: boolean) => void;
}) {
  const [internal, setInternal] = useState(defaultChecked ?? false);
  const checked = controlledChecked !== undefined ? controlledChecked : internal;
  const toggle = () => {
    const next = !checked;
    setInternal(next);
    onChange?.(next);
  };
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={toggle}
      style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: checked ? '#0F4C81' : '#d1d5db', position: 'relative',
        transition: 'background 0.2s ease', flexShrink: 0, minHeight: 24,
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: checked ? 22 : 2, width: 20, height: 20,
        borderRadius: '50%', background: '#fff', transition: 'left 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

const TABS = [
  { id: 'profile',       icon: '👤', label: 'Profile' },
  { id: 'team',          icon: '👥', label: 'Team' },
  { id: 'notifications', icon: '🔔', label: 'Notifications' },
  { id: 'appearance',    icon: '🎨', label: 'Appearance' },
  { id: 'security',      icon: '🔐', label: 'Security' },
];

const styles = {
  page: { padding: '24px 20px', maxWidth: 900, margin: '0 auto' } as React.CSSProperties,
  heading: { fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 4 } as React.CSSProperties,
  subheading: { fontSize: 14, color: '#6b7280' } as React.CSSProperties,
  layout: { display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' } as React.CSSProperties,
  sideNav: { width: 180, display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' } as React.CSSProperties,
  navItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', border: 'none', cursor: 'pointer', fontSize: 14, textAlign: 'left', width: '100%', minHeight: 44, transition: 'all 0.15s ease' } as React.CSSProperties,
  content: { flex: 1, minWidth: 280, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '24px 20px' } as React.CSSProperties,
  sectionHeading: { fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 20 } as React.CSSProperties,
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 4 } as React.CSSProperties,
  label: { fontSize: 13, fontWeight: 600, color: '#374151' } as React.CSSProperties,
  readOnlyInput: { border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '11px 14px', fontSize: 15, background: '#f9fafb', color: '#6b7280', minHeight: 44 } as React.CSSProperties,
  dangerZone: { marginTop: 32, padding: '16px', border: '1px solid #fecaca', borderRadius: 8, background: '#fff5f5' } as React.CSSProperties,
  toggleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #f3f4f6', gap: 16 } as React.CSSProperties,
  sessionRow: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
    background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb',
  } as React.CSSProperties,
  inviteRow: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
    background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb',
  } as React.CSSProperties,
};
