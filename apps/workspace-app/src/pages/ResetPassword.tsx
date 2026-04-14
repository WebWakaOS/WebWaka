import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/lib/toast';

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
type FormData = z.infer<typeof schema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset link. Please request a new one.');
    }
  }, [token]);

  const onSubmit = async (data: FormData) => {
    if (!token) return;
    setLoading(true);
    try {
      await authApi.resetPassword(token, data.password);
      setDone(true);
      toast.success('Password reset! Please log in with your new password.');
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : 'Reset failed. The link may have expired — request a new one.';
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

        {!token ? (
          <>
            <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }} aria-hidden="true">
              ⚠️
            </div>
            <h1 style={styles.heading}>Invalid link</h1>
            <p style={styles.subheading}>
              This password reset link is missing or invalid.
            </p>
            <Link to="/forgot-password">
              <Button fullWidth variant="secondary">
                Request a new link
              </Button>
            </Link>
          </>
        ) : done ? (
          <>
            <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }} aria-hidden="true">
              ✅
            </div>
            <h1 style={styles.heading}>Password reset</h1>
            <p style={styles.subheading}>
              Your password has been updated. Redirecting to login…
            </p>
            <Link to="/login">
              <Button fullWidth>Go to login</Button>
            </Link>
          </>
        ) : (
          <>
            <h1 style={styles.heading}>Choose a new password</h1>
            <p style={styles.subheading}>
              Enter your new password below. It must be at least 8 characters.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} noValidate style={styles.form}>
              <Input
                label="New password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="At least 8 characters"
                error={errors.password?.message}
                {...register('password')}
              />
              <Input
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
              <Button type="submit" fullWidth loading={loading} size="lg">
                Reset password
              </Button>
            </form>
            <p style={styles.footer}>
              <Link to="/login" style={styles.link}>
                ← Back to login
              </Link>
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
    background: '#0F4C81',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: 4,
  } as React.CSSProperties,
  heading: { fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 4 } as React.CSSProperties,
  subheading: { fontSize: 14, color: '#6b7280', marginBottom: 28 } as React.CSSProperties,
  form: { display: 'flex', flexDirection: 'column', gap: 16 } as React.CSSProperties,
  footer: { marginTop: 24, fontSize: 14, color: '#6b7280', textAlign: 'center' } as React.CSSProperties,
  link: { color: '#0F4C81', fontWeight: 600, textDecoration: 'none' } as React.CSSProperties,
};
