import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authApi, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AcceptInvite() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
          <h1 style={styles.heading}>Invalid invitation link</h1>
          <p style={styles.subtext}>The invitation link is missing or malformed. Please check your email.</p>
          <Link to="/login" style={styles.link}>Go to login</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password && password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (password && password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await authApi.acceptInvite(token, name ? { name, password } : undefined);
      setSuccess(true);
      setTimeout(() => void navigate('/login'), 3000);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to accept invitation. It may have expired.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <h1 style={styles.heading}>Welcome to the workspace!</h1>
          <p style={styles.subtext}>You have been added to the workspace. Redirecting you to login…</p>
          <Link to="/login" style={styles.link}>Log in now</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>👋</div>
        <h1 style={styles.heading}>Accept your invitation</h1>
        <p style={styles.subtext}>
          You've been invited to join a workspace on WebWaka.
          If you're a new user, create your account below.
          If you already have an account, just click "Accept".
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
          <Input
            label="Full name (new users only)"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
          />
          <Input
            label="Password (new users only)"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
          {password && (
            <Input
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          )}
          {error && (
            <p role="alert" style={{ fontSize: 13, color: '#dc2626', background: '#fef2f2', padding: '10px 12px', borderRadius: 6 }}>
              {error}
            </p>
          )}
          <Button type="submit" loading={loading}>
            {name ? 'Create account & join workspace' : 'Accept invitation'}
          </Button>
        </form>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 16, textAlign: 'center' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#0F4C81', fontWeight: 600 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#f9fafb', padding: 24,
  } as React.CSSProperties,
  card: {
    background: '#fff', borderRadius: 16, padding: '40px 32px', maxWidth: 440, width: '100%',
    textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb',
  } as React.CSSProperties,
  heading: { fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 12 } as React.CSSProperties,
  subtext: { fontSize: 14, color: '#6b7280', marginBottom: 24, lineHeight: 1.5 } as React.CSSProperties,
  link: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    color: '#0F4C81', textDecoration: 'none', fontWeight: 600, fontSize: 14, minHeight: 44,
  } as React.CSSProperties,
};
