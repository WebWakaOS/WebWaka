/**
 * Onboarding Wizard — 3-step guided flow for new users (M3 fix)
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api, ApiError, authApi } from '@/lib/api';
import { toast } from '@/lib/toast';
import { useAuth } from '@/contexts/AuthContext';
import { VERTICAL_REGISTRY } from '@/lib/verticals';

const STEPS = ['Business Profile', 'Choose Vertical', 'Create First Offering'];

const POPULAR_VERTICALS = [
  'palm-oil', 'restaurant', 'supermarket', 'pharmacy', 'hotel',
  'bakery', 'beauty-salon', 'laundry', 'tailoring', 'auto-workshop',
];

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 1: Profile
  const [businessName, setBusinessName] = useState(user?.businessName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');

  // Step 2: Vertical
  const [selectedVertical, setSelectedVertical] = useState('');

  // Step 3: Offering
  const [offeringName, setOfferingName] = useState('');
  const [offeringPrice, setOfferingPrice] = useState('');
  const [offeringCategory, setOfferingCategory] = useState('');

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) { toast.error('Business name is required'); return; }
    setSaving(true);
    try {
      if (user?.workspaceId) {
        await api.patch(`/workspaces/${user.workspaceId}`, { name: businessName.trim() });
      }
      await authApi.updateProfile({ phone: phone || undefined });
      setStep(1);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleStep2 = async () => {
    if (!selectedVertical) { toast.error('Please select a vertical'); return; }
    setSaving(true);
    try {
      if (user?.workspaceId) {
        await api.post(`/workspaces/${user.workspaceId}/verticals/${selectedVertical}/activate`);
      }
      setStep(2);
    } catch {
      // Non-blocking — vertical activation may require KYC; proceed anyway
      setStep(2);
    } finally {
      setSaving(false);
    }
  };

  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(offeringPrice);
    if (!offeringName.trim() || isNaN(price) || price <= 0) {
      toast.error('Please enter a valid offering name and price');
      return;
    }
    setSaving(true);
    try {
      if (user?.workspaceId) {
        await api.post('/pos-business/products', {
          workspace_id: user.workspaceId,
          name: offeringName.trim(),
          price_kobo: Math.round(price * 100),
          category: offeringCategory.trim() || undefined,
        });
      }
      toast.success(’🎉 All done! Your workspace is ready.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Non-blocking — go to dashboard anyway
      navigate('/dashboard', { replace: true });
    } finally {
      setSaving(false);
    }
  };

  const popularMetas = POPULAR_VERTICALS.map(s => VERTICAL_REGISTRY[s]).filter(Boolean);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)',
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '40px 36px', width: '100%',
        maxWidth: 520, boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#0F4C81' }}>WebWaka</span>
          <span style={{ background: '#0F4C81', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>OS</span>
        </div>

        {/* Progress steps */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, alignItems: 'center' }}>
          {STEPS.map((s, i) => (
            <>
              <div key={s} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: i < step ? '#059669' : i === step ? '#0F4C81' : '#e5e7eb',
                  color: i <= step ? '#fff' : '#9ca3af',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, marginBottom: 4,
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 10, color: i === step ? '#0F4C81' : '#9ca3af', fontWeight: i === step ? 700 : 400, textAlign: 'center', lineHeight: 1.2 }}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ height: 2, flex: 1, background: i < step ? '#059669' : '#e5e7eb', marginBottom: 20 }} />
              )}
            </>
          ))}
        </div>

        {/* Step 1: Profile */}
        {step === 0 && (
          <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Set up your profile</h2>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Tell us about your business</p>
            <Input
              label="Business name"
              required
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              placeholder="Adaeze Farms Ltd"
            />
            <Input
              label="Phone number (optional)"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+2348000000000"
            />
            <Button type="submit" loading={saving} fullWidth size="lg">Continue →</Button>
          </form>
        )}

        {/* Step 2: Vertical */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 4 }}>What kind of business?</h2>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Select your primary business vertical</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {popularMetas.map(v => (
                <button
                  key={v.slug}
                  onClick={() => setSelectedVertical(v.slug)}
                  style={{
                    textAlign: 'left', padding: '12px 14px',
                    border: `2px solid ${selectedVertical === v.slug ? '#0F4C81' : '#e5e7eb'}`,
                    borderRadius: 10, background: selectedVertical === v.slug ? '#eff6ff' : '#fff',
                    cursor: 'pointer', fontSize: 14,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{v.icon}</span>
                  <span style={{ fontWeight: 500, color: selectedVertical === v.slug ? '#0F4C81' : '#374151' }}>{v.label}</span>
                </button>
              ))}
            </div>
            <select
              value={selectedVertical}
              onChange={e => setSelectedVertical(e.target.value)}
              style={{ border: '1.5px solid #d1d5db', borderRadius: 8, padding: '11px 14px', fontSize: 14, minHeight: 44 }}
            >
              <option value="">Or select from full list…</option>
              {Object.values(VERTICAL_REGISTRY).map(v => (
                <option key={v.slug} value={v.slug}>{v.icon} {v.label}</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" onClick={() => setStep(0)}>Back</Button>
              <Button fullWidth loading={saving} onClick={() => void handleStep2()} disabled={!selectedVertical}>
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: First offering */}
        {step === 2 && (
          <form onSubmit={handleStep3} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Add your first offering</h2>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>What do you sell or offer?</p>
            <Input
              label="Product or service name"
              required
              value={offeringName}
              onChange={e => setOfferingName(e.target.value)}
              placeholder="e.g. Palm Oil (1 litre)"
            />
            <Input
              label="Price (Naira)"
              type="number"
              min="1"
              step="0.01"
              required
              value={offeringPrice}
              onChange={e => setOfferingPrice(e.target.value)}
              placeholder="1500"
            />
            <Input
              label="Category (optional)"
              value={offeringCategory}
              onChange={e => setOfferingCategory(e.target.value)}
              placeholder="Produce, Services, Retail…"
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <Button type="button" variant="secondary" onClick={() => setStep(1)}>Back</Button>
              <Button type="submit" fullWidth loading={saving} size="lg">
                Complete setup
              </Button>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard', { replace: true })}
              style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 13, cursor: 'pointer', padding: 8 }}
            >
              Skip for now
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
