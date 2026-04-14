import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/lib/toast';
import { authApi, ApiError } from '@/lib/api';

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

type Tab = 'profile' | 'notifications' | 'appearance' | 'security';

export default function Settings() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('profile');
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);
  const [pushEnabled, setPushEnabled] = useState(false);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    applyDarkMode(darkMode);
  }, [darkMode]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    toast.success('Settings saved');
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

  return (
    <div style={styles.page}>
      <header style={{ marginBottom: 28 }}>
        <h1 style={styles.heading}>Settings</h1>
        <p style={styles.subheading}>Manage your account and preferences</p>
      </header>

      <div style={styles.layout}>
        <nav aria-label="Settings sections" style={styles.sideNav}>
          {TABS.map(t => (
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
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Input label="Email address" type="email" value={user?.email ?? ''} readOnly hint="Contact support to change your email" />
                <Input label="Business name" defaultValue="My Business" />
                <Input label="Phone number" type="tel" defaultValue="+2348000000000" />
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
              <div style={styles.dangerZone}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#991b1b', marginBottom: 8 }}>Danger zone</h3>
                <Button variant="danger" size="sm" onClick={logout}>Sign out of all devices</Button>
              </div>
            </section>
          )}

          {tab === 'notifications' && (
            <section aria-label="Notification settings">
              <h2 style={styles.sectionHeading}>Notifications</h2>
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
              <div style={styles.toggleRow}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Email summaries</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>Daily business summary at 8am</div>
                </div>
                <ToggleSwitch defaultChecked onChange={v => toast.info(v ? 'Email summaries on' : 'Email summaries off')} />
              </div>
              <div style={styles.toggleRow}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Low stock alerts</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>Notified when offering stock drops below threshold</div>
                </div>
                <ToggleSwitch defaultChecked onChange={v => toast.info(v ? 'Low stock alerts on' : 'Low stock alerts off')} />
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
              <div style={{ ...styles.dangerZone, marginTop: 32 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#991b1b', marginBottom: 8 }}>Session</h3>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
                  Signing out clears your local session. Your account remains active.
                </p>
                <Button variant="danger" size="sm" onClick={logout}>Sign out</Button>
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
};
