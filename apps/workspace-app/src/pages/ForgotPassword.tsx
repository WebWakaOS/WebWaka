import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/lib/toast';

const schema = z.object({ email: z.string().email('Enter a valid email address') });
type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Request failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoText}>WebWaka</span>
          <span style={styles.logoBadge}>OS</span>
        </div>
        {sent ? (
          <>
            <div style={styles.successIcon} aria-hidden="true">✉️</div>
            <h1 style={styles.heading}>Check your email</h1>
            <p style={styles.subheading}>
              We've sent a password reset link to your email. It expires in 1 hour.
            </p>
            <Link to="/login" style={{ display: 'block', textAlign: 'center', marginTop: 24 }}>
              <Button fullWidth variant="secondary">Back to login</Button>
            </Link>
          </>
        ) : (
          <>
            <h1 style={styles.heading}>Reset your password</h1>
            <p style={styles.subheading}>Enter your email and we'll send a reset link.</p>
            <form onSubmit={handleSubmit(onSubmit)} noValidate style={styles.form}>
              <Input
                label="Email address"
                type="email"
                autoComplete="email"
                required
                placeholder="you@business.com"
                error={errors.email?.message}
                {...register('email')}
              />
              <Button type="submit" fullWidth loading={loading} size="lg">
                Send reset link
              </Button>
            </form>
            <p style={styles.footer}>
              <Link to="/login" style={styles.link}>← Back to login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)',
  } as React.CSSProperties,
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: '40px 32px',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  } as React.CSSProperties,
  logo: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 } as React.CSSProperties,
  logoText: { fontSize: 22, fontWeight: 800, color: '#0F4C81' } as React.CSSProperties,
  logoBadge: {
    background: '#0F4C81', color: '#fff', fontSize: 11, fontWeight: 700,
    padding: '2px 6px', borderRadius: 4,
  } as React.CSSProperties,
  successIcon: { fontSize: 48, textAlign: 'center', marginBottom: 16 } as React.CSSProperties,
  heading: { fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 4 } as React.CSSProperties,
  subheading: { fontSize: 14, color: '#6b7280', marginBottom: 28 } as React.CSSProperties,
  form: { display: 'flex', flexDirection: 'column', gap: 16 } as React.CSSProperties,
  footer: { marginTop: 24, fontSize: 14, color: '#6b7280', textAlign: 'center' } as React.CSSProperties,
  link: { color: '#0F4C81', fontWeight: 600, textDecoration: 'none' } as React.CSSProperties,
};
