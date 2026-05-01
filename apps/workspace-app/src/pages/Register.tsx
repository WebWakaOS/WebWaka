import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/lib/toast';
import { ApiError } from '@/lib/api';

const schema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().regex(/^\+?[0-9]{10,14}$/, 'Enter a valid phone number').optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        businessName: data.businessName,
        phone: data.phone || undefined,
      });
      toast.success('Account created! Welcome to WebWaka.');
      // M3: Route new users through onboarding wizard
      navigate('/onboarding', { replace: true });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Registration failed. Please try again.';
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
        <h1 style={styles.heading}>Create your workspace</h1>
        <p style={styles.subheading}>Start managing your business with WebWaka OS</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate style={styles.form}>
          <Input
            label="Business name"
            type="text"
            autoComplete="organization"
            required
            placeholder="Adaeze Farms Ltd"
            error={errors.businessName?.message}
            {...register('businessName')}
          />
          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            required
            placeholder="you@business.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Phone number"
            type="tel"
            autoComplete="tel-national"
            inputMode="tel"
            pattern="^\+?[0-9]{10,14}$"
            placeholder="+2348012345678"
            error={errors.phone?.message}
            hint="Optional — for account recovery"
            {...register('phone')}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="At least 8 characters"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" fullWidth loading={loading} size="lg">
            Create workspace
          </Button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
        <p style={styles.terms}>
          By registering you agree to our{' '}
          <a href="/terms" style={styles.link}>Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" style={styles.link}>Privacy Policy</a>
          {' '}(NDPR compliant).
        </p>
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
    maxWidth: 440,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  } as React.CSSProperties,
  logo: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 } as React.CSSProperties,
  logoText: { fontSize: 22, fontWeight: 800, color: '#0F4C81' } as React.CSSProperties,
  logoBadge: {
    background: '#0F4C81', color: '#fff', fontSize: 11, fontWeight: 700,
    padding: '2px 6px', borderRadius: 4,
  } as React.CSSProperties,
  heading: { fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 4 } as React.CSSProperties,
  subheading: { fontSize: 14, color: '#6b7280', marginBottom: 28 } as React.CSSProperties,
  form: { display: 'flex', flexDirection: 'column', gap: 16 } as React.CSSProperties,
  footer: { marginTop: 24, fontSize: 14, color: '#6b7280', textAlign: 'center' } as React.CSSProperties,
  terms: { marginTop: 12, fontSize: 12, color: '#9ca3af', textAlign: 'center' } as React.CSSProperties,
  link: { color: '#0F4C81', fontWeight: 600, textDecoration: 'none' } as React.CSSProperties,
};
