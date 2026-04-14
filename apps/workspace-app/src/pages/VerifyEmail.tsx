import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '@/lib/api';

type Status = 'loading' | 'success' | 'error';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found. Please check your email for the correct link.');
      return;
    }
    authApi.verifyEmail(token)
      .then(res => {
        setStatus('success');
        setMessage(res.message);
      })
      .catch(err => {
        setStatus('error');
        const msg = err instanceof Error ? err.message : 'Verification failed. The link may have expired.';
        setMessage(msg);
      });
  }, [token]);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {status === 'loading' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <h1 style={styles.heading}>Verifying your email…</h1>
            <p style={styles.subtext}>Please wait while we confirm your email address.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h1 style={styles.heading}>Email verified!</h1>
            <p style={styles.subtext}>{message}</p>
            <Link to="/dashboard" style={styles.btn}>Go to dashboard</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
            <h1 style={styles.heading}>Verification failed</h1>
            <p style={styles.subtext}>{message}</p>
            <Link to="/dashboard" style={styles.btn}>Go to dashboard</Link>
          </>
        )}
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
    background: '#fff', borderRadius: 16, padding: '40px 32px', maxWidth: 420, width: '100%',
    textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb',
  } as React.CSSProperties,
  heading: { fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 12 } as React.CSSProperties,
  subtext: { fontSize: 14, color: '#6b7280', marginBottom: 24, lineHeight: 1.5 } as React.CSSProperties,
  btn: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: '#0F4C81', color: '#fff', textDecoration: 'none',
    padding: '12px 24px', borderRadius: 8, fontWeight: 600, fontSize: 14, minHeight: 44,
  } as React.CSSProperties,
};
